import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { parseResume } from '../utils/resumeParser';
import { saveResume } from '../utils/userStorage';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ResumeUploadProps {
  className?: string;
  onUploadComplete?: (fileName: string, fileData: string) => void;
  onUploadSuccess?: () => void;
}

export const ResumeUpload: React.FC<ResumeUploadProps> = ({ className, onUploadComplete, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast.error('Please upload a valid PDF, DOCX, or TXT file');
      return;
    }

    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // First read the file as base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Keep the data URL prefix as we'll need it for proper file handling
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(uploadedFile);
      });

      // Also read as text for parsing
      const textData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsText(uploadedFile);
      });

      // Parse the resume
      const parsedResume = await parseResume(uploadedFile);
      
      // Save the resume with both raw data and parsed text
      await saveResume(uploadedFile.name, base64Data, parsedResume.text || textData);
      
      // Complete the upload
      clearInterval(interval);
      setUploadProgress(100);
      toast.success('Resume uploaded successfully!');
      
      // Call callbacks
      onUploadComplete?.(uploadedFile.name, base64Data);
      onUploadSuccess?.();
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload resume');
      setFile(null);
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, [onUploadComplete, onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    disabled: isUploading
  });

  const fileIcon = () => {
    if (!file) return null;
    
    switch (file.type) {
      case 'application/pdf':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
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
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ease-in-out",
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            isUploading ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          <input {...getInputProps()} />
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
              {isUploading ? (
                <p className="text-gray-600">Uploading resume...</p>
              ) : isDragActive ? (
                <p className="text-blue-600">Drop your resume here</p>
              ) : (
                <>
                  <p className="text-gray-600">Drag and drop your resume here, or click to select</p>
                  <p className="text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</p>
                </>
              )}
            </div>
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
          ) : uploadProgress === 100 ? (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Uploaded
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
