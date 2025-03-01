import { getCurrentUser, updateCurrentUser } from './userStorage';
import { JobMatch } from './userStorage';

// API configurations
const APIS = {
  JSEARCH: {
    url: 'https://jsearch.p.rapidapi.com',
    headers: {
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY
    }
  }
};

interface JobSearchOptions {
  workType?: 'in-person' | 'remote' | 'hybrid' | 'any';
  employmentType?: 'full-time' | 'part-time' | 'internship' | 'co-op' | 'contract' | 'any';
  location?: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive' | 'any';
  datePosted?: 'past-24h' | 'past-week' | 'past-month' | 'anytime';
  skills?: string[];
  industries?: string[];
}

async function searchJSearchAPI(query: string): Promise<any[]> {
  try {
    console.log('=== JSearch API Request Details ===');
    console.log('Base URL:', APIS.JSEARCH.url);
    console.log('Query:', query);
    
    // Fetch multiple pages of results
    const numPages = 5;
    const pageSize = 500; // Set to 100 per page (more reasonable than 500)
    let allJobs: any[] = [];
    let totalJobsFound = 0;

    // Always try to fetch all pages
    for (let page = 1; page <= numPages; page++) {
      const params = new URLSearchParams({
        query: query,
        page: page.toString(),
        page_size: pageSize.toString(),
        language: 'en'
      });
      
      const url = `${APIS.JSEARCH.url}/search?${params.toString()}`;
      console.log(`\nFetching page ${page}/${numPages} from:`, url);
      
      const headers = {
        'x-rapidapi-host': 'jsearch.p.rapidapi.com',
        'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY || '',
      };

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: headers
        });

        if (!response.ok) {
          console.warn(`Failed to fetch page ${page}: ${response.status} ${response.statusText}`);
          if (response.status === 429) {
            console.log('Rate limit reached, waiting 2 seconds before retry...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            page--; // Retry this page
            continue;
          }
          continue;
        }

        const data = await response.json();
        
        if (!data || typeof data !== 'object') {
          console.warn(`Invalid response format for page ${page}`);
          continue;
        }

        // Check if we have valid data array
        if (!data.data || !Array.isArray(data.data)) {
          console.warn(`No job data array found in response for page ${page}`);
          continue;
        }

        // Add jobs from this page to our collection
        const newJobs = data.data.filter(job => job && job.job_id);
        allJobs = [...allJobs, ...newJobs];
        totalJobsFound += newJobs.length;
        
        console.log(`Page ${page}: Retrieved ${newJobs.length} valid jobs (Total so far: ${totalJobsFound})`);
        
        // Only stop if we get zero results
        if (newJobs.length === 0) {
          console.log('No more results available, stopping pagination');
          break;
        }

        // Add a delay between requests to avoid rate limiting
        if (page < numPages) {
          console.log('Waiting 1 second before fetching next page...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        continue;
      }
    }

    // Remove duplicate jobs based on job_id
    const uniqueJobs = Array.from(new Map(allJobs.map(job => [job.job_id, job])).values());
    
    console.log('\n=== Final Job Retrieval Results ===');
    console.log(`Total pages fetched: ${numPages}`);
    console.log(`Total jobs found: ${totalJobsFound}`);
    console.log(`Unique jobs after deduplication: ${uniqueJobs.length}`);
    if (uniqueJobs.length > 0) {
      console.log('Sample of first 3 jobs:', uniqueJobs.slice(0, 3).map(job => ({
        title: job.job_title,
        company: job.employer_name,
        location: job.job_location
      })));
    }

    if (uniqueJobs.length === 0) {
      console.warn('Warning: No jobs found after API search');
    }

    return uniqueJobs;
  } catch (error) {
    console.error('=== JSearch API Error ===');
    console.error('Error details:', error);
    throw new Error(`Failed to fetch jobs: ${error.message}`);
  }
}

function normalizeJSearchJob(job: any): JobMatch {
  return {
    id: job.job_id || Math.random().toString(),
    title: job.job_title,
    company: job.employer_name,
    location: job.job_location || 'Remote',
    description: job.job_description,
    url: job.job_apply_link || job.job_google_link,
    matchScore: 0, // Will be calculated later
    postedDate: job.job_posted_at_datetime || new Date().toISOString(),
    requirements: job.job_highlights?.Qualifications || [],
    salary: job.job_min_salary && job.job_max_salary 
      ? `$${job.job_min_salary}-${job.job_max_salary}` 
      : job.job_salary || 'Not specified'
  };
}

export async function searchJobs(options: JobSearchOptions = {}): Promise<JobMatch[]> {
  const currentUser = getCurrentUser();
  if (!currentUser?.resume?.parsedText) {
    throw new Error('No resume found. Please upload your resume first.');
  }

  try {
    console.log('Starting job search with resume and filters:', options);
    
    // Extract keywords from resume for search
    const keywords = extractKeywords(currentUser.resume.parsedText);
    console.log('Extracted keywords:', keywords);
    
    // Calculate how many keywords to use based on number of filters
    const numFilters = Object.values(options).filter(v => v !== undefined).length;
    const keywordsToUse = Math.max(3, Math.min(6 - numFilters, 5)); // Use 3-5 keywords, fewer if more filters
    const jobKeywords = keywords.slice(0, keywordsToUse);
    
    // Construct a more natural job search query
    let searchQuery = '';
    
    // Start with job title/role
    if (jobKeywords[0] && !jobKeywords[0].includes('developer') && !jobKeywords[0].includes('engineer')) {
      searchQuery = `${jobKeywords[0]} developer`;
    } else {
      searchQuery = jobKeywords[0] || 'software developer';
    }

    // Add additional keywords if we have room
    if (jobKeywords.length > 1) {
      const additionalKeywords = jobKeywords.slice(1)
        .filter(k => !k.includes('developer') && !k.includes('engineer'))
        .join(' ');
      if (additionalKeywords) {
        searchQuery += ` ${additionalKeywords}`;
      }
    }

    // Add location if specified and not "any"
    if (options.location && options.location.length > 0 && options.location.toLowerCase() !== 'any') {
      searchQuery += ` in ${options.location}`;
    }

    // Add employment type if specified and not "any"
    if (options.employmentType && options.employmentType !== 'any') {
      searchQuery += ` ${options.employmentType}`;
    }

    // Add work type if specified and not "any"
    if (options.workType && options.workType !== 'any') {
      searchQuery += ` ${options.workType}`;
    }

    // Add experience level if specified and not "any"
    if (options.experienceLevel && options.experienceLevel !== 'any') {
      searchQuery += ` ${options.experienceLevel} level`;
    }

    // Add key skills if specified and not empty or "any"
    if (options.skills && options.skills.length > 0 && !options.skills.includes('any')) {
      const topSkills = options.skills.slice(0, 2).join(' ');
      searchQuery += ` ${topSkills}`;
    }

    // Add key industries if specified and not empty or "any"
    if (options.industries && options.industries.length > 0 && !options.industries.includes('any')) {
      searchQuery += ` ${options.industries[0]}`;
    }

    console.log('Search query:', searchQuery);
    
    // Search jobs using JSearch API
    const jSearchJobs = await searchJSearchAPI(searchQuery);
    
    if (!jSearchJobs || jSearchJobs.length === 0) {
      // Try a fallback search with just the job title and key skills
      console.log('No results found, trying fallback search...');
      let fallbackQuery = searchQuery.split(' in ')[0]; // Remove location
      fallbackQuery = fallbackQuery.split(/\s+/).slice(0, 3).join(' '); // Keep only first 3 terms
      const fallbackJobs = await searchJSearchAPI(fallbackQuery);
      
      if (!fallbackJobs || fallbackJobs.length === 0) {
        throw new Error('No matching jobs found. Please try different search terms.');
      }
      
      jSearchJobs.push(...fallbackJobs);
    }
    
    // Normalize job data
    const normalizedJobs = jSearchJobs.map(normalizeJSearchJob);
    console.log('Total jobs before filtering:', normalizedJobs.length);
    
    // Calculate match scores with fuzzy matching
    const jobMatches = normalizedJobs.map(job => ({
      ...job,
      matchScore: calculateMatchScore(currentUser.resume.parsedText!, job, options, keywords)
    }));
    
    // Apply less strict filtering with higher thresholds
    let filteredJobs = jobMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(job => {
        // Keep minimum match score threshold at 50
        if (job.matchScore < 50) return false;

        // Apply other filters only if they're specifically set
        if (options.workType) {
          const jobContent = (job.location + ' ' + job.description).toLowerCase();
          switch (options.workType) {
            case 'remote':
              if (!jobContent.includes('remote')) return false;
              break;
            case 'hybrid':
              if (!jobContent.includes('hybrid')) return false;
              break;
          }
        }

        // Location filter - more lenient
        if (options.location && options.location.length > 0) {
          const jobLocation = job.location.toLowerCase();
          const searchLocation = options.location.toLowerCase();
          const locationParts = searchLocation.split(',').map(part => part.trim());
          // Match any part of the location (city or state/province)
          if (!locationParts.some(part => jobLocation.includes(part))) return false;
        }

        // Keep all other filters optional
        return true;
      });

    // If still not enough, take top 30 jobs with minimum 50% score
    if (filteredJobs.length < 30) {
      filteredJobs = jobMatches
        .filter(job => job.matchScore >= 50)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, Math.max(30, Math.floor(jobMatches.length * 0.3)));
    }

    console.log('Jobs after filtering:', {
      totalJobsBeforeFiltering: jobMatches.length,
      totalJobsAfterFiltering: filteredJobs.length,
      averageMatchScore: filteredJobs.reduce((sum, job) => sum + job.matchScore, 0) / filteredJobs.length,
      filters: options
    });
    
    // Log sample of jobs for debugging
    console.log('Sample of top jobs:', filteredJobs.slice(0, 5).map(j => ({
      title: j.title,
      company: j.company,
      score: j.matchScore,
      location: j.location
    })));

    // Store the results
    storeJobSearchResults(filteredJobs);

    return filteredJobs;
  } catch (error) {
    console.error('Job search error:', error);
    throw error;
  }
}

function extractKeywords(text: string): string[] {
  // Common job-related terms to boost
  const jobTerms = new Set([
    'developer', 'engineer', 'software', 'web', 'mobile', 'frontend', 'backend',
    'fullstack', 'full-stack', 'programmer', 'architect', 'lead', 'senior', 'junior',
    'development', 'engineering', 'application', 'apps', 'systems', 'devops', 'cloud'
  ]);

  // Technical skills to identify
  const techSkills = new Set([
    'javascript', 'typescript', 'python', 'java', 'c++', 'ruby', 'php', 'swift',
    'kotlin', 'flutter', 'react', 'angular', 'vue', 'node', 'express', 'django',
    'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'sql', 'nosql',
    'mongodb', 'postgresql', 'mysql', 'redis', 'graphql', 'rest', 'api'
  ]);

  // Split text into words and clean them
  const words = text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')  // Keep hyphens for terms like 'full-stack'
    .split(/\s+/)
    .filter(word => word.length > 2);
  
  // Count word frequency with boosted weights for job terms and tech skills
  const frequency: { [key: string]: number } = {};
  words.forEach(word => {
    if (!commonWords.has(word)) {
      let weight = 1;
      if (jobTerms.has(word)) weight = 3;  // Boost job-related terms
      if (techSkills.has(word)) weight = 2; // Boost technical skills
      frequency[word] = (frequency[word] || 0) + weight;
    }
  });
  
  // Get keywords sorted by frequency and boosted weights
  const keywords = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);

  // Ensure we have at least one job title term
  const hasJobTitle = keywords.some(word => jobTerms.has(word));
  if (!hasJobTitle) {
    // Add a default job title based on found tech skills
    const foundTechSkills = keywords.filter(word => techSkills.has(word));
    if (foundTechSkills.length > 0) {
      keywords.unshift(foundTechSkills[0] + ' developer');
    } else {
      keywords.unshift('software developer');
    }
  }

  return keywords;
}

function calculateMatchScore(resumeText: string, job: any, options: JobSearchOptions = {}, keywords: string[]): number {
  let score = 0;
  const maxScore = 100;

  // Start with a base score of 40 (reduced from 50)
  score = 40;

  // Convert texts to lowercase and clean them
  const resumeLower = resumeText.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const descriptionLower = job.description ? job.description.toLowerCase() : '';
  
  // Title match (25% weight) with slightly reduced scores
  const titleWords = titleLower.split(/\s+/);
  let titleScore = 0;
  titleWords.forEach(word => {
    if (word.length <= 2) return;
    // Exact match
    if (resumeLower.includes(word)) {
      titleScore += 1.2; // Reduced from 1.5
    } else {
      // Fuzzy match - check if the word is similar to any word in resume
      const resumeWords = resumeLower.split(/\s+/);
      for (const resumeWord of resumeWords) {
        if (resumeWord.length <= 2) continue;
        if (word.includes(resumeWord) || resumeWord.includes(word)) {
          titleScore += 0.8; // Reduced from 1.0
          break;
        }
        // Check for common prefixes (e.g., "react" matches "reactjs")
        if (word.startsWith(resumeWord) || resumeWord.startsWith(word)) {
          titleScore += 0.6; // Reduced from 0.8
          break;
        }
      }
    }
  });
  score += (titleScore / Math.max(titleWords.length, 1)) * 25;
  
  // Keyword match (25% weight) with reduced boost
  let keywordScore = 0;
  const jobContent = (titleLower + ' ' + descriptionLower).toLowerCase();
  keywords.forEach((keyword, index) => {
    const weight = 1.0 - (index * 0.05); // Reduced from 1.2
    if (jobContent.includes(keyword)) {
      keywordScore += weight * 1.2; // Reduced from 1.5
    } else {
      // Fuzzy match for keywords
      const parts = keyword.split(/\s+/);
      if (parts.some(part => jobContent.includes(part))) {
        keywordScore += weight * 0.8; // Added weight reduction
      }
    }
  });
  score += (keywordScore / Math.min(keywords.length, 10)) * 25;

  // Requirements match (15% weight) with reduced scores
  if (job.requirements && job.requirements.length > 0) {
    let reqScore = 0;
    job.requirements.forEach((req: string) => {
      const reqLower = req.toLowerCase();
      const reqWords = reqLower.split(/\s+/);
      let matched = false;
      
      // Check each word in the requirement
      reqWords.forEach(word => {
        if (word.length <= 2) return;
        if (resumeLower.includes(word)) {
          reqScore += 1.2; // Reduced from 1.5
          matched = true;
        } else {
          // Fuzzy match with resume content
          const resumeWords = resumeLower.split(/\s+/);
          for (const resumeWord of resumeWords) {
            if (resumeWord.length <= 2) continue;
            if (word.includes(resumeWord) || resumeWord.includes(word)) {
              reqScore += 0.8; // Reduced from 1.0
              matched = true;
              break;
            }
          }
        }
      });
      
      // Bonus for matching technical terms
      if (matched && reqLower.match(/\b(javascript|python|java|react|angular|vue|node|typescript|flutter|mobile|web|frontend|backend|fullstack|cloud|aws|azure|docker|kubernetes|ci\/cd|devops)\b/)) {
        reqScore += 0.8; // Reduced from 1.0
      }
    });
    score += (reqScore / Math.max(job.requirements.length, 1)) * 15;
  } else {
    score += 10; // Reduced from 15
  }

  // Filter match bonus (35% weight) with reduced scores
  let filterScore = 0;
  
  // Location match - slightly reduced
  if (options.location) {
    const jobLocation = job.location.toLowerCase();
    const searchLocation = options.location.toLowerCase();
    const locationParts = searchLocation.split(/[\s,]+/);
    
    locationParts.forEach(part => {
      if (part.length <= 2) return;
      if (jobLocation.includes(part)) {
        filterScore += 2.5; // Reduced from 3
      } else {
        // Fuzzy location match
        const jobLocationParts = jobLocation.split(/[\s,]+/);
        if (jobLocationParts.some(loc => 
          loc.includes(part) || part.includes(loc) ||
          levenshteinDistance(loc, part) <= 2
        )) {
          filterScore += 1.5; // Reduced from 2
        }
      }
    });
  }
  
  // Work type match - reduced
  if (options.workType) {
    const jobContent = (job.location + ' ' + job.description).toLowerCase();
    const workTypeVariants = {
      'remote': ['remote', 'work from home', 'wfh', 'virtual', 'telecommute'],
      'hybrid': ['hybrid', 'flexible', 'partial remote', 'partially remote'],
      'in-person': ['on-site', 'onsite', 'in-office', 'office based']
    };
    
    if (workTypeVariants[options.workType]?.some(term => jobContent.includes(term))) {
      filterScore += 6; // Reduced from 8
    }
  }
  
  // Employment type match - reduced
  if (options.employmentType) {
    const jobContent = (job.title + ' ' + job.description).toLowerCase();
    const employmentTypeVariants = {
      'full-time': ['full time', 'full-time', 'permanent', 'regular'],
      'part-time': ['part time', 'part-time'],
      'contract': ['contract', 'temporary', 'contractor'],
      'internship': ['intern', 'internship', 'co-op', 'coop'],
      'co-op': ['co-op', 'coop', 'cooperative', 'internship']
    };
    
    if (employmentTypeVariants[options.employmentType]?.some(term => jobContent.includes(term))) {
      filterScore += 6; // Reduced from 8
    }
  }
  
  score += Math.min(filterScore, 30); // Reduced cap from 35 to 30

  // Apply a final boost (reduced)
  score = Math.min(Math.round(score * 1.1), maxScore); // Reduced from 1.2
  
  return score;
}

// Helper function for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + substitutionCost
      );
    }
  }

  return matrix[b.length][a.length];
}

// Common words to filter out
const commonWords = new Set([
  'the', 'and', 'for', 'that', 'with', 'this', 'our', 'your', 'will', 'have',
  'from', 'they', 'what', 'about', 'when', 'make', 'can', 'all', 'been', 'were',
  'into', 'some', 'than', 'its', 'time', 'only', 'could', 'other', 'these'
]);

function storeJobSearchResults(jobs: JobMatch[]): void {
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const updatedUser = {
    ...currentUser,
    jobSearchResults: jobs
  };

  localStorage.setItem('jobmingle_user_data', JSON.stringify(updatedUser));
}

export function getJobSearchResults(): { jobs: JobMatch[] } | null {
  const currentUser = getCurrentUser();
  if (!currentUser?.jobSearchResults) return null;

  return {
    jobs: currentUser.jobSearchResults
  };
}
