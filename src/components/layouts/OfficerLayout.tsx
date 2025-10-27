import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { useAuth } from '../../context/AuthContext';

export const OfficerLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};