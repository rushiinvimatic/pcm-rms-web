import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { PMCLogo } from '../../components/common/PMCLogo';

interface ErrorPageProps {
  error?: Error;
  message?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  message = "Something went wrong",
  showRetry = true,
  onRetry
}) => {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* PMC Logo */}
        <div className="mb-6">
          <PMCLogo size="large" />
        </div>

        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {message}
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 mb-6">
          {error ? error.message : "We're experiencing some technical difficulties. Please try again."}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {showRetry && (
            <Button onClick={handleRefresh} className="w-full flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          <Link to="/" className="block w-full">
            <Button variant="outline" className="w-full flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              Go to Homepage
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 mt-6">
          If this problem persists, please contact our support team at{' '}
          <a 
            href="mailto:support@pmc.gov.in" 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            support@pmc.gov.in
          </a>
        </p>
      </div>
    </div>
  );
};