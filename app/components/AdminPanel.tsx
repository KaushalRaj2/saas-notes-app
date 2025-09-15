'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AdminPanel() {
  const { user, token } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isDowngrading, setIsDowngrading] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member'
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        setMessage('🎉 Successfully upgraded to Pro plan! Please refresh to see changes.');
      } else {
        setError(data.error || 'Upgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      setError('Network error during upgrade. Please check your connection.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleResetSubscription = async () => {
    if (!confirm('Are you sure you want to reset your subscription to Free plan? This will limit your notes to 3.')) {
      return;
    }

    setIsDowngrading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`/api/tenants/${user.tenant.slug}/downgrade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Successfully reset subscription to Free plan! Please refresh to see changes.');
      } else {
        setError(data.error || 'Downgrade failed. Please try again.');
      }
    } catch (error) {
      console.error('Downgrade error:', error);
      setError('Network error during downgrade. Please check your connection.');
    } finally {
      setIsDowngrading(false);
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
        setMessage(`✅ Successfully invited ${inviteData.email}!`);
        setInviteData({ email: '', password: '', role: 'member' });
        setShowInviteForm(false);
      } else {
        setError(data.error || 'Invitation failed. Please try again.');
      }
    } catch (error) {
      console.error('Invitation error:', error);
      setError('Network error during invitation. Please check your connection.');
    } finally {
      setIsInviting(false);
    }
  };

  const currentPlan = user?.tenant?.plan || 'free';
  const isPro = currentPlan === 'pro';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h2>
        <p className="text-gray-600">Manage your organization settings and team members.</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-medium">{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800 font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Subscription</h3>
              <p className="text-sm text-gray-600">Manage your plan and billing</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <div className="font-semibold text-gray-900 text-base">Current Plan</div>
                <div className="text-sm text-gray-600 capitalize mt-1">
                  {currentPlan} Plan
                </div>
              </div>
              <div className={`
                px-3 py-1 text-sm font-medium rounded-full
                ${isPro 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-orange-100 text-orange-800 border border-orange-200'
                }
              `}>
                {user?.tenant?.noteLimit === -1 ? 'Unlimited Notes' : `${user?.tenant?.noteLimit ?? 5} Notes`}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {!isPro ? (
              <div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <h4 className="font-semibold text-green-900">Upgrade to Pro</h4>
                  </div>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      Unlimited notes storage
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      Advanced collaboration tools
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2">✓</span>
                      Priority customer support
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={isUpgrading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold text-base transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  {isUpgrading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Upgrading...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                      </svg>
                      Upgrade to Pro
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="font-semibold text-green-900 text-lg mb-1">Pro Plan Active</div>
                  <div className="text-sm text-green-700">You have access to all premium features</div>
                </div>

                <button
                  onClick={handleResetSubscription}
                  disabled={isDowngrading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold text-base transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  {isDowngrading ? (
                    <>
                      <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                      </svg>
                      Reset to Free Plan
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Team Management</h3>
              <p className="text-sm text-gray-600">Invite and manage team members</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900 mb-1">4</div>
                <div className="text-sm text-gray-600 font-medium">Total Members</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900 mb-1">1</div>
                <div className="text-sm text-gray-600 font-medium">Administrators</div>
              </div>
            </div>

            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold text-base transition-all duration-150 flex items-center justify-center shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {showInviteForm ? 'Cancel Invitation' : 'Invite Team Member'}
            </button>
          </div>
        </div>
      </div>

      {showInviteForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Invite Team Member</h4>
              <p className="text-sm text-gray-600">Send an invitation to join your organization</p>
            </div>
          </div>
          
          <form onSubmit={handleInviteUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteData.email}
                  onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
                  placeholder="user@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Temporary Password</label>
                <input
                  type="password"
                  value={inviteData.password}
                  onChange={(e) => setInviteData({...inviteData, password: e.target.value})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
                  placeholder="Create password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={inviteData.role}
                  onChange={(e) => setInviteData({...inviteData, role: e.target.value as 'admin' | 'member'})}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowInviteForm(false)}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isInviting}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-6 rounded-lg font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isInviting ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
