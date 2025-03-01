import { Configuration, OpenAIApi } from 'openai';
import { getCurrentUser } from './userStorage';
import puppeteer from 'puppeteer';
import { OpenAI } from 'openai';

// Initialize OpenAI with browser flag
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Function to generate a customized cover letter
async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName: string
): Promise<string> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "system",
        content: "Generate a professional cover letter that highlights relevant experience and skills from the resume that match the job requirements. The tone should be confident but not arrogant, and should demonstrate genuine interest in the role and company."
      }, {
        role: "user",
        content: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}\n\nCompany: ${companyName}`
      }]
    });

    return response.data.choices[0].message?.content || "";
  } catch (error) {
    console.error('Cover letter generation error:', error);
    throw error;
  }
}

// Function to customize resume for specific job
async function customizeResume(
  resumeText: string,
  jobDescription: string
): Promise<string> {
  try {
    const response = await openai.createChatCompletion({
      model: "gpt-4-turbo-preview",
      messages: [{
        role: "system",
        content: "Customize the resume to highlight experience and skills that are most relevant to the job requirements. Maintain the original format but adjust content emphasis and wording."
      }, {
        role: "user",
        content: `Resume: ${resumeText}\n\nJob Description: ${jobDescription}`
      }]
    });

    return response.data.choices[0].message?.content || "";
  } catch (error) {
    console.error('Resume customization error:', error);
    throw error;
  }
}

// Function to submit application via company website
async function submitApplicationViaWebsite(
  url: string,
  resumeData: string,
  coverLetter: string,
  userProfile: any
): Promise<boolean> {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto(url);
    
    // Common application form selectors
    const selectors = {
      name: 'input[name*="name" i]',
      email: 'input[type="email"]',
      phone: 'input[type="tel"]',
      resume: 'input[type="file"]',
      coverLetter: 'textarea[name*="cover" i]',
      submit: 'button[type="submit"]'
    };
    
    // Fill in basic information
    await page.type(selectors.name, userProfile.name);
    await page.type(selectors.email, userProfile.email);
    if (userProfile.phone) {
      await page.type(selectors.phone, userProfile.phone);
    }
    
    // Upload resume
    const resumeInput = await page.$(selectors.resume);
    if (resumeInput) {
      await resumeInput.uploadFile(Buffer.from(resumeData));
    }
    
    // Fill in cover letter
    const coverLetterInput = await page.$(selectors.coverLetter);
    if (coverLetterInput) {
      await page.type(selectors.coverLetter, coverLetter);
    }
    
    // Submit form
    await page.click(selectors.submit);
    
    // Wait for confirmation
    await page.waitForNavigation();
    
    await browser.close();
    return true;
  } catch (error) {
    console.error('Application submission error:', error);
    return false;
  }
}

// Main function to auto-apply for a job
export async function autoApplyForJob(jobId: string): Promise<boolean> {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.resume) {
      throw new Error('User profile or resume not found');
    }
    
    // Find the job in search results
    const job = currentUser.jobSearchResults?.find(j => j.id === jobId);
    if (!job) {
      throw new Error('Job not found in search results');
    }
    
    // Extract resume text
    const resumeText = atob(currentUser.resume.fileData.split(',')[1]);
    
    // Generate customized documents
    const [customizedResume, coverLetter] = await Promise.all([
      customizeResume(resumeText, job.description),
      generateCoverLetter(resumeText, job.description, job.company)
    ]);
    
    // Submit application
    const success = await submitApplicationViaWebsite(
      job.url,
      customizedResume,
      coverLetter,
      currentUser
    );
    
    return success;
  } catch (error) {
    console.error('Auto-apply error:', error);
    return false;
  }
} 