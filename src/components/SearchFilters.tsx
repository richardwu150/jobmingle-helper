
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface SearchFiltersProps {
  onFilter: (filters: FilterOptions) => void;
  className?: string;
}

export interface FilterOptions {
  keywords: string;
  location: string;
  isRemote: boolean;
  salaryRange: [number, number];
  jobTypes: string[];
  industries: string[];
  experienceLevels: string[];
}

const jobTypeOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'];
const industryOptions = ['Technology', 'Finance', 'Healthcare', 'Education', 'Marketing', 'Design', 'Consulting'];
const experienceLevelOptions = ['Entry Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'];

const SearchFilters = ({ onFilter, className }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    keywords: '',
    location: '',
    isRemote: false,
    salaryRange: [30, 150],
    jobTypes: [],
    industries: [],
    experienceLevels: []
  });
  
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  
  const handleFilterChange = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };
  
  const toggleArrayValue = <K extends keyof FilterOptions>(
    key: K, 
    value: string, 
    array: string[]
  ) => {
    const newArray = array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
    
    handleFilterChange(key, newArray as FilterOptions[K]);
  };
  
  const handleSearch = () => {
    onFilter(filters);
  };
  
  const handleReset = () => {
    setFilters({
      keywords: '',
      location: '',
      isRemote: false,
      salaryRange: [30, 150],
      jobTypes: [],
      industries: [],
      experienceLevels: []
    });
  };
  
  const countActiveFilters = () => {
    let count = 0;
    if (filters.keywords) count++;
    if (filters.location) count++;
    if (filters.isRemote) count++;
    if (filters.jobTypes.length > 0) count++;
    if (filters.industries.length > 0) count++;
    if (filters.experienceLevels.length > 0) count++;
    return count;
  };
  
  return (
    <div className={cn("bg-background border rounded-lg shadow-sm", className)}>
      <div className="p-4 border-b">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="keywords">Keywords</Label>
            <Input 
              id="keywords" 
              placeholder="Job title, skills, or keywords" 
              value={filters.keywords}
              onChange={(e) => handleFilterChange('keywords', e.target.value)}
            />
          </div>
          
          <div className="flex-1 space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              placeholder="City, state, or zip code" 
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 mt-6">
            <Switch 
              id="remote" 
              checked={filters.isRemote}
              onCheckedChange={(checked) => handleFilterChange('isRemote', checked)}
            />
            <Label htmlFor="remote">Remote Only</Label>
          </div>
          
          <Button onClick={handleSearch} className="animated-button w-full md:w-auto">
            Search Jobs
          </Button>
        </div>
      </div>
      
      {/* Expandable section for mobile */}
      <div className="md:hidden px-4 py-2">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground/80"
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
        >
          <span>Advanced Filters</span>
          <Badge variant="outline" className="ml-2">
            {countActiveFilters()}
          </Badge>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-transform duration-200",
              isMobileExpanded ? "transform rotate-180" : ""
            )}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      
      <div className={cn(
        "overflow-hidden transition-all duration-300 ease-in-out",
        isMobileExpanded || window.innerWidth >= 768 ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 md:max-h-[1000px] md:opacity-100"
      )}>
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <Label>Salary Range (K per year)</Label>
            <div className="pt-2">
              <Slider
                value={filters.salaryRange}
                min={0}
                max={300}
                step={5}
                onValueChange={(value) => handleFilterChange('salaryRange', value as [number, number])}
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${filters.salaryRange[0]}K</span>
              <span>${filters.salaryRange[1]}K+</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-full md:w-auto md:flex-1 space-y-3">
              <Label>Job Type</Label>
              <div className="flex flex-wrap gap-2">
                {jobTypeOptions.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.jobTypes.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayValue('jobTypes', type, filters.jobTypes)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto md:flex-1 space-y-3">
              <Label>Industry</Label>
              <div className="flex flex-wrap gap-2">
                {industryOptions.map((industry) => (
                  <Badge
                    key={industry}
                    variant={filters.industries.includes(industry) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayValue('industries', industry, filters.industries)}
                  >
                    {industry}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="w-full md:w-auto md:flex-1 space-y-3">
              <Label>Experience Level</Label>
              <div className="flex flex-wrap gap-2">
                {experienceLevelOptions.map((level) => (
                  <Badge
                    key={level}
                    variant={filters.experienceLevels.includes(level) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleArrayValue('experienceLevels', level, filters.experienceLevels)}
                  >
                    {level}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 bg-muted/30 flex justify-end space-x-3">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Filters
          </Button>
          <Button size="sm" onClick={handleSearch} className="animated-button">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
