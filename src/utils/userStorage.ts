
interface UserData {
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
  };
  coverLetter?: {
    fileName: string;
    fileData: string;
    uploadDate: string;
  };
  jobSearchResults?: JobMatch[];
}

interface JobMatch {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  matchScore: number;
  postedDate: string;
  appliedDate?: string;
}

// User storage functions
export const saveUser = (userData: Omit<UserData, 'id'>): UserData => {
  const id = crypto.randomUUID();
  const user: UserData = {
    ...userData,
    id,
  };
  
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  
  // Set as current user
  localStorage.setItem('currentUser', JSON.stringify(user));
  
  return user;
};

export const getUsers = (): UserData[] => {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) : [];
};

export const getCurrentUser = (): UserData | null => {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
};

export const updateCurrentUser = (updates: Partial<UserData>): UserData | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;
  
  const updatedUser = { ...currentUser, ...updates };
  
  // Update in users array
  const users = getUsers();
  const updatedUsers = users.map(user => 
    user.id === currentUser.id ? updatedUser : user
  );
  
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  
  return updatedUser;
};

export const logoutUser = (): void => {
  localStorage.removeItem('currentUser');
};

export const loginUser = (email: string, password: string): UserData | null => {
  // In a real app, we'd hash passwords and do secure authentication
  // This is just a simple demo implementation
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  
  return null;
};

export const isLoggedIn = (): boolean => {
  return !!getCurrentUser();
};
