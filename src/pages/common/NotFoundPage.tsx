import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-100 rounded-full opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Main illustration */}
        <div className="mb-8 relative">
          <div className="relative inline-block">
            {/* Astronaut illustration */}
            <div className="relative w-48 h-48 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full opacity-20 animate-pulse"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                    <Search className="w-10 h-10 text-blue-600" />
                  </div>
                </div>
              </div>
              {/* Floating elements around the main circle */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-float"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full animate-float delay-500"></div>
              <div className="absolute top-1/2 -right-8 w-4 h-4 bg-green-400 rounded-full animate-float delay-1000"></div>
            </div>
          </div>
        </div>

        {/* Error code */}
        <div className="mb-6">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-pulse">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 text-lg text-gray-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Page Not Found</span>
          </div>
        </div>

        {/* Main message */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Oops! You're lost in space
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-lg mx-auto leading-relaxed">
            The page you're looking for seems to have drifted away into the digital void. 
            Don't worry, even the best astronauts get lost sometimes!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={handleGoHome}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
          
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="w-full sm:w-auto px-8 py-3 border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful suggestions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            What can you do?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Home className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-900">Go Home</span>
              <span className="text-gray-600 text-center">Return to the main page</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <ArrowLeft className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-900">Go Back</span>
              <span className="text-gray-600 text-center">Return to previous page</span>
            </div>
            
            <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Search className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-900">Search</span>
              <span className="text-gray-600 text-center">Use the search feature</span>
            </div>
          </div>
        </div>

        {/* Contact information */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            Still having trouble? Contact our support team at{' '}
            <a 
              href="mailto:support@pmc.gov.in" 
              className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
            >
              support@pmc.gov.in
            </a>
          </p>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFoundPage;
