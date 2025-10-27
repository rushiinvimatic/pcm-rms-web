import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { useLoading, useApiLoading, useFormSubmission } from '../../hooks/useLoading';
import { SkeletonLoader, CardSkeleton, TableSkeleton } from '../../components/common/GlobalLoader';
import { AlertTriangle, Loader2, CheckCircle, XCircle } from 'lucide-react';

// Component that throws an error for testing
const ErrorThrowingComponent: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error thrown by the ErrorBoundary demo component!');
  }
  return <div className="text-green-600">Component is working normally!</div>;
};

export const LoaderErrorBoundaryDemo: React.FC = () => {
  const [throwError, setThrowError] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(false);
  
  const { showLoader, hideLoader } = useLoading();
  const { callApi } = useApiLoading();
  const { submitForm } = useFormSubmission();

  const handleGlobalLoader = () => {
    showLoader('Processing your request...');
    setTimeout(() => {
      hideLoader();
    }, 3000);
  };

  const handleApiCall = async () => {
    try {
      await callApi(
        () => new Promise(resolve => setTimeout(resolve, 2000)),
        'Fetching data from server...'
      );
      alert('API call completed successfully!');
    } catch (error) {
      alert('API call failed!');
    }
  };

  const handleFormSubmit = async () => {
    try {
      await submitForm(
        () => new Promise(resolve => setTimeout(resolve, 1500)),
        'Submitting form data...'
      );
      alert('Form submitted successfully!');
    } catch (error) {
      alert('Form submission failed!');
    }
  };

  const handleAsyncError = async () => {
    try {
      await callApi(
        () => new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Simulated API error')), 1000)
        ),
        'This will fail...'
      );
    } catch (error) {
      alert(`Caught error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Error Boundary & Global Loader Demo
        </h1>
        <p className="text-gray-600">
          Test the error handling and loading states of the application
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Error Boundary Demo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Error Boundary Demo
          </h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <ErrorThrowingComponent shouldThrow={throwError} />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setThrowError(!throwError)}
                variant={throwError ? "destructive" : "default"}
                className="flex-1"
              >
                {throwError ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reset Component
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Trigger Error
                  </>
                )}
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Graceful error handling with user-friendly UI</li>
                <li>Error reporting with unique error IDs</li>
                <li>Retry functionality</li>
                <li>Development error details</li>
                <li>Bug reporting integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Global Loader Demo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-blue-500" />
            Global Loader Demo
          </h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Button onClick={handleGlobalLoader} className="w-full">
                Show Global Loader
              </Button>
              
              <Button onClick={handleApiCall} variant="outline" className="w-full">
                Simulate API Call
              </Button>
              
              <Button onClick={handleFormSubmit} variant="outline" className="w-full">
                Simulate Form Submit
              </Button>
              
              <Button onClick={handleAsyncError} variant="destructive" className="w-full">
                Simulate API Error
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Features:</strong></p>
              <ul className="list-disc list-inside space-y-1">
                <li>Global overlay loader with PMC branding</li>
                <li>Context-based loading state management</li>
                <li>Custom loading messages</li>
                <li>Async operation wrapping</li>
                <li>Multiple size variants</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Loaders Demo */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Skeleton Loaders Demo</h2>
          <Button
            onClick={() => setShowSkeletons(!showSkeletons)}
            variant="outline"
          >
            {showSkeletons ? 'Hide' : 'Show'} Skeletons
          </Button>
        </div>

        {showSkeletons ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Skeleton */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Basic Skeleton</h3>
              <SkeletonLoader count={5} height="h-4" />
            </div>

            {/* Card Skeleton */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Card Skeleton</h3>
              <CardSkeleton />
            </div>

            {/* Table Skeleton */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Table Skeleton</h3>
              <TableSkeleton rows={4} columns={3} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sample Content */}
            <div>
              <h3 className="font-medium text-gray-700 mb-3">Sample List</h3>
              <div className="space-y-2">
                <div className="p-2 bg-gray-50 rounded">Application #001</div>
                <div className="p-2 bg-gray-50 rounded">Application #002</div>
                <div className="p-2 bg-gray-50 rounded">Application #003</div>
                <div className="p-2 bg-gray-50 rounded">Application #004</div>
                <div className="p-2 bg-gray-50 rounded">Application #005</div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Sample Card</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">Application Approved</h4>
                    <p className="text-sm text-gray-500">PMC/2024/001</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Your building permit application has been successfully approved.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-3">Sample Table</h3>
              <div className="overflow-hidden">
                <div className="flex font-medium text-gray-700 mb-2 pb-2 border-b">
                  <div className="flex-1">ID</div>
                  <div className="flex-1">Status</div>
                  <div className="flex-1">Date</div>
                </div>
                <div className="space-y-1">
                  <div className="flex text-sm">
                    <div className="flex-1">#001</div>
                    <div className="flex-1">Approved</div>
                    <div className="flex-1">Jan 15</div>
                  </div>
                  <div className="flex text-sm">
                    <div className="flex-1">#002</div>
                    <div className="flex-1">Pending</div>
                    <div className="flex-1">Jan 18</div>
                  </div>
                  <div className="flex text-sm">
                    <div className="flex-1">#003</div>
                    <div className="flex-1">Review</div>
                    <div className="flex-1">Jan 20</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};