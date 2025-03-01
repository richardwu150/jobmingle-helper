
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import MatchScore from './MatchScore';
import { cn } from '@/lib/utils';

export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary?: string;
  posted: string;
  description: string;
  matchScore: number;
  skills: string[];
  logo?: string;
}

const JobCard = ({
  id,
  title,
  company,
  location,
  type,
  salary,
  posted,
  description,
  matchScore,
  skills,
  logo,
}: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const truncateDescription = (text: string, maxLength = 180) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card className={cn(
      "overflow-hidden transition-all duration-500 ease-out hover-card",
      isExpanded ? "max-h-[600px]" : "max-h-[320px]"
    )}>
      <CardHeader className="pb-3 flex flex-row justify-between items-start">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 rounded-md overflow-hidden bg-accent flex items-center justify-center">
            {logo ? (
              <img src={logo} alt={`${company} logo`} className="w-full h-full object-cover" />
            ) : (
              <div className="text-xl font-bold text-primary/70">{company.charAt(0)}</div>
            )}
          </div>
          <div>
            <CardTitle className="text-xl font-semibold leading-tight">
              {title}
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {company} • {location}
            </div>
          </div>
        </div>
        <MatchScore score={matchScore} />
      </CardHeader>
      
      <CardContent className="pb-3 space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal">
            {type}
          </Badge>
          {salary && (
            <Badge variant="outline" className="font-normal">
              {salary}
            </Badge>
          )}
          <Badge variant="outline" className="font-normal text-muted-foreground">
            Posted {posted}
          </Badge>
        </div>
        
        <div className="text-sm pt-2">
          <p className={cn(
            "text-foreground/80 transition-all duration-500",
            isExpanded ? "" : "line-clamp-3"
          )}>
            {isExpanded ? description : truncateDescription(description)}
          </p>
          {!isExpanded && description.length > 180 && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-primary hover:text-primary/80 text-sm font-medium mt-1"
            >
              Read more
            </button>
          )}
        </div>
        
        {isExpanded && (
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-2">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between items-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Show more"}
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">Save</Button>
          <Button size="sm" className="animated-button">Apply Now</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default JobCard;
