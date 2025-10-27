import React, { useState } from 'react';
import { Button } from '../ui/button';
import { AlertTriangle, Bug, RefreshCw } from 'lucide-react';

// Component that throws an error for testing
const ErrorThrower: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('This is a test error for ErrorBoundary demonstration');
  }
  return <div className="text-green-600">✅ Component is working correctly!</div>;
};

// Component that throws an async error (won't be caught by ErrorBoundary)
const AsyncErrorThrower: React.FC = () => {
  const [hasAsyncError, setHasAsyncError] = useState(false);

  const triggerAsyncError = () => {
    setTimeout(() => {
      setHasAsyncError(true);
      throw new Error('This async error will not be caught by ErrorBoundary');
    }, 1000);
  };

  if (hasAsyncError) {
    return <div className="text-red-600">❌ Async error occurred (not caught by ErrorBoundary)</div>;
  }

  return (
    <Button onClick={triggerAsyncError} variant="outline" className="text-orange-600">
      Trigger Async Error (Not Caught)
    </Button>
  );
};

const ErrorBoundaryTest: React.FC = () => {
  const [shouldThrow, setShouldThrow] = useState(false);
  const [renderKey, setRenderKey] = useState(0);

  const triggerError = () => {
    setShouldThrow(true);
  };

  const resetComponent = () => {
    setShouldThrow(false);
    setRenderKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bug className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">ErrorBoundary Test Component</h1>
          </div>

          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Test Instructions
              </h2>
              <ul className="text-blue-800 space-y-2">
                <li>• Click "Trigger Error" to test ErrorBoundary functionality</li>
                <li>• The ErrorBoundary should catch the error and show a fallback UI</li>
                <li>• Use "Reset Component" to clear the error state</li>
                <li>• Async errors (setTimeout, promises) are NOT caught by ErrorBoundary</li>
              </ul>
            </div>

            {/* Error trigger section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ErrorBoundary Test</h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Button 
                    onClick={triggerError}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Trigger Error
                  </Button>
                  
                  <Button 
                    onClick={resetComponent}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Component
                  </Button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-900 mb-2">Component Status:</h4>
                  <ErrorThrower key={renderKey} shouldThrow={shouldThrow} />
                </div>
              </div>
            </div>

            {/* Async error test */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Async Error Test (Not Caught by ErrorBoundary)</h3>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  This demonstrates that ErrorBoundary only catches errors during the render phase, 
                  not async operations like setTimeout or promises.
                </p>
                
                <AsyncErrorThrower />
              </div>
            </div>

            {/* ErrorBoundary features */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">ErrorBoundary Features</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold text-green-800 mb-2">✅ What ErrorBoundary Catches:</h4>
                  <ul className="text-green-700 space-y-1">
                    <li>• Render method errors</li>
                    <li>• Lifecycle method errors</li>
                    <li>• Constructor errors</li>
                    <li>• Child component errors</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-red-800 mb-2">❌ What ErrorBoundary Doesn't Catch:</h4>
                  <ul className="text-red-700 space-y-1">
                    <li>• Event handler errors</li>
                    <li>• Async code errors (setTimeout, promises)</li>
                    <li>• Server-side rendering errors</li>
                    <li>• Errors thrown in the ErrorBoundary itself</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                ErrorBoundary is already integrated in the app layout
              </div>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
              >
                Go Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundaryTest;
