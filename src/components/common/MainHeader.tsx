import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/button';
import { PMCLogo } from './PMCLogo';

interface MainHeaderProps {
  variant?: 'default' | 'auth';
}

export const MainHeader: React.FC<MainHeaderProps> = ({ variant = 'default' }) => {
  const location = useLocation();
  const isOfficerLogin = location.pathname.includes('officer');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "w-full bg-white fixed top-0 left-0 z-10 transition-all duration-300",
        isScrolled ? "shadow-md py-2" : "border-b border-gray-100 py-3"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-3 group"
          aria-label="Go to homepage"
        >
          <div className="transition-transform duration-300 group-hover:scale-105">
            <PMCLogo size="medium" />
          </div>
          <div className="transition-opacity duration-300 group-hover:opacity-90">
            <h1 className="text-lg font-semibold text-gray-900">PMCRMS</h1>
            <p className="text-xs text-gray-500">Pune Municipal Corporation</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {variant === 'default' && (
          <nav className="hidden md:flex items-center space-x-8">
            {['Home', 'Services', 'About Us', 'Contact'].map((item, index) => (
              <Link 
                key={index}
                to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                className={cn(
                  "text-gray-600 font-medium text-sm relative py-2",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-600 after:scale-x-0 after:origin-right",
                  "hover:text-blue-600 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
                )}
              >
                {item}
              </Link>
            ))}
          </nav>
        )}

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none"
          >
            {!mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
          </button>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {variant === 'auth' ? (
            <Button
              variant="outline"
              className="text-sm bg-white border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors duration-300"
              asChild
            >
              <Link to={isOfficerLogin ? '/auth/login' : '/auth/officer-login'}>
                {isOfficerLogin ? 'Citizen Login' : 'Officer Login'}
              </Link>
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="text-sm hover:text-blue-600 transition-colors duration-300" 
                asChild
              >
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button 
                variant="default" 
                className="text-sm bg-blue-600 hover:bg-blue-700 transition-all duration-300 shadow-sm hover:shadow"
              >
                <Link to="/auth/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {variant === 'default' && (
        <div 
          className={cn(
            "md:hidden bg-white absolute left-0 right-0 top-full border-b border-gray-100",
            "overflow-hidden transition-all duration-300 shadow-md",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            {['Home', 'Services', 'About Us', 'Contact'].map((item, index) => (
              <Link 
                key={index}
                to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-gray-600 hover:text-blue-600 font-medium py-2 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100 flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-center text-sm" 
                asChild
              >
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              </Button>
              <Button 
                variant="default" 
                className="w-full justify-center text-sm bg-blue-600"
                asChild
              >
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>Register</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};