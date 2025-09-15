'use client';

import React from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface DashboardProps {
  children: React.ReactNode;
}

export default function Dashboard({ children }: DashboardProps) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Notes App</h1>
              <span className="ml-4 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                {user?.tenant.name} ({user?.tenant.plan})
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.email}</span>
                <span className="text-gray-500 ml-2">({user?.role})</span>
              </div>
              
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
