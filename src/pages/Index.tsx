
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/Navbar';
import AnimatedLogo from '@/components/AnimatedLogo';
import { motion } from 'framer-motion';

const Index = () => {
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 px-4">
        <div className="page-container">
          <motion.div 
            className="max-w-3xl mx-auto text-center space-y-6"
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
          >
            <motion.div 
              className="mx-auto w-20 h-20 mb-6"
              variants={fadeIn}
            >
              <AnimatedLogo className="w-full h-full" />
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight"
            >
              Find the perfect job match with <span className="text-gradient">AI precision</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto"
            >
              Smart Job Finder uses AI to analyze your resume, search job listings, and match you with opportunities perfectly aligned with your skills and experience.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            >
              <Link to="/signup">
                <Button size="lg" className="animated-button px-6">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  I already have an account
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section ref={sectionRef} className="py-20 bg-accent/50">
        <div className="page-container">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Badge variant="outline" className="mb-4 px-3 py-1">
              How It Works
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find your dream job in 3 simple steps</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our intelligent platform streamlines your job search process from start to finish
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Upload Your Resume",
                description: "Start by uploading your resume. Our AI will analyze your skills, experience, and preferences.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )
              },
              {
                title: "Discover Matching Jobs",
                description: "Our AI searches across job boards and company websites to find positions that match your profile.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )
              },
              {
                title: "Apply with Confidence",
                description: "View personalized match scores and get AI-tailored resumes and cover letters for each opportunity.",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="glass-card p-6 rounded-lg hover-card"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              >
                <div className="bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "1M+", label: "Jobs Analyzed" },
              { number: "85%", label: "Match Accuracy" },
              { number: "200+", label: "Job Boards" },
              { number: "10K+", label: "Successful Matches" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-20 bg-accent/50">
        <div className="page-container">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1">
              Success Stories
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What our users say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Thousands of job seekers have found their dream positions using Smart Job Finder
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I found a job that perfectly matched my skills within just two weeks. The match score was 92% and they were right!",
                author: "Sarah J.",
                position: "UX Designer",
                company: "TechVision Inc."
              },
              {
                quote: "The AI-tailored resume got me more interviews than I've ever had. I'm now working at my dream company.",
                author: "Michael T.",
                position: "Software Engineer",
                company: "Quantum Solutions"
              },
              {
                quote: "After months of searching on my own, Smart Job Finder connected me with the perfect role that I wouldn't have found otherwise.",
                author: "Jessica L.",
                position: "Project Manager",
                company: "Elevate Innovations"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="glass-card p-6 rounded-lg relative"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.2 }}
              >
                <div className="text-primary text-5xl absolute -top-4 -left-2 opacity-20">"</div>
                <p className="mb-6 relative z-10">{testimonial.quote}</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.position}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="page-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to find your perfect job match?</h2>
            <p className="text-primary-foreground/80 mb-8">
              Join thousands of successful job seekers who have found their dream positions with Smart Job Finder.
            </p>
            <Link to="/signup">
              <Button 
                size="lg" 
                variant="secondary" 
                className="animated-button px-8 font-medium"
              >
                Get Started For Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="page-container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <AnimatedLogo className="h-8 w-8 mr-2" />
              <span className="font-semibold text-lg">SmartJob</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </div>
            
            <div className="mt-6 md:mt-0 flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Smart Job Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
