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
  workType?: 'in-person' | 'remote' | 'hybrid';
  employmentType?: 'full-time' | 'part-time' | 'internship' | 'co-op' | 'contract';
  location?: string;
  salaryRange?: {
    min?: number;
    max?: number;
  };
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  datePosted?: 'past-24h' | 'past-week' | 'past-month' | 'anytime';
  skills?: string[];
  industries?: string[];
}

async function searchJSearchAPI(query: string): Promise<any[]> {
  try {
    console.log('=== JSearch API Request Details ===');
    console.log('Base URL:', APIS.JSEARCH.url);
    console.log('Query:', query);
    
    // Simplify the request URL and parameters
    const params = new URLSearchParams({
      query: query,
      page: '1',
      num_pages: '1',
      page_size: '10'
    });
    
    const url = `${APIS.JSEARCH.url}/search?${params.toString()}`;
    console.log('Request URL:', url);
    
    const headers = {
      'x-rapidapi-host': 'jsearch.p.rapidapi.com',
      'x-rapidapi-key': import.meta.env.VITE_RAPID_API_KEY || '',
    };
    console.log('Request Headers:', {
      ...headers,
      'x-rapidapi-key': '***hidden***'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: headers
    });

    console.log('Response Status:', response.status);
    console.log('Response Status Text:', response.statusText);
    
    const responseText = await response.text();
    console.log('Raw Response:', responseText);

    // Check for empty response
    if (!responseText) {
      throw new Error('Empty response from API');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      throw new Error(`Invalid JSON response from API: ${responseText.slice(0, 100)}...`);
    }

    // Check for various error conditions
    if (!data) {
      throw new Error('No data received from API');
    }

    if (data.status === 'error') {
      throw new Error(`API Error: ${data.message || 'Unknown error'}`);
    }

    if (!data.data || !Array.isArray(data.data)) {
      throw new Error(`Invalid data format: ${JSON.stringify(data).slice(0, 100)}...`);
    }

    // Log successful response details
    console.log('Successfully retrieved jobs:', {
      total: data.data.length,
      sample: data.data.slice(0, 2).map(job => ({
        title: job.job_title,
        company: job.employer_name,
        location: job.job_location
      }))
    });

    return data.data;
  } catch (error) {
    console.error('=== JSearch API Error ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error message
    if (error.message.includes('API Error')) {
      throw new Error(`JSearch API Error: ${error.message}`);
    } else if (error.message.includes('Invalid JSON')) {
      throw new Error('Invalid response format from JSearch API');
    } else {
      throw new Error(`Failed to fetch jobs: ${error.message}`);
    }
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
    console.error('No resume text found in user data:', currentUser);
    throw new Error('No resume found. Please upload your resume first.');
  }

  try {
    console.log('Starting job search with resume and filters:', options);
    
    // Extract keywords from resume for search
    const keywords = extractKeywords(currentUser.resume.parsedText);
    console.log('Extracted keywords:', keywords);
    
    // Use only keywords for the initial search query
    const searchQuery = keywords.slice(0, 3).join(' ') || 'software developer';
    console.log('Search query (keywords only):', searchQuery);
    
    // Search jobs using JSearch API
    const jSearchJobs = await searchJSearchAPI(searchQuery);
    
    if (!jSearchJobs || jSearchJobs.length === 0) {
      console.error('No jobs found from JSearch API');
      throw new Error('No matching jobs found. Please try different search terms.');
    }
    
    // Normalize job data
    const normalizedJobs = jSearchJobs.map(normalizeJSearchJob);
    console.log('Total jobs before filtering:', normalizedJobs.length);
    
    // Calculate match scores
    const jobMatches = normalizedJobs.map(job => ({
      ...job,
      matchScore: calculateMatchScore(currentUser.resume.parsedText!, job, options)
    }));
    
    // Apply filters separately from the search
    let filteredJobs = jobMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .filter(job => {
        // Work Type Filter
        if (options.workType && options.workType !== 'any') {
          const jobLocation = job.location.toLowerCase();
          switch (options.workType) {
            case 'remote':
              if (!jobLocation.includes('remote')) return false;
              break;
            case 'hybrid':
              if (!jobLocation.includes('hybrid')) return false;
              break;
            case 'in-person':
              if (jobLocation.includes('remote') || jobLocation.includes('hybrid')) return false;
              break;
          }
        }

        // Location Filter
        if (options.location && options.location !== 'any') {
          const jobLocation = job.location.toLowerCase();
          const searchLocation = options.location.toLowerCase();
          if (!jobLocation.includes(searchLocation)) return false;
        }

        // Employment Type Filter
        if (options.employmentType && options.employmentType !== 'any') {
          const jobTitle = job.title.toLowerCase();
          const jobDesc = job.description.toLowerCase();
          const employmentType = options.employmentType.toLowerCase();
          if (!jobTitle.includes(employmentType) && !jobDesc.includes(employmentType)) return false;
        }

        // Salary Filter
        if (options.salaryRange?.min || options.salaryRange?.max) {
          const salaryText = job.salary.toLowerCase();
          const numbers = salaryText.match(/\d+/g);
          if (!numbers) return false;
          
          const salaryNum = parseInt(numbers[0]);
          if (options.salaryRange.min && salaryNum < options.salaryRange.min) return false;
          if (options.salaryRange.max && salaryNum > options.salaryRange.max) return false;
        }

        // Experience Level Filter
        if (options.experienceLevel && options.experienceLevel !== 'any') {
          const jobDesc = job.description.toLowerCase();
          const jobTitle = job.title.toLowerCase();
          const level = options.experienceLevel;
          
          switch (level) {
            case 'entry':
              if (!jobDesc.includes('entry') && !jobDesc.includes('junior') && 
                  !jobTitle.includes('entry') && !jobTitle.includes('junior')) return false;
              break;
            case 'mid':
              if (!jobDesc.includes('mid') && !jobDesc.includes('intermediate') &&
                  !jobTitle.includes('mid') && !jobTitle.includes('intermediate')) return false;
              break;
            case 'senior':
              if (!jobDesc.includes('senior') && !jobDesc.includes('sr.') &&
                  !jobTitle.includes('senior') && !jobTitle.includes('sr.')) return false;
              break;
            case 'executive':
              if (!jobDesc.includes('executive') && !jobDesc.includes('director') &&
                  !jobTitle.includes('executive') && !jobTitle.includes('director')) return false;
              break;
          }
        }

        // Date Posted Filter
        if (options.datePosted && options.datePosted !== 'any') {
          const postedDate = new Date(job.postedDate);
          const now = new Date();
          const daysDiff = (now.getTime() - postedDate.getTime()) / (1000 * 3600 * 24);
          
          switch (options.datePosted) {
            case 'past-24h':
              if (daysDiff > 1) return false;
              break;
            case 'past-week':
              if (daysDiff > 7) return false;
              break;
            case 'past-month':
              if (daysDiff > 30) return false;
              break;
          }
        }

        // Skills Filter
        if (options.skills && options.skills.length > 0) {
          const jobDesc = job.description.toLowerCase();
          const hasRequiredSkills = options.skills.some(skill => 
            jobDesc.includes(skill.toLowerCase())
          );
          if (!hasRequiredSkills) return false;
        }

        // Industries Filter
        if (options.industries && options.industries.length > 0) {
          const jobDesc = job.description.toLowerCase();
          const hasMatchingIndustry = options.industries.some(industry =>
            jobDesc.includes(industry.toLowerCase())
          );
          if (!hasMatchingIndustry) return false;
        }

        return true;
      });

    console.log('Jobs after filtering:', {
      total: filteredJobs.length,
      filters: {
        workType: options.workType,
        location: options.location,
        employmentType: options.employmentType,
        experienceLevel: options.experienceLevel,
        datePosted: options.datePosted
      }
    });
    
    // Log sample of jobs for debugging
    console.log('Sample of top jobs:', filteredJobs.slice(0, 3).map(j => ({
      title: j.title,
      company: j.company,
      score: j.matchScore,
      location: j.location,
      salary: j.salary
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
  // Split text into words and clean them
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')  // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 2);  // Remove very short words
  
  // Count word frequency
  const frequency: { [key: string]: number } = {};
  words.forEach(word => {
    if (!commonWords.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  });
  
  // Get top 15 keywords (increased from 10)
  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word);
}

function calculateMatchScore(resumeText: string, job: any, options: JobSearchOptions = {}): number {
  let score = 0;
  const maxScore = 100;

  // Convert texts to lowercase and clean them
  const resumeLower = resumeText.toLowerCase();
  const titleLower = job.title.toLowerCase();
  const descriptionLower = job.description ? job.description.toLowerCase() : '';
  
  // Title match (35% weight)
  const titleWords = titleLower.split(/\s+/);
  const titleMatches = titleWords.filter(word => 
    word.length > 2 && resumeLower.includes(word)
  ).length;
  score += (titleMatches / Math.min(titleWords.length, 5)) * 35;
  
  // Requirements match (25% weight)
  if (job.requirements && job.requirements.length > 0) {
    const reqMatches = job.requirements.filter((req: string) => {
      const reqLower = req.toLowerCase();
      return reqLower.split(/\s+/).some(word => 
        word.length > 2 && resumeLower.includes(word)
      );
    }).length;
    score += (reqMatches / Math.min(job.requirements.length, 3)) * 25;
  } else {
    score += 10;
  }
  
  // Description match (20% weight)
  if (descriptionLower) {
    const descWords = new Set(
      descriptionLower.split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 50)
    );
    const descMatches = Array.from(descWords).filter(word =>
      resumeLower.includes(word)
    ).length;
    score += (descMatches / Math.min(descWords.size, 10)) * 20;
  } else {
    score += 10;
  }

  // Filter match bonus (20% weight)
  let filterScore = 0;
  
  // Location match
  if (options.location && job.location.toLowerCase().includes(options.location.toLowerCase())) {
    filterScore += 5;
  }
  
  // Work type match
  if (options.workType) {
    const jobLocation = job.location.toLowerCase();
    if ((options.workType === 'remote' && jobLocation.includes('remote')) ||
        (options.workType === 'hybrid' && jobLocation.includes('hybrid')) ||
        (options.workType === 'in-person' && !jobLocation.includes('remote') && !jobLocation.includes('hybrid'))) {
      filterScore += 5;
    }
  }
  
  // Employment type match
  if (options.employmentType && 
      (job.title.toLowerCase().includes(options.employmentType) || 
       job.description.toLowerCase().includes(options.employmentType))) {
    filterScore += 5;
  }
  
  // Experience level match
  if (options.experienceLevel) {
    const content = (job.title + ' ' + job.description).toLowerCase();
    if (content.includes(options.experienceLevel)) {
      filterScore += 5;
    }
  }
  
  score += filterScore;

  // Ensure score is between 0 and 100
  return Math.min(Math.round(score), maxScore);
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
