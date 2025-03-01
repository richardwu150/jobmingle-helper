import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import { searchJobs, getJobSearchResults } from '@/utils/jobSearchService';
import { getCurrentUser } from '@/utils/userStorage';
import JobCard from '@/components/JobCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import JobFilters from './JobFilters';
import { JobMatch } from '@/utils/userStorage';

const JobSearch: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [filters, setFilters] = useState({});
  const currentUser = getCurrentUser();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    // Check if we already have search results
    const results = getJobSearchResults();
    if (results && results.jobs.length > 0) {
      setJobs(results.jobs);
      setTotalPages(Math.ceil(results.jobs.length / resultsPerPage));
    }
  }, [resultsPerPage]);
  
  const handleSearch = async () => {
    setIsLoading(true);
    try {
      // Use the current user's location if no location filter is set
      const searchFilters = {
        ...filters,
        location: filters.location || currentUser?.location || '',
      };
      
      const results = await searchJobs(searchFilters);
      setJobs(results);
      setTotalPages(Math.ceil(results.length / resultsPerPage));
      setCurrentPage(1); // Reset to first page
      
      toast({
        title: "Job search complete",
        description: `Found ${results.length} matching jobs based on your preferences`,
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "An error occurred during job search",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
  };
  
  // Get current page results
  const getCurrentPageResults = () => {
    const indexOfLastResult = currentPage * resultsPerPage;
    const indexOfFirstResult = indexOfLastResult - resultsPerPage;
    return jobs.slice(indexOfFirstResult, indexOfLastResult);
  };
  
  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="space-y-6">
      <JobFilters onFiltersChange={handleFiltersChange} />
      
      <Button 
        onClick={handleSearch} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Searching..." : "Search Jobs"}
      </Button>
      
      {jobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {jobs.length} matching jobs
          </h2>
          
          <div className="grid gap-4">
            {getCurrentPageResults().map((job) => (
              <div
                key={job.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{job.title}</h3>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <span className="text-sm bg-primary/10 px-2 py-1 rounded">
                    Match: {job.matchScore}%
                  </span>
                </div>
                
                <div className="mt-2 space-y-2">
                  <p className="text-sm">📍 {job.location}</p>
                  {job.salary !== 'Not specified' && (
                    <p className="text-sm">💰 {job.salary}</p>
                  )}
                  <p className="text-sm">📅 Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                </div>

                {job.requirements.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Key Requirements:</p>
                    <ul className="text-sm list-disc list-inside">
                      {job.requirements.slice(0, 3).map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-4">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View Job →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {jobs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-lg font-medium">No matching jobs found</p>
          <p className="text-muted-foreground mt-2">
            Try adjusting your preferences or updating your resume to improve matches.
          </p>
        </div>
      )}
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default JobSearch;
