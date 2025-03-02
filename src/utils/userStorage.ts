import { parseResume } from './resumeParser';

// Define types and export them
export interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  postedDate: string;
  appliedDate?: string;
  requirements?: string[];
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  preferences?: {
    industries?: string[];
    remote?: boolean;
    salaryRange?: {
      min?: number;
      max?: number;
    };
  };
  resume?: {
    fileName: string;
    fileData: string;
    uploadDate: string;
    parsedText?: string;
  };
  coverLetter?: {
    fileName: string;
    fileData: string;
    uploadDate: string;
  };
  jobSearchResults?: JobMatch[];
}

const STORAGE_KEY = 'jobmingle_user_data';

// Get user data from localStorage
export function getCurrentUser(): UserData | null {
  try {
    const userData = localStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
}

// Update user data in localStorage
export function updateCurrentUser(updates: Partial<UserData>): void {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('No user found');
    }
    
    // Properly merge nested objects
    const updatedUser = {
      ...currentUser,
      ...updates,
      // Ensure preferences are merged, not overwritten
      preferences: {
        ...currentUser.preferences,
        ...(updates.preferences || {})
      },
      // Ensure resume data is merged, not overwritten
      resume: updates.resume ? {
        ...currentUser.resume,
        ...updates.resume
      } : currentUser.resume,
      // Ensure cover letter data is merged, not overwritten
      coverLetter: updates.coverLetter ? {
        ...currentUser.coverLetter,
        ...updates.coverLetter
      } : currentUser.coverLetter,
      // Preserve job search results if not being updated
      jobSearchResults: updates.jobSearchResults || currentUser.jobSearchResults
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user data:', error);
    throw error; // Propagate the error
  }
}

// Update save resume function to handle both File objects and raw data
export async function saveResume(file: File | string, parsedResume: { text: string }): Promise<void> {
  try {
    // First check if user is logged in
    if (!isLoggedIn()) {
      throw new Error('Please log in to upload a resume');
    }

    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      throw new Error('No user found');
    }

    // Convert File to base64 if needed
    let fileData: string;
    let fileName: string;

    if (file instanceof File) {
      // Handle File object
      fileName = file.name;
      const buffer = await file.arrayBuffer();
      fileData = btoa(
        new Uint8Array(buffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    } else {
      // Handle string input (base64)
      fileName = file;
      fileData = file;
    }

    // Create the resume update object
    const resumeUpdate = {
      fileName,
      fileData,
      uploadDate: new Date().toISOString(),
      parsedText: parsedResume.text
    };

    // Update both the current user and the users array
    const updatedUser = {
      ...currentUser,
      resume: resumeUpdate
    };

    // Save to current user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    // Also update the user in the users array
    const users = getUsers();
    const updatedUsers = users.map(user => 
      user.id === currentUser.id 
        ? { ...user, resume: resumeUpdate }
        : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // Verify the update was successful
    const verifyUser = getCurrentUser();
    if (!verifyUser?.resume?.fileData) {
      throw new Error('Failed to save resume data');
    }

    console.log('Resume saved successfully:', fileName);
  } catch (error) {
    console.error('Error saving resume:', error);
    throw error;
  }
}

// Check if user is logged in
export function isLoggedIn(): boolean {
  const user = getCurrentUser();
  return !!user && !!user.id;
}

// Clear user data (for logout)
export function clearUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// User storage functions
export const saveUser = (userData: Omit<UserData, 'id'>): UserData => {
  try {
    const id = crypto.randomUUID();
    const user: UserData = {
      ...userData,
      id,
      resume: undefined, // Initialize with no resume
      coverLetter: undefined, // Initialize with no cover letter
      preferences: {}, // Initialize empty preferences
      jobSearchResults: [], // Initialize empty job results
    };
    
    // Get existing users or initialize empty array
    const users = getUsers();
    
    // Check if email already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('A user with this email already exists');
    }
    
    // Add new user to array
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Set as current user
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    return user;
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const getUsers = (): UserData[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

export const logoutUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// Update login function to properly handle user data and auto-load resume
export const loginUser = async (email: string, password: string): Promise<UserData | null> => {
  try {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
      // Store complete user data in localStorage
      const userData = {
        ...user,
        lastLogin: new Date().toISOString()
      };

      // Ensure we're storing the complete user data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      
      // Update user's last login in users array
      const updatedUsers = users.map(u => 
        u.id === user.id ? userData : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Always load the test resume after login
      await preloadTestResume();
      
      return getCurrentUser(); // Return the updated user data with resume
    }
    
    return null;
  } catch (error) {
    console.error('Error during login:', error);
    return null;
  }
};

// Helper function to check if user has completed onboarding
export const hasCompletedOnboarding = (): boolean => {
  const user = getCurrentUser();
  return !!user?.resume?.fileData;
};

// Function to preload test resume for development
export async function preloadTestResume(): Promise<void> {
  try {
    console.log('Starting to preload chef resume...');
    
    // Ensure user is logged in
    const currentUser = getCurrentUser();
    if (!currentUser || !currentUser.id) {
      console.error('No user found to preload resume');
      return;
    }

    // Fetch the resume file
    const response = await fetch('/chef-resume.pdf');
    if (!response.ok) {
      throw new Error(`Failed to fetch resume file: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log('Resume file fetched successfully, size:', blob.size);
    
    // Convert to File object
    const file = new File([blob], 'chef-resume.pdf', { type: 'application/pdf' });
    console.log('Created File object');
    
    // Parse the resume
    const parsedResume = await parseResume(file);
    if (!parsedResume || !parsedResume.text) {
      throw new Error('Failed to parse resume text');
    }
    console.log('Resume parsed successfully');
    
    // Save the resume
    await saveResume(file, parsedResume);
    console.log('Resume saved to user storage');
    
    // Verify the resume was saved
    const updatedUser = getCurrentUser();
    if (!updatedUser?.resume?.fileData) {
      throw new Error('Resume was not saved properly');
    }
    
    console.log('Chef resume preload completed successfully');
  } catch (error) {
    console.error('Error preloading chef resume:', error);
    throw error;
  }
}
