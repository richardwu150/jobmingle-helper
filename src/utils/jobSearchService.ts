
import { getCurrentUser, updateCurrentUser } from './userStorage';

// Generate 100+ mock job listings
const generateMockJobs = () => {
  const companies = [
    'TechCorp', 'InnovateTech', 'DesignHub', 'DataFlow', 'CloudNative', 
    'DevWorks', 'CodeCraft', 'DigitalSolutions', 'FutureStack', 'SmartSystems',
    'WebWizards', 'ByteBuilders', 'LogicLabs', 'NetNexus', 'AppArchitects',
    'SoftSphere', 'Quantum Computing', 'CyberShield', 'AI Innovations', 'BlockChain Tech'
  ];
  
  const titles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Engineer', 'UI/UX Designer',
    'DevOps Engineer', 'Data Scientist', 'Product Manager', 'Project Manager',
    'Software Engineer', 'Mobile Developer', 'QA Engineer', 'Systems Architect',
    'Cloud Engineer', 'Machine Learning Engineer', 'Cybersecurity Analyst',
    'Technical Writer', 'Database Administrator', 'Network Engineer', 'Business Analyst',
    'Scrum Master'
  ];
  
  const locations = [
    'Remote', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA',
    'Boston, MA', 'Chicago, IL', 'Los Angeles, CA', 'Denver, CO', 'Atlanta, GA',
    'Portland, OR', 'Dallas, TX', 'Miami, FL', 'Washington, DC', 'Toronto, Canada',
    'London, UK', 'Berlin, Germany', 'Tokyo, Japan', 'Sydney, Australia', 'Paris, France'
  ];
  
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
    'AWS', 'Docker', 'Kubernetes', 'SQL', 'NoSQL',
    'HTML/CSS', 'Git', 'CI/CD', 'REST APIs', 'GraphQL',
    'Vue.js', 'Angular', 'Java', 'C#', '.NET',
    'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin',
    'Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Illustrator',
    'Agile', 'Scrum', 'Jira', 'TDD', 'DevOps',
    'Machine Learning', 'Data Analysis', 'Big Data', 'Blockchain', 'AR/VR'
  ];
  
  const descriptions = [
    'We are looking for a skilled developer to join our team. The ideal candidate should have experience in building modern applications.',
    'Seeking an experienced engineer to work on our core product features. You will be responsible for designing and implementing new functionality.',
    'Join our growing team to help build and maintain our cloud infrastructure. Experience with DevOps practices and tools is required.',
    'Looking for a talented designer with a strong portfolio. You will be responsible for creating user-friendly interfaces for our products.',
    'We need a data expert to help us extract insights from our vast datasets. Experience with data analysis and visualization is required.'
  ];
  
  const salaryRanges = [
    '$70,000 - $90,000', 
    '$80,000 - $100,000', 
    '$90,000 - $120,000', 
    '$100,000 - $130,000', 
    '$120,000 - $150,000',
    '$140,000 - $180,000',
    '$160,000 - $200,000'
  ];
  
  const expLevels = ['Entry Level', 'Mid Level', 'Senior', 'Lead', 'Manager', 'Director'];
  
  // Generate dates within the last 30 days
  const generateRecentDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    now.setDate(now.getDate() - daysAgo);
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  };
  
  // Generate job postings
  const jobs = [];
  for (let i = 1; i <= 120; i++) {
    const companyIndex = Math.floor(Math.random() * companies.length);
    const titleIndex = Math.floor(Math.random() * titles.length);
    const locationIndex = Math.floor(Math.random() * locations.length);
    const descIndex = Math.floor(Math.random() * descriptions.length);
    const salaryIndex = Math.floor(Math.random() * salaryRanges.length);
    const expIndex = Math.floor(Math.random() * expLevels.length);
    
    // Generate 3-6 random skills for this job
    const jobSkills = [];
    const numSkills = Math.floor(Math.random() * 4) + 3; // 3-6 skills
    for (let j = 0; j < numSkills; j++) {
      const skillIndex = Math.floor(Math.random() * skills.length);
      if (!jobSkills.includes(skills[skillIndex])) {
        jobSkills.push(skills[skillIndex]);
      }
    }
    
    // Create detailed job description
    const baseDesc = descriptions[descIndex];
    const skillsText = `Required skills include: ${jobSkills.join(', ')}.`;
    const expText = `This is a ${expLevels[expIndex]} position.`;
    const companyText = `${companies[companyIndex]} is a leading company in the technology sector.`;
    const fullDesc = `${baseDesc} ${skillsText} ${expText} ${companyText}`;
    
    jobs.push({
      id: `job-${i}`,
      title: titles[titleIndex],
      company: companies[companyIndex],
      location: locations[locationIndex],
      description: fullDesc,
      type: Math.random() > 0.3 ? 'Full-time' : 'Contract',
      salary: salaryRanges[salaryIndex],
      posted: generateRecentDate(),
      skills: jobSkills,
      logo: null // In a real app, we'd have company logos
    });
  }
  
  return jobs;
};

// Create the mock jobs once
const mockJobs = generateMockJobs();

// Improved function to extract text content from resume data (base64)
const extractResumeText = (resumeData: string): string => {
  try {
    // If it's base64, try to decode it
    return atob(resumeData.split(',')[1] || resumeData);
  } catch (e) {
    console.error('Failed to decode resume data:', e);
    return resumeData;
  }
};

// More sophisticated contextual similarity function
const computeContextualSimilarity = (resumeText: string, jobText: string): number => {
  // Convert to lowercase for case-insensitive matching
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobText.toLowerCase();
  
  // Extract potential skills and keywords (simple version)
  const extractKeywords = (text: string): string[] => {
    // Remove punctuation and split by whitespace
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2); // Filter out very short words
  };
  
  const resumeWords = extractKeywords(resumeLower);
  const jobWords = extractKeywords(jobLower);
  
  // Count matching words with more weight for consecutive matches
  let matchScore = 0;
  let totalScore = 0;
  
  // Check for key terms in both texts
  jobWords.forEach(word => {
    // Skip common words to focus on important terms
    const commonWords = ['and', 'the', 'for', 'with', 'this', 'that', 'our', 'your', 'their', 'are', 'will'];
    if (commonWords.includes(word)) return;
    
    totalScore++;
    if (resumeWords.includes(word)) {
      matchScore++;
    }
  });
  
  // Add context matching - look for phrases (simplified)
  const phrases = [
    'years of experience', 'team player', 'communication skills',
    'problem solving', 'attention to detail', 'time management',
    'project management', 'customer service'
  ];
  
  phrases.forEach(phrase => {
    if (jobLower.includes(phrase)) {
      totalScore += 2;
      if (resumeLower.includes(phrase)) {
        matchScore += 2;
      }
    }
  });
  
  // Make sure totalScore is not zero to avoid division by zero
  if (totalScore === 0) return 0;
  
  // Calculate percentage, ensure it's at least 20% to be more forgiving
  const basePercentage = (matchScore / totalScore) * 100;
  return Math.max(20, Math.min(99, basePercentage)); // Clamp between 20-99%
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
  
  // Filter and score jobs
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
      // Calculate match score using improved algorithm
      const matchScore = computeContextualSimilarity(resumeText, job.description);
      
      return {
        ...job,
        matchScore: Math.round(matchScore)
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
