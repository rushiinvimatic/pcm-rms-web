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
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${dragging ? 'border-blue-500 bg-blue-50' : error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
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

        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div className="text-sm text-gray-600">
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </div>
            ) : uploadedFileId && uploadedFileName ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-green-800 font-medium">{uploadedFileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">File ID: {uploadedFileId}</p>
                </div>
                <p className="text-xs text-gray-500">Click to upload a different file</p>
              </div>
            ) : currentFile ? (
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">{currentFile.name}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove file"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Ready to upload</p>
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium">
                  {label} {required && <span className="text-red-500">*</span>}
                </p>
                <p>Drag & drop or click to select</p>
                <p className="text-xs">
                  Max size: {maxSize}MB | Accepted formats: {accept}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};