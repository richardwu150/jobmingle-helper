import OpenAI from 'openai';
import { RawJobData } from './jobAggregationService';
import { JobMatch } from './userStorage';

// Initialize OpenAI with browser flag
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Interface for embedding vectors
interface EmbeddingVector {
  vector: number[];
  text: string;
}

// Cache for embeddings to avoid redundant API calls
const embeddingCache = new Map<string, number[]>();

// Function to get embeddings from OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });

    const embedding = response.data[0].embedding;
    embeddingCache.set(text, embedding);
    return embedding;
  } catch (error) {
    console.error('OpenAI embedding error:', error);
    return [];
  }
}

// Function to compute cosine similarity between two vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to extract key information from resume text
async function analyzeResume(resumeText: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "system",
        content: "Extract key information from the resume in JSON format including: skills, experience_years, job_titles, industries, education_level"
      }, {
        role: "user",
        content: resumeText
      }]
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Resume analysis error:', error);
    return {};
  }
}

// Function to analyze job requirements
async function analyzeJobRequirements(jobDescription: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "system",
        content: "Extract key requirements from the job description in JSON format including: required_skills, min_experience_years, preferred_skills, education_requirements, role_level"
      }, {
        role: "user",
        content: jobDescription
      }]
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error('Job analysis error:', error);
    return {};
  }
}

// Function to compute comprehensive match score
async function computeMatchScore(
  resumeAnalysis: any,
  jobAnalysis: any,
  resumeEmbedding: number[],
  jobEmbedding: number[]
): Promise<number> {
  // Semantic similarity from embeddings (25% weight) - More forgiving threshold
  const semanticScore = Math.max(30, cosineSimilarity(resumeEmbedding, jobEmbedding) * 25);

  // Skills match (35% weight) - More forgiving matching
  const requiredSkills = new Set(jobAnalysis.required_skills || []);
  const preferredSkills = new Set(jobAnalysis.preferred_skills || []);
  const candidateSkills = new Set(resumeAnalysis.skills || []);
  
  // Count both exact matches and partial matches
  const exactMatches = [...requiredSkills].filter(skill => 
    candidateSkills.has(skill.toLowerCase())
  ).length;
  
  // Check for partial matches (e.g., "React" matches "React.js" or "ReactJS")
  const partialMatches = [...requiredSkills].filter(skill => 
    [...candidateSkills].some(candidateSkill => 
      candidateSkill.toLowerCase().includes(skill.toLowerCase()) ||
      skill.toLowerCase().includes(candidateSkill.toLowerCase())
    )
  ).length;

  // Also consider preferred skills
  const preferredMatches = [...preferredSkills].filter(skill => 
    candidateSkills.has(skill.toLowerCase())
  ).length;

  const totalPossibleSkills = requiredSkills.size || 1;
  const skillsScore = Math.min(35, 
    ((exactMatches * 2 + partialMatches + preferredMatches * 0.5) / totalPossibleSkills) * 35
  );

  // Experience level match (25% weight) - More forgiving
  const expYears = resumeAnalysis.experience_years || 0;
  const reqYears = jobAnalysis.min_experience_years || 0;
  // Give partial credit even if experience is less than required
  const expScore = reqYears === 0 ? 25 : Math.min(25, (expYears / reqYears) * 25);

  // Education match (15% weight) - More forgiving
  let eduScore = 15;
  if (resumeAnalysis.education_level && jobAnalysis.education_requirements) {
    const eduLevels = {
      'high school': 1,
      'associate': 2,
      'bachelor': 3,
      'master': 4,
      'phd': 5
    };
    const candidateEdu = Object.keys(eduLevels).find(level => 
      resumeAnalysis.education_level.toLowerCase().includes(level)
    );
    const requiredEdu = Object.keys(eduLevels).find(level => 
      jobAnalysis.education_requirements.toLowerCase().includes(level)
    );
    
    if (candidateEdu && requiredEdu) {
      eduScore = eduLevels[candidateEdu] >= eduLevels[requiredEdu] ? 15 : 10;
    }
  }

  // Total score with minimum threshold
  const totalScore = Math.round(semanticScore + skillsScore + expScore + eduScore);
  return Math.max(40, Math.min(99, totalScore)); // Ensure score is between 40 and 99
}

// Main function to match jobs with resume
export async function matchJobsWithResume(
  jobs: RawJobData[],
  resumeText: string
): Promise<JobMatch[]> {
  try {
    // Get resume embedding and analysis
    const resumeEmbedding = await getEmbedding(resumeText);
    const resumeAnalysis = await analyzeResume(resumeText);

    // Process jobs in batches to avoid rate limits
    const batchSize = 10;
    const matchedJobs = [];
    
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);
      const batchPromises = batch.map(async (job) => {
        const jobEmbedding = await getEmbedding(job.description);
        const jobAnalysis = await analyzeJobRequirements(job.description);
        
        const matchScore = await computeMatchScore(
          resumeAnalysis,
          jobAnalysis,
          resumeEmbedding,
          jobEmbedding
        );

        return {
          ...job,
          matchScore,
          requirements: jobAnalysis.required_skills || [],
        };
      });

      const batchResults = await Promise.all(batchPromises);
      matchedJobs.push(...batchResults);
    }
    
    // Sort by match score in descending order and ensure we return at least 100 jobs
    return matchedJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, Math.max(100, Math.floor(jobs.length * 0.8))); // Return at least 100 jobs or 80% of total
  } catch (error) {
    console.error('Job matching error:', error);
    return [];
  }
} 