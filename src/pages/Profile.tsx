
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '@/components/ProfileForm';
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
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          Complete your profile to help us find the best job matches for you. 
          The more information you provide, the better we can tailor job recommendations.
        </p>
        
        <ProfileForm />
      </div>
    </div>
  );
};

export default Profile;
