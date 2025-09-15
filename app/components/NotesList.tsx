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
  const { token, user } = useAuth();

  /* ─────────────────────────  Fetch notes  ───────────────────────── */
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

  /* ────────────────────────  Delete a note  ──────────────────────── */
  const deleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

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


  /* ───────────────────────────  Helpers  ─────────────────────────── */
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const limitDisplay =
    user?.tenant.noteLimit === -1 ? '∞' : user?.tenant.noteLimit;

  /* ───────────────────────────  UI states  ───────────────────────── */
  if (loading)
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
        <p className="text-gray-600 mt-2">Loading notes...</p>
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );

  if (notes.length === 0)
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No notes found. Create your first note!</p>
      </div>
    );

  /* ───────────────────────────  Render  ──────────────────────────── */
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">
          Your Notes ({notes.length}/{limitDisplay})
        </h2>
        <div className="text-sm text-gray-500">
          Plan: {user?.tenant.plan}{' '}
          • Limit:{' '}
          {user?.tenant.noteLimit === -1 ? 'Unlimited' : `${user?.tenant.noteLimit} notes`}
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map(note => (
          <div
            key={note.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            {/* Card header */}
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 truncate flex-1">{note.title}</h3>

              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => onEditNote(note)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  title="Edit note"
                >
                  Edit
                </button>

                {note.user.id === user?.id && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-600 hover:text-red-800 text-sm ml-2"
                    title="Delete note"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Content preview */}
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {note.content.length > 100 ? `${note.content.slice(0, 100)}…` : note.content}
            </p>

            {/* Meta */}
            <div className="text-xs text-gray-400">
              <p>By: {note.user.email}</p>
              <p>Created: {formatDate(note.createdAt)}</p>
              {note.updatedAt !== note.createdAt && <p>Updated: {formatDate(note.updatedAt)}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
