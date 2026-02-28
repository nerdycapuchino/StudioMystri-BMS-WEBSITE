import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="w-full flex-grow bg-[#f8f7f6] text-[#211d11] font-sans relative overflow-hidden flex flex-col">
      {/* Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] text-[40vw] font-bold text-[#e8ba30] opacity-5 select-none leading-none font-serif">
          404
        </div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full border-[2px] border-[#211d11] opacity-5"></div>
        <div className="absolute top-[20%] left-[10%] w-[20px] h-[20px] bg-[#e8ba30] rounded-full opacity-20"></div>
      </div>

      <div className="flex-grow flex items-center justify-center p-6 md:p-12 lg:p-24 relative z-10">
        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Image (Desktop) / Top (Mobile) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] w-full max-w-md mx-auto lg:mx-0 overflow-hidden rounded-2xl shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1518050226102-0918c072669d?q=80&w=2070&auto=format&fit=crop" 
                alt="Architectural detail" 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white">
                <p className="text-sm uppercase tracking-widest mb-2 opacity-80">System Status</p>
                <p className="text-2xl font-serif italic">"Even the strongest foundations occasionally shift."</p>
              </div>
            </div>
            
            {/* Decorative elements around image */}
            <div className="absolute -z-10 top-[-20px] left-[-20px] w-full h-full border border-[#211d11]/10 rounded-2xl"></div>
            <div className="absolute -z-10 bottom-[-20px] right-[-20px] w-full h-full bg-[#e8ba30]/10 rounded-2xl"></div>
          </motion.div>

          {/* Right Column: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="order-1 lg:order-2 text-center lg:text-left"
          >
            <div className="inline-block mb-6 px-4 py-1.5 border border-[#211d11] rounded-full">
              <span className="text-xs font-bold uppercase tracking-widest">Error Code: 404</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              Foundations <br/>
              <span className="text-[#e8ba30] italic">Shifted.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#211d11]/70 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              The page you are looking for has been moved, deleted, or possibly never existed. 
              Like a blueprint with a missing dimension, we cannot build what isn't there.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link 
                to="/" 
                className="group relative px-8 py-4 bg-[#211d11] text-white overflow-hidden rounded-full transition-all hover:shadow-lg hover:shadow-[#e8ba30]/20"
              >
                <div className="absolute inset-0 w-full h-full bg-[#e8ba30] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center justify-center gap-2 font-medium tracking-wide group-hover:text-[#211d11] transition-colors">
                  <Home size={18} />
                  Return Home
                </span>
              </Link>
              
              <button 
                onClick={() => window.location.reload()}
                className="group px-8 py-4 border border-[#211d11] text-[#211d11] rounded-full hover:bg-[#f0efed] transition-colors flex items-center justify-center gap-2 font-medium tracking-wide"
              >
                <AlertTriangle size={18} />
                Report Issue
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer Line */}
      <div className="w-full py-6 border-t border-[#211d11]/10 text-center text-xs uppercase tracking-widest opacity-40">
        Design Excellence since 1998
      </div>
    </div>
  );
}
