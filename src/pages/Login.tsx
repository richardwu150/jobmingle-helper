
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import AnimatedLogo from '@/components/AnimatedLogo';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Login successful",
        description: "Welcome back to Smart Job Finder.",
      });
      
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Google Sign In",
        description: "This feature is coming soon.",
      });
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <AnimatedLogo className="h-12 w-12 mx-auto mb-4" />
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to continue to Smart Job Finder
            </p>
          </div>
          
          <div className="glass-card rounded-lg p-6">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center space-x-2 h-11"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span>Sign in with Google</span>
            </Button>
            
            <div className="flex items-center my-6">
              <Separator className="flex-1" />
              <span className="mx-4 text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, rememberMe: checked === true }))
                  }
                />
                <label 
                  htmlFor="rememberMe" 
                  className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Remember me for 30 days
                </label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full animated-button h-11"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
