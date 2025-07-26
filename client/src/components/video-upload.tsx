import { useState, useRef } from "react";
import { CloudUpload, Video, FolderOpen } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function VideoUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      // Use fetch directly for file upload instead of apiRequest
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear any running progress interval
      if ((window as any).uploadProgressInterval) {
        clearInterval((window as any).uploadProgressInterval);
      }
      
      // Complete the progress bar
      setUploadProgress(100);
      
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Upload Complete",
        description: "Video uploaded successfully. Processing heatmap...",
      });
      
      // Reset after a short delay to show completion
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    },
    onError: (error: any) => {
      // Clear any running progress interval
      if ((window as any).uploadProgressInterval) {
        clearInterval((window as any).uploadProgressInterval);
      }
      
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      });
      setIsUploading(false);
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid File",
        description: "Please select a video file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 500MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Stop at 90% and let the success handler complete it
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Store interval to clear it on success/error
    (window as any).uploadProgressInterval = progressInterval;

    uploadMutation.mutate(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className="bg-gray-800/70 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-fade-in animate-float shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center animate-slide-in-left">
        <CloudUpload className="text-blue-400 mr-3 animate-glow" size={24} />
        Video Upload
      </h2>
      
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
        className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-400 transition-all cursor-pointer group animate-scale-pulse"
      >
        <div className="group-hover:scale-110 transition-transform">
          <Video className="mx-auto text-4xl text-slate-400 mb-4 group-hover:text-blue-400 transition-colors animate-float" size={48} />
          <p className="text-lg text-slate-300 mb-2 animate-fade-in">Drop your video file here</p>
          <p className="text-slate-500 text-sm mb-4 animate-fade-in">or click to browse</p>
          <button className="px-6 py-3 gradient-primary rounded-lg text-white font-medium hover:opacity-90 transition-all animate-glow">
            <FolderOpen className="mr-2 inline" size={16} />
            Choose File
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>

      <div className="mt-4 text-sm text-slate-400">
        <p>Supported formats: MP4, AVI, MOV (Max 500MB)</p>
      </div>

      {isUploading && (
        <div className="mt-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-300">Processing video...</span>
            <span className="text-cyan-400">{Math.round(uploadProgress)}%</span>
          </div>
          <Progress 
            value={uploadProgress} 
            className="h-2 bg-slate-700"
          />
        </div>
      )}
    </div>
  );
}
