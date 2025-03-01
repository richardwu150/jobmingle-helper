
import { getCurrentUser, updateCurrentUser } from './userStorage';

// Mock job data (in a real app, this would come from an API)
const mockJobs = [
  {
    id: '1',
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'Remote',
    description: 'We are looking for a skilled Frontend Developer with experience in React, TypeScript, and Tailwind CSS. The ideal candidate should have at least 3 years of experience building modern web applications.',
    url: 'https://example.com/job/1',
    postedDate: '2023-05-15',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'InnovateTech',
    location: 'San Francisco, CA',
    description: 'Seeking a Full Stack Engineer proficient in React, Node.js, and MongoDB. Experience with cloud services (AWS/GCP) is a plus. You will work on developing and maintaining our core product features.',
    url: 'https://example.com/job/2',
    postedDate: '2023-05-18',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    company: 'DesignHub',
    location: 'New York, NY',
    description: 'Looking for a talented UI/UX Designer with a strong portfolio. Experience with Figma and Adobe Creative Suite required. Knowledge of frontend development is a plus.',
    url: 'https://example.com/job/3',
    postedDate: '2023-05-12',
  },
  {
    id: '4',
    title: 'Backend Developer',
    company: 'DataFlow',
    location: 'Remote',
    description: 'Backend Developer needed for our growing team. Must have experience with Node.js, Express, and SQL/NoSQL databases. Knowledge of microservices architecture is a plus.',
    url: 'https://example.com/job/4',
    postedDate: '2023-05-20',
  },
  {
    id: '5',
    title: 'DevOps Engineer',
    company: 'CloudNative',
    location: 'Seattle, WA',
    description: 'DevOps Engineer with experience in Kubernetes, Docker, and CI/CD pipelines. You will be responsible for maintaining and improving our cloud infrastructure.',
    url: 'https://example.com/job/5',
    postedDate: '2023-05-17',
  },
];

// Function to extract text content from resume data (base64)
const extractResumeText = (resumeData: string): string => {
  // In a real app, we would parse the PDF/DOCX file
  // For this demo, we'll assume the data is already in text format
  try {
    // If it's base64, try to decode it
    return atob(resumeData.split(',')[1] || resumeData);
  } catch (e) {
    console.error('Failed to decode resume data:', e);
    return resumeData;
  }
};

// Function to compute similarity between two texts
// This is a simple implementation - in a real app, you'd use an AI service
const computeSimilarity = (text1: string, text2: string): number => {
  // Convert to lowercase and tokenize
  const tokens1 = text1.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  const tokens2 = text2.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  
  // Count matching tokens
  const tokenSet1 = new Set(tokens1);
  const tokenSet2 = new Set(tokens2);
  
  let matchCount = 0;
  for (const token of tokenSet1) {
    if (tokenSet2.has(token)) {
      matchCount++;
    }
  }
  
  // Calculate similarity
  const totalUniqueTokens = new Set([...tokens1, ...tokens2]).size;
  return totalUniqueTokens > 0 ? (matchCount / totalUniqueTokens) * 100 : 0;
};

// Main function to search for jobs
export const searchJobs = async (
  industries?: string[],
  remote?: boolean,
  salaryRange?: { min?: number; max?: number }
): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.resume) {
    throw new Error('No resume found. Please upload your resume first.');
  }
  
  // Extract text from resume
  const resumeText = extractResumeText(currentUser.resume.fileData);
  
  // In a real app, we would:
  // 1. Call a job search API or web scraper
  // 2. Use an AI service to match resume with job descriptions
  
  // For this demo, we'll use our mock data and simple matching algorithm
  const jobMatches = mockJobs
    .filter(job => {
      // Apply filters based on preferences
      if (industries && industries.length > 0) {
        // Simple industry matching - in a real app, this would be more sophisticated
        const jobIndustryMatch = industries.some(industry => 
          job.description.toLowerCase().includes(industry.toLowerCase())
        );
        if (!jobIndustryMatch) return false;
      }
      
      if (remote !== undefined) {
        const isRemoteJob = job.location.toLowerCase().includes('remote');
        if (remote && !isRemoteJob) return false;
      }
      
      // In a real app, we would also filter by salary if available
      
      return true;
    })
    .map(job => {
      // Calculate match score
      const matchScore = computeSimilarity(resumeText, job.description);
      
      return {
        ...job,
        matchScore: Math.round(matchScore),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by match score (descending)
  
  // Store results in user data
  updateCurrentUser({ jobSearchResults: jobMatches });
  
  return;
};

// Function to get stored job search results
export const getJobSearchResults = (): { jobs: any[], timestamp: string } | null => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.jobSearchResults) {
    return null;
  }
  
  return {
    jobs: currentUser.jobSearchResults,
    timestamp: new Date().toISOString(),
  };
};
