'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { storeAuthTokens, type LoginResponse } from '@/lib/auth';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState({ access_token: '', type: '' });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  // Auto redirect after successful login
  useEffect(() => {
    if (success.access_token) {
      const timer = setTimeout(() => {
        window.location.href = '/bookmarks';
      }, 2000); // Redirect after 2 seconds

      return () => clearTimeout(timer);
    }
  }, [success.access_token]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      // Prepare form-urlencoded data
      const formBody = new URLSearchParams({
        grant_type: 'password',
        username: formData.username,
        password: formData.password,
        scope: '',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID || 'default_client',
        client_secret: process.env.NEXT_PUBLIC_CLIENT_SECRET || 'default_secret',
      });

      const response = await fetch(`${apiUrl}/user/login`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Login failed: ${response.status}`);
      }

      const loginData: LoginResponse = await response.json();
      setSuccess({
        access_token: loginData.access_token,
        type: loginData.type
      });
      
      // Store token using auth utility
      storeAuthTokens(loginData);
      
      // Clear form
      setFormData({ username: '', password: '' });
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 mt-20">
      <header>
      <title>Login Page | OtakuStream</title>
      <meta name="description" content="Login to your account to access your bookmarks and more features." />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="OtakuStream" />
      <meta name="language" content="id" />
      <meta name="geo.country" content="ID" />
      <meta name="geo.placename" content="Indonesia" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      </header>
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign In</h1>
            <p className="text-gray-400">Login to access your account</p>
          </div>

          {success.access_token ? (
            <div className="text-center">
              <div className="mb-6 p-6 bg-green-500/20 border border-green-500/50 rounded-md">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-green-400 font-medium text-lg mb-2">Login Berhasil!</p>
                <p className="text-green-300 text-sm">Anda akan diarahkan ke halaman bookmarks...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-md">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username/Email
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-[#00A8E1] focus:ring-1 focus:ring-[#00A8E1]/20 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter your username or email"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-[#00A8E1] focus:ring-1 focus:ring-[#00A8E1]/20 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter your password"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !formData.username || !formData.password}
                className="w-full h-12 bg-[#00A8E1] hover:bg-[#0084B3] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="/register" className="text-[#00A8E1] hover:text-[#0084B3] font-medium">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 