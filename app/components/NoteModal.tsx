'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

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

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  note?: Note | null;
}

export default function NoteModal({ isOpen, onClose, onSave, note }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    if (isOpen) {
      if (note) {
        setTitle(note.title);
        setContent(note.content);
      } else {
        setTitle('');
        setContent('');
      }
      setError('');
    }
  }, [isOpen, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = note ? `/api/notes/${note.id}` : '/api/notes';
      const method = note ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        onSave();
        onClose();
      } else {
        setError(data.error || `Failed to ${note ? 'update' : 'create'} note`);
        
        if (response.status === 403 && data.details) {
          setError(data.details);
        }
      }
    } catch (error) {
      console.error('Note operation error:', error);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-50 transition-opacity"></div>
      
      <div className="flex items-center justify-center min-h-full p-4">
        <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {note ? 'Edit Note' : 'New Note'}
            </h2>
            
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 p-1 rounded"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="flex-1 p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none text-lg font-medium"
                  placeholder="Note title..."
                  disabled={loading}
                  required
                />
              </div>

              <div className="flex-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none resize-none"
                  placeholder="Start writing your note..."
                  disabled={loading}
                  required
                />
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                  <span>Markdown supported</span>
                  <span>{content.length} characters</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {note ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {note ? 'Update Note' : 'Create Note'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
