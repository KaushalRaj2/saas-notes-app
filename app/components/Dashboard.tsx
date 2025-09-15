'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface DashboardProps {
  children: React.ReactNode;
  currentPage?: 'dashboard' | 'notes' | 'admin' | 'profile';
  onNavigate?: (page: 'dashboard' | 'notes' | 'admin' | 'profile') => void;
}

export default function Dashboard({ children, currentPage = 'notes', onNavigate }: DashboardProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
  { 
    name: 'Home', 
    key: 'dashboard' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
      </svg>
    ), 
    current: currentPage === 'dashboard',
    available: true 
  },
  { 
    name: 'Notes', 
    key: 'notes' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ), 
    current: currentPage === 'notes',
    available: true 
  },
  // ADD THIS ADMIN NAVIGATION ITEM
  { 
    name: 'Settings', 
    key: 'admin' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), 
    current: currentPage === 'admin',
    available: user?.role === 'admin' // Only show for admins
  },
  { 
    name: 'Profile', 
    key: 'profile' as const,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ), 
    current: currentPage === 'profile',
    available: true 
  }
];


  const handleNavClick = (page: 'dashboard' | 'notes' | 'admin' | 'profile') => {
    setSidebarOpen(false);
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-25"></div>
        </div>
      )}

      {/* Evernote-Style Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Evernote Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.5 2A1.5 1.5 0 007 3.5V5H5.5A1.5 1.5 0 004 6.5v12A1.5 1.5 0 005.5 20h12a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0017.5 5H16V3.5A1.5 1.5 0 0014.5 2h-6zM9 3.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V5H9V3.5zM5.5 6H17.5a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-12a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5z"/>
                </svg>
              </div>
              <span className="font-semibold text-gray-900 text-lg">Notes</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.filter(item => item.available).map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.key)}
                className={`
                  w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150
                  ${item.current
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>

          {/* User Info */}
          <div className="px-4 py-4 border-t border-gray-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-700 font-medium text-sm">
                  {user?.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email.split('@')[0]}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.tenant.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`
                inline-flex px-2 py-1 text-xs font-medium rounded
                ${user?.tenant.plan === 'pro' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
                }
              `}>
                {user?.tenant.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
              <span className="text-xs text-gray-500">
                {user?.tenant.noteLimit === -1 ? 'Unlimited' : `${user?.tenant.noteLimit} notes`}
              </span>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Evernote-Style Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page Title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-xl font-semibold text-gray-900">
                {currentPage === 'dashboard' && 'Home'}
                {currentPage === 'notes' && 'All Notes'}
                {currentPage === 'profile' && 'Account'}
                {currentPage === 'admin' && 'Settings'}
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5-5V9.09c0-1.06-.6-2.04-1.56-2.56A3 3 0 0012 6c-1.66 0-3 1.34-3 3v3.09L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
