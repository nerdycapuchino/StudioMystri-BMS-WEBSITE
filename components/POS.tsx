import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Trash2, CreditCard, X, Check, Smartphone, Mail, Wallet, LogOut, ScanBarcode, TicketPercent, Lock, Tag, Clock, Package, FileText, Info, Camera, RefreshCcw } from 'lucide-react';
import { MOCK_PRODUCTS, MOCK_CUSTOMERS } from '../constants';
import { Product, CartItem, Customer } from '../types';
import { useGlobal } from '../context/GlobalContext';

export const POS: React.FC = () => {
  const { 
    addSale, addActivity, isShiftOpen, openingBalance, cashCollected, startShift, updateCashCollected, closeShift, userRole,
    products, addProduct, orders, addOrder, deductStock, addInvoice, currency, formatCurrency
  } = useGlobal();

  // Shift Logic
  const [localOpeningBalance, setLocalOpeningBalance] = useState('');
  const [closingBalance, setClosingBalance] = useState('');
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);

  // Cart & Product Logic
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modals
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRazorpayMock, setShowRazorpayMock] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);

  // Add Product Form
  const [newProd, setNewProd] = useState<Partial<Product>>({ name: '', price: 0, category: 'Furniture', stock: 10, sku: '', description: '', materials: '', dimensions: '' });

  // Payment State
  const [discount, setDiscount] = useState<{ type: 'percent' | 'fixed'; value: number }>({ type: 'percent', value: 0 });
  const [tempDiscount, setTempDiscount] = useState(discount);
  const [couponCode, setCouponCode] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [taxRate, setTaxRate] = useState(18); // Default 18% for INR

  // Barcode Camera
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  // Customer
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Derived Values
  const categories = ['All', 'Furniture', 'Lighting', 'Textiles', 'Decor'];
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = discount.type === 'percent' ? (subtotal * discount.value) / 100 : discount.value;
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * (taxRate / 100);
  const total = taxableAmount + tax;

  // Effects
  useEffect(() => {
    // Update tax defaults based on currency
    if (currency === 'INR') setTaxRate(18);
    else setTaxRate(0);
  }, [currency]);

  // Handlers
  const handleStartShift = () => { if (localOpeningBalance) startShift(localOpeningBalance); };
  const handleCloseShift = () => { if (closingBalance) { closeShift(); setShowCloseShiftModal(false); setLocalOpeningBalance(''); setClosingBalance(''); setCart([]); } };
  
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert("Item Out of Stock!");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Cannot add more than available stock!");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > product.stock) {
          alert(`Only ${product.stock} available!`);
          return item;
        }
        return { ...item, quantity: Math.max(1, newQty) };
      }
      return item;
    }));
  };

  const applyCoupon = () => {
    if (couponCode === 'SAVE50') setTempDiscount({ type: 'percent', value: 50 });
    else if (couponCode === 'SAVE10') setTempDiscount({ type: 'percent', value: 10 });
    else alert('Invalid Coupon');
  };

  const confirmDiscount = () => {
    if (tempDiscount.type === 'percent' && tempDiscount.value > 50) {
      alert("Discount cannot exceed 50%");
      return;
    }
    setDiscount(tempDiscount);
    setShowDiscountModal(false);
  };

  const startPayment = (method: string) => {
    setSelectedPaymentMethod(method);
    if (method === 'Razorpay' || method === 'Online') {
      setShowPaymentModal(false);
      setShowRazorpayMock(true);
      setTimeout(() => {
        completePayment(method);
      }, 2000);
    } else {
      completePayment(method);
    }
  };

  const completePayment = (method: string) => {
    addSale(total);
    updateCashCollected(total);
    const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
    const custName = selectedCustomer ? selectedCustomer.name : 'Walk-in Customer';

    deductStock(cart.map(item => ({ id: item.id, quantity: item.quantity })));

    addInvoice({
      id: `INV-${orderId}`,
      client: custName,
      amount: total,
      baseAmount: taxableAmount,
      taxAmount: tax,
      taxRate: taxRate,
      paidAmount: total,
      type: 'Income',
      date: new Date().toLocaleDateString(),
      status: 'Paid',
      currency: currency,
      history: [{ date: new Date().toLocaleDateString(), amount: total, note: `POS Sale via ${method}` }]
    });

    addActivity(`Order ${orderId} completed: ${formatCurrency(total)}`, 'sale');
    addOrder({
      id: orderId,
      customerName: custName,
      date: new Date().toLocaleDateString(),
      total: total,
      items: cart.length,
      status: 'Completed',
      paymentMethod: method,
      currency: currency
    });

    setCart([]);
    setShowPaymentModal(false);
    setShowRazorpayMock(false);
    setShowReceiptModal(true);
    setDiscount({type: 'percent', value: 0});
    setSelectedCustomer(null);
  };

  const handleAddNewProduct = () => {
    if(newProd.name && newProd.price) {
      addProduct({
        id: Math.random().toString(36).substr(2, 9),
        name: newProd.name,
        price: newProd.price, // Assumes input is in Base Currency (INR)
        category: newProd.category || 'Furniture',
        stock: newProd.stock || 0,
        sku: newProd.sku || `SKU-${Math.floor(Math.random()*1000)}`,
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
        description: newProd.description,
        materials: newProd.materials,
        dimensions: newProd.dimensions
      });
      setShowAddProductModal(false);
      setNewProd({ name: '', price: 0, category: 'Furniture', stock: 10, sku: '' });
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // Fail silently for user but set state to show fallback UI
      console.warn("Camera access denied or unavailable", err);
      setCameraError(true);
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setCameraActive(false);
    setShowBarcodeScanner(false);
  };

  const generateBarcode = () => {
    const randomSku = `SKU-${Math.floor(Math.random() * 100000)}`;
    setNewProd({...newProd, sku: randomSku});
  };

  if (!isShiftOpen) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
            <Wallet className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Start Shift</h2>
          <p className="text-slate-500 mb-6">Enter opening cash amount.</p>
          <input type="number" value={localOpeningBalance} onChange={e => setLocalOpeningBalance(e.target.value)} className="w-full p-3 border rounded-xl mb-4 text-center text-xl font-bold" placeholder="0.00" />
          <button onClick={handleStartShift} disabled={!localOpeningBalance} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50">Open Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full gap-4 relative">
      <div className="flex-1 flex flex-col gap-4">
        {/* Cleaner Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
           <div className="flex-1 flex items-center gap-3 w-full">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Search products..." 
                   className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                 />
              </div>
              <button onClick={() => { setShowBarcodeScanner(true); startCamera(); }} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Scan Barcode">
                 <ScanBarcode className="w-5 h-5" />
              </button>
              <button onClick={() => setShowAddProductModal(true)} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200" title="Add Custom Product">
                 <Plus className="w-5 h-5" />
              </button>
           </div>
           
           <div className="flex items-center gap-4 w-full md:w-auto justify-end">
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Start Balance</p>
                 <p className="text-sm font-bold text-slate-700">{formatCurrency(parseFloat(openingBalance))}</p>
              </div>
              <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
              <button onClick={() => setShowOrdersModal(true)} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
                 <Clock className="w-4 h-4" /> History
              </button>
              <button onClick={() => setShowCloseShiftModal(true)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2">
                 <LogOut className="w-4 h-4" /> End Shift
              </button>
           </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
           {categories.map(cat => (
             <button 
               key={cat} 
               onClick={() => setSelectedCategory(cat)}
               className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-2">
           {filteredProducts.map(p => (
             <div key={p.id} onClick={() => addToCart(p)} className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md transition-all group relative flex flex-col">
                <div className="h-32 bg-slate-100 relative shrink-0">
                   <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                   <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-white font-bold text-sm">{formatCurrency(p.price)}</span>
                   </div>
                   <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                      {p.stock} Left
                   </div>
                </div>
                <div className="p-3 flex-1 flex flex-col">
                   <h3 className="font-medium text-sm text-slate-800 line-clamp-1">{p.name}</h3>
                   <p className="text-xs text-slate-500 mb-1">{p.sku}</p>
                   {p.materials && <p className="text-[10px] text-slate-400 line-clamp-1">{p.materials}</p>}
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-full md:w-80 bg-white rounded-xl shadow-xl border border-slate-200 flex flex-col z-10 shrink-0 h-[400px] md:h-full">
         <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="w-4 h-4"/> Current Order</h3>
            <button onClick={() => setCart([])} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
         </div>
         
         {/* Customer Search */}
         <div className="p-3 border-b border-slate-100">
            {selectedCustomer ? (
               <div className="flex justify-between items-center bg-indigo-50 p-2 rounded-lg">
                  <div className="text-xs">
                     <p className="font-bold text-indigo-900">{selectedCustomer.name}</p>
                     <p className="text-indigo-600">{selectedCustomer.phone}</p>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)}><X className="w-4 h-4 text-indigo-400"/></button>
               </div>
            ) : (
               <div className="flex gap-2">
                  <input 
                    placeholder="Customer Phone" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)}
                    className="flex-1 text-sm border rounded px-2 py-1"
                  />
                  <button onClick={() => {
                     const found = MOCK_CUSTOMERS.find(c => c.phone === customerPhone);
                     if(found) setSelectedCustomer(found);
                     else alert('Customer not found');
                  }} className="bg-slate-800 text-white rounded px-3 py-1 text-xs">Find</button>
               </div>
            )}
         </div>

         <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 && <div className="text-center text-slate-400 text-sm mt-10">Cart is empty</div>}
            {cart.map(item => (
               <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                  <div className="flex-1 truncate pr-2">
                     <p className="font-medium text-slate-800 truncate">{item.name}</p>
                     <p className="text-xs text-slate-500 flex items-center gap-1">{item.sku}</p>
                  </div>
                  <div className="flex items-center gap-1 text-right">
                     <p className="text-xs text-slate-600 font-medium mr-2">{formatCurrency(item.price)}</p>
                     <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white border rounded hover:bg-slate-100"><Minus className="w-3 h-3"/></button>
                     <span className="w-4 text-center font-bold">{item.quantity}</span>
                     <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white border rounded hover:bg-slate-100"><Plus className="w-3 h-3"/></button>
                  </div>
               </div>
            ))}
         </div>

         <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
            <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm mb-1 items-center">
               <span>Discount</span>
               <button onClick={() => setShowDiscountModal(true)} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-bold hover:bg-indigo-100 flex items-center gap-1">
                  <TicketPercent className="w-3 h-3" /> {discount.value > 0 ? 'Edit' : 'Add'}
               </button>
            </div>
            {discount.value > 0 && <div className="flex justify-between text-sm text-green-600 mb-1"><span>Applied</span><span>-{formatCurrency(discountAmount)}</span></div>}
            
            <div className="flex justify-between text-sm mb-1 items-center">
               <span className="flex items-center gap-1">
                  {currency === 'INR' ? 'GST' : 'Tax'}
                  <input 
                     type="number" 
                     className="w-10 bg-white border rounded px-1 text-xs ml-1" 
                     value={taxRate} 
                     onChange={(e) => setTaxRate(parseFloat(e.target.value))} 
                  />%
               </span>
               <span>{formatCurrency(tax)}</span>
            </div>
            
            <div className="flex justify-between text-lg font-bold mb-4 pt-2 border-t"><span>Total</span><span>{formatCurrency(total)}</span></div>
            <button onClick={() => setShowPaymentModal(true)} disabled={cart.length === 0} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50">Pay Now</button>
         </div>
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-[90%] max-w-[600px] shadow-2xl overflow-y-auto max-h-[90vh]">
               <h3 className="font-bold mb-4 text-lg">Add New Product Details</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                     <label className="text-xs text-slate-500">Product Name</label>
                     <input className="w-full border p-2 rounded" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">SKU Code</label>
                     <div className="flex gap-2">
                        <input className="w-full border p-2 rounded" value={newProd.sku} onChange={e => setNewProd({...newProd, sku: e.target.value})} />
                        <button onClick={generateBarcode} className="px-2 bg-slate-100 rounded text-xs" title="Generate"><RefreshCcw className="w-4 h-4"/></button>
                     </div>
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">Category</label>
                     <select className="w-full border p-2 rounded" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
                        <option value="Furniture">Furniture</option>
                        <option value="Lighting">Lighting</option>
                        <option value="Textiles">Textiles</option>
                        <option value="Decor">Decor</option>
                        <option value="Accessories">Accessories</option>
                        <option value="Other">Other</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">Price (Base INR)</label>
                     <input type="number" className="w-full border p-2 rounded" value={newProd.price || ''} onChange={e => setNewProd({...newProd, price: parseFloat(e.target.value)})} />
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">Initial Stock</label>
                     <input type="number" className="w-full border p-2 rounded" value={newProd.stock || ''} onChange={e => setNewProd({...newProd, stock: parseInt(e.target.value)})} />
                  </div>
                  <div className="col-span-2">
                     <label className="text-xs text-slate-500">Description</label>
                     <textarea className="w-full border p-2 rounded" rows={2} value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">Materials</label>
                     <input className="w-full border p-2 rounded" value={newProd.materials} onChange={e => setNewProd({...newProd, materials: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs text-slate-500">Dimensions</label>
                     <input className="w-full border p-2 rounded" value={newProd.dimensions} onChange={e => setNewProd({...newProd, dimensions: e.target.value})} />
                  </div>
               </div>
               <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowAddProductModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                  <button onClick={handleAddNewProduct} className="flex-1 py-2 bg-indigo-600 text-white rounded">Add to Inventory</button>
               </div>
            </div>
         </div>
      )}

      {/* Orders History Modal */}
      {showOrdersModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-[600px] h-[500px] shadow-2xl flex flex-col">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Order History</h3>
                  <button onClick={() => setShowOrdersModal(false)}><X className="w-5 h-5"/></button>
               </div>
               <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 font-bold text-slate-600">
                        <tr><th className="p-3">ID</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Method</th><th className="p-3">Status</th></tr>
                     </thead>
                     <tbody>
                        {orders.map(o => (
                           <tr key={o.id} className="border-b">
                              <td className="p-3 font-mono">{o.id}</td>
                              <td className="p-3">{o.customerName}</td>
                              <td className="p-3 font-bold">{o.currency === 'USD' ? '$' : '₹'}{o.total.toFixed(2)}</td>
                              <td className="p-3">{o.paymentMethod || 'Cash'}</td>
                              <td className="p-3"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">{o.status}</span></td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
                  {orders.length === 0 && <p className="text-center text-slate-400 mt-10">No orders found.</p>}
               </div>
            </div>
         </div>
      )}

      {/* Barcode Scanner with Camera */}
      {showBarcodeScanner && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-[400px] text-center relative">
               <button onClick={stopCamera} className="absolute top-2 right-2"><X className="w-5 h-5"/></button>
               <h3 className="font-bold text-lg mb-4">Scan Barcode</h3>
               <div className="bg-black w-full h-64 rounded-lg overflow-hidden relative mb-4 flex items-center justify-center">
                  {cameraActive && !cameraError ? (
                     <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                  ) : (
                     <div className="text-white text-sm p-4">
                        {cameraError ? "Camera unavailable. Permission denied or system error." : "Starting Camera..."}
                     </div>
                  )}
                  <div className="absolute inset-0 border-2 border-red-500 opacity-50 m-12 rounded pointer-events-none"></div>
               </div>
               <p className="text-sm text-slate-500 mb-4">Align barcode within frame</p>
               <button onClick={() => { alert('Scanned: SKU-12345 (Simulated)'); stopCamera(); }} className="w-full py-2 bg-slate-100 rounded mb-2 font-medium">Simulate Successful Scan</button>
               <button onClick={stopCamera} className="w-full py-2 bg-red-50 text-red-600 rounded">Close</button>
            </div>
         </div>
      )}

      {/* Discount Modal */}
      {showDiscountModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-800">Add Discount</h3>
              <div className="space-y-4">
                 <div className="flex gap-2">
                    <input placeholder="Coupon Code" value={couponCode} onChange={e => setCouponCode(e.target.value)} className="flex-1 border p-2 rounded" />
                    <button onClick={applyCoupon} className="bg-slate-800 text-white px-3 rounded text-sm">Apply</button>
                 </div>
                 <hr />
                 <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                    <button onClick={() => setTempDiscount(d => ({...d, type: 'percent'}))} className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${tempDiscount.type === 'percent' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Percentage (%)</button>
                    <button onClick={() => setTempDiscount(d => ({...d, type: 'fixed'}))} className={`flex-1 py-2 text-sm rounded-md font-medium transition-all ${tempDiscount.type === 'fixed' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>Fixed ({currency === 'INR' ? '₹' : '$'})</button>
                 </div>
                 <input type="number" value={tempDiscount.value} onChange={e => setTempDiscount(d => ({...d, value: parseFloat(e.target.value) || 0}))} className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-lg" placeholder="0" />
                 
                 <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowDiscountModal(false)} className="flex-1 py-2.5 text-slate-600 bg-slate-100 font-bold rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                    <button onClick={confirmDiscount} className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors">Apply Discount</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Payment Method Modal */}
      {showPaymentModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl text-center">
               <h3 className="font-bold text-xl mb-2">Select Payment Method</h3>
               <p className="text-3xl font-extrabold text-indigo-600 mb-6">{formatCurrency(total)}</p>
               <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={() => startPayment('Cash')} className="py-3 border rounded-xl hover:bg-slate-50 font-medium">Cash</button>
                  <button onClick={() => startPayment('Card')} className="py-3 border rounded-xl hover:bg-slate-50 font-medium">Credit/Debit Card</button>
                  <button onClick={() => startPayment('UPI')} className="py-3 border rounded-xl hover:bg-slate-50 font-medium">UPI / QR</button>
                  <button onClick={() => startPayment('Razorpay')} className="py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">Razorpay</button>
                  <button onClick={() => startPayment('NEFT')} className="py-3 border rounded-xl hover:bg-slate-50 font-medium">NEFT/Bank</button>
                  <button onClick={() => startPayment('EMI')} className="py-3 border rounded-xl hover:bg-slate-50 font-medium">EMI</button>
               </div>
               <button onClick={() => setShowPaymentModal(false)} className="w-full py-2 text-slate-500">Cancel</button>
            </div>
         </div>
      )}

      {/* Razorpay Mock Modal */}
      {showRazorpayMock && (
         <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-[400px] overflow-hidden">
               <div className="bg-[#2a2f6d] p-4 flex justify-between items-center text-white">
                  <span className="font-bold">Razorpay Trusted</span>
                  <button onClick={() => setShowRazorpayMock(false)}><X className="w-4 h-4"/></button>
               </div>
               <div className="p-8 text-center">
                  <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="font-bold text-lg mb-1">Processing Payment...</h3>
                  <p className="text-sm text-slate-500">Please do not refresh the page.</p>
               </div>
            </div>
         </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-xl w-80 text-center shadow-2xl">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
               </div>
               <h3 className="font-bold text-xl mb-2">Payment Successful!</h3>
               <p className="text-slate-500 text-sm mb-6">Stock deducted & Invoice generated.</p>
               <button onClick={() => setShowReceiptModal(false)} className="w-full py-2 bg-slate-900 text-white rounded-lg">New Sale</button>
            </div>
         </div>
      )}
      
      {showCloseShiftModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
               <h3 className="font-bold text-lg mb-4">End Shift</h3>
               <div className="bg-slate-50 p-3 rounded mb-4 text-sm">
                  <div className="flex justify-between mb-1"><span>Opening Balance:</span> <span>{formatCurrency(parseFloat(openingBalance))}</span></div>
                  <div className="flex justify-between font-bold"><span>Total Cash:</span> <span>{formatCurrency((parseFloat(openingBalance) + cashCollected))}</span></div>
               </div>
               <input type="number" placeholder="Actual Cash in Drawer" className="w-full border p-2 rounded mb-4" value={closingBalance} onChange={e => setClosingBalance(e.target.value)} />
               <div className="flex gap-2">
                  <button onClick={() => setShowCloseShiftModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                  <button onClick={handleCloseShift} className="flex-1 py-2 bg-red-600 text-white rounded">Close Shift</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};