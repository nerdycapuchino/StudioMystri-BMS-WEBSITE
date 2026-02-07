
import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Product, CartItem, Customer, Invoice, ProductVariant } from '../types';
import { Search, X, CreditCard, Banknote, Printer, Trash2, Box, Scan, Plus, User, MapPin, Calculator, FileText, ChevronDown, Image as ImageIcon, Upload, Layers, Barcode, Edit2 } from 'lucide-react';

export const POS: React.FC = () => {
  const { 
    addSale, addActivity, isShiftOpen, startShift, closeShift, products, addProduct, updateProduct, deductStock, formatCurrency, customers, addCustomer, addInvoice, companySettings, addInventoryItem
  } = useGlobal();

  // --- STATE ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Tax Logic State
  const [orderType, setOrderType] = useState<'Local' | 'InterState'>('Local'); // Drives GST Logic
  const [discount, setDiscount] = useState<number>(0); // Percentage

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState<Invoice | null>(null);
  const [showVariantSelector, setShowVariantSelector] = useState<Product | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [custSearchTerm, setCustSearchTerm] = useState('');
  
  // Product Management State (Restored)
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Partial<Product>>({ 
      name: '', price: 0, cost: 0, stock: 0, category: 'General', description: '', materials: '', dimensions: '', manualUrl: '', sku: '', barcode: '',
      media: [], documents: [], variants: []
  });
  const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ name: '', price: 0, stock: 0, sku: '' });

  // Register State
  const [openingBalance, setOpeningBalance] = useState('');

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxRate = 0.18; // Flat 18% for demo, can be per-item in future
  const taxAmount = taxableAmount * taxRate;
  const total = taxableAmount + taxAmount;

  // --- HANDLERS ---

  const addToCart = (product: Product, variant?: ProductVariant) => {
    setCart(prev => {
      const cartId = variant ? `${product.id}-${variant.id}` : product.id;
      const existing = prev.find(item => {
          const itemKey = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
          return itemKey === cartId;
      });
      
      const stockAvailable = variant ? variant.stock : product.stock;
      
      if (existing) {
          if (existing.quantity + 1 > stockAvailable) {
              alert("Insufficient Stock!");
              return prev;
          }
          return prev.map(item => {
              const itemKey = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
              if (itemKey === cartId) return { ...item, quantity: item.quantity + 1 };
              return item;
          });
      }
      
      if (stockAvailable <= 0) {
          alert("Item Out of Stock!");
          return prev;
      }

      return [...prev, {
          ...product,
          price: variant ? variant.price : product.price,
          quantity: 1,
          selectedVariant: variant
      }];
    });
    setShowVariantSelector(null);
  };

  const updateQty = (index: number, delta: number) => {
      setCart(prev => prev.map((item, i) => {
          if (i === index) {
              const newQty = item.quantity + delta;
              const stock = item.selectedVariant ? item.selectedVariant.stock : item.stock;
              if (newQty > stock) return item;
              if (newQty < 1) return item;
              return { ...item, quantity: newQty };
          }
          return item;
      }));
  };

  const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

  const handlePayment = (method: string) => {
      // 1. Deduct Stock
      deductStock(cart.map(i => ({
          id: i.id,
          quantity: i.quantity,
          selectedVariant: i.selectedVariant
      })));

      // 2. Generate Invoice ID
      const invId = `POS-${Date.now().toString().substr(-6)}`;

      // 3. Create Invoice Object
      const newInvoice: Invoice = {
          id: invId,
          date: new Date().toLocaleDateString('en-GB'),
          client: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
          buyerAddress: selectedCustomer ? selectedCustomer.address : '',
          gstNumber: selectedCustomer ? selectedCustomer.gstNumber : '',
          amount: total,
          paidAmount: total,
          status: 'Paid',
          type: 'Income',
          currency: 'INR',
          paymentMode: method,
          items: cart.map(c => ({
              desc: c.name,
              variant: c.selectedVariant?.name,
              qty: c.quantity,
              rate: c.price,
              total: c.price * c.quantity,
              hsn: '9403', // Default
              gstRate: 18
          })),
          baseAmount: taxableAmount,
          taxAmount: taxAmount,
          history: [],
          // Tax Logic Snapshot
          sellerName: companySettings.name,
          sellerAddress: companySettings.address,
          sellerGst: companySettings.gstNumber,
          jurisdiction: 'Ahmedabad'
      };

      // 4. Save Data
      addSale(total, selectedCustomer?.id, cart);
      addInvoice(newInvoice);
      
      // 5. Show Receipt
      setShowPaymentModal(false);
      setShowReceipt(newInvoice);
      setCart([]);
      setSelectedCustomer(null);
      setDiscount(0);
  };

  // --- PRODUCT MANAGEMENT HANDLERS ---
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          const newMedia = files.map((file: any) => ({
              type: file.type.startsWith('video') ? 'video' : 'image',
              url: URL.createObjectURL(file),
              file: file
          }));
          setProductForm(prev => ({ ...prev, media: [...(prev.media || []), ...newMedia] as any }));
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
                  stock: newVariant.stock !== undefined ? newVariant.stock : 0,
                  sku: newVariant.sku || `${prev.sku}-${prev.variants?.length || 0}`
              }]
          }));
          setNewVariant({ name: '', price: 0, stock: 0, sku: '' });
      }
  };

  const generateBarcode = () => {
      const code = `890${Math.floor(Math.random() * 10000000000)}`;
      setProductForm(prev => ({ ...prev, barcode: code }));
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
      else addProduct(newProdData);
      
      setShowProductModal(false);
      setEditingProduct(null);
      setProductForm({ name: '', price: 0, cost: 0, stock: 0, category: 'General', description: '', materials: '', dimensions: '', manualUrl: '', sku: '', barcode: '', media: [], documents: [], variants: [] });
  };

  const filteredProducts = products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = activeCategory === 'All' || p.category === activeCategory;
      return matchSearch && matchCat;
  });

  const categories = ['All', 'Furniture', 'Lighting', 'Textiles', 'Decor'];

  if (!isShiftOpen) {
      return (
        <div className="h-full flex items-center justify-center bg-background-dark p-4">
          <div className="bg-surface-dark p-10 rounded-3xl border border-white/5 w-full max-w-md text-center shadow-2xl">
            <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"><Banknote className="w-8 h-8"/></div>
            <h2 className="text-2xl font-bold text-white mb-2">Open Register</h2>
            <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-center text-xl font-bold mb-6 focus:border-primary focus:outline-none text-white" placeholder="0.00" />
            <button onClick={() => startShift(openingBalance)} className="w-full py-4 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-all">Start Shift</button>
          </div>
        </div>
      );
  }

  return (
    <div className="h-full w-full flex flex-col md:flex-row overflow-hidden bg-background-dark">
        {/* LEFT: Product Grid (65%) */}
        <div className="flex-1 flex flex-col h-full border-r border-white/5 relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 bg-surface-dark flex justify-between items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        className="w-full bg-background-dark border border-white/10 rounded-full pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none" 
                        placeholder="Search Item / Scan Barcode..." 
                        autoFocus
                    />
                </div>
                <div className="flex gap-2">
                    {categories.map(cat => (
                        <button 
                            key={cat} 
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* ADD PRODUCT TILE (Restored) */}
                    <div onClick={() => { setEditingProduct(null); setProductForm({name:'', price:0, cost:0, stock:0, category: 'Furniture', sku: '', media: [], documents: [], variants: [], materials: '', dimensions: '', barcode: ''}); setShowProductModal(true); }} 
                        className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-3 cursor-pointer transition-all hover:bg-primary/10 hover:border-primary/50 group flex flex-col items-center justify-center min-h-[200px]"
                    >
                        <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Plus className="w-8 h-8 text-primary" />
                        </div>
                        <span className="font-bold text-primary text-sm uppercase tracking-wider">Add Product</span>
                    </div>

                    {filteredProducts.map(p => {
                        const hasVariants = p.variants && p.variants.length > 0;
                        const totalStock = hasVariants ? p.variants?.reduce((sum, v) => sum + v.stock, 0) : p.stock;
                        const isOut = totalStock! <= 0;

                        return (
                            <div 
                                key={p.id} 
                                onClick={() => !isOut && (hasVariants ? setShowVariantSelector(p) : addToCart(p))}
                                className={`bg-surface-dark border border-white/5 rounded-2xl p-3 cursor-pointer transition-all hover:border-primary/50 group relative flex flex-col ${isOut ? 'opacity-50 grayscale' : ''}`}
                            >
                                <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setProductForm(p); setShowProductModal(true); }} className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-primary text-white rounded-full z-10 opacity-0 group-hover:opacity-100 transition-all">
                                    <Edit2 className="w-3 h-3" />
                                </button>

                                <div className="aspect-square bg-background-dark rounded-xl mb-3 overflow-hidden relative">
                                    <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    {isOut && <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-white text-xs uppercase tracking-widest">Out of Stock</div>}
                                    {hasVariants && <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] font-bold text-white">{p.variants?.length} VARIANTS</div>}
                                </div>
                                <h4 className="font-bold text-white text-sm leading-tight mb-1 line-clamp-2">{p.name}</h4>
                                <div className="mt-auto flex justify-between items-center">
                                    <span className="text-primary font-bold">{formatCurrency(p.price)}</span>
                                    <span className="text-[10px] text-zinc-500">{totalStock} in stock</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>

        {/* RIGHT: Billing Area (35%) - "The Machine" */}
        <div className="w-[400px] xl:w-[450px] bg-surface-darker flex flex-col h-full border-l border-white/5 shadow-2xl relative z-10">
            {/* 1. Customer & Settings Header */}
            <div className="p-4 bg-surface-dark border-b border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="font-black text-lg text-white tracking-tight uppercase flex items-center gap-2"><Calculator className="w-5 h-5 text-primary"/> Billing Station</h2>
                    <button onClick={closeShift} className="text-xs font-bold text-red-500 hover:text-red-400">Close Shift</button>
                </div>
                
                {/* Customer Selector */}
                <div className="relative">
                    {selectedCustomer ? (
                        <div className="flex justify-between items-center bg-primary/10 border border-primary/20 p-3 rounded-xl">
                            <div>
                                <p className="text-xs font-bold text-primary">{selectedCustomer.name}</p>
                                <p className="text-[10px] text-primary/70">{selectedCustomer.phone}</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="p-1 hover:bg-primary/20 rounded-full text-primary"><X className="w-4 h-4"/></button>
                        </div>
                    ) : (
                        <div className="relative">
                            <button onClick={() => setShowCustomerSearch(!showCustomerSearch)} className="w-full bg-background-dark border border-white/10 p-3 rounded-xl flex items-center justify-between text-zinc-400 text-sm hover:border-white/20 transition-colors">
                                <span className="flex items-center gap-2"><User className="w-4 h-4"/> Add Customer to Bill</span>
                                <Plus className="w-4 h-4" />
                            </button>
                            {showCustomerSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-dark border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                                    <input 
                                        autoFocus
                                        className="w-full bg-black/20 p-2 rounded-lg text-sm text-white border border-white/5 mb-2 focus:border-primary outline-none"
                                        placeholder="Search Name / Phone..."
                                        value={custSearchTerm}
                                        onChange={e => setCustSearchTerm(e.target.value)}
                                    />
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {customers.filter(c => c.name.toLowerCase().includes(custSearchTerm.toLowerCase()) || c.phone.includes(custSearchTerm)).map(c => (
                                            <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerSearch(false); setCustSearchTerm(''); }} className="w-full text-left p-2 hover:bg-white/5 rounded-lg text-xs">
                                                <div className="font-bold text-white">{c.name}</div>
                                                <div className="text-zinc-500">{c.phone}</div>
                                            </button>
                                        ))}
                                        {custSearchTerm && (
                                            <button className="w-full p-2 text-primary font-bold text-xs text-center border-t border-white/5 mt-1">
                                                + Create "{custSearchTerm}"
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Tax Toggle */}
                <div className="flex bg-background-dark p-1 rounded-lg border border-white/5">
                    <button 
                        onClick={() => setOrderType('Local')} 
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${orderType === 'Local' ? 'bg-white text-black shadow' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Local (CGST+SGST)
                    </button>
                    <button 
                        onClick={() => setOrderType('InterState')} 
                        className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${orderType === 'InterState' ? 'bg-amber-500 text-black shadow' : 'text-zinc-500 hover:text-white'}`}
                    >
                        Inter-State (IGST)
                    </button>
                </div>
            </div>

            {/* 2. Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-black/20">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 opacity-50">
                        <Scan className="w-12 h-12 mb-2" />
                        <p className="font-bold text-sm uppercase tracking-widest">Register Empty</p>
                    </div>
                ) : (
                    cart.map((item, idx) => (
                        <div key={`${item.id}-${idx}`} className="bg-surface-dark p-3 rounded-xl border border-white/5 flex gap-3 group animate-in slide-in-from-right-2 duration-300">
                            <div className="size-12 bg-background-dark rounded-lg overflow-hidden shrink-0"><img src={item.image} className="w-full h-full object-cover" /></div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-sm truncate">{item.name}</p>
                                {item.selectedVariant && <p className="text-[10px] text-zinc-400">{item.selectedVariant.name}</p>}
                                <p className="text-xs font-mono text-primary mt-1">{formatCurrency(item.price)}</p>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <button onClick={() => removeItem(idx)} className="text-zinc-600 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                                <div className="flex items-center bg-black/40 rounded-lg">
                                    <button onClick={() => updateQty(idx, -1)} className="px-2 py-1 hover:bg-white/10 text-zinc-400 text-xs font-bold rounded-l-lg">-</button>
                                    <span className="px-1 text-xs font-mono font-bold text-white">{item.quantity}</span>
                                    <button onClick={() => updateQty(idx, 1)} className="px-2 py-1 hover:bg-white/10 text-zinc-400 text-xs font-bold rounded-r-lg">+</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* 3. Calculations & Actions */}
            <div className="p-4 bg-surface-dark border-t border-white/5 space-y-3">
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-400"><span>Subtotal</span><span className="font-mono text-white">{formatCurrency(subtotal)}</span></div>
                    {discount > 0 && <div className="flex justify-between text-primary"><span>Discount ({discount}%)</span><span className="font-mono">-{formatCurrency(discountAmount)}</span></div>}
                    <div className="flex justify-between text-zinc-400">
                        <span>Tax ({orderType === 'Local' ? 'CGST+SGST' : 'IGST'} 18%)</span>
                        <span className="font-mono text-white">{formatCurrency(taxAmount)}</span>
                    </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <span className="font-black text-lg text-white uppercase tracking-wider">Total</span>
                    <span className="font-black text-2xl text-primary font-mono">{formatCurrency(total)}</span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2">
                    <button onClick={() => setDiscount(prev => prev === 0 ? 5 : 0)} className={`col-span-1 py-3 rounded-xl font-bold text-xs border ${discount > 0 ? 'bg-primary/10 text-primary border-primary/20' : 'bg-white/5 text-zinc-400 border-white/5'}`}>
                        {discount > 0 ? `${discount}% Off` : '% Disc'}
                    </button>
                    <button 
                        disabled={cart.length === 0} 
                        onClick={() => setShowPaymentModal(true)} 
                        className="col-span-3 bg-primary hover:bg-[#2ecc71] disabled:opacity-50 disabled:cursor-not-allowed text-background-dark font-black uppercase text-sm tracking-widest rounded-xl shadow-glow transition-all active:scale-95 py-4"
                    >
                        Charge {formatCurrency(total)}
                    </button>
                </div>
            </div>
        </div>

        {/* --- MODALS --- */}

        {/* Add Product Modal (Restored) */}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">SKU Code (Auto)</label>
                                    <input value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-primary" placeholder="Generated Automatically" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Barcode</label>
                                    <div className="flex gap-2">
                                        <input value={productForm.barcode} onChange={e => setProductForm({...productForm, barcode: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-primary" placeholder="Scan or Gen" />
                                        <button onClick={generateBarcode} className="p-3 bg-white/5 rounded-xl hover:bg-white/10" title="Generate Barcode"><Barcode className="w-5 h-5"/></button>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Selling Price</label>
                                    <input type="number" value={productForm.price || ''} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Cost Price (Inv)</label>
                                    <input type="number" value={productForm.cost || ''} onChange={e => setProductForm({...productForm, cost: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="0.00" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Initial Stock</label>
                                    <input 
                                        type="number" 
                                        value={productForm.stock || ''} 
                                        onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} 
                                        className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" 
                                        placeholder="0" 
                                        disabled={productForm.variants && productForm.variants.length > 0} 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Dimensions</label>
                                    <input value={productForm.dimensions || ''} onChange={e => setProductForm({...productForm, dimensions: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="L x W x H" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Materials</label>
                                    <input value={productForm.materials || ''} onChange={e => setProductForm({...productForm, materials: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Wood, Metal..." />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-zinc-500 ml-2">Description</label>
                                <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary h-24" placeholder="Detailed product description..." />
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

                            {/* Variants */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> Product Variants</h4>
                                <div className="flex gap-2 mb-2 items-end">
                                    <div className="flex-1">
                                        <label className="text-[9px] uppercase font-bold text-zinc-500 ml-1">Name</label>
                                        <input value={newVariant.name} onChange={e => setNewVariant({...newVariant, name: e.target.value})} placeholder="e.g. Red / Large" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" />
                                    </div>
                                    <div className="w-20">
                                        <label className="text-[9px] uppercase font-bold text-zinc-500 ml-1">Price</label>
                                        <input type="number" value={newVariant.price || ''} onChange={e => setNewVariant({...newVariant, price: Number(e.target.value)})} placeholder="0.00" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" />
                                    </div>
                                    <div className="w-16">
                                        <label className="text-[9px] uppercase font-bold text-zinc-500 ml-1">Stock</label>
                                        <input type="number" value={newVariant.stock || ''} onChange={e => setNewVariant({...newVariant, stock: Number(e.target.value)})} placeholder="0" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-xs text-white" />
                                    </div>
                                    <button onClick={addVariant} className="p-2 bg-primary text-black rounded-lg mb-[1px] h-[34px] flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                                </div>
                                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                                    {productForm.variants?.map((v, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs bg-black/20 p-2 rounded">
                                            <span className="text-white font-bold">{v.name}</span>
                                            <div className="flex gap-4">
                                                <span className="text-zinc-400">Stock: {v.stock}</span>
                                                <span className="text-zinc-400">{formatCurrency(v.price)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-4">
                        <button onClick={handleSaveProduct} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow hover:scale-[1.01] transition-transform">Save Product to Inventory</button>
                    </div>
                </div>
            </div>
        )}

        {/* Variant Selector */}
        {showVariantSelector && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-surface-dark border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-white text-lg">{showVariantSelector.name}</h3>
                        <button onClick={() => setShowVariantSelector(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
                    </div>
                    <p className="text-xs text-zinc-500 mb-4">Select Option</p>
                    <div className="space-y-2">
                        {showVariantSelector.variants?.map(v => (
                            <button 
                                key={v.id}
                                disabled={v.stock <= 0}
                                onClick={() => addToCart(showVariantSelector, v)}
                                className="w-full flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all disabled:opacity-50"
                            >
                                <span className="font-bold text-white">{v.name}</span>
                                <div className="text-right">
                                    <span className="text-primary font-mono font-bold block">{formatCurrency(v.price)}</span>
                                    <span className={`text-[10px] ${v.stock > 0 ? 'text-zinc-400' : 'text-red-500'}`}>{v.stock > 0 ? `${v.stock} Available` : 'Out of Stock'}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl">
                    <h3 className="text-2xl font-black text-white mb-6 text-center uppercase tracking-tight">Confirm Payment</h3>
                    <div className="text-center mb-8">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Payable</p>
                        <p className="text-4xl font-black text-primary font-mono mt-2">{formatCurrency(total)}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button onClick={() => handlePayment('Cash')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-2xl flex flex-col items-center gap-2 transition-all">
                            <Banknote className="w-8 h-8 text-green-400" />
                            <span className="font-bold text-white text-sm">Cash</span>
                        </button>
                        <button onClick={() => handlePayment('Card')} className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/50 rounded-2xl flex flex-col items-center gap-2 transition-all">
                            <CreditCard className="w-8 h-8 text-blue-400" />
                            <span className="font-bold text-white text-sm">Card / UPI</span>
                        </button>
                    </div>
                    
                    <button onClick={() => setShowPaymentModal(false)} className="w-full py-4 text-zinc-500 font-bold hover:text-white">Cancel Transaction</button>
                </div>
            </div>
        )}

        {/* Receipt Modal */}
        {showReceipt && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4">
                <div className="flex flex-col items-center gap-6">
                    <div id="receipt-print" className="bg-white text-black p-6 w-[80mm] min-h-[100mm] shadow-2xl font-mono text-xs leading-tight rounded-sm">
                        <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
                            <h2 className="font-black text-lg uppercase mb-1">{companySettings.name}</h2>
                            <p>{companySettings.address}</p>
                            <p>GSTIN: {companySettings.gstNumber}</p>
                            <p>Ph: {companySettings.phone}</p>
                        </div>
                        
                        <div className="mb-4">
                            <p>Inv No: <span className="font-bold">{showReceipt.id}</span></p>
                            <p>Date: {showReceipt.date}</p>
                            <p>Customer: {showReceipt.client}</p>
                            {showReceipt.gstNumber && <p>GST: {showReceipt.gstNumber}</p>}
                        </div>

                        <table className="w-full text-left mb-4">
                            <thead>
                                <tr className="border-b border-black border-dashed">
                                    <th className="py-1">Item</th>
                                    <th className="py-1 text-center">Qty</th>
                                    <th className="py-1 text-right">Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {showReceipt.items?.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-1 pr-1">
                                            {item.desc}
                                            {item.variant && <span className="block text-[10px]">({item.variant})</span>}
                                        </td>
                                        <td className="py-1 text-center">{item.qty}</td>
                                        <td className="py-1 text-right">{(item.total).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="border-t border-black border-dashed pt-2 space-y-1 text-right">
                            <div className="flex justify-between"><span>Subtotal:</span><span>{showReceipt.baseAmount?.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax (18%):</span><span>{showReceipt.taxAmount?.toFixed(2)}</span></div>
                            <div className="flex justify-between text-sm font-bold border-t border-black border-dashed pt-2 mt-2">
                                <span>TOTAL:</span>
                                <span>{showReceipt.amount.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center mt-6 pt-4 border-t border-black border-dashed">
                            <p>Thank you for shopping with us!</p>
                            <p className="text-[10px] mt-2">No returns on discounted items.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 no-print">
                        <button onClick={() => window.print()} className="px-8 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:scale-105 transition-transform"><Printer className="w-4 h-4"/> Print Receipt</button>
                        <button onClick={() => setShowReceipt(null)} className="px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20">Close</button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
