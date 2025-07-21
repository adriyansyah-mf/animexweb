'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState({ userId: 0 });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/user/register`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Registration failed: ${response.status}`);
      }

      const userId = await response.json();
      setSuccess({ userId });
      
      // Clear form
      setFormData({ email: '', password: '' });
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 mt-20">
      <header>
        <title>Register Page | OtakuStream</title>
        <meta name="description" content="Register to start watching anime." />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="OtakuStream" />
        <meta name="language" content="id" />
        <meta name="geo.country" content="ID" />
        <meta name="geo.placename" content="Indonesia" />
      </header>
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Register to start watching anime</p>
          </div>

          {success.userId > 0 ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-500/20 border border-green-500/50 rounded-md">
                <p className="text-green-400 font-medium">Registration Successful!</p>
                <p className="text-green-300 text-sm mt-1">Your user ID: {success.userId}</p>
              </div>
              <Button
                onClick={() => setSuccess({ userId: 0 })}
                variant="outline"
                className="w-full"
              >
                Register Another User
              </Button>
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
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full h-12 px-4 text-white bg-white/5 border border-white/10 rounded-md focus:outline-none focus:border-[#00A8E1] focus:ring-1 focus:ring-[#00A8E1]/20 backdrop-blur-sm placeholder-gray-400"
                    placeholder="Enter your email"
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
                disabled={isLoading || !formData.email || !formData.password}
                className="w-full h-12 bg-[#00A8E1] hover:bg-[#0084B3] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <a href="/login" className="text-[#00A8E1] hover:text-[#0084B3] font-medium">
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
} 