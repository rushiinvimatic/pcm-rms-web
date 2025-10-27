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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'border-amber-500 text-slate-900 bg-amber-50'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
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