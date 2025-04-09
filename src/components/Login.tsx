import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MailIcon, LockIcon } from 'lucide-react';
interface LoginProps {
  onLogin: () => void;
}
export const Login = ({
  onLogin
}: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in a real app, this would verify credentials with a backend
    if (email && password) {
      onLogin();
      navigate('/create');
    }
  };
  return <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-center text-purple-600 mb-6">
        Welcome to Robyn Reads!
      </h1>
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Login to create and save your magical stories!
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MailIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500" placeholder="your@email.com" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 block w-full rounded-lg border-gray-300 border p-2.5 text-gray-900 focus:border-purple-500 focus:ring-purple-500" required />
          </div>
        </div>
        <button type="submit" className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg shadow hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors">
          Login
        </button>
      </form>
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <button className="text-purple-600 hover:text-purple-800 font-medium">
            Sign Up
          </button>
        </p>
      </div>
    </div>;
};