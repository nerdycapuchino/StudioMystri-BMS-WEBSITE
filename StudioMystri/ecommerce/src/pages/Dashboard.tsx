import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Package, User, MapPin, Heart, LogOut } from 'lucide-react';
import { apiGet } from '../lib/api';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      // Fetch orders from BMS API — placeholder for when endpoint is extended
      // For now, show empty state since per-user order listing needs a dedicated endpoint
      setOrders([]);
      setLoading(false);
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f7f6]">Loading...</div>;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="bg-[#f8f7f6] min-h-screen py-20">
      <div className="max-w-[1800px] mx-auto px-6">
        <h1 className="font-serif text-4xl md:text-5xl mb-12 text-[#211d11]">My <span className="italic text-[#8c8c8c]">Account</span></h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-8 border border-[#211d11]/5 sticky top-32">
              <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#211d11]/10">
                <div className="h-12 w-12 bg-[#211d11] text-white flex items-center justify-center text-xl font-serif">
                  {user?.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium truncate text-[#211d11]">{user?.email}</p>
                  <p className="text-xs text-[#8c8c8c] uppercase tracking-widest mt-1">{user?.role || 'Member'}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeTab === 'orders' ? 'bg-[#f8f7f6] text-[#211d11] border-l-2 border-[#e8ba30]' : 'text-[#8c8c8c] hover:text-[#211d11]'}`}
                >
                  <Package className="h-4 w-4" /> Orders
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeTab === 'profile' ? 'bg-[#f8f7f6] text-[#211d11] border-l-2 border-[#e8ba30]' : 'text-[#8c8c8c] hover:text-[#211d11]'}`}
                >
                  <User className="h-4 w-4" /> Profile
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeTab === 'addresses' ? 'bg-[#f8f7f6] text-[#211d11] border-l-2 border-[#e8ba30]' : 'text-[#8c8c8c] hover:text-[#211d11]'}`}
                >
                  <MapPin className="h-4 w-4" /> Addresses
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] transition-colors ${activeTab === 'wishlist' ? 'bg-[#f8f7f6] text-[#211d11] border-l-2 border-[#e8ba30]' : 'text-[#8c8c8c] hover:text-[#211d11]'}`}
                >
                  <Heart className="h-4 w-4" /> Wishlist
                </button>




                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#8c8c8c] hover:text-red-600 transition-colors mt-8 border-t border-[#211d11]/10 pt-8"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'orders' && (
              <div className="space-y-8">
                <h2 className="font-serif text-2xl text-[#211d11] mb-6">Order History</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-20 bg-white border border-[#211d11]/5">
                    <p className="text-[#8c8c8c] mb-6 font-light">You haven't placed any orders yet.</p>
                    <Link to="/shop" className="text-xs uppercase tracking-[0.2em] border-b border-[#211d11] pb-1 hover:text-[#e8ba30] hover:border-[#e8ba30] transition-colors">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-white border border-[#211d11]/5 hover:border-[#e8ba30]/30 transition-colors group">
                        <div className="px-8 py-6 flex flex-wrap gap-8 justify-between items-center border-b border-[#211d11]/5 bg-[#fcfbf9]">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1">Order ID</p>
                            <p className="font-mono text-sm text-[#211d11]">{order.id}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1">Date</p>
                            <p className="text-sm text-[#211d11]">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8c8c8c] mb-1">Total</p>
                            <p className="text-sm text-[#211d11] font-medium">${order.total_amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className={`inline-flex items-center px-3 py-1 text-[10px] uppercase tracking-[0.2em] border ${order.status === 'delivered' ? 'border-green-200 text-green-700 bg-green-50' :
                              order.status === 'shipped' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                'border-[#e8ba30]/30 text-[#b58d18] bg-[#e8ba30]/5'
                              }`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="p-8">
                          <div className="space-y-4 mb-6">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="text-[#211d11]">{item.name} <span className="text-[#8c8c8c]">x{item.quantity}</span></span>
                                <span className="text-[#211d11]">${item.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="pt-6 border-t border-[#211d11]/5 flex justify-between items-center">
                            <p className="text-xs text-[#8c8c8c]">
                              Shipped to: <span className="text-[#211d11]">{order.shipping_address.firstName} {order.shipping_address.lastName}, {order.shipping_address.city}</span>
                            </p>
                            <button className="text-xs uppercase tracking-[0.2em] text-[#211d11] hover:text-[#e8ba30] transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab !== 'orders' && (
              <div className="bg-white p-12 border border-[#211d11]/5 text-center">
                <p className="font-serif text-xl text-[#211d11] mb-2">Coming Soon</p>
                <p className="text-[#8c8c8c] font-light">This section is currently under development.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
