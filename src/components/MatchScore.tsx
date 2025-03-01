
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MatchScore = ({ score, size = 'md', className }: MatchScoreProps) => {
  const [displayScore, setDisplayScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayScore(score);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [score]);
  
  const getColorClass = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-orange-500';
  };
  
  const getFillClass = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-orange-500';
  };
  
  const sizeClasses = {
    sm: { container: 'w-10 h-10', text: 'text-xs', circle: 'w-9 h-9' },
    md: { container: 'w-14 h-14', text: 'text-sm', circle: 'w-12 h-12' },
    lg: { container: 'w-20 h-20', text: 'text-base', circle: 'w-16 h-16' },
  };
  
  return (
    <div className={cn(
      "relative flex items-center justify-center",
      sizeClasses[size].container,
      className
    )}>
      <div className={cn(
        "absolute inset-0 rounded-full overflow-hidden",
        "bg-muted/30"
      )}>
        <div 
          className={cn(
            "absolute bottom-0 w-full transition-all duration-1000 ease-out",
            getFillClass(score)
          )}
          style={{ height: `${displayScore}%` }}
        ></div>
      </div>
      
      <div className={cn(
        "relative z-10 flex items-center justify-center",
        "rounded-full bg-background/80 backdrop-blur-sm",
        sizeClasses[size].circle
      )}>
        <span className={cn(
          "font-semibold transition-all duration-500",
          sizeClasses[size].text,
          getColorClass(score)
        )}>
          {Math.round(displayScore)}%
        </span>
      </div>
    </div>
  );
};

export default MatchScore;
