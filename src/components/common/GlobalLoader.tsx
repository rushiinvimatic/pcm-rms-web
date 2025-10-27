import React from 'react';
import { Loader2 } from 'lucide-react';
import { PMCLogo } from './PMCLogo';

interface GlobalLoaderProps {
  isLoading: boolean;
  message?: string;
  overlay?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  isLoading,
  message = 'Loading...',
  overlay = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const logoSizes = {
    sm: 'small' as const,
    md: 'medium' as const,
    lg: 'large' as const
  };

  if (!isLoading) return null;

  const loaderContent = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* PMC Logo */}
      <div className="mb-2">
        <PMCLogo size={logoSizes[size]} />
      </div>

      {/* Loading Spinner */}
      <div className="relative">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      </div>

      {/* Loading Message */}
      {message && (
        <div className="text-center">
          <p className="text-gray-700 font-medium">{message}</p>
          <div className="mt-2 flex justify-center space-x-1">
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="h-1 w-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );

  // Overlay version (full screen)
  if (overlay) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full mx-4">
          {loaderContent}
        </div>
      </div>
    );
  }

  // Inline version
  return (
    <div className="flex items-center justify-center p-8">
      {loaderContent}
    </div>
  );
};

// Loading context for global state management
import { createContext, useContext, useState } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  message: string;
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoader: <T>(promise: Promise<T>, message?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');

  const showLoader = (loadingMessage = 'Loading...') => {
    setMessage(loadingMessage);
    setIsLoading(true);
  };

  const hideLoader = () => {
    setIsLoading(false);
    setMessage('Loading...');
  };

  const withLoader = async <T,>(promise: Promise<T>, loadingMessage = 'Loading...'): Promise<T> => {
    try {
      showLoader(loadingMessage);
      const result = await promise;
      return result;
    } finally {
      hideLoader();
    }
  };

  const value: LoadingContextType = {
    isLoading,
    message,
    showLoader,
    hideLoader,
    withLoader,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <GlobalLoader isLoading={isLoading} message={message} />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Higher Order Component for automatic loading states
export const withLoading = <P extends object>(
  Component: React.ComponentType<P>,
  defaultMessage?: string
) => {
  const WrappedComponent = (props: P) => {
    const [isLoading, setIsLoading] = useState(false);

    const componentProps = {
      ...props,
      isLoading,
      setLoading: setIsLoading,
    } as P & { isLoading: boolean; setLoading: (loading: boolean) => void };

    return (
      <>
        <GlobalLoader 
          isLoading={isLoading} 
          message={defaultMessage} 
          overlay={false}
        />
        <Component {...componentProps} />
      </>
    );
  };

  WrappedComponent.displayName = `withLoading(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// Skeleton Loader Components
export const SkeletonLoader: React.FC<{
  className?: string;
  count?: number;
  height?: string;
  width?: string;
}> = ({ className = '', count = 1, height = 'h-4', width = 'w-full' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${height} ${width} bg-gray-200 rounded animate-pulse`}
        />
      ))}
    </div>
  );
};

export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="animate-pulse">
        <div className="flex items-center space-x-4 mb-4">
          <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex space-x-4 mb-4 pb-2 border-b border-gray-200">
          {Array.from({ length: columns }).map((_, index) => (
            <div key={index} className="flex-1 h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex space-x-4 mb-3">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="flex-1 h-3 bg-gray-200 rounded"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};