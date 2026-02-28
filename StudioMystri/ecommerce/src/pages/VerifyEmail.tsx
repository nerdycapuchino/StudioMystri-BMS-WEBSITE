import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Check, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Simulate verification for demo purposes if no token provided or specific demo token
    if (!token) {
      // For demo, we might want to show the success state if accessed directly for preview
      // But in real app, this is an error. 
      // Let's stick to error for no token, but maybe add a way to simulate success?
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    // Mock verification for demo
    if (token === 'demo-token') {
      setTimeout(() => {
        setStatus('success');
        setMessage('Your email has been successfully verified.');
      }, 1500);
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed. The link may be invalid or expired.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6] px-4 py-20">
      <div className="max-w-md w-full bg-white p-12 border border-[#211d11]/5 shadow-sm text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-[#e8ba30] animate-spin mb-6" />
            <h2 className="font-serif text-2xl text-[#211d11] mb-2">Verifying Email</h2>
            <p className="text-[#8c8c8c] font-light">Please wait while we confirm your account...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="font-serif text-3xl text-[#211d11] mb-4">Email Verified</h2>
            <p className="text-[#8c8c8c] mb-8 font-light leading-relaxed">{message}</p>
            
            <div className="bg-[#fcfbf9] border border-[#e8ba30]/30 p-6 w-full mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[#e8ba30] mb-2">Welcome Gift Unlocked</p>
              <p className="font-serif text-xl text-[#211d11] mb-1">10% Off Your First Order</p>
              <p className="text-xs text-[#8c8c8c]">Discount automatically applied at checkout.</p>
            </div>

            <Link 
              to="/login" 
              className="w-full bg-[#211d11] text-white py-4 uppercase tracking-[0.2em] text-xs hover:bg-[#e8ba30] transition-colors duration-300 group flex items-center justify-center gap-2"
            >
              Sign In to Shop <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="font-serif text-3xl text-[#211d11] mb-4">Verification Failed</h2>
            <p className="text-[#8c8c8c] mb-8 font-light leading-relaxed">{message}</p>
            
            <div className="space-y-4 w-full">
              <Link 
                to="/contact" 
                className="block w-full border border-[#211d11]/20 py-3 uppercase tracking-[0.2em] text-xs text-[#211d11] hover:border-[#211d11] transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                to="/" 
                className="block text-xs uppercase tracking-[0.2em] text-[#8c8c8c] hover:text-[#211d11] transition-colors"
              >
                Return Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
