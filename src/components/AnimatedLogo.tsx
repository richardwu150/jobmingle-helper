
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo = ({ className }: AnimatedLogoProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 50 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "w-full h-full transition-all duration-1000 ease-out",
          isAnimating ? "opacity-100" : "opacity-0 scale-90"
        )}
      >
        <circle 
          cx="25" 
          cy="25" 
          r="20" 
          className={cn(
            "stroke-primary transition-all duration-1500 ease-out",
            isAnimating ? "opacity-100 stroke-[2]" : "opacity-0 stroke-[0]"
          )}
          strokeDasharray="125.6"
          strokeDashoffset={isAnimating ? "0" : "125.6"}
          fill="transparent"
        />
        
        <g className={cn(
          "transition-all duration-1000 ease-out delay-300",
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-50"
        )}>
          <path 
            d="M20 15L30 25M30 25L20 35M30 25H15"
            className="stroke-primary stroke-[2.5] stroke-linecap-round"
          />
        </g>
        
        <circle 
          cx="35" 
          cy="25" 
          r="3" 
          className={cn(
            "fill-primary transition-all duration-700 ease-out delay-700",
            isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-0"
          )}
        />
      </svg>
    </div>
  );
};

export default AnimatedLogo;
