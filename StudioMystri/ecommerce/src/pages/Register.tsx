import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registerCustomer } from '../lib/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const result = await registerCustomer({ name, email, password });
      login(result.data.user, result.data.token);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6] px-4 py-20">
        <div className="max-w-md w-full bg-white p-12 border border-[#211d11]/5 shadow-sm text-center">
          <h2 className="font-serif text-3xl mb-6 text-[#211d11]">Check your email</h2>
          <p className="text-[#8c8c8c] mb-8 font-light leading-relaxed">
            We've sent a verification link to <strong>{email}</strong>.
            Please verify your email to unlock your 10% welcome discount.
          </p>
          <p className="text-xs text-[#8c8c8c] mb-8 font-light italic">
            (For this demo, check the server console logs for the verification link)
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors border-b border-[#211d11] hover:border-[#e8ba30] pb-1"
          >
            Back to Login <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6] px-4 py-20">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl text-[#211d11] mb-4">Create Account</h2>
          <p className="text-[#8c8c8c] font-light">Join our community for exclusive access and benefits.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 mb-8 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 md:p-12 border border-[#211d11]/5 shadow-sm">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
            />
          </div>
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
            <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Password</label>
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
            Create Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-[#8c8c8c] font-light">
            Already have an account?{' '}
            <Link to="/login" className="text-[#211d11] font-medium hover:text-[#e8ba30] transition-colors border-b border-[#211d11] hover:border-[#e8ba30] pb-0.5">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
