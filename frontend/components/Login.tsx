import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompanySettings } from '../hooks/useAdmin';
import { Mail, Lock, Eye, EyeOff, Architecture, Moon, Sun } from 'lucide-react'; // Fallback icons if material symbols fail

export const Login: React.FC = () => {
   const { login } = useAuth();
   const { data: companySettings } = useCompanySettings();
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [showPassword, setShowPassword] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   // Theme toggle
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
   const settings = companySettings?.data || companySettings || { name: 'Studio Mystri', logoUrl: '' };

   return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden transition-colors duration-300">
         <div className="relative flex h-screen w-full flex-col overflow-hidden">
            <div className="flex h-full w-full flex-col md:flex-row">
               {/* Left Side: Architectural Render */}
               <div className="relative hidden md:flex md:w-1/2 lg:w-3/5 xl:w-2/3 bg-slate-900">
                  <div
                     className="absolute inset-0 z-0 h-full w-full bg-cover bg-center opacity-80 mix-blend-overlay transition-transform duration-[20s] ease-linear hover:scale-105"
                     style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')" }}
                  ></div>
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/90"></div>
                  <div className="relative z-20 flex flex-col justify-end p-12 lg:p-16 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
                     <div className="mb-6">
                        <span className="inline-block rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest backdrop-blur-sm">
                           Enterprise Resource Planning
                        </span>
                     </div>
                     <h2 className="text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl max-w-2xl drop-shadow-md">
                        Constructing the future, <br /> <span className="text-slate-300">one project at a time.</span>
                     </h2>
                     <p className="mt-4 max-w-lg text-lg text-slate-300/90 font-light drop-shadow">
                        Seamlessly manage your architectural projects, assets, and workflows in one unified ecosystem.
                     </p>
                  </div>
               </div>

               {/* Right Side: Login Form */}
               <div className="flex w-full flex-col justify-center bg-background-light dark:bg-background-dark px-6 py-12 md:w-1/2 md:px-12 lg:w-2/5 lg:px-16 xl:w-1/3 xl:px-20 border-l border-slate-200 dark:border-slate-800 relative z-30 transition-colors duration-300 shadow-2xl md:shadow-none">
                  {/* Mobile specific header image */}
                  <div
                     className="md:hidden absolute top-0 left-0 w-full h-40 bg-cover bg-center opacity-30"
                     style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600607686527-6fb886090705?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')", WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)" }}
                  ></div>

                  <div className="w-full max-w-md mx-auto relative z-10 animate-in fade-in slide-in-from-right-8 duration-700">
                     <div className="mb-10 flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-2">
                           {settings.logoUrl ? (
                              <img src={settings.logoUrl} alt="Logo" className="h-10 w-auto object-contain rounded" />
                           ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/30">
                                 <span className="material-symbols-outlined text-[24px]">architecture</span>
                              </div>
                           )}
                           <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{settings.name || 'Blueprint ERP'}</h1>
                        </div>
                        <h2 className="text-base font-normal text-slate-500 dark:text-slate-400">
                           Welcome back. Please enter your details.
                        </h2>
                     </div>

                     <form onSubmit={handleLogin} className="flex flex-col gap-6">
                        {/* Email Input */}
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="email">Email Address</label>
                           <div className="relative flex items-center group">
                              <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">
                                 <Mail className="w-5 h-5" />
                              </span>
                              <input
                                 className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 transition-all duration-200 shadow-sm"
                                 id="email"
                                 type="email"
                                 value={email}
                                 onChange={e => setEmail(e.target.value)}
                                 placeholder="architect@domain.com"
                                 required
                              />
                           </div>
                        </div>

                        {/* Password Input */}
                        <div className="flex flex-col gap-1.5">
                           <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="password">Password</label>
                           <div className="relative flex items-center group">
                              <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary transition-colors">
                                 <Lock className="w-5 h-5" />
                              </span>
                              <input
                                 className="w-full rounded-lg border border-slate-300 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-1 focus:ring-primary dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 transition-all duration-200 shadow-sm tracking-wide"
                                 id="password"
                                 type={showPassword ? "text" : "password"}
                                 value={password}
                                 onChange={e => setPassword(e.target.value)}
                                 placeholder="••••••••"
                                 required
                              />
                              <button
                                 className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                                 type="button"
                                 onClick={() => setShowPassword(!showPassword)}
                              >
                                 {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                           </div>
                        </div>

                        {/* Session Management & Recovery */}
                        <div className="flex items-center justify-between">
                           <label className="flex items-center gap-2 cursor-pointer group">
                              <div className="relative flex items-center justify-center">
                                 <input
                                    className="peer h-4 w-4 appearance-none rounded border border-slate-300 checked:border-primary checked:bg-primary dark:border-slate-600 dark:bg-slate-800 dark:checked:border-primary dark:checked:bg-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={e => setRememberMe(e.target.checked)}
                                 />
                                 <span className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity">
                                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                 </span>
                              </div>
                              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-300 transition-colors">Keep me logged in</span>
                           </label>
                           <a className="text-sm font-semibold text-primary hover:text-blue-600 transition-colors" href="#">Forgot password?</a>
                        </div>

                        {error && (
                           <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-lg text-center animate-in shake duration-300">
                              {error}
                           </div>
                        )}

                        {/* Primary Action */}
                        <button
                           type="submit"
                           disabled={loading}
                           className="mt-2 flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                           {loading ? (
                              <div className="flex items-center gap-2">
                                 <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                                 Authenticating...
                              </div>
                           ) : 'Sign In to Workspace'}
                        </button>
                     </form>

                     <div className="text-center mt-6">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800/50 py-2 px-4 rounded-md inline-block">
                           Dev: admin@studiomystri.com / Admin@1234
                        </p>
                     </div>

                     {/* Divider */}
                     <div className="relative mt-8 mb-6">
                        <div aria-hidden="true" className="absolute inset-0 flex items-center">
                           <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center">
                           <span className="bg-background-light dark:bg-background-dark px-2 text-xs font-medium text-slate-500 dark:text-slate-500 uppercase tracking-wide">Or connect with</span>
                        </div>
                     </div>

                     {/* SSO Option */}
                     <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600 transition-all duration-200 shadow-sm disabled:opacity-50" type="button" disabled>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                           <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                           <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                           <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                           <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        Sign in with Google
                     </button>

                     <div className="mt-10 flex items-center justify-center gap-6">
                        <a className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors" href="#">Privacy Policy</a>
                        <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                        <a className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors" href="#">Terms of Service</a>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Dark Mode Toggle Float */}
         <div className="fixed top-4 right-4 z-50">
            <button
               onClick={() => setIsDark(!isDark)}
               className="p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-slate-200/20 text-slate-800 dark:text-slate-200 hover:bg-white/20 dark:hover:bg-slate-800/60 shadow-lg transition-all"
               title="Toggle Theme"
            >
               {isDark ? <Sun className="w-5 h-5 drop-shadow-sm" /> : <Moon className="w-5 h-5 drop-shadow-sm" />}
            </button>
         </div>
      </div>
   );
};
