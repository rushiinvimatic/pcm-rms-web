import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ExternalLink, Home } from 'lucide-react';

const NotFoundTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">404 Page Test</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">Test the 404 Page</h2>
              <p className="text-blue-800 mb-4">
                Click the links below to test the 404 Not Found page. These routes don't exist and should trigger the 404 page.
              </p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  <Link 
                    to="/nonexistent-page" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    /nonexistent-page
                  </Link>
                  
                  <Link 
                    to="/random-route" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    /random-route
                  </Link>
                  
                  <Link 
                    to="/this-does-not-exist" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    /this-does-not-exist
                  </Link>
                  
                  <Link 
                    to="/user/invalid-route" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    /user/invalid-route
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-green-900 mb-3">404 Page Features</h2>
              <ul className="text-green-800 space-y-2">
                <li>✅ Modern, aesthetic design with space theme</li>
                <li>✅ Animated illustrations and floating particles</li>
                <li>✅ Responsive layout for desktop and mobile</li>
                <li>✅ "Go Home" and "Go Back" navigation buttons</li>
                <li>✅ Helpful suggestions for users</li>
                <li>✅ Contact information for support</li>
                <li>✅ Smooth animations and transitions</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-yellow-900 mb-3">ErrorBoundary Features</h2>
              <ul className="text-yellow-800 space-y-2">
                <li>✅ Catches JavaScript errors in component tree</li>
                <li>✅ Shows friendly fallback UI</li>
                <li>✅ Logs error details to console</li>
                <li>✅ Provides retry and navigation options</li>
                <li>✅ Includes error reporting functionality</li>
                <li>✅ Development mode shows detailed error info</li>
                <li>✅ Accessible with proper ARIA labels</li>
              </ul>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                Test both 404 page and ErrorBoundary functionality
              </div>
              
              <div className="flex gap-3">
                <Link to="/demo/error-boundary">
                  <Button variant="outline">
                    Test ErrorBoundary
                  </Button>
                </Link>
                
                <Link to="/">
                  <Button className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundTest;
