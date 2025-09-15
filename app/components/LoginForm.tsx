'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
    
    setIsLoading(false);
  };

  const testAccounts = [
    { email: 'admin@acme.test', role: 'Admin', company: 'Acme Corp' },
    { email: 'user@acme.test', role: 'User', company: 'Acme Corp' },
    { email: 'admin@globex.test', role: 'Admin', company: 'Globex Corp' },
    { email: 'user@globex.test', role: 'User', company: 'Globex Corp' }
  ];

  const fillTestAccount = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Evernote-Style Login Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.5 2A1.5 1.5 0 007 3.5V5H5.5A1.5 1.5 0 004 6.5v12A1.5 1.5 0 005.5 20h12a1.5 1.5 0 001.5-1.5v-12A1.5 1.5 0 0017.5 5H16V3.5A1.5 1.5 0 0014.5 2h-6zM9 3.5a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V5H9V3.5zM5.5 6H17.5a.5.5 0 01.5.5v12a.5.5 0 01-.5.5h-12a.5.5 0 01-.5-.5v-12a.5.5 0 01.5-.5z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
              Sign in to Notes
            </h2>
            <p className="text-gray-600 text-sm">
              Welcome back! Please sign in to continue.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={passwordVisible ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:outline-none transition-colors pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12.5m6.121-3.621a3 3 0 11-4.243-4.243m4.243 4.243L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">Demo accounts</p>
            <div className="space-y-2">
              {testAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillTestAccount(account.email)}
                  className="w-full text-left p-2.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-150"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{account.email}</span>
                      <div className="text-xs text-gray-500">{account.role} • {account.company}</div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-3">
              Password: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
