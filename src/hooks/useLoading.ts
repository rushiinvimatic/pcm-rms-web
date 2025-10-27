import { useLoading } from '../components/common/GlobalLoader';

// Re-export for convenience
export { useLoading };

// Custom hooks for specific loading scenarios
export const useApiLoading = () => {
  const { withLoader } = useLoading();
  
  const callApi = async <T,>(
    apiCall: () => Promise<T>,
    loadingMessage = 'Please wait...'
  ): Promise<T> => {
    return withLoader(apiCall(), loadingMessage);
  };

  return { callApi };
};

export const useFormSubmission = () => {
  const { withLoader } = useLoading();
  
  const submitForm = async <T,>(
    submitFn: () => Promise<T>,
    loadingMessage = 'Submitting...'
  ): Promise<T> => {
    return withLoader(submitFn(), loadingMessage);
  };

  return { submitForm };
};

export const useFileUpload = () => {
  const { withLoader } = useLoading();
  
  const uploadFile = async <T,>(
    uploadFn: () => Promise<T>,
    loadingMessage = 'Uploading file...'
  ): Promise<T> => {
    return withLoader(uploadFn(), loadingMessage);
  };

  return { uploadFile };
};