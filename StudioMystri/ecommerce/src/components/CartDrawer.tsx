import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity, total } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', ease: 'circOut', duration: 0.4 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#f8f7f6] shadow-2xl z-[70] flex flex-col border-l border-[#211d11]/10"
          >
            <div className="flex items-center justify-between p-8 border-b border-[#211d11]/10">
              <h2 className="font-serif text-2xl text-[#211d11]">Your Bag <span className="text-[#8c8c8c] text-lg italic">({items.length})</span></h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:text-[#e8ba30] transition-colors text-[#211d11]">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <p className="font-serif text-xl text-[#211d11] mb-2">Your bag is empty</p>
                  <p className="text-[#8c8c8c] text-sm mb-8 font-light">Looks like you haven't found your perfect piece yet.</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="text-xs uppercase tracking-[0.2em] border-b border-[#211d11] pb-1 hover:text-[#e8ba30] hover:border-[#e8ba30] transition-colors"
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-6">
                    <div className="h-28 w-24 flex-shrink-0 overflow-hidden bg-[#e5e5e5]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-serif text-lg text-[#211d11] leading-tight pr-4">
                            <Link to={`/product/${item.product_id}`} onClick={() => setIsOpen(false)} className="hover:text-[#e8ba30] transition-colors">
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-sm font-medium text-[#211d11]">${(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                        {item.variant_name && (
                          <p className="mt-1 text-xs uppercase tracking-widest text-[#8c8c8c]">{item.variant_name}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-[#211d11]/20">
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.variant_id, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-[#211d11]/5 transition-colors text-[#211d11]"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-medium text-[#211d11] min-w-[1.5rem] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                            className="p-2 hover:bg-[#211d11]/5 transition-colors text-[#211d11]"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id, item.variant_id)}
                          className="text-xs uppercase tracking-widest text-[#8c8c8c] hover:text-[#e8ba30] transition-colors border-b border-transparent hover:border-[#e8ba30]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[#211d11]/10 p-8 bg-white">
                <div className="flex justify-between items-end mb-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Subtotal</span>
                  <span className="font-serif text-2xl text-[#211d11]">${total.toLocaleString()}</span>
                </div>
                <p className="text-xs text-[#8c8c8c] font-light mb-8">
                  Shipping and taxes calculated at checkout.
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 bg-[#211d11] text-white px-6 py-4 text-xs uppercase tracking-[0.2em] hover:bg-[#e8ba30] transition-colors duration-300 group"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
