import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Lock } from 'lucide-react';
import { createOrder, verifyPayment, validateDiscount } from '../lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login?redirect=/checkout');
    }
  }, [user, authLoading, navigate]);

  // Load Razorpay script
  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">Loading...</div>;

  const finalTotal = total - discountAmount;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    try {
      const result = await validateDiscount(discountCode, total, user?.id);
      setDiscountAmount(result.data.discountAmount);
      setDiscountApplied(true);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setDiscountAmount(0);
      setDiscountApplied(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Create order on BMS (returns razorpayOrderId)
      const orderResult = await createOrder({
        subtotal: total,
        discountAmount,
        totalAmount: finalTotal,
        items: items.map(item => ({
          productId: item.product_id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        customerDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          name: `${formData.firstName} ${formData.lastName}`,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          phone: formData.phone,
        },
        userId: user?.id,
      });

      const order = orderResult.data;
      const razorpayOrderId = order.razorpayOrderId;

      if (!razorpayOrderId) {
        // No Razorpay configured — order created without payment gateway
        clearCart();
        navigate('/dashboard');
        return;
      }

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(finalTotal * 100),
        currency: 'INR',
        name: 'Studio Mystri',
        description: `Order ${order.orderNumber}`,
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            // 3. Verify payment with BMS
            await verifyPayment(order.orderNumber, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            clearCart();
            navigate('/dashboard');
          } catch (err: any) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#211d11',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">
        <div className="text-center">
          <h1 className="font-serif text-3xl mb-4 text-[#211d11]">Your bag is empty</h1>
          <button
            onClick={() => navigate('/shop')}
            className="text-xs uppercase tracking-[0.2em] border-b border-[#211d11] pb-1 hover:text-[#e8ba30] hover:border-[#e8ba30] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f7f6] min-h-screen py-20">
      <div className="max-w-[1800px] mx-auto px-6">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-center text-[#211d11]">Secure <span className="italic text-[#8c8c8c]">Checkout</span></h1>

        {error && (
          <div className="max-w-2xl mx-auto mb-8 bg-red-50 border border-red-100 text-red-600 p-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Address</label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">State</label>
                  <input
                    type="text"
                    name="state"
                    required
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c]">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    required
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-[#211d11]/20 py-3 text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                </div>
              </div>

              <div className="bg-white p-8 border border-[#211d11]/5 mt-12">
                <h3 className="font-serif text-xl mb-6 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#e8ba30]" /> Payment
                </h3>
                <div className="flex items-center gap-4 border border-[#e8ba30] bg-[#fcfbf9] p-4">
                  <div className="h-4 w-4 rounded-full border-4 border-[#e8ba30]"></div>
                  <span className="text-sm font-medium">Razorpay (Cards, UPI, NetBanking)</span>
                </div>
                <p className="text-xs text-[#8c8c8c] mt-4 font-light">
                  Secure payment powered by Razorpay. All major payment methods accepted.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#211d11] text-white py-5 uppercase tracking-[0.2em] text-xs hover:bg-[#e8ba30] transition-colors disabled:opacity-50 group flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : `Pay ₹${finalTotal.toLocaleString()}`}
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          </div>

          {/* Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 lg:p-12 border border-[#211d11]/5 sticky top-32">
              <h3 className="font-serif text-2xl mb-8 text-[#211d11]">Order Summary</h3>
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={`${item.product_id}-${item.variant_id}`} className="flex gap-4">
                    <div className="h-20 w-16 bg-[#e5e5e5] flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-lg leading-tight">{item.name}</h4>
                        <span className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-[#8c8c8c] mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="border-t border-[#211d11]/10 pt-6 mb-6">
                <label className="text-xs uppercase tracking-[0.2em] text-[#8c8c8c] block mb-2">Discount Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    disabled={discountApplied}
                    placeholder="Enter code"
                    className="flex-1 bg-transparent border-b border-[#211d11]/20 py-2 text-sm text-[#211d11] focus:outline-none focus:border-[#e8ba30] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleApplyDiscount}
                    disabled={discountApplied}
                    className="text-xs uppercase tracking-[0.15em] px-4 py-2 bg-[#211d11] text-white hover:bg-[#e8ba30] transition-colors disabled:opacity-50"
                  >
                    {discountApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>

              <div className="border-t border-[#211d11]/10 pt-6 space-y-3">
                <div className="flex justify-between text-sm text-[#8c8c8c]">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-[#8c8c8c]">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-[#27ae60]">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-serif text-[#211d11] pt-4 border-t border-[#211d11]/10 mt-4">
                  <span>Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 bg-[#f8f7f6] p-4">
                <Check className="h-5 w-5 text-[#e8ba30] flex-shrink-0" />
                <p className="text-xs text-[#8c8c8c] leading-relaxed">
                  Your order is eligible for complimentary white glove delivery and installation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
