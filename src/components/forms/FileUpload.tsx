import React, { useState, useRef } from 'react';
import { useToast } from '../../hooks/use-toast';
import { fileService } from '../../services/file.service';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileUpload?: (fileId: string, fileName: string) => void;
  onFileDelete?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  label?: string;
  currentFile?: File | null;
  uploadedFileId?: string;
  uploadedFileName?: string;
  uploadImmediately?: boolean;
  required?: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileUpload,
  onFileDelete,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 2, // 2MB default
  label = "Upload File",
  currentFile,
  uploadedFileId,
  uploadedFileName,
  uploadImmediately = true, // Default to true for immediate upload
  required = false,
  error,
}) => {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragging(true);
    } else if (e.type === "dragleave") {
      setDragging(false);
    }
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size should be less than ${maxSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const acceptedTypes = accept.split(',');
    const fileType = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileType)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a file of type: ${accept}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);

    const { files } = e.dataTransfer;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
        
        if (uploadImmediately && onFileUpload) {
          setUploading(true);
          try {
            const fileId = await fileService.uploadFile(file);
            onFileUpload(fileId, file.name);
            toast({
              title: "File uploaded successfully",
              description: `${file.name} uploaded. File ID: ${fileId}`,
            });
          } catch (error) {
            console.error('Upload error:', error);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: "destructive",
            });
          } finally {
            setUploading(false);
          }
        }
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      if (validateFile(file)) {
        onFileSelect(file);
        
        if (uploadImmediately && onFileUpload) {
          setUploading(true);
          try {
            const fileId = await fileService.uploadFile(file);
            onFileUpload(fileId, file.name);
            toast({
              title: "File uploaded successfully",
              description: `${file.name} uploaded. File ID: ${fileId}`,
            });
          } catch (error) {
            console.error('Upload error:', error);
            toast({
              title: "Upload failed",
              description: `Failed to upload ${file.name}. Please try again.`,
              variant: "destructive",
            });
          } finally {
            setUploading(false);
          }
        }
      }
    }
    // Clear the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleDelete = () => {
    if (onFileDelete) {
      onFileDelete();
      toast({
        title: "File removed",
        description: "File has been removed from the form.",
      });
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg transition-colors
          ${dragging ? 'border-blue-500 bg-blue-50' : error ? 'border-red-300 bg-red-50' : 
            uploadedFileId ? 'border-green-300 bg-green-50' : 'border-slate-300 hover:border-slate-400 bg-white'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${uploadedFileId ? 'p-3' : 'p-4'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
        />

        <div>
          {uploading ? (
            <div className="flex items-center justify-center gap-2 py-2">
              <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-blue-600">Uploading file...</span>
            </div>
          ) : uploadedFileId && uploadedFileName ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-green-900 truncate">{uploadedFileName}</p>
                  <p className="text-xs text-green-700 font-medium">✓ Uploaded Successfully</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-white rounded"
                title="Remove and upload different file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : currentFile ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">{currentFile.name}</p>
                  <p className="text-xs text-amber-600 font-medium">⏳ Waiting to upload...</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                className="flex-shrink-0 text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-white rounded"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-slate-700 font-medium mb-1">
                {label}
              </p>
              <p className="text-xs text-slate-500">Drag & drop or click to select</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-xs mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};