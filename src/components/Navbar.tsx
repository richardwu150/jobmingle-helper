
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AnimatedLogo from './AnimatedLogo';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Jobs', path: '/jobs' },
  ];
  
  return (
    <nav className={cn(
      "fixed top-0 inset-x-0 z-50 transition-all duration-300 ease-in-out py-4",
      isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="page-container">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <AnimatedLogo className="h-10 w-10" />
            <span className="font-semibold text-xl tracking-tight">SmartJob</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className={cn(
                    "px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                    location.pathname === link.path 
                      ? "text-primary font-semibold" 
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="animated-button">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden rounded-md p-2 bg-accent text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              {isMobileMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-background/90 backdrop-blur-md rounded-lg shadow-lg overflow-hidden animate-slide-down">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200",
                    location.pathname === link.path 
                      ? "text-primary font-semibold" 
                      : "text-foreground/70 hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="px-5 py-4 border-t border-border/50">
              <div className="flex items-center space-x-3">
                <Link to="/login" className="w-full">
                  <Button variant="outline" size="sm" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" className="w-full">
                  <Button size="sm" className="w-full animated-button">
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
