import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import CartDrawer from './CartDrawer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { itemCount, setIsOpen: setCartOpen } = useCart();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#f8f7f6] text-[#211d11]">
      <CartDrawer />
      
      {/* Header */}
      <header 
        className={`fixed w-full z-50 top-0 transition-all duration-300 ${
          scrolled ? 'bg-[#f8f7f6]/90 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-6 flex items-center justify-between">
          {/* Left Menu (Desktop) */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link to="/shop" className="text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] transition-colors font-medium">Shop</Link>
            <Link to="/projects" className="text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] transition-colors font-medium">Projects</Link>
            <Link to="/journal" className="text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] transition-colors font-medium">Journal</Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 hover:text-[#e8ba30] transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* Logo */}
          <div className="flex-1 lg:flex-none text-center">
            <Link to="/" className="font-serif text-2xl tracking-widest font-bold inline-block">
              STUDIO <span className="text-[#e8ba30]">MYSTRI</span>
            </Link>
          </div>

          {/* Right Menu */}
          <div className="flex items-center justify-end space-x-6 lg:space-x-8">
            <button className="hover:text-[#e8ba30] transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <div className="relative group hidden lg:block">
                <Link to="/dashboard" className="text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] transition-colors font-medium flex items-center gap-2">
                  Account
                  {user.is_verified && <span className="h-1.5 w-1.5 bg-[#e8ba30] rounded-full"></span>}
                </Link>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#211d11]/10 shadow-lg rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="py-1">
                    <Link to="/dashboard" className="block px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f8f7f6]">Dashboard</Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f8f7f6] text-[#e8ba30]">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-xs uppercase tracking-widest hover:bg-[#f8f7f6]">Sign out</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden lg:block text-xs uppercase tracking-[0.2em] hover:text-[#e8ba30] transition-colors font-medium">
                Account
              </Link>
            )}

            <button 
              className="flex items-center space-x-2 hover:text-[#e8ba30] transition-colors group"
              onClick={() => setCartOpen(true)}
            >
              <span className="hidden lg:block text-xs uppercase tracking-[0.2em] font-medium group-hover:text-[#e8ba30]">Bag ({itemCount})</span>
              <ShoppingBag className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: '100vh' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden absolute top-full left-0 w-full bg-[#f8f7f6] border-t border-[#211d11]/10 overflow-hidden"
            >
              <div className="px-6 py-8 space-y-6 flex flex-col items-center">
                <Link to="/shop" className="text-sm uppercase tracking-[0.2em] font-medium">Shop</Link>
                <Link to="/projects" className="text-sm uppercase tracking-[0.2em] font-medium">Projects</Link>
                <Link to="/journal" className="text-sm uppercase tracking-[0.2em] font-medium">Journal</Link>
                <div className="w-12 h-px bg-[#211d11]/10 my-4"></div>
                <Link to={user ? "/dashboard" : "/login"} className="text-sm uppercase tracking-[0.2em] font-medium">Account</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-sm uppercase tracking-[0.2em] font-medium text-[#e8ba30]">Admin Panel</Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className={`flex-grow ${location.pathname === '/' ? '' : 'pt-24'}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#211d11] text-white py-20 border-t border-[#e8ba30]/20">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            {/* Brand Column */}
            <div className="space-y-8">
              <Link to="/" className="font-serif text-2xl tracking-widest font-bold block">
                STUDIO <span className="text-[#e8ba30]">MYSTRI</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs font-light">
                Curating timeless design for modern living. 
                Where exceptional craftsmanship meets contemporary aesthetics in perfect harmony.
              </p>
              <div className="flex space-x-4">
                {/* Social Icons Placeholder */}
                <div className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:border-[#e8ba30] hover:text-[#e8ba30] transition-colors cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465C9.673 2.013 10.03 2 12.48 2h.165zm-1.996 1.996h-1.36c-2.389 0-2.673.01-3.626.054-.925.042-1.428.196-1.765.327-.45.175-.77.383-1.106.718-.335.336-.543.656-.718 1.106-.13.337-.285.84-.327 1.765-.043.953-.054 1.237-.054 3.626v1.36c0 2.389.01 2.673.054 3.626.042.925.196 1.428.327 1.765.175.45.383.77.718 1.106.336.335.656.543 1.106.718.337.13.84.285 1.765.327.953.043 1.237.054 3.626.054h1.36c2.389 0 2.673-.01 3.626-.054.925-.042 1.428-.196 1.765-.327.45-.175.77-.383 1.106-.718.336-.335.543-.656.718-1.106.13-.337.285-.84.327-1.765.043-.953.054-1.237.054-3.626v-1.36c0-2.389-.01-2.673-.054-3.626-.042-.925-.196-1.428-.327-1.765-.175-.45-.383-.77-.718-1.106-.335-.336-.543-.656-1.106-.718-.337-.13-.84-.285-1.765-.327-.953-.043-1.237-.054-3.626-.054zm-6.18 7.304a5.304 5.304 0 1110.608 0 5.304 5.304 0 01-10.608 0zm1.996 0a3.308 3.308 0 106.616 0 3.308 3.308 0 00-6.616 0zm5.304-5.304a1.326 1.326 0 112.652 0 1.326 1.326 0 01-2.652 0z" clipRule="evenodd" /></svg>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-[#e8ba30]">Collections</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-light">
                <li><Link to="/shop/seating" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Seating</Link></li>
                <li><Link to="/shop/tables" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Tables</Link></li>
                <li><Link to="/shop/lighting" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Lighting</Link></li>
                <li><Link to="/shop/objects" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Objects</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-[#e8ba30]">Support</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-light">
                <li><Link to="/contact" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Contact Us</Link></li>
                <li><Link to="/shipping" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Shipping & Returns</Link></li>
                <li><Link to="/care" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Product Care</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">FAQ</Link></li>
                <li><Link to="/report-issue" className="hover:text-white transition-colors hover:translate-x-1 inline-block duration-200">Report Issue</Link></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-[#e8ba30]">Newsletter</h4>
              <p className="text-gray-400 text-sm mb-6 font-light">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="flex border-b border-gray-700 pb-2 focus-within:border-[#e8ba30] transition-colors">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="bg-transparent w-full text-sm focus:outline-none text-white placeholder-gray-600 font-light"
                />
                <button type="submit" className="text-xs uppercase tracking-widest hover:text-[#e8ba30] transition-colors">Join</button>
              </form>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 font-light tracking-wide">
            <p>&copy; {new Date().getFullYear()} Studio Mystri. All rights reserved.</p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
