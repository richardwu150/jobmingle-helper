
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { searchJobs, getJobSearchResults } from '@/utils/jobSearchService';
import { getCurrentUser } from '@/utils/userStorage';
import JobCard from '@/components/JobCard';

const JobSearch = () => {
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [searchCompleted, setSearchCompleted] = useState(false);
  const [jobResults, setJobResults] = useState<any[]>([]);
  
  const handleSearch = async () => {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      toast({
        title: "Not logged in",
        description: "Please log in to search for jobs",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser.resume) {
      toast({
        title: "Resume required",
        description: "Please upload your resume before searching for jobs",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    setSearchCompleted(false);
    
    try {
      // Start job search with user preferences
      await searchJobs(
        currentUser.preferences?.industries,
        currentUser.preferences?.remote,
        currentUser.preferences?.salaryRange
      );
      
      // Get search results
      const results = getJobSearchResults();
      
      if (results && results.jobs.length > 0) {
        setJobResults(results.jobs);
        toast({
          title: "Job search complete",
          description: `Found ${results.jobs.length} matching jobs based on your resume`,
        });
      } else {
        setJobResults([]);
        toast({
          title: "No matches found",
          description: "Try adjusting your preferences or updating your resume",
        });
      }
      
      setSearchCompleted(true);
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An error occurred during job search",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">AI-Powered Job Search</h2>
            <p className="text-muted-foreground">
              Our AI will search for jobs that match your resume and preferences.
              We'll analyze your skills and experience to find the best matches.
            </p>
            
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              size="lg"
              className="mt-4"
            >
              {isSearching ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Searching...
                </>
              ) : "Start Job Search"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Spinner className="h-12 w-12 text-primary" />
          <p className="text-lg font-medium">Searching for matching jobs...</p>
          <p className="text-muted-foreground text-center max-w-md">
            Our AI is analyzing your resume and searching for jobs that match your skills and experience.
            This might take a moment.
          </p>
        </div>
      )}
      
      {searchCompleted && jobResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Results ({jobResults.length} jobs found)</h3>
          <div className="space-y-4">
            {jobResults.map((job) => (
              <JobCard 
                key={job.id}
                title={job.title}
                company={job.company}
                location={job.location}
                description={job.description}
                url={job.url}
                matchScore={job.matchScore}
                postedDate={job.postedDate}
              />
            ))}
          </div>
        </div>
      )}
      
      {searchCompleted && jobResults.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No matching jobs found</p>
          <p className="text-muted-foreground mt-2">
            Try adjusting your preferences or updating your resume to improve matches.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
