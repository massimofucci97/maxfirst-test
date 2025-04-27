import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AlertCircle } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

const Layout: React.FC = () => {
  const { error } = useFinance();

  return (
    <div className="flex h-screen bg-background-dark text-white">
      <Sidebar />
      
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 bg-error-900 text-error-100 rounded-md border border-error-700 fade-in">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;