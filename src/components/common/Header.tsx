import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useAuth } from '../../context/AuthContext';
import { PMCLogo } from './PMCLogo';

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const getUserInitials = (name?: string) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white border-b-2 border-amber-400 px-6 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        {/* Left side - Logo and Government Branding */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4">
            {/* PMC Logo */}
            <PMCLogo size="medium" />
            <div>
              <h1 className="text-xl font-bold text-slate-900">PCMC Registration Portal</h1>
              <p className="text-sm text-amber-600 font-medium">Pimpri-Chinchwad Municipal Corporation</p>
              <p className="text-xs text-slate-500">Government of Maharashtra</p>
            </div>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Help
            </Button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 text-left p-2 rounded-lg hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="w-9 h-9 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {getUserInitials(user?.name)}
                </span>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-slate-900">
                  {user?.name || (user?.email?.split('@')[0] || 'User')}
                </div>
                <div className="text-xs text-slate-500">
                  PCMC Portal Access
                </div>
              </div>
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl ring-1 ring-slate-200 z-50">
                <div className="py-2">
                  <div className="px-4 py-3 text-sm text-slate-700 border-b border-slate-100 bg-slate-50">
                    <div className="font-semibold text-slate-900">{user?.name || (user?.email?.split('@')[0] || 'User')}</div>
                    <div className="text-xs text-slate-500">{user?.email}</div>
                    <div className="text-xs text-amber-600 font-medium mt-1">PCMC Portal User</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to profile page
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      // Navigate to help page
                    }}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Help & Support
                  </button>
                  
                  <div className="border-t border-slate-100 mt-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};