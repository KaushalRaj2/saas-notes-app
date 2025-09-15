'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Dashboard from './Dashboard';
import NotesList from './NotesList';
import NoteModal from './NoteModal';
import AdminPanel from './AdminPanel'; // Add this import

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

  return (
    <Dashboard>
      <div className="space-y-6">
        {/* Admin Panel - Only show for admins */}
        <AdminPanel />

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
            <p className="text-gray-600">
              Manage your notes • {user?.tenant.name} tenant
            </p>
          </div>
          <button
            onClick={handleCreateNote}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            + Create Note
          </button>
        </div>

        {/* Notes List */}
        <NotesList 
          onEditNote={handleEditNote}
          refreshTrigger={refreshTrigger}
        />

        {/* Create/Edit Modal */}
        <NoteModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={handleNoteSave}
          note={editingNote}
        />
      </div>
    </Dashboard>
  );
}
