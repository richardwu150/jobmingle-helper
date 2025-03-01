
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from '@/components/ProfileForm';
import JobSearch from '@/components/JobSearch';
import Navbar from '@/components/Navbar';
import { isLoggedIn } from '@/utils/userStorage';

const Profile = () => {
  const navigate = useNavigate();
  
  // Check if user is logged in, if not redirect to login
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Your Profile</h1>
        
        <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="jobs">Job Search</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-0">
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Complete your profile to help us find the best job matches for you. 
              The more information you provide, the better we can tailor job recommendations.
            </p>
            
            <ProfileForm />
          </TabsContent>
          
          <TabsContent value="jobs" className="mt-0">
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              Use our AI-powered job search to find positions that match your skills and experience.
              We'll analyze your resume and rank jobs based on how well they match your profile.
            </p>
            
            <JobSearch />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
