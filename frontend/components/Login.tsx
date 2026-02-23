import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompanySettings } from '../hooks/useAdmin';

export const Login: React.FC = () => {
   const { login } = useAuth();
   const { data: companySettings } = useCompanySettings();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [rememberMe, setRememberMe] = useState(false);

   const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
         await login(email, password);
      } catch (err: any) {
         setError(err?.response?.data?.message || err?.message || 'Invalid email or password');
      } finally {
         setLoading(false);
      }
   };

   const settings = companySettings || { name: 'Studio Mystri', logoUrl: '', loginBackgroundUrl: '' };

   return (
      <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
         {/* Soft gradient background */}
         <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-50/30 to-pink-50/20"></div>
            <img
               src={settings.loginBackgroundUrl || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"}
               className="w-full h-full object-cover opacity-10"
               alt="Background"
            />
         </div>

         <div className="relative z-10 w-full max-w-[400px] bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] p-10 shadow-2xl shadow-slate-200/50">
            <div className="text-center mb-8">
               {/* Dynamic Logo Placeholder */}
               <div className="mx-auto mb-6 w-[100px] h-[100px] bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-lg shadow-primary/10">
                  {settings.logoUrl ? (
                     <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                     <div className="font-black text-4xl bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">M</div>
                  )}
               </div>
               <h1 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{settings.name}</h1>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Enterprise Login</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-3">Email ID</label>
                  <input
                     type="email"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     placeholder="Enter your email"
                     className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none placeholder-slate-400"
                     required
                  />
               </div>
               <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase ml-3">Password</label>
                  <input
                     type="password"
                     value={password}
                     onChange={e => setPassword(e.target.value)}
                     placeholder="Enter your password"
                     className="w-full bg-white border border-slate-200 rounded-xl px-5 py-3.5 text-slate-800 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all outline-none placeholder-slate-400"
                     required
                  />
               </div>

               {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold px-4 py-3 rounded-xl">
                     {error}
                  </div>
               )}

               <div className="flex items-center gap-2 ml-1">
                  <input
                     type="checkbox"
                     id="remember"
                     checked={rememberMe}
                     onChange={e => setRememberMe(e.target.checked)}
                     className="rounded bg-white border-slate-300 text-primary focus:ring-primary/30 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-500 font-medium cursor-pointer select-none">Remember Me</label>
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary font-black text-sm uppercase tracking-widest py-4 rounded-xl mt-2"
               >
                  {loading ? 'Logging in...' : 'Login'}
               </button>
            </form>

            {/* Dev hint */}
            <div className="mt-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
               <p className="text-[10px] text-slate-500 text-center font-mono">
                  Dev: admin@studiomystri.com / Admin@1234
               </p>
            </div>
         </div>
      </div>
   );
};
