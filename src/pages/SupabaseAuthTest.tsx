import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * SupabaseAuthTest Component
 * Test component for Supabase authentication
 * Allows registration and login testing
 */
export default function SupabaseAuthTest() {
  const navigate = useNavigate();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'worker' as 'worker' | 'employer' | 'admin'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      // 1. Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('Registration failed - no user returned');
      }

      // 2. Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role as any,
          language: 'nl' as any,
          is_premium: false
        } as any);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Auth user created but profile failed - should cleanup
        setStatus({
          type: 'error',
          message: `Auth successful but profile creation failed: ${profileError.message}`
        });
      } else {
        setStatus({
          type: 'success',
          message: 'Registration successful! Check your email for verification.'
        });

        // Switch to login mode after 2 seconds
        setTimeout(() => {
          setMode('login');
          setFormData({ ...formData, password: '' });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Registration failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) throw error;

      if (data.user) {
        setStatus({
          type: 'success',
          message: `Login successful! Redirecting to avatar test...`
        });

        // Redirect to avatar test page after 1 second
        setTimeout(() => {
          navigate('/test/avatar-upload');
        }, 1000);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setStatus({
        type: 'error',
        message: err.message || 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            {mode === 'login' ? (
              <LogIn className="w-8 h-8 text-blue-600" />
            ) : (
              <UserPlus className="w-8 h-8 text-blue-600" />
            )}
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Login Test' : 'Register Test'}
            </h1>
          </div>
          <p className="text-gray-600">Test Supabase authentication</p>
        </div>

        {/* Status Messages */}
        {status && (
          <div
            className={`rounded-xl shadow-lg p-4 mb-6 flex items-center gap-3 ${
              status.type === 'success'
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            )}
            <p
              className={`font-medium ${
                status.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {status.message}
            </p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="your@email.com"
                aria-label="Email address"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                aria-label="Password"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
            </div>

            {/* Register-only fields */}
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Jan Kowalski"
                    aria-label="Full name"
                  />
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    aria-label="User role"
                  >
                    <option value="worker">Worker</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? 'Logging in...' : 'Creating account...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  {mode === 'login' ? (
                    <>
                      <LogIn className="w-5 h-5" />
                      Login
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Register
                    </>
                  )}
                </div>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setStatus(null);
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {mode === 'login'
                ? "Don't have an account? Register"
                : 'Already have an account? Login'}
            </button>
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-white rounded-xl shadow-xl p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Supabase Auth with RLS</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Profile auto-creation in <strong>profiles</strong> table</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Session persistence enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Email verification required</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
