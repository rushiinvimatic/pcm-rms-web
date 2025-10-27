import axios from 'axios';

const API_URL = import.meta.env.DEV 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || 'http://localhost:5012/api');

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    'Accept': '*/*',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-access-token'] = token;
  }
  return config;
});

export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  filePath: string;
}

export const fileService = {
  /**
   * Upload a file to the server
   * @param file - The file to upload
   * @returns Promise with file upload response
   */
  uploadFile: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/File/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // The API returns just the file ID as a string
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${file.name}`);
    }
  },

  /**
   * Upload multiple files
   * @param files - Array of files to upload
   * @returns Promise with array of file IDs
   */
  uploadMultipleFiles: async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => fileService.uploadFile(file));
    return Promise.all(uploadPromises);
  },

  /**
   * Get file download URL
   * @param fileId - The file ID returned from upload
   * @returns Download URL
   */
  getFileDownloadUrl: (fileId: string): string => {
    return `${API_URL}/File/${fileId}/download`;
  },

  /**
   * Download a file
   * @param fileId - The file ID
   * @returns Promise with blob data
   */
  downloadFile: async (fileId: string): Promise<Blob> => {
    try {
      // First try with responseType 'blob' for direct blob response
      const response = await api.get(`/File/${fileId}/download`, {
        responseType: 'blob',
      });
      
      // If response is already a blob, return it
      if (response.data instanceof Blob) {
        return response.data;
      }
      
      // If response is a byte array or other format, convert to blob
      let blobData: BlobPart[] = [];
      
      if (response.data instanceof ArrayBuffer) {
        blobData = [response.data];
      } else if (Array.isArray(response.data)) {
        // Handle byte array response
        const uint8Array = new Uint8Array(response.data);
        blobData = [uint8Array];
      } else if (typeof response.data === 'string') {
        // Handle base64 string response
        const binaryString = atob(response.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blobData = [bytes];
      } else {
        // Fallback: try to convert whatever we got to blob
        blobData = [response.data];
      }
      
      // Determine MIME type based on file extension
      const extension = fileId.toLowerCase().split('.').pop();
      let mimeType = 'application/octet-stream';
      
      if (extension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      } else if (extension === 'txt') {
        mimeType = 'text/plain';
      } else if (['doc', 'docx'].includes(extension || '')) {
        mimeType = 'application/msword';
      }
      
      return new Blob(blobData, { type: mimeType });
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${fileId}`);
    }
  },

  /**
   * Download a file with alternative method for byte array responses
   * @param fileId - The file ID
   * @returns Promise with blob data
   */
  downloadFileAsArrayBuffer: async (fileId: string): Promise<Blob> => {
    try {
      const response = await api.get(`/File/${fileId}/download`, {
        responseType: 'arraybuffer',
      });
      
      // Determine MIME type based on file extension
      const extension = fileId.toLowerCase().split('.').pop();
      let mimeType = 'application/octet-stream';
      
      if (extension === 'pdf') {
        mimeType = 'application/pdf';
      } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
        mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      }
      
      return new Blob([response.data], { type: mimeType });
    } catch (error) {
      console.error('Error downloading file as array buffer:', error);
      throw new Error(`Failed to download file: ${fileId}`);
    }
  },

  /**
   * Download recommended form with multiple fallback methods
   * @param filePath - The file path
   * @returns Promise with blob data
   */
  downloadRecommendedForm: async (filePath: string): Promise<Blob> => {    
    const methods = [
      // Method 1: Try as blob response
      () => api.get(`/File/${filePath}/download`, { responseType: 'blob' }),
      // Method 2: Try as arraybuffer
      () => api.get(`/File/${filePath}/download`, { responseType: 'arraybuffer' }),
      // Method 3: Try without responseType (for byte array)
      () => api.get(`/File/${filePath}/download`),
      // Method 4: Try direct URL construction
      () => api.get(`/File/download/${filePath}`, { responseType: 'blob' }),
    ];
    
    for (let i = 0; i < methods.length; i++) {
      try {
        const response = await methods[i]();
        
        let blob: Blob;
        
        if (response.data instanceof Blob) {
          blob = response.data;
        } else if (response.data instanceof ArrayBuffer) {
          blob = new Blob([response.data], { type: 'application/pdf' });
        } else if (Array.isArray(response.data)) {
          // Handle byte array
          const uint8Array = new Uint8Array(response.data);
          blob = new Blob([uint8Array], { type: 'application/pdf' });
        } else if (typeof response.data === 'string') {
          // Handle base64 string
          try {
            const binaryString = atob(response.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let j = 0; j < binaryString.length; j++) {
              bytes[j] = binaryString.charCodeAt(j);
            }
            blob = new Blob([bytes], { type: 'application/pdf' });
          } catch {
            // If not base64, treat as text
            blob = new Blob([response.data], { type: 'application/pdf' });
          }
        } else {
          // Last resort
          blob = new Blob([response.data], { type: 'application/pdf' });
        }
        
        if (blob && blob.size > 0) {
          return blob;
        }
      } catch (error) {
        console.log(`Method ${i + 1} failed:`, error);
        if (i === methods.length - 1) {
          throw error; // Re-throw on last attempt
        }
      }
    }
    
    throw new Error('All download methods failed for recommended form');
  },

  /**
   * Validate file before upload
   * @param file - File to validate
   * @param maxSize - Maximum file size in bytes (default 5MB)
   * @param allowedTypes - Array of allowed MIME types
   * @returns Validation result
   */
  validateFile: (
    file: File, 
    maxSize: number = 5 * 1024 * 1024, // 5MB
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
  ): { isValid: boolean; error?: string } => {
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      };
    }

    return { isValid: true };
  },

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};