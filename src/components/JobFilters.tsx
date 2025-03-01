import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { getCurrentUser } from '@/utils/userStorage';

interface JobFiltersProps {
  onFiltersChange: (filters: any) => void;
}

const JobFilters = ({ onFiltersChange }: JobFiltersProps) => {
  const currentUser = getCurrentUser();
  const [filters, setFilters] = useState({
    workType: 'any',
    employmentType: 'any',
    location: currentUser?.location || '',
    salaryRange: {
      min: 0,
      max: 200000,
    },
    experienceLevel: 'any',
    datePosted: 'any',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="mb-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="mb-4">
            Filter Jobs
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Jobs</SheetTitle>
            <SheetDescription>
              Customize your job search with these filters
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Work Type</label>
              <Select
                value={filters.workType}
                onValueChange={(value) => handleFilterChange('workType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Employment Type</label>
              <Select
                value={filters.employmentType}
                onValueChange={(value) => handleFilterChange('employmentType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="full-time">Full-Time</SelectItem>
                  <SelectItem value="part-time">Part-Time</SelectItem>
                  <SelectItem value="internship">Internship</SelectItem>
                  <SelectItem value="co-op">Co-op</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Salary Range</label>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryRange.min}
                  onChange={(e) => handleFilterChange('salaryRange', {
                    ...filters.salaryRange,
                    min: parseInt(e.target.value) || 0,
                  })}
                />
                <span>to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryRange.max}
                  onChange={(e) => handleFilterChange('salaryRange', {
                    ...filters.salaryRange,
                    max: parseInt(e.target.value) || 0,
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Experience Level</label>
              <Select
                value={filters.experienceLevel}
                onValueChange={(value) => handleFilterChange('experienceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Posted</label>
              <Select
                value={filters.datePosted}
                onValueChange={(value) => handleFilterChange('datePosted', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Time</SelectItem>
                  <SelectItem value="past-24h">Past 24 Hours</SelectItem>
                  <SelectItem value="past-week">Past Week</SelectItem>
                  <SelectItem value="past-month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            className="w-full mt-4"
            onClick={() => {
              setFilters({
                workType: 'any',
                employmentType: 'any',
                location: currentUser?.location || '',
                salaryRange: { min: 0, max: 200000 },
                experienceLevel: 'any',
                datePosted: 'any',
              });
              onFiltersChange({});
            }}
          >
            Reset Filters
          </Button>
        </SheetContent>
      </Sheet>

      {/* Active filters display */}
      <div className="flex flex-wrap gap-2">
        {filters.workType && (
          <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
            {filters.workType}
          </div>
        )}
        {filters.employmentType && (
          <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
            {filters.employmentType}
          </div>
        )}
        {filters.location && (
          <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
            📍 {filters.location}
          </div>
        )}
        {filters.experienceLevel && (
          <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
            {filters.experienceLevel}
          </div>
        )}
        {filters.datePosted && (
          <div className="bg-primary/10 px-3 py-1 rounded-full text-sm">
            {filters.datePosted}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobFilters; 