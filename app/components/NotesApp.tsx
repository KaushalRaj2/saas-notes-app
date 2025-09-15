'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Dashboard from './Dashboard';
import NotesList from './NotesList';
import NoteModal from './NoteModal';
import AdminPanel from './AdminPanel';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
  };
}

export default function NotesApp() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState<'notes' | 'admin' | 'profile' | 'dashboard'>('notes');
  const { user } = useAuth();

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  const handleNoteSave = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleNavigate = (page: 'dashboard' | 'notes' | 'admin' | 'profile') => {
    setCurrentView(page);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardHome refreshTrigger={refreshTrigger} />;
      
      case 'profile':
        return <ProfilePanel />;
      
      case 'admin':
        if (user?.role !== 'admin') {
          return (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
              <p className="text-gray-600">You need administrator privileges to access this area.</p>
            </div>
          );
        }
        return <AdminPanel />;
      
      default: // 'notes'
        return (
          <div className="space-y-6">
            {/* Notes Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">All Notes</h2>
                <p className="text-gray-600 mt-1">
                  {user?.tenant?.name} • {user?.role} access
                </p>
              </div>
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-150"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Note
              </button>
            </div>

            {/* Notes List */}
            <NotesList 
              onEditNote={handleEditNote}
              refreshTrigger={refreshTrigger}
            />
          </div>
        );
    }
  };

  return (
    <Dashboard currentPage={currentView} onNavigate={handleNavigate}>
      {renderContent()}
      
      {/* Create/Edit Modal */}
      <NoteModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleNoteSave}
        note={editingNote}
      />
    </Dashboard>
  );
}

// Dashboard Home Component with Real Data
function DashboardHome({ refreshTrigger }: { refreshTrigger: number }) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalNotes: 0,
    thisWeekNotes: 0,
    loading: true
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string;
    title: string;
    time: string;
    icon: string;
  }>>([]);

  useEffect(() => {
    fetchDashboardStats();
  }, [refreshTrigger, token]);

  const fetchDashboardStats = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const notes = data.notes || [];
        
        // Calculate stats for current tenant only
        const totalNotes = notes.length;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const thisWeekNotes = notes.filter((note: Note) => 
          new Date(note.createdAt) >= oneWeekAgo
        ).length;

        // Get recent activity (last 3 notes)
        const recentNotes = notes
          .sort((a: Note, b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((note: Note) => ({
            action: 'Created',
            title: note.title,
            time: formatRelativeTime(note.createdAt),
            icon: '📝'
          }));

        setStats({
          totalNotes,
          thisWeekNotes,
          loading: false
        });
        setRecentActivity(recentNotes);
      } else {
        setStats(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          Good evening, {user?.email?.split('@')[0] || 'User'}
        </h2>
        <p className="text-gray-600">Here's what's happening with your notes today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Total Notes</div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-12 rounded"></div>
                ) : (
                  stats.totalNotes
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">This Week</div>
              <div className="text-2xl font-semibold text-gray-900">
                {stats.loading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-8 rounded"></div>
                ) : (
                  stats.thisWeekNotes
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500">Plan</div>
              <div className="text-2xl font-semibold text-gray-900 capitalize">
                {user?.tenant?.plan || 'Unknown'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          {stats.loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.action}</span> "{activity.title}"
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No recent activity</p>
              <p className="text-gray-400 text-xs">Create your first note to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Panel Component with TypeScript Safety
function ProfilePanel() {
  const { user } = useAuth();
  
  const capitalizeFirst = (str?: string) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };
  
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Account Settings</h2>
        <p className="text-gray-600">Manage your account information and preferences.</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-700 font-semibold text-xl">
              {user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.email ?? 'Unknown'}</h3>
            <p className="text-gray-600">
              {capitalizeFirst(user?.role)} • {user?.tenant?.name ?? 'Unknown Organization'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              value={user?.email ?? ''} 
              disabled 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input 
              type="text" 
              value={capitalizeFirst(user?.role)} 
              disabled 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input 
              type="text" 
              value={user?.tenant?.name ?? ''} 
              disabled 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
            <input 
              type="text" 
              value={capitalizeFirst(user?.tenant?.plan)} 
              disabled 
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
