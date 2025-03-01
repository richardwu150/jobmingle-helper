import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { updateCurrentUser, getCurrentUser } from '@/utils/userStorage';
import ResumeUpload from './ResumeUpload';

const ProfileForm = () => {
  const { toast } = useToast();
  const currentUser = getCurrentUser();
  
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    preferences: {
      industries: currentUser?.preferences?.industries || [],
      remote: currentUser?.preferences?.remote || false,
      salaryMin: currentUser?.preferences?.salaryRange?.min || '',
      salaryMax: currentUser?.preferences?.salaryRange?.max || '',
    }
  });
  
  const [newIndustry, setNewIndustry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleRemoteToggle = (checked: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        remote: checked
      }
    }));
  };
  
  const handlePreferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [name]: value
      }
    }));
  };
  
  const addIndustry = () => {
    if (!newIndustry.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        industries: [...prev.preferences.industries, newIndustry.trim()]
      }
    }));
    setNewIndustry('');
  };
  
  const removeIndustry = (industry: string) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        industries: prev.preferences.industries.filter(i => i !== industry)
      }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Format data for storage
      const userData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        preferences: {
          industries: profile.preferences.industries,
          remote: profile.preferences.remote,
          salaryRange: {
            min: profile.preferences.salaryMin ? Number(profile.preferences.salaryMin) : undefined,
            max: profile.preferences.salaryMax ? Number(profile.preferences.salaryMax) : undefined,
          }
        }
      };
      
      updateCurrentUser(userData);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Your email address"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Your Resume</Label>
              <ResumeUpload 
                onUploadComplete={(fileName: string, fileData: string) => {
                  updateCurrentUser({
                    resume: {
                      fileName,
                      fileData,
                      uploadDate: new Date().toISOString()
                    }
                  });
                  
                  toast({
                    title: "Resume uploaded",
                    description: "Your resume has been successfully uploaded."
                  });
                }}
              />
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Job Preferences</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Industries</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newIndustry}
                      onChange={(e) => setNewIndustry(e.target.value)}
                      placeholder="Add an industry"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addIndustry} variant="outline">
                      Add
                    </Button>
                  </div>
                  
                  {profile.preferences.industries.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {profile.preferences.industries.map((industry, index) => (
                        <div key={index} className="px-3 py-1 bg-secondary rounded-full flex items-center gap-2">
                          <span>{industry}</span>
                          <button
                            type="button"
                            onClick={() => removeIndustry(industry)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remote" 
                    checked={profile.preferences.remote}
                    onCheckedChange={handleRemoteToggle}
                  />
                  <Label htmlFor="remote">Open to remote work</Label>
                </div>
                
                <div>
                  <Label>Salary Range</Label>
                  <div className="flex gap-4 mt-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="salaryMin">Minimum ($)</Label>
                      <Input
                        id="salaryMin"
                        name="salaryMin"
                        type="number"
                        placeholder="Min salary"
                        value={profile.preferences.salaryMin}
                        onChange={handlePreferenceChange}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="salaryMax">Maximum ($)</Label>
                      <Input
                        id="salaryMax"
                        name="salaryMax"
                        type="number"
                        placeholder="Max salary"
                        value={profile.preferences.salaryMax}
                        onChange={handlePreferenceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
