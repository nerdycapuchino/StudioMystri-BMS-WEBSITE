import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.user.role !== 'admin') {
          setError('Access denied. Admin privileges required.');
          // Optional: logout if they logged in as regular user
          await fetch('/api/auth/logout', { method: 'POST' });
          return;
        }
        login(data.user);
        navigate(redirect);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#211d11] px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-[#e8ba30]/10 mb-6">
            <Lock className="h-8 w-8 text-[#e8ba30]" />
          </div>
          <h2 className="font-serif text-4xl text-white mb-4">Admin Portal</h2>
          <p className="text-gray-400 font-light">Restricted access area.</p>
        </div>
        
        {/* Dummy Credentials Info */}
        <div className="bg-[#2a261a] border border-[#e8ba30]/30 p-4 mb-8 text-xs text-gray-400">
          <p className="font-bold text-[#e8ba30] mb-2 uppercase tracking-wider">Demo Credentials:</p>
          <div>
            <p className="font-medium text-white">Admin:</p>
            <p>admin@studiomystri.com</p>
            <p>admin123</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 mb-8 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-[#2a261a] p-8 md:p-12 border border-white/5 shadow-2xl">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-[#e8ba30] transition-colors placeholder-gray-600"
              placeholder="admin@studiomystri.com"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-gray-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-white/10 py-3 text-white focus:outline-none focus:border-[#e8ba30] transition-colors placeholder-gray-600"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#e8ba30] text-[#211d11] py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white transition-colors duration-300 group flex items-center justify-center gap-2"
          >
            Access Dashboard <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-light">
            Unauthorized access is prohibited. All attempts are logged.
          </p>
        </div>
      </div>
    </div>
  );
}
