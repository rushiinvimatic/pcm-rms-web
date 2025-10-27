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
        "w-full bg-white fixed top-0 left-0 z-50 transition-all duration-300 border-b-2",
        isScrolled ? "shadow-lg py-2 border-slate-200 bg-white/95 backdrop-blur-sm" : "border-amber-400 py-3"
      )}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link 
          to="/" 
          className="flex items-center space-x-4 group"
          aria-label="Go to homepage"
        >
          <div className="transition-transform duration-300 group-hover:scale-105">
            <PMCLogo size="medium" />
          </div>
          <div className="transition-opacity duration-300 group-hover:opacity-90">
            <h1 className="text-lg font-bold text-slate-900">PCMC Registration Portal</h1>
            <p className="text-xs text-amber-600 font-medium">Pimpri-Chinchwad Municipal Corporation</p>
            <p className="text-xs text-slate-500">Government of Maharashtra</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        {variant === 'default' && (
          <nav className="hidden md:flex items-center space-x-8">
            {['Citizen Services', 'Application Status', 'Support', 'About PCMC'].map((item, index) => (
              <Link 
                key={index}
                to={item === 'Citizen Services' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} 
                className={cn(
                  "text-slate-700 font-medium text-sm relative py-2 px-1",
                  "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-500 after:scale-x-0 after:origin-right",
                  "hover:text-slate-900 hover:after:scale-x-100 hover:after:origin-left after:transition-transform after:duration-300"
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
            className="text-slate-700 hover:text-slate-900 focus:outline-none p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
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
              className="text-sm bg-white border-2 border-slate-700 text-slate-700 hover:bg-slate-50 transition-colors duration-300 font-medium"
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
                className="text-sm text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors duration-300 font-medium" 
                asChild
              >
                <Link to="/auth/login">Login</Link>
              </Button>
              <Button 
                className="text-sm bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white transition-all duration-300 shadow-md hover:shadow-lg font-medium px-6"
                asChild
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
            "md:hidden bg-white absolute left-0 right-0 top-full border-b-2 border-slate-200",
            "overflow-hidden transition-all duration-300 shadow-lg backdrop-blur-sm",
            mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {['Citizen Services', 'Application Status', 'Support', 'About PCMC'].map((item, index) => (
              <Link 
                key={index}
                to={item === 'Citizen Services' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                className="text-slate-700 hover:text-slate-900 font-medium py-3 px-2 transition-colors duration-200 border-l-2 border-transparent hover:border-amber-400"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-200 flex flex-col space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-center text-sm border-2 border-slate-700 text-slate-700 hover:bg-slate-50 font-medium" 
                asChild
              >
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>Citizen Login</Link>
              </Button>
              <Button 
                className="w-full justify-center text-sm bg-gradient-to-r from-slate-800 to-slate-900 text-white font-medium"
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