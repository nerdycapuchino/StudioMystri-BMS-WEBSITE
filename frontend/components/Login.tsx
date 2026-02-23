import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompanySettings } from '../hooks/useAdmin';

export const Login: React.FC = () => {
   const { login } = useAuth();
   const { data: companySettings } = useCompanySettings();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Theme toggle (to preview the dark mode the user specified)
   const [isDark, setIsDark] = useState(true);

   useEffect(() => {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
   }, [isDark]);

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

   // Fallback settings if API fails
   const settings = companySettings || { name: 'Studio Mystri', logoUrl: '' };

   return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 font-sans antialiased transition-colors duration-200">
         <div className="w-full max-w-md bg-transparent dark:bg-transparent md:bg-card-light md:dark:bg-card-dark md:shadow-xl md:dark:shadow-none rounded-2xl p-0 md:p-10 transition-all duration-300">
            <div className="flex justify-center mb-8">
               {/* dynamic logo rendering logic */}
               {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Company Logo" className="h-12 w-auto object-contain" />
               ) : (
                  <div className="h-12 w-48 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500 font-medium tracking-widest">
                     {settings.name.toUpperCase()}
                  </div>
               )}
            </div>

            <div className="text-left mb-8">
               <h1 className="font-playfair text-4xl text-[#1a202c] dark:text-white mb-3 tracking-tight">
                  Welcome Back
               </h1>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-relaxed">
                  Please enter your details to access your dashboard.
               </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
               <div className="space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                     Email Address
                  </label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">mail</span>
                     </div>
                     <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@studiomystri.com"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-input-borderLight dark:border-input-borderDark rounded-lg bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out shadow-sm text-sm"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label htmlFor="password" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Password
                     </label>
                     <a href="#" className="text-xs font-medium text-bronze-accent hover:text-bronze-dark transition-colors">
                        Forgot Password?
                     </a>
                  </div>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-xl">lock</span>
                     </div>
                     <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-input-borderLight dark:border-input-borderDark rounded-lg bg-white dark:bg-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition duration-150 ease-in-out shadow-sm text-sm tracking-widest"
                     />
                  </div>
               </div>

               {error && (
                  <div className="bg-red-900/40 border border-red-500/50 text-red-200 text-xs font-bold px-4 py-3 rounded-lg text-center">
                     {error}
                  </div>
               )}

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-surface-darker bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wide transition duration-150 ease-in-out mt-8"
               >
                  {loading ? 'Authenticating...' : 'Sign In'}
               </button>

               <div className="text-center pt-4">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                     Don't have an account?{' '}
                     <a href="#" className="font-medium text-bronze-accent hover:text-bronze-dark transition-colors">
                        Contact Support
                     </a>
                  </p>
               </div>

               {/* Dev hint */}
               <div className="mt-6 pt-4 border-t border-slate-200 dark:border-zinc-800 text-center">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                     Dev: admin@studiomystri.com / Admin@1234
                  </p>
               </div>
            </form>
         </div>

         {/* Dark Mode Toggle Float */}
         <div className="fixed top-4 right-4 z-50">
            <button
               onClick={() => setIsDark(!isDark)}
               className="p-2 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-zinc-700 transition-colors border border-transparent dark:border-zinc-700"
            >
               {isDark ? (
                  <span className="material-symbols-outlined text-xl">light_mode</span>
               ) : (
                  <span className="material-symbols-outlined text-xl">dark_mode</span>
               )}
            </button>
         </div>
      </div>
   );
};
