import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  className?: string;
  onUploadComplete?: (fileName: string, fileData: string) => void;
}

const ResumeUpload = ({ className, onUploadComplete }: ResumeUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFile(droppedFile)) {
      handleFileSelection(droppedFile);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFile(selectedFile)) {
      handleFileSelection(selectedFile);
    } else if (selectedFile) {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF, DOCX, or TXT file.",
        variant: "destructive"
      });
    }
  };

  const isValidFile = (file: File) => {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    return validTypes.includes(file.type);
  };

  const handleFileSelection = (selectedFile: File) => {
    setFile(selectedFile);
    simulateUpload(selectedFile);
  };

  const simulateUpload = (uploadedFile: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileData = e.target?.result as string;
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            
            toast({
              title: "Upload complete",
              description: `Successfully uploaded ${uploadedFile.name}`,
            });
            
            if (onUploadComplete) {
              onUploadComplete(uploadedFile.name, fileData);
            }
            
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    };
    
    reader.onerror = () => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: "Failed to read the file",
        variant: "destructive"
      });
    };
    
    reader.readAsDataURL(uploadedFile);
  };

  const fileIcon = () => {
    if (!file) return null;
    
    if (file.type === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      {!file ? (
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border hover:border-primary/50 hover:bg-accent/50",
            className
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium mb-1">Upload your resume</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop your file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOCX, or TXT (Max 5MB)
              </p>
            </div>
            <label>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <Button type="button" variant="outline" className="mt-2">
                Browse Files
              </Button>
            </label>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            {fileIcon()}
            <div className="flex-1 truncate">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFile(null)}
              disabled={isUploading}
            >
              Change
            </Button>
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-1.5" />
            </div>
          ) : (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
