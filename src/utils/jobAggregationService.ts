import axios from 'axios';
import { JobMatch } from './userStorage';

// API configurations
const API_CONFIGS = {
  LINKEDIN: {
    baseUrl: 'https://api.linkedin.com/v2',
    apiKey: import.meta.env.VITE_LINKEDIN_API_KEY,
  },
  INDEED: {
    baseUrl: 'https://api.indeed.com/v2',
    apiKey: import.meta.env.VITE_INDEED_API_KEY,
  },
  MONSTER: {
    baseUrl: 'https://api.monster.com/v1',
    apiKey: import.meta.env.VITE_MONSTER_API_KEY,
  },
};

// Interface for job data from different sources
interface RawJobData {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  postedDate: string;
  salary?: string;
  requirements?: string[];
  type?: string;
  source: string;
}

// Function to fetch jobs from LinkedIn
async function fetchLinkedInJobs(query: string): Promise<RawJobData[]> {
  try {
    const response = await axios.get(`${API_CONFIGS.LINKEDIN.baseUrl}/jobs/search`, {
      headers: { Authorization: `Bearer ${API_CONFIGS.LINKEDIN_API_KEY}` },
      params: { keywords: query }
    });
    return response.data.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company.name,
      location: job.location,
      description: job.description,
      url: job.url,
      postedDate: job.postedDate,
      source: 'LinkedIn'
    }));
  } catch (error) {
    console.error('LinkedIn API error:', error);
    return [];
  }
}

// Function to fetch jobs from Indeed
async function fetchIndeedJobs(query: string): Promise<RawJobData[]> {
  try {
    const response = await axios.get(`${API_CONFIGS.INDEED.baseUrl}/jobs/search`, {
      headers: { Authorization: `Bearer ${API_CONFIGS.INDEED_API_KEY}` },
      params: { q: query }
    });
    return response.data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      postedDate: job.date,
      salary: job.salary,
      source: 'Indeed'
    }));
  } catch (error) {
    console.error('Indeed API error:', error);
    return [];
  }
}

// Function to fetch jobs from Monster
async function fetchMonsterJobs(query: string): Promise<RawJobData[]> {
  try {
    const response = await axios.get(`${API_CONFIGS.MONSTER.baseUrl}/jobs/search`, {
      headers: { Authorization: `Bearer ${API_CONFIGS.MONSTER_API_KEY}` },
      params: { q: query }
    });
    return response.data.jobs.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      postedDate: job.posted_date,
      type: job.job_type,
      source: 'Monster'
    }));
  } catch (error) {
    console.error('Monster API error:', error);
    return [];
  }
}

// Function to aggregate jobs from all sources
export async function aggregateJobs(query: string): Promise<RawJobData[]> {
  try {
    const [linkedInJobs, indeedJobs, monsterJobs] = await Promise.all([
      fetchLinkedInJobs(query),
      fetchIndeedJobs(query),
      fetchMonsterJobs(query)
    ]);

    return [...linkedInJobs, ...indeedJobs, ...monsterJobs];
  } catch (error) {
    console.error('Job aggregation error:', error);
    return [];
  }
}

// Function to deduplicate jobs based on title and company
export function deduplicateJobs(jobs: RawJobData[]): RawJobData[] {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Export the job aggregation pipeline
export async function fetchJobsFromAllSources(query: string): Promise<RawJobData[]> {
  const rawJobs = await aggregateJobs(query);
  const uniqueJobs = deduplicateJobs(rawJobs);
  return uniqueJobs;
} 