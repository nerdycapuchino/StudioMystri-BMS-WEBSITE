import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { loginCustomer } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await loginCustomer(email, password);
      login(result.data.user, result.data.token);
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6] px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-[#211d11] mb-4">Welcome Back</h2>
          <p className="text-[#8c8c8c] font-light">Sign in to access your account and order history.</p>
        </div>

        {/* Dummy Credentials Info */}
        <div className="bg-[#fcfbf9] border border-[#e8ba30]/30 p-4 mb-8 text-xs text-[#8c8c8c]">
          <p className="font-bold text-[#211d11] mb-2 uppercase tracking-wider">Demo Credentials:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="font-medium text-[#211d11]">Admin:</p>
              <p>admin@studiomystri.com</p>
              <p>admin123</p>
            </div>
            <div>
              <p className="font-medium text-[#211d11]">User:</p>
              <p>user@studiomystri.com</p>
              <p>user123</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 border border-[#211d11]/5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Password</label>
              <Link to="/contact" className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] hover:text-[#e8ba30] transition-colors">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#211d11] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#e8ba30] transition-colors duration-300 group flex items-center justify-center gap-2"
          >
            Sign In <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8c8c8c] font-light">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#211d11] font-medium hover:text-[#e8ba30] transition-colors border-b border-[#211d11] hover:border-[#e8ba30] pb-0.5">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
