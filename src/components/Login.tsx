import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon, UserIcon, Loader2Icon } from 'lucide-react';
import { loginUser, registerUser, signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          setError('Please enter your name');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        const profile = await registerUser(email, password, displayName);
        setProfile(profile);
      } else {
        await loginUser(email, password);
      }
      navigate('/create');
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string; message?: string };
      const code = firebaseErr?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please log in instead.');
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(firebaseErr?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-display text-center text-purple-600 mb-2">
        {isRegister ? 'Join Robyn Reads!' : 'Welcome Back!'}
      </h1>
      <p className="text-center text-gray-500 font-body mb-6">
        {isRegister
          ? 'Create an account to start your storytelling adventure!'
          : 'Login to continue your magical stories!'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm font-body">
          {error}
        </div>
      )}

      {/* Google Sign-In */}
      <button
        onClick={async () => {
          setError(null);
          setLoading(true);
          try {
            const profile = await signInWithGoogle();
            setProfile(profile);
            navigate('/create');
          } catch (err: unknown) {
            const firebaseErr = err as { code?: string; message?: string };
            if (firebaseErr?.code === 'auth/popup-closed-by-user') {
              setError(null);
            } else {
              setError(firebaseErr?.message || 'Google sign-in failed. Please try again.');
            }
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl shadow hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-3"
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        {loading ? 'Please wait...' : 'Continue with Google'}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-400 font-body">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {isRegister && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1 font-body">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="pl-10 block w-full rounded-xl border-gray-300 border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
                placeholder="What should we call you?"
                required={isRegister}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 font-body">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MailIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-300 border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1 font-body">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 block w-full rounded-xl border-gray-300 border p-3 text-gray-900 focus:border-purple-500 focus:ring-purple-500 font-body"
              placeholder={isRegister ? 'At least 6 characters' : 'Your password'}
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed font-body flex items-center justify-center gap-2"
        >
          {loading && <Loader2Icon className="animate-spin" size={20} />}
          {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm font-body">
        <p className="text-gray-600">
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => { setIsRegister(!isRegister); setError(null); }}
            className="text-purple-600 hover:text-purple-800 font-bold"
          >
            {isRegister ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
