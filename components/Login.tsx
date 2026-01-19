import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Loader2, ArrowRight, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { setUserRole, addActivity } = useGlobal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Authentication Delay
    setTimeout(() => {
      if (email === 'admin@studiomystri.com' && password === 'admin123') {
        setUserRole('Super Admin');
        addActivity('Super Admin logged in', 'alert');
      } else if (email === 'alex@studiomystri.com') {
         setUserRole('Architect');
      } else if (email === 'sarah@studiomystri.com') {
         setUserRole('Sales');
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#122017]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#122017] via-[#1a261e] to-[#0f1512] opacity-90"></div>
        <img 
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover opacity-20"
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="bg-[#1a261e]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-br from-primary to-[#1a2c22] aspect-square rounded-full size-16 flex items-center justify-center shadow-[0_0_20px_rgba(56,224,123,0.2)] mb-4 border border-white/5">
                    <span className="material-symbols-outlined text-[#122017] text-4xl">chair</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Studio Mystri</h1>
                <p className="text-[#9eb7a8] text-sm font-medium tracking-widest uppercase mt-1">Luxury BMS Access</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#9eb7a8] uppercase tracking-wider ml-1">Email</label>
                  <div className="relative group">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-[#111714] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                       placeholder="name@studiomystri.com"
                     />
                  </div>
               </div>
               
               <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#9eb7a8] uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group">
                     <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary transition-colors" />
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full pl-12 pr-4 py-3.5 bg-[#111714] border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                       placeholder="••••••••"
                     />
                  </div>
               </div>
               
               {error && (
                   <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">error</span>
                       {error}
                   </div>
               )}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full py-4 bg-primary text-[#122017] font-bold rounded-xl hover:bg-[#2ecc71] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(56,224,123,0.3)] hover:shadow-[0_0_30px_rgba(56,224,123,0.5)] transform active:scale-95 mt-4"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Access Dashboard <ArrowRight className="w-5 h-5" /></>}
               </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-xs text-zinc-600">
                    Protected by Enterprise SSO. <br/>
                    Contact IT for access credentials.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};