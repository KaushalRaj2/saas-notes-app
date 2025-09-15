'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; email: string };
}

interface NotesListProps {
  onEditNote: (note: Note) => void;
  refreshTrigger: number;
}

export default function NotesList({ onEditNote, refreshTrigger }: NotesListProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const { token, user } = useAuth();

  useEffect(() => {
    fetchNotes();
  }, [refreshTrigger]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notes', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        setNotes(data.notes);
        setError('');
      } else {
        setError(data.error || 'Failed to fetch notes');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setNotes(notes.filter(n => n.id !== id));
      else setError(data.error || 'Failed to delete note');
    } catch {
      setError('Network error');
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const limitDisplay = user?.tenant.noteLimit === -1 ? '∞' : user?.tenant.noteLimit;

  // Filter and sort notes
  const filteredNotes = notes
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'newest':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading)
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="inline-flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mb-4">
          <svg className="animate-spin w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-600">Loading your notes...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-red-700 font-medium">{error}</span>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
            </div>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'title')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
        
        <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
          <span>{filteredNotes.length} notes</span>
          <span>
            {user?.tenant.plan} plan • {user?.tenant.noteLimit === -1 ? 'Unlimited' : `${user?.tenant.noteLimit} limit`}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {filteredNotes.length === 0 && !loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? `No notes match "${searchTerm}". Try a different search term.`
              : 'Create your first note to get started.'
            }
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map(note => (
          <div
            key={note.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-150 cursor-pointer group"
            onClick={() => onEditNote(note)}
          >
            {/* Note Header */}
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900 text-base truncate flex-1 group-hover:text-green-700 transition-colors">
                {note.title}
              </h3>
              
              <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditNote(note);
                  }}
                  className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                  title="Edit note"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {(note.user.id === user?.id || user?.role === 'admin') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Content Preview */}
            <div className="mb-4">
              <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                {note.content.length > 120 ? `${note.content.slice(0, 120)}...` : note.content}
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-xs">
                    {note.user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{note.user.email.split('@')[0]}</span>
              </div>
              <div>
                <span>{formatDate(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span className="text-green-600 ml-1">• edited</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
