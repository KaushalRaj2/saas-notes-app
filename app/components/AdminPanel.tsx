'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Only show admin panel for admins
  if (user?.role !== 'admin') {
    return null;
  }

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/upgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Successfully upgraded to Pro plan! Please refresh to see changes.');
      } else {
        setError(data.error || 'Upgrade failed');
      }
    } catch (err) {
      setError('Network error during upgrade');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inviteData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Successfully invited ${inviteData.email}!`);
        setInviteData({ email: '', password: '', role: 'member' });
        setShowInviteForm(false);
      } else {
        setError(data.error || 'Invitation failed');
      }
    } catch (err) {
      setError('Network error during invitation');
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <h2 className="text-lg font-semibold text-blue-900 mb-4">
        🔧 Admin Panel
      </h2>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upgrade Subscription */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Subscription Management</h3>
          <p className="text-sm text-gray-600">
            Current Plan: <span className="font-semibold">{user.tenant.plan}</span>
            {user.tenant.plan === 'free' && (
              <span className="text-orange-600"> (Limited to {user.tenant.noteLimit} notes)</span>
            )}
          </p>
          
          {user.tenant.plan === 'free' ? (
            <button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpgrading ? 'Upgrading...' : '⬆️ Upgrade to Pro (Unlimited Notes)'}
            </button>
          ) : (
            <div className="text-green-600 font-medium">
              ✅ Pro Plan Active - Unlimited Notes
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">User Management</h3>
          <p className="text-sm text-gray-600">
            Invite new users to your tenant
          </p>
          
          <button
            onClick={() => setShowInviteForm(!showInviteForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            {showInviteForm ? 'Cancel Invite' : '👥 Invite User'}
          </button>
        </div>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <form onSubmit={handleInviteUser} className="mt-6 p-4 bg-white rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-3">Invite New User</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={inviteData.password}
                onChange={(e) => setInviteData({...inviteData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Password"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={inviteData.role}
                onChange={(e) => setInviteData({...inviteData, role: e.target.value as 'admin' | 'member'})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isInviting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInviting ? 'Inviting...' : 'Send Invite'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
