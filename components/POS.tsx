
import React, { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Product, CartItem, Customer, Invoice, ProductVariant } from '../types';
import { Plus, Search, Edit2, X, CreditCard, Banknote, Smartphone, Printer, CheckCircle, ShoppingBag, AlertTriangle, Scan, Trash2, Box, Image as ImageIcon, UserPlus, Truck, ChevronDown, ChevronUp, Upload, FileText, Film, Layers, Zap } from 'lucide-react';

export const POS: React.FC = () => {
  const { 
    addSale, addActivity, isShiftOpen, startShift, closeShift, products, addProduct, updateProduct, deductStock, formatCurrency, customers, addCustomer, addInvoice, companySettings, addInventoryItem
  } = useGlobal();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localOpeningBalance, setLocalOpeningBalance] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  
  // Modals & UI States
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInvoice, setShowInvoice] = useState<Invoice | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [showVariantSelector, setShowVariantSelector] = useState<Product | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Razorpay Simulation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Forms
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ name: '', phone: '', email: '', gstNumber: '', address: '' });
  
  // Product Form State
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
      name: '', price: 0, stock: 0, category: 'General', description: '', manualUrl: '', dimensions: '', sku: '', 
      media: [], documents: [], variants: []
  });
  const [trackInInventory, setTrackInInventory] = useState(true);
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ name: '', price: 0, stock: 0, sku: '' });

  // Payment & Checkout State
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Razorpay' | null>(null);
  const [deliveryType, setDeliveryType] = useState<'Standard' | 'Express' | 'Pickup'>('Standard');
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'customer' | 'payment'>('customer');
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  
  // Comprehensive Invoice Details State
  const [invDetails, setInvDetails] = useState({
      buyerOrderNo: '',
      dispatchDocNo: '',
      dispatchThrough: '',
      destination: '',
      termsOfDelivery: '',
      referenceNo: '',
      referenceDate: '',
      pan: companySettings.gstNumber.substr(2, 10),
      declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
      jurisdiction: 'Ahmedabad'
  });

  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-Generate SKU
  useEffect(() => {
      if (productForm.name && !editingProduct) {
          const generated = productForm.name.substring(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 10000);
          setProductForm(prev => ({ ...prev, sku: prev.sku || generated }));
      }
  }, [productForm.name]);

  // Pre-fill Invoice details on checkout
  useEffect(() => {
      if (showCheckout) {
          const rand = Math.floor(Math.random() * 100000);
          setInvDetails(prev => ({
              ...prev,
              buyerOrderNo: `ORD-${rand}`,
              dispatchDocNo: `DOC-${rand}`,
              dispatchThrough: 'FedEx/Self',
              termsOfDelivery: 'Immediate',
              referenceDate: new Date().toLocaleDateString()
          }));
      }
  }, [showCheckout]);

  // Scanner Logic
  useEffect(() => {
      let stream: MediaStream | null = null;
      if (showScanner) {
          const initCamera = async () => {
              try {
                  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  if (videoRef.current) {
                      videoRef.current.srcObject = stream;
                  }
              } catch (e) {
                  console.error("Camera failed", e);
                  alert("Unable to access camera. Please ensure permissions are granted.");
                  setShowScanner(false);
              }
          };
          initCamera();
      }
      return () => {
          if (stream) stream.getTracks().forEach(t => t.stop());
      };
  }, [showScanner]);

  const handleBarcodeDetected = (code: string) => {
      const foundProduct = products.find(p => p.sku === code || p.barcode === code || p.variants?.some(v => v.sku === code));
      if (foundProduct) {
          const matchedVariant = foundProduct.variants?.find(v => v.sku === code);
          addToCart(foundProduct, matchedVariant);
          alert(`Scanned: ${foundProduct.name} ${matchedVariant ? `(${matchedVariant.name})` : ''}`);
          setShowScanner(false);
      } else {
          alert(`No product found for code: ${code}`);
      }
  };

  const manualTriggerScan = () => {
      const target = products[0]; 
      if(target) handleBarcodeDetected(target.sku);
  };

  const filteredProducts = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const hasStock = p.variants && p.variants.length > 0 ? p.variants.some(v => v.stock > 0) : p.stock > 0;
      const matchesStock = showInStockOnly ? hasStock : true;
      return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = ['All', 'Furniture', 'Lighting', 'Textiles', 'Decor'];

  const deliveryOptions = [
      { id: 'Standard', label: 'Standard', cost: 500 },
      { id: 'Express', label: 'Express', cost: 1500 },
      { id: 'Pickup', label: 'Pickup', cost: 0 }
  ];

  const currentDeliveryCost = discountApplied ? 0 : (deliveryOptions.find(d => d.id === deliveryType)?.cost || 0);

  const handleCoupon = (code: string) => {
      setCouponCode(code);
      if (code.toUpperCase() === 'FREESHIP' || code.toUpperCase() === 'MYSTRI') {
          setDiscountApplied(true);
      } else {
          setDiscountApplied(false);
      }
  };

  const handleProductClick = (product: Product) => {
      if (product.variants && product.variants.length > 0) {
          setShowVariantSelector(product);
      } else {
          addToCart(product);
      }
  };

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart(prev => {
      const cartId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find(item => {
          const itemKey = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
          return itemKey === cartId;
      });
      
      const stockAvailable = variant ? variant.stock : product.stock;
      const currentQty = existing ? existing.quantity : 0;

      if (currentQty + 1 > stockAvailable) {
         alert(`Stock Limit: Only ${stockAvailable} units available.`);
         return prev;
      }

      if (existing) {
          return prev.map(item => {
              const itemKey = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
              if (itemKey === cartId) {
                  return { ...item, quantity: item.quantity + 1 };
              }
              return item;
          });
      }
      
      const newItem: CartItem = {
          ...product,
          price: variant ? variant.price : product.price,
          quantity: 1,
          selectedVariant: variant
      };
      return [...prev, newItem];
    });
    setShowVariantSelector(null);
  };

  const updateQuantity = (cartIndex: number, delta: number) => {
    setCart(prev => prev.map((item, idx) => {
      if (idx === cartIndex) {
        const stock = item.selectedVariant ? item.selectedVariant.stock : item.stock;
        if (delta > 0 && item.quantity + delta > stock) return item;
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (cartIndex: number) => setCart(prev => prev.filter((_, idx) => idx !== cartIndex));
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.18; 
  const total = subtotal + tax + currentDeliveryCost;

  const initiateCheckout = () => {
      setCheckoutStep('customer');
      setShowCheckout(true);
  };

  const handleCustomerSelect = (customer: Customer) => {
      setSelectedCustomer(customer);
      setCheckoutStep('payment');
  };

  const clearCustomer = () => {
      setSelectedCustomer(null);
      setCheckoutStep('customer');
  };

  const handlePayment = async (method: 'Cash' | 'Card' | 'Razorpay') => {
      setPaymentMethod(method);
      if (method === 'Razorpay') {
          setIsProcessingPayment(true);
          // Simulate Gateway Delay
          setTimeout(() => {
              setIsProcessingPayment(false);
              completeTransaction(method);
          }, 2000);
      } else {
          completeTransaction(method);
      }
  };

  const completeTransaction = (method: string) => {
      // 1. Sync Stock - Now correctly calls context which syncs Inventory too
      deductStock(cart.map(i => ({ 
          id: i.id, 
          quantity: i.quantity, 
          sku: i.selectedVariant ? i.selectedVariant.sku : i.sku, 
          name: i.selectedVariant ? i.selectedVariant.name : i.name,
          selectedVariant: i.selectedVariant
      })));
      
      addSale(total, selectedCustomer?.id, cart);
      
      const invId = `EVM/25-26/${Math.floor(Math.random()*9999).toString().padStart(4, '0')}`;
      const newInvoice: Invoice = {
          id: invId,
          client: selectedCustomer?.name || 'Walk-in Customer',
          amount: total,
          baseAmount: subtotal,
          taxAmount: tax,
          taxRate: 18,
          paidAmount: total,
          type: 'Income',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
          status: 'Paid',
          currency: 'INR',
          gstNumber: selectedCustomer?.gstNumber,
          history: [],
          items: cart.map(c => ({ 
              desc: c.name, 
              qty: c.quantity, 
              rate: c.price, 
              total: c.price * c.quantity,
              variant: c.selectedVariant?.name,
              hsn: '9403', 
              gstRate: 18
          })),
          deliveryType: discountApplied ? 'Free' : (deliveryType as any),
          deliveryCost: currentDeliveryCost,
          buyerAddress: selectedCustomer?.address,
          shippingAddress: selectedCustomer?.shippingAddress || selectedCustomer?.address,
          paymentMode: method,
          sellerName: companySettings.name,
          sellerAddress: companySettings.address,
          sellerGst: companySettings.gstNumber,
          bankName: companySettings.bankName,
          accountNo: companySettings.accountNo,
          ifsc: companySettings.ifsc,
          branch: companySettings.branch,
          ...invDetails
      };
      
      addInvoice(newInvoice);
      addActivity(`Sale: ${formatCurrency(total)} via ${method}`, 'sale');
      
      setCart([]); 
      setSelectedCustomer(null); 
      setShowCheckout(false);
      setCheckoutStep('customer');
      setPaymentMethod(null);
      setDeliveryType('Standard');
      setCouponCode('');
      setDiscountApplied(false);
      setInvDetails({ buyerOrderNo: '', dispatchDocNo: '', dispatchThrough: '', destination: '', termsOfDelivery: '', referenceNo: '', referenceDate: '', pan: companySettings.gstNumber.substr(2, 10), declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.', jurisdiction: 'Ahmedabad' });
      setShowInvoice(newInvoice);
  };

  // Media Handling
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const newMedia = files.map((file: any) => ({
              type: file.type.startsWith('video') ? 'video' : 'image',
              url: URL.createObjectURL(file), // Create local preview URL
              file: file
          }));
          setProductForm(prev => ({ ...prev, media: [...(prev.media || []), ...newMedia] as any }));
      }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const newDocs = files.map((file: any) => ({
              name: file.name,
              url: URL.createObjectURL(file)
          }));
          setProductForm(prev => ({ ...prev, documents: [...(prev.documents || []), ...newDocs] }));
      }
  };

  const addVariant = () => {
      if (newVariant.name && newVariant.price) {
          setProductForm(prev => ({
              ...prev,
              variants: [...(prev.variants || []), {
                  id: Math.random().toString(36).substr(2, 5),
                  name: newVariant.name!,
                  price: newVariant.price!,
                  stock: newVariant.stock || 0,
                  sku: newVariant.sku || `${prev.sku}-${prev.variants?.length || 0}`
              }]
          }));
          setNewVariant({ name: '', price: 0, stock: 0, sku: '' });
      }
  };

  const handleSaveProduct = () => {
      if (!productForm.name || !productForm.price) return;
      
      const mainImage = productForm.media && productForm.media.length > 0 ? productForm.media[0].url : 'https://via.placeholder.com/300?text=No+Image';

      const newProdData = {
          ...productForm,
          image: mainImage,
          id: editingProduct ? editingProduct.id : Math.random().toString(36).substr(2, 9),
      } as Product;

      if (editingProduct) updateProduct(editingProduct.id, newProdData);
      else {
          addProduct(newProdData);
          if (trackInInventory) {
              addInventoryItem({
                  id: newProdData.id,
                  name: newProdData.name,
                  type: 'Finished Good',
                  quantity: newProdData.stock,
                  unit: 'pcs',
                  cost: newProdData.price * 0.6,
                  reorderLevel: 5,
                  location: 'Showroom'
              });
          }
      }
      
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, stock: 0, category: 'General', description: '', manualUrl: '', dimensions: '', sku: '', media: [], documents: [], variants: [] });
  };

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch));

  if (!isShiftOpen) {
    return (
      <div className="h-full flex items-center justify-center bg-background-dark p-4">
        <div className="bg-surface-dark p-10 rounded-3xl border border-white/5 w-full max-w-md text-center shadow-2xl">
          <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"><Banknote className="w-8 h-8"/></div>
          <h2 className="text-2xl font-bold text-white mb-2">Open Register</h2>
          <input type="number" value={localOpeningBalance} onChange={e => setLocalOpeningBalance(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-center text-xl font-bold mb-6 focus:border-primary focus:outline-none text-white" placeholder="0.00" />
          <button onClick={() => startShift(localOpeningBalance)} className="w-full py-4 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-all">Open Shift</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background-dark text-white overflow-hidden relative">
      {/* Product Grid Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-[70%]">
        <div className="p-4 border-b border-white/5 flex flex-col gap-4 bg-background-dark z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative flex-1 w-full md:max-w-lg">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                 <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-surface-dark border border-white/10 rounded-full pl-10 pr-4 py-2.5 focus:ring-1 focus:ring-primary outline-none" placeholder="Search products..." />
              </div>
              <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                <button onClick={() => setShowScanner(true)} className="px-4 py-2.5 bg-surface-dark hover:bg-white/5 border border-white/10 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap">
                    <Scan className="w-4 h-4" /> Scan
                </button>
                <button onClick={closeShift} className="px-4 py-2.5 bg-red-500/10 text-red-500 rounded-full text-sm font-bold border border-red-500/20 hover:bg-red-500/20 transition-colors whitespace-nowrap">Close</button>
              </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {categories.map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${activeCategory === cat ? 'bg-primary text-black border-primary' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}
                  >
                      {cat}
                  </button>
              ))}
              <div className="w-px h-6 bg-white/10 mx-2 self-center"></div>
              <button 
                onClick={() => setShowInStockOnly(!showInStockOnly)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-2 ${showInStockOnly ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-white/5 text-zinc-400 border-white/5'}`}
              >
                  <Box className="w-3 h-3" /> In Stock Only
              </button>
          </div>
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 content-start custom-scrollbar">
          {/* Create Product Tile */}
          <div onClick={() => { setEditingProduct(null); setProductForm({name:'', price:0, stock:0, category: 'Furniture', sku: '', media: [], documents: [], variants: []}); setShowProductModal(true); }} 
               className="bg-primary/5 border-2 border-dashed border-primary/20 p-2.5 rounded-xl hover:bg-primary/10 hover:border-primary/50 text-center transition-all cursor-pointer flex flex-col items-center justify-center h-full group min-h-[160px]">
              <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="font-bold text-primary text-sm">Create Product</span>
          </div>

          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => handleProductClick(p)} className={`bg-surface-dark p-2.5 rounded-xl border border-white/5 hover:border-primary/50 text-left transition-all group relative cursor-pointer flex flex-col h-full ${p.stock === 0 && (!p.variants || p.variants.every(v=>v.stock===0)) ? 'opacity-50' : ''}`}>
               <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setProductForm(p); setShowProductModal(true); }} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-primary text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all">
                  <Edit2 className="w-3 h-3" />
               </button>
               
              <div className="aspect-square bg-zinc-800 rounded-lg mb-2 overflow-hidden relative">
                  <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  {p.stock === 0 && (!p.variants || p.variants.every(v=>v.stock===0)) && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-bold text-[10px] uppercase tracking-widest text-white">Out of Stock</div>}
              </div>
              <h4 className="font-bold text-xs mb-0.5 truncate text-zinc-200">{p.name}</h4>
              <div className="mt-auto flex justify-between items-center">
                  <p className="text-primary font-bold text-xs">{formatCurrency(p.price)}</p>
                  {p.variants && p.variants.length > 0 ? (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">{p.variants.length} Options</span>
                  ) : (
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${p.stock < 5 ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 bg-white/5'}`}>{p.stock} Left</span>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Sidebar Cart Drawer */}
      <aside 
        className={`
          fixed inset-y-0 right-0 w-full md:w-[400px] lg:w-[30%] bg-surface-darker shadow-2xl flex flex-col z-[100] transition-transform duration-300 lg:relative lg:translate-x-0 lg:border-l lg:border-white/5
          ${showMobileCart ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Cart Contents - Same as before */}
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-surface-darker">
           <h3 className="font-black text-lg">Current Order</h3>
           <button onClick={() => setShowMobileCart(false)} className="lg:hidden p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        
        {/* Manual Customer Section - Same as before */}
        <div className="p-5 pb-0">
           <div className={`bg-white/5 p-4 rounded-xl border ${!selectedCustomer ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10'} relative transition-colors`}>
             {selectedCustomer ? (
               <div className="flex justify-between items-center">
                 <div>
                    <p className="font-bold text-sm text-white">{selectedCustomer.name}</p>
                    <p className="text-xs text-zinc-500">{selectedCustomer.phone}</p>
                 </div>
                 <button onClick={clearCustomer}><X className="w-4 h-4 text-zinc-500 hover:text-white" /></button>
               </div>
             ) : (
               <div className="relative">
                  <div className="flex items-center gap-2 text-amber-500 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Customer Required</span>
                  </div>
                  {/* SEARCH BAR REPLACEMENT */}
                  <div className="space-y-2">
                      <div className="relative">
                          <input 
                            value={customerSearch}
                            onChange={e => setCustomerSearch(e.target.value)}
                            placeholder="Search Name or Phone..."
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 pl-8 text-xs text-white focus:outline-none focus:border-primary"
                          />
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          {customerSearch && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-surface-darker border border-white/10 rounded-lg max-h-40 overflow-y-auto z-50">
                                  {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                      <button key={c.id} onClick={() => { handleCustomerSelect(c); setCustomerSearch(''); }} className="w-full text-left p-2 hover:bg-white/10 text-xs border-b border-white/5 last:border-0">
                                          <div className="font-bold text-white">{c.name}</div>
                                          <div className="text-zinc-500">{c.phone}</div>
                                      </button>
                                  )) : (
                                      <div className="p-2 text-xs text-zinc-500 text-center">No results</div>
                                  )}
                              </div>
                          )}
                      </div>
                      <button onClick={() => setShowAddCustomer(true)} className="w-full p-2 bg-primary/20 text-primary rounded-lg border border-primary/20 hover:bg-primary hover:text-black transition-colors font-bold text-xs">
                          + Add New Customer
                      </button>
                  </div>
               </div>
             )}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex gap-3 items-center bg-white/5 p-2 rounded-xl border border-white/5">
              <div className="size-10 bg-zinc-800 rounded-lg shrink-0 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
              <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-white">{item.name}</p>
                  {item.selectedVariant && <p className="text-[10px] text-zinc-400">Variant: {item.selectedVariant.name}</p>}
                  <p className="text-[10px] text-primary font-bold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
              <div className="flex items-center bg-black/40 rounded-lg p-1">
                  <button onClick={() => updateQuantity(idx, -1)} className="px-2 font-bold text-zinc-400 hover:text-white text-sm">-</button>
                  <span className="px-1 text-xs font-bold text-white min-w-[16px] text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(idx, 1)} className="px-2 font-bold text-zinc-400 hover:text-white text-sm">+</button>
              </div>
              <button onClick={() => removeFromCart(idx)} className="text-zinc-600 hover:text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center text-zinc-600 italic py-10 text-xs">No items in cart</div>}
        </div>

        <div className="p-5 bg-surface-darker border-t border-white/5 space-y-2 pb-8 lg:pb-6">
           <div className="flex justify-between text-zinc-400 text-xs"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
           <div className="flex justify-between text-zinc-400 text-xs"><span>GST (18%)</span><span>{formatCurrency(tax)}</span></div>
           <div className="flex justify-between text-zinc-400 text-xs">
              <span>Delivery ({deliveryType})</span>
              <span>{discountApplied ? <span className="text-primary font-bold">FREE</span> : formatCurrency(currentDeliveryCost)}</span>
           </div>
           <div className="flex justify-between text-white text-lg font-bold pt-2 border-t border-white/5"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
           <button 
             onClick={initiateCheckout} 
             disabled={cart.length === 0} 
             className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none mt-2"
           >
             Complete Order
           </button>
        </div>
      </aside>

      {/* Checkout Modal */}
      {showCheckout && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative min-h-[400px] flex flex-col">
                  <button onClick={() => { setShowCheckout(false); setCheckoutStep('customer'); }} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
                  <h3 className="text-2xl font-black text-white mb-6">Complete Order</h3>
                  
                  {checkoutStep === 'customer' && !selectedCustomer ? (
                     <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                        <h4 className="text-lg font-bold text-white mb-2">Customer Details Required</h4>
                        <p className="text-zinc-400 text-sm mb-6">A customer profile is mandatory for invoicing.</p>
                        <button onClick={() => { setShowCheckout(false); setShowAddCustomer(true); }} className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 mb-3">Create New Profile</button>
                        <button onClick={() => { setShowCheckout(false); }} className="text-zinc-500 text-xs font-bold hover:text-white">Cancel</button>
                     </div>
                  ) : checkoutStep === 'customer' && selectedCustomer ? (
                     setCheckoutStep('payment') as any
                  ) : null}

                  {checkoutStep === 'payment' && (
                      <div className="flex-1 flex flex-col">
                          {/* Invoice Toggle Removed for brevity - kept logic if desired but simplifying for payment */}
                          
                          <div className="mb-6">
                              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Truck className="w-4 h-4"/> Delivery Method</p>
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                  {deliveryOptions.map(d => (
                                      <button 
                                        key={d.id} 
                                        onClick={() => setDeliveryType(d.id as any)}
                                        className={`py-3 rounded-xl text-[10px] md:text-xs font-bold border transition-all flex flex-col items-center justify-center gap-1 ${deliveryType === d.id ? 'bg-primary text-black border-primary' : 'bg-white/5 text-zinc-400 border-white/5'}`}
                                      >
                                          <span>{d.label}</span>
                                          <span className="opacity-70">{d.cost === 0 ? '' : formatCurrency(d.cost)}</span>
                                      </button>
                                  ))}
                              </div>
                              {/* Coupon Code Input */}
                              <div className="flex gap-2">
                                  <input 
                                    value={couponCode} 
                                    onChange={e => handleCoupon(e.target.value)} 
                                    placeholder="Enter Promo Code" 
                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-primary" 
                                  />
                                  <div className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center ${discountApplied ? 'bg-green-500/20 text-green-500' : 'bg-white/5 text-zinc-500'}`}>
                                      {discountApplied ? 'APPLIED' : 'CODE'}
                                  </div>
                              </div>
                          </div>

                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Select Payment Method</p>
                          <div className="grid grid-cols-3 gap-3 mb-8">
                              {['Cash', 'Card', 'Razorpay'].map(method => (
                                  <button 
                                      key={method}
                                      onClick={() => handlePayment(method as any)}
                                      className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-primary/50"
                                  >
                                      {method === 'Cash' ? <Banknote className="w-6 h-6" /> : method === 'Card' ? <CreditCard className="w-6 h-6" /> : <Zap className="w-6 h-6 text-blue-400" />}
                                      <span className="text-xs font-bold">{method}</span>
                                  </button>
                              ))}
                          </div>
                          <div className="mt-auto border-t border-white/5 pt-4">
                              <div className="flex justify-between items-center mb-4">
                                  <span className="text-zinc-400 font-bold">Total Payable</span>
                                  <span className="text-2xl font-black text-white">{formatCurrency(total)}</span>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* Razorpay Simulation Overlay */}
      {isProcessingPayment && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-md">
              <div className="bg-white rounded-xl p-8 w-96 text-center shadow-2xl animate-fade-in-up">
                  <div className="size-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Razorpay Secure</h3>
                  <p className="text-slate-500 text-sm mb-6">Processing payment of {formatCurrency(total)}...</p>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-4">
                      <div className="h-full bg-blue-500 w-2/3 animate-pulse"></div>
                  </div>
                  <p className="text-xs text-slate-400">Please do not close this window.</p>
              </div>
          </div>
      )}

      {/* Invoice Modal - Fixed A4 Black Text */}
      {showInvoice && (
          <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
              <div className="relative w-[210mm] flex flex-col items-center">
                  <div className="absolute -top-12 left-0 right-0 flex justify-center gap-4 print:hidden z-50">
                      <button onClick={() => window.print()} className="px-6 py-3 bg-primary text-black rounded-full font-bold shadow-glow flex items-center gap-2 hover:scale-105 transition-transform"><Printer className="w-5 h-5"/> Print Invoice</button>
                      <button onClick={() => setShowInvoice(null)} className="px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors flex items-center gap-2"><X className="w-5 h-5"/> Close</button>
                  </div>

                  <div id="invoice-print-area" className="bg-white text-black w-[210mm] min-h-[297mm] shadow-2xl p-[10mm] text-xs font-sans leading-tight relative mt-4 mx-auto print:mt-0">
                      {/* Optional Logo */}
                      {companySettings.logoUrl && (
                          <div className="mb-4 text-center">
                              <img src={companySettings.logoUrl} alt="Company Logo" className="h-16 mx-auto object-contain" />
                          </div>
                      )}
                      
                      <div className="text-center font-bold text-xl mb-4 uppercase tracking-wider underline decoration-2 underline-offset-4 text-black">Tax Invoice</div>
                      
                      {/* Bordered Container */}
                      <div className="border border-black flex-1 flex flex-col text-black">
                          {/* Row 1: Seller & Invoice Info */}
                          <div className="grid grid-cols-2 border-b border-black">
                              <div className="p-2 border-r border-black text-black">
                                  <h4 className="font-bold mb-1 text-black">Seller Details:</h4>
                                  <h2 className="font-bold text-lg text-black">{showInvoice.sellerName}</h2>
                                  <p className="whitespace-pre-wrap text-black">{showInvoice.sellerAddress}</p>
                                  <p className="mt-1 text-black"><span className="font-bold">GSTIN:</span> {showInvoice.sellerGst}</p>
                                  <p className="text-black"><span className="font-bold">State:</span> Gujarat (24)</p>
                                  <p className="text-black"><span className="font-bold">Email:</span> {companySettings.email}</p>
                              </div>
                              <div className="flex flex-col text-black">
                                  <div className="flex border-b border-black flex-1">
                                      <div className="p-2 w-1/2 border-r border-black">
                                          <p className="font-bold">Invoice No.</p>
                                          <p>{showInvoice.id}</p>
                                      </div>
                                      <div className="p-2 w-1/2">
                                          <p className="font-bold">Date</p>
                                          <p>{showInvoice.date}</p>
                                      </div>
                                  </div>
                                  <div className="p-2 border-b border-black">
                                      <p className="font-bold">Delivery Note</p>
                                      <p>{showInvoice.deliveryType}</p>
                                  </div>
                                  <div className="p-2">
                                      <p className="font-bold">Mode/Terms of Payment</p>
                                      <p>{showInvoice.paymentMode}</p>
                                  </div>
                              </div>
                          </div>

                          {/* Row 2: Buyer & Consignee */}
                          <div className="grid grid-cols-2 border-b border-black">
                              <div className="p-2 border-r border-black text-black">
                                  <h4 className="font-bold mb-1">Buyer (Bill to):</h4>
                                  <p className="font-bold">{showInvoice.client}</p>
                                  <p className="whitespace-pre-wrap">{showInvoice.buyerAddress || 'Address on File'}</p>
                                  <p className="mt-1"><span className="font-bold">GSTIN:</span> {showInvoice.gstNumber || 'Unregistered'}</p>
                              </div>
                              <div className="p-2 text-black">
                                  <h4 className="font-bold mb-1">Consignee (Ship to):</h4>
                                  <p className="font-bold">{showInvoice.client}</p>
                                  <p className="whitespace-pre-wrap">{showInvoice.shippingAddress || showInvoice.buyerAddress || 'Same as billing'}</p>
                              </div>
                          </div>

                          {/* Row 3: Logistics */}
                          <div className="grid grid-cols-2 border-b border-black text-black">
                              <div className="flex flex-col border-r border-black">
                                  <div className="flex border-b border-black">
                                      <div className="p-2 w-1/2 border-r border-black">
                                          <p className="font-bold">Buyer Order No.</p>
                                          <p>{showInvoice.buyerOrderNo || '-'}</p>
                                      </div>
                                      <div className="p-2 w-1/2">
                                          <p className="font-bold">Dated</p>
                                          <p>{showInvoice.referenceDate || '-'}</p>
                                      </div>
                                  </div>
                                  <div className="p-2">
                                      <p className="font-bold">Terms of Delivery</p>
                                      <p>{showInvoice.termsOfDelivery || 'Immediate'}</p>
                                  </div>
                              </div>
                              <div className="flex flex-col">
                                  <div className="flex border-b border-black">
                                      <div className="p-2 w-1/2 border-r border-black">
                                          <p className="font-bold">Dispatch Doc No.</p>
                                          <p>{showInvoice.dispatchDocNo || '-'}</p>
                                      </div>
                                      <div className="p-2 w-1/2">
                                          <p className="font-bold">Dispatch Through</p>
                                          <p>{showInvoice.dispatchThrough || 'Self'}</p>
                                      </div>
                                  </div>
                                  <div className="p-2">
                                      <p className="font-bold">Destination</p>
                                      <p>{showInvoice.destination || '-'}</p>
                                  </div>
                              </div>
                          </div>

                          {/* Row 4: Items */}
                          <div className="flex-1 flex flex-col text-black">
                              <table className="w-full text-left border-collapse">
                                  <thead>
                                      <tr className="border-b border-black bg-gray-100 text-black">
                                          <th className="border-r border-black p-2 w-10 text-center">SI</th>
                                          <th className="border-r border-black p-2 text-center">Description of Services</th>
                                          <th className="border-r border-black p-2 w-20 text-center">HSN/SAC</th>
                                          <th className="border-r border-black p-2 w-12 text-center">GST</th>
                                          <th className="border-r border-black p-2 w-16 text-center">Qty</th>
                                          <th className="border-r border-black p-2 w-24 text-center">Rate</th>
                                          <th className="p-2 w-24 text-center">Amount</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {showInvoice.items?.map((item, i) => (
                                          <tr key={i} className="align-top border-b border-black last:border-b-0">
                                              <td className="border-r border-black p-2 text-center">{i + 1}</td>
                                              <td className="border-r border-black p-2 font-bold">
                                                  {item.desc}
                                                  {item.variant && <span className="block font-normal text-[10px] text-gray-600">Variant: {item.variant}</span>}
                                              </td>
                                              <td className="border-r border-black p-2 text-center">{item.hsn || '9403'}</td>
                                              <td className="border-r border-black p-2 text-center">{item.gstRate || 18}%</td>
                                              <td className="border-r border-black p-2 text-center font-bold">{item.qty}</td>
                                              <td className="border-r border-black p-2 text-right">{item.rate.toFixed(2)}</td>
                                              <td className="p-2 text-right font-bold">{item.total.toFixed(2)}</td>
                                          </tr>
                                      ))}
                                      {showInvoice.deliveryCost !== undefined && (
                                          <tr className="align-top border-b border-black">
                                              <td className="border-r border-black p-2 text-center">{showInvoice.items!.length + 1}</td>
                                              <td className="border-r border-black p-2 font-bold">Delivery Charges {showInvoice.deliveryType === 'Free' ? '(Waived)' : ''}</td>
                                              <td className="border-r border-black p-2 text-center">9965</td>
                                              <td className="border-r border-black p-2 text-center">-</td>
                                              <td className="border-r border-black p-2 text-center font-bold">1</td>
                                              <td className="border-r border-black p-2 text-right">{showInvoice.deliveryCost.toFixed(2)}</td>
                                              <td className="p-2 text-right font-bold">{showInvoice.deliveryCost.toFixed(2)}</td>
                                          </tr>
                                      )}
                                  </tbody>
                              </table>
                              
                              <div className="mt-auto border-t border-black text-black">
                                  <div className="flex border-b border-black">
                                      <div className="flex-1 border-r border-black text-right p-2 font-bold">Taxable Amount</div>
                                      <div className="w-24 text-right p-2">{showInvoice.baseAmount?.toFixed(2)}</div>
                                  </div>
                                  <div className="flex border-b border-black">
                                      <div className="flex-1 border-r border-black text-right p-2 font-bold">Add: CGST (9%)</div>
                                      <div className="w-24 text-right p-2">{(showInvoice.taxAmount! / 2).toFixed(2)}</div>
                                  </div>
                                  <div className="flex border-b border-black">
                                      <div className="flex-1 border-r border-black text-right p-2 font-bold">Add: SGST (9%)</div>
                                      <div className="w-24 text-right p-2">{(showInvoice.taxAmount! / 2).toFixed(2)}</div>
                                  </div>
                                  <div className="flex bg-gray-200">
                                      <div className="flex-1 border-r border-black text-right p-2 font-bold uppercase">Total Payable</div>
                                      <div className="w-24 text-right p-2 font-bold">₹ {showInvoice.amount.toFixed(2)}</div>
                                  </div>
                              </div>
                          </div>

                          {/* Row 5: Amount in Words */}
                          <div className="border-t border-black p-2 text-black">
                              <p className="font-bold">Amount Chargeable (in words)</p>
                              <p className="italic">{toWords(showInvoice.amount)}</p>
                          </div>

                          {/* Row 6: Bank & Sign */}
                          <div className="grid grid-cols-2 border-t border-black text-black">
                              <div className="p-2 border-r border-black">
                                  <h4 className="font-bold underline mb-1">Bank Details</h4>
                                  <p><span className="font-bold">Bank:</span> {showInvoice.bankName || '-'}</p>
                                  <p><span className="font-bold">A/c No:</span> {showInvoice.accountNo || '-'}</p>
                                  <p><span className="font-bold">Branch & IFS:</span> {showInvoice.branch || '-'} & {showInvoice.ifsc || '-'}</p>
                                  <p className="mt-2"><span className="font-bold">PAN:</span> {showInvoice.pan}</p>
                              </div>
                              <div className="p-2 flex flex-col justify-between">
                                  <div className="text-right">
                                      <p className="font-bold">For {showInvoice.sellerName}</p>
                                  </div>
                                  <div className="text-right mt-12">
                                      <p className="font-bold">(Authorized Signatory)</p>
                                  </div>
                              </div>
                          </div>
                      </div>
                      
                      <div className="text-center font-bold text-[10px] mt-2 text-black">
                          SUBJECT TO {showInvoice.jurisdiction?.toUpperCase()} JURISDICTION
                      </div>
                      <div className="mt-4 text-[10px] text-black">
                          <p className="font-bold underline">Declaration:</p>
                          <p>{showInvoice.declaration}</p>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Product Modal (Updated with Image & Sync) */}
      {showProductModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl p-6 md:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                 <button onClick={() => setShowProductModal(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col: Basics */}
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Product Name</label>
                          <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Name" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">SKU Code (Auto)</label>
                          <input value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-primary" placeholder="Generated Automatically" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Price</label>
                              <input type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="0.00" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Initial Stock</label>
                              <input type="number" value={productForm.stock || ''} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="0" />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Description / Material</label>
                          <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary h-24" placeholder="Details..." />
                      </div>
                  </div>

                  {/* Right Col: Media & Variants */}
                  <div className="space-y-6">
                      {/* Media Upload */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Media Gallery</h4>
                          <div className="grid grid-cols-4 gap-2 mb-3">
                              {productForm.media?.map((m, i) => (
                                  <div key={i} className="aspect-square rounded-lg overflow-hidden relative border border-white/10">
                                      {m.type === 'video' ? <video src={m.url} className="w-full h-full object-cover" /> : <img src={m.url} className="w-full h-full object-cover" />}
                                  </div>
                              ))}
                              <label className="aspect-square rounded-lg border-2 border-dashed border-white/10 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                  <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Upload</span>
                                  <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                              </label>
                          </div>
                      </div>

                      {/* Doc Upload */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Manuals & Docs</h4>
                          <div className="space-y-2">
                              {productForm.documents?.map((d, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs text-white bg-black/20 p-2 rounded">
                                      <FileText className="w-3 h-3 text-primary" /> {d.name}
                                  </div>
                              ))}
                              <label className="flex items-center justify-center gap-2 w-full py-2 bg-black/20 hover:bg-black/40 rounded border border-dashed border-white/10 text-xs text-zinc-400 cursor-pointer">
                                  <Upload className="w-3 h-3" /> Upload PDF
                                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDocUpload} />
                              </label>
                          </div>
                      </div>

                      {/* Variants */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> Product Variants</h4>
                          <div className="flex gap-2 mb-2">
                              <input value={newVariant.name} onChange={e => setNewVariant({...newVariant, name: e.target.value})} placeholder="Name (e.g. Red)" className="flex-1 bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" />
                              <input type="number" value={newVariant.price || ''} onChange={e => setNewVariant({...newVariant, price: Number(e.target.value)})} placeholder="Price" className="w-20 bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" />
                              <button onClick={addVariant} className="p-2 bg-primary text-black rounded-lg"><Plus className="w-4 h-4"/></button>
                          </div>
                          <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                              {productForm.variants?.map((v, i) => (
                                  <div key={i} className="flex justify-between items-center text-xs bg-black/20 p-2 rounded">
                                      <span className="text-white font-bold">{v.name}</span>
                                      <span className="text-zinc-400">{formatCurrency(v.price)}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <button onClick={handleSaveProduct} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow mt-4 hover:scale-[1.01] transition-transform">Save Product to Inventory</button>
           </div>
        </div>
      )}

      {/* Add Customer Modal (FIXED) */}
      {showAddCustomer && (
          <div className="fixed inset-0 z-[200] bg-black/90 p-8 flex items-center justify-center">
             <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
                <h3 className="text-xl font-bold mb-6 text-white">Add New Customer</h3>
                <div className="space-y-4 mb-8">
                    <input placeholder="Full Name" onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary" />
                    <input placeholder="Phone Number" onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary" />
                    <input placeholder="Email Address" onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary" />
                    <input placeholder="GST Number" onChange={e => setNewCustomer({...newCustomer, gstNumber: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary" />
                    <textarea placeholder="Full Billing Address" onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary h-24 resize-none" />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAddCustomer(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/20">Cancel</button>
                    <button onClick={() => { 
                        if(newCustomer.name && newCustomer.phone) {
                            const c = { ...newCustomer, id: Math.random().toString(36).substr(2,9), totalSpend: 0, status: 'Active' as const, history: [] };
                            addCustomer(c as Customer); 
                            setSelectedCustomer(c as Customer); 
                            setShowAddCustomer(false); 
                            setCheckoutStep('payment');
                        }
                    }} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold shadow-glow">Save Customer</button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};

function toWords(amount: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (n: number): string => {
        if (n < 20) return a[n];
        const digit = n % 10;
        if (n < 100) return b[Math.floor(n / 10)] + (digit ? '-' + a[digit] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + (n % 100 == 0 ? '' : numToWords(n % 100));
        return numToWords(Math.floor(n / 1000)) + 'Thousand ' + (n % 1000 != 0 ? numToWords(n % 1000) : '');
    };
    return numToWords(Math.floor(amount)) + (amount % 1 !== 0 ? ' and ' + Math.round((amount % 1) * 100) + '/100' : '');
}
