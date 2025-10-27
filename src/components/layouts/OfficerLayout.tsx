import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { useAuth } from '../../context/AuthContext';

const getRoleTitle = (role: string) => {
  const roleMap: { [key: string]: string } = {
    juniorengineer: 'Junior Engineer',
    assistantengineer: 'Assistant Engineer',
    chiefengineer: 'Chief Engineer',
    cityengineer: 'City Engineer',
    clerk: 'Clerk'
  };
  
  const roleName = roleMap[role.toLowerCase()] || role;
  return `${roleName} Dashboard`;
};

export const OfficerLayout: React.FC = () => {
  const { user } = useAuth();
  
  const title = user?.role ? getRoleTitle(user.role) : 'Officer Dashboard';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title={title} subtitle="PMCRMS - Pune Municipal Corporation" />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};