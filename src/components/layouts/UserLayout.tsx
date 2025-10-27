import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Header } from '../common/Header';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { path: '/user/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/user/application/new', label: 'New Application', icon: '📝' },
  { path: '/user/applications', label: 'My Applications', icon: '📋' },
  { path: '/user/profile', label: 'Profile', icon: '👤' },
  { path: '/user/documents', label: 'Documents', icon: '📄' },
  { path: '/user/support', label: 'Support', icon: '💬' },
];

export const UserLayout: React.FC = () => {
  const location = useLocation();
  
  const getPageTitle = () => {
    const currentNav = navItems.find(item => item.path === location.pathname);
    return currentNav?.label || 'User Portal';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title={getPageTitle()}
        subtitle="PMCRMS - Pune Municipal Corporation" 
      />
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};