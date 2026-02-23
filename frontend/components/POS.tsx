import React, { useState } from 'react';
import { useProducts, useCreateProduct, useUpdateProduct } from '../hooks/useProducts';
import { useCustomers } from '../hooks/useCustomers';
import { useCompanySettings } from '../hooks/useAdmin';
import { useCreateOrder } from '../hooks/useOrders';
import { useAuth } from '../context/AuthContext';
import { Product, CartItem, Customer, ProductVariant } from '../types';
import toast from 'react-hot-toast';
import { Search, X, CreditCard, Banknote, Printer, Trash2, Scan, Plus, User, Calculator, Image as ImageIcon, Upload, Layers, Barcode, Edit2, Remove } from 'lucide-react';
import { InlineError } from './ui/Skeleton';

const formatCurrency = (n: number, cur: 'INR' | 'USD' = 'INR') =>
    new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: cur }).format(n || 0);

export const POS: React.FC = () => {
    const { user } = useAuth();
    const { data: productsData, isLoading: prodLoading, isError: prodError, error: pe } = useProducts();
    const { data: customersData } = useCustomers();
    const { data: settingsData } = useCompanySettings();
    const createProduct = useCreateProduct();
    const updateProductMut = useUpdateProduct();
    const createOrder = useCreateOrder();

    const products: Product[] = Array.isArray(productsData?.data || productsData) ? (productsData?.data || productsData) as Product[] : [];
    const customers: Customer[] = Array.isArray(customersData?.data || customersData) ? (customersData?.data || customersData) as Customer[] : [];
    const companySettings = settingsData?.data || settingsData || { name: 'Studio Mystri', address: '', gstNumber: '', phone: '', email: '', logoUrl: '' };

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    // --- STATE ---
    const [isShiftOpen, setIsShiftOpen] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [orderType, setOrderType] = useState<'Local' | 'InterState'>('Local');
    const [discount, setDiscount] = useState<number>(0);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showReceipt, setShowReceipt] = useState<any>(null);
    const [showVariantSelector, setShowVariantSelector] = useState<Product | null>(null);
    const [showCustomerSearch, setShowCustomerSearch] = useState(false);
    const [custSearchTerm, setCustSearchTerm] = useState('');
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'Card' | 'Cash' | 'Transfer'>('Card');

    const [productForm, setProductForm] = useState<Partial<Product>>({
        name: '', price: 0, cost: 0, stock: 0, category: 'General', description: '', materials: '', dimensions: '', manualUrl: '', sku: '', barcode: '',
        media: [], documents: [], variants: []
    });
    const [newVariant, setNewVariant] = useState<Partial<ProductVariant>>({ name: '', price: 0, stock: 0, sku: '' });
    const [openingBalance, setOpeningBalance] = useState('');

    // Calculations
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    const discountAmount = (subtotal * discount) / 100;
    const taxableAmount = subtotal - discountAmount;
    const taxRate = 0.18;
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
            const stockAvailable = variant ? (variant.stock || 0) : (product.stock || 0);
            if (existing) {
                if (existing.quantity + 1 > stockAvailable && stockAvailable > 0) { toast.error("Insufficient Stock!"); return prev; }
                return prev.map(item => {
                    const itemKey = item.selectedVariant ? `${item.id}-${item.selectedVariant.id}` : item.id;
                    if (itemKey === cartId) return { ...item, quantity: item.quantity + 1 };
                    return item;
                });
            }
            if (stockAvailable <= 0) { toast.error("Item Out of Stock!"); return prev; }
            return [...prev, { ...product, price: variant ? (variant.price || 0) : (product.price || 0), quantity: 1, selectedVariant: variant }];
        });
        setShowVariantSelector(null);
    };

    const updateQty = (index: number, delta: number) => {
        setCart(prev => prev.map((item, i) => {
            if (i === index) {
                const newQty = item.quantity + delta;
                const stock = item.selectedVariant ? (item.selectedVariant.stock || 0) : (item.stock || 0);
                if (newQty > stock || newQty < 1) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeItem = (index: number) => setCart(prev => prev.filter((_, i) => i !== index));

    const handlePayment = () => {
        if (cart.length === 0) return;
        const orderPayload = {
            items: cart.map(c => ({
                productId: c.id,
                name: c.name,
                sku: c.sku,
                price: c.price,
                quantity: c.quantity,
                variantId: c.selectedVariant?.id,
                variantName: c.selectedVariant?.name,
            })),
            subtotal: taxableAmount,
            taxAmount,
            discount: discountAmount,
            total,
            paymentMethod: paymentMethod,
            customerId: selectedCustomer?.id || undefined,
            notes: `POS Sale - ${orderType}`,
        };

        createOrder.mutate(orderPayload, {
            onSuccess: (data: any) => {
                const receiptData = {
                    id: data?.data?.orderNumber || data?.orderNumber || `POS-${Date.now().toString().substr(-6)}`,
                    date: new Date().toLocaleDateString('en-GB'),
                    client: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
                    gstNumber: (selectedCustomer as any)?.gstNumber || '',
                    amount: total,
                    baseAmount: taxableAmount,
                    taxAmount: taxAmount,
                    items: cart.map(c => ({ desc: c.name, variant: c.selectedVariant?.name, qty: c.quantity, rate: c.price, total: c.price * c.quantity })),
                };
                setShowPaymentModal(false);
                setShowReceipt(receiptData);
                setCart([]);
                setSelectedCustomer(null);
                setDiscount(0);
                toast.success("Payment Received Successfully");
            },
        });
    };

    // --- PRODUCT MANAGEMENT ---
    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const newMedia = files.map((file: any) => ({ type: file.type.startsWith('video') ? 'video' : 'image', url: URL.createObjectURL(file), file }));
            setProductForm(prev => ({ ...prev, media: [...(prev.media || []), ...newMedia] as any }));
        }
    };

    const addVariant = () => {
        if (newVariant.name && newVariant.price) {
            setProductForm(prev => ({
                ...prev,
                variants: [...(prev.variants || []), { id: Math.random().toString(36).substr(2, 5), name: newVariant.name!, price: newVariant.price!, stock: newVariant.stock !== undefined ? newVariant.stock : 0, sku: newVariant.sku || `${prev.sku}-${prev.variants?.length || 0}` }]
            }));
            setNewVariant({ name: '', price: 0, stock: 0, sku: '' });
        }
    };

    const generateBarcode = () => setProductForm(prev => ({ ...prev, barcode: `890${Math.floor(Math.random() * 10000000000)}` }));

    const handleSaveProduct = () => {
        if (!productForm.name || !productForm.price) return;
        const payload: any = { ...productForm };
        if (editingProduct) {
            updateProductMut.mutate({ id: editingProduct.id, ...payload }, { onSuccess: () => toast.success("Updated product") });
        } else {
            createProduct.mutate(payload, { onSuccess: () => toast.success("Created product") });
        }
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({ name: '', price: 0, cost: 0, stock: 0, category: 'General', sku: '', media: [], documents: [], variants: [] });
    };

    // Get unique categories
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    if (prodError) return <div className="p-8"><InlineError message={(pe as Error)?.message} /></div>;

    if (!isShiftOpen) {
        return (
            <div className="h-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4 font-display">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-3xl w-full max-w-sm text-center shadow-xl shadow-slate-200/50 dark:shadow-none">
                    <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"><span className="material-symbols-outlined text-[32px]">point_of_sale</span></div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Open Register</h2>
                    <p className="text-sm text-slate-500 mb-6">Enter opening cash balance to start the shift.</p>
                    <div className="relative mb-6">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                        <input type="number" value={openingBalance} onChange={e => setOpeningBalance(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 text-center text-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder-slate-300 dark:placeholder-slate-600" placeholder="0.00" autoFocus />
                    </div>
                    <button onClick={() => setIsShiftOpen(true)} className="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold shadow-sm shadow-primary/20 transition-all">Start Shift</button>
                    {isAdmin && (
                        <button onClick={() => setIsShiftOpen(true)} className="w-full py-3 mt-2 bg-transparent text-slate-500 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-300">Skip balance</button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 w-full h-full flex flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                {/* Left Column: Product Catalog */}
                <section className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden relative">
                    {/* Filters & Search Header */}
                    <div className="p-6 pb-2">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
                            <div className="relative w-full max-w-md group">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">search</span>
                                </span>
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm text-sm text-slate-900 dark:text-white placeholder-slate-400"
                                    placeholder="Search products, SKU..."
                                    autoFocus
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                {isAdmin && (
                                    <button
                                        onClick={() => { setEditingProduct(null); setProductForm({ name: '', price: 0, cost: 0, stock: 0, category: 'General', sku: '', media: [], documents: [], variants: [], materials: '', dimensions: '', barcode: '' }); setShowProductModal(true); }}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-primary border border-transparent rounded-lg text-sm font-medium text-white shadow-sm hover:bg-blue-600 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                        Add Product
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat as string)}
                                    className={`flex-none px-4 py-1.5 rounded-full text-sm font-medium shadow-sm transition-colors border ${activeCategory === cat
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                                            : 'bg-white dark:bg-[#1a2634] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 shadow-sm">
                            {filteredProducts.map(p => {
                                const hasVariants = p.variants && p.variants.length > 0;
                                const totalStock = hasVariants ? p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) : (p.stock || 0);
                                const isOut = totalStock! <= 0;
                                const imgUrl = (p as any).image || (p.images && p.images[0]) || (p.media && p.media.length > 0 && p.media[0].url) || 'https://via.placeholder.com/300?text=No+Image';

                                return (
                                    <div key={p.id}
                                        className={`group bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative ${isOut ? 'opacity-60' : ''}`}
                                    >
                                        <div onClick={() => !isOut && (hasVariants ? setShowVariantSelector(p) : addToCart(p))} className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex-shrink-0">
                                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
                                            {!isOut && (
                                                <button className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-primary hover:scale-110 transition-transform opacity-0 group-hover:opacity-100">
                                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                                </button>
                                            )}
                                            {isOut && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]"><span className="px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-bold text-slate-900 dark:text-white uppercase shadow-lg">Out of Stock</span></div>}
                                            {hasVariants && !isOut && <div className="absolute bottom-2 left-2 bg-slate-900/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm border border-white/10">{p.variants?.length} Options</div>}
                                        </div>
                                        <div className="p-3 flex flex-col flex-1" onClick={() => !isOut && (hasVariants ? setShowVariantSelector(p) : addToCart(p))}>
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h3 className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight pr-1" title={p.name}>{p.name}</h3>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 truncate" title={p.sku || p.category}>{p.category} {(p.sku) && `• ${p.sku}`}</p>
                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="font-bold text-primary">{formatCurrency(p.price || 0)}</span>
                                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${totalStock! > 5 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : totalStock! > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>{totalStock} left</span>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={(e) => { e.stopPropagation(); setEditingProduct(p); setProductForm(p); setShowProductModal(true); }} className="absolute top-2 right-2 p-1.5 bg-white/90 dark:bg-slate-800/90 hover:bg-white border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded shadow-sm z-10 opacity-0 group-hover:opacity-100 transition-all">
                                                <span className="material-symbols-outlined text-[14px]">edit</span>
                                            </button>
                                        )}
                                    </div>
                                );
                            })}

                            {filteredProducts.length === 0 && (
                                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">search_off</span>
                                    <p className="text-sm font-medium text-slate-500">No products found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Right Column: Cart & Checkout */}
                <aside className="w-full md:w-[350px] lg:w-[400px] flex flex-col bg-white dark:bg-[#1a2634] border-l border-slate-200 dark:border-slate-800 z-10 shadow-xl flex-shrink-0">
                    {/* Order Header */}
                    <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex-none bg-slate-50/50 dark:bg-slate-900/20">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1">New Sale</h2>
                            <button onClick={() => setIsShiftOpen(false)} className="text-xs font-semibold text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:underline">Close Wait</button>
                        </div>

                        {/* Customer Selector */}
                        <div className="relative">
                            {selectedCustomer ? (
                                <div className="flex items-center justify-between p-3 rounded-lg border border-primary/30 bg-primary/5 cursor-pointer group transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined text-[18px]">person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{selectedCustomer.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{selectedCustomer.phone}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedCustomer(null)} className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="relative">
                                    <button onClick={() => setShowCustomerSearch(!showCustomerSearch)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 text-sm font-medium hover:border-primary transition-colors shadow-sm">
                                        <span className="material-symbols-outlined text-[18px]">person_add</span>
                                        Select Customer
                                    </button>

                                    {showCustomerSearch && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 z-50 overflow-hidden">
                                            <div className="relative mb-2">
                                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"><span className="material-symbols-outlined text-[16px]">search</span></span>
                                                <input
                                                    autoFocus
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-2 pl-8 rounded-lg text-sm text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                                    placeholder="Search Name or Phone..."
                                                    value={custSearchTerm}
                                                    onChange={e => setCustSearchTerm(e.target.value)}
                                                />
                                            </div>
                                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-1">
                                                {customers.length > 0 ? customers.filter(c => c.name?.toLowerCase().includes(custSearchTerm.toLowerCase()) || (c.phone || '').includes(custSearchTerm)).map(c => (
                                                    <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerSearch(false); setCustSearchTerm(''); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm transition-colors flex justify-between items-center group">
                                                        <div>
                                                            <div className="font-bold text-slate-800 dark:text-white">{c.name}</div>
                                                            <div className="text-xs text-slate-500 dark:text-slate-400">{c.phone}</div>
                                                        </div>
                                                        <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100">add_circle</span>
                                                    </button>
                                                )) : (
                                                    <div className="p-3 text-center text-sm text-slate-500">No customers found.</div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Tax Toggle Option */}
                        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 mt-4">
                            <button onClick={() => setOrderType('Local')} className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-md transition-all ${orderType === 'Local' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Local (CGST+SGST)</button>
                            <button onClick={() => setOrderType('InterState')} className={`flex-1 py-1.5 text-[11px] font-bold uppercase rounded-md transition-all ${orderType === 'InterState' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>Inter-State (IGST)</button>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60">
                                <div className="w-16 h-16 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-[32px]">shopping_cart</span>
                                </div>
                                <p className="font-medium text-sm">Cart is empty</p>
                                <p className="text-xs mt-1 max-w-[200px] text-center">Select products from the catalog to add them to the order</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => {
                                const imgUrl = (item as any).image || (item.images && item.images[0]) || (item.media && item.media[0]?.url) || 'https://via.placeholder.com/100?text=Item';
                                return (
                                    <div key={`${item.id}-${idx}`} className="flex gap-3 group animate-in slide-in-from-right-4 duration-200 ease-out">
                                        <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 bg-cover bg-center shrink-0 border border-slate-200 dark:border-slate-700" style={{ backgroundImage: `url('${imgUrl}')` }}></div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div className="flex justify-between items-start gap-2">
                                                <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={item.name}>{item.name}</h4>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0">{formatCurrency((item.price || 0) * item.quantity)}</span>
                                            </div>
                                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                                                {item.selectedVariant ? `${item.selectedVariant.name} • ` : ''}{formatCurrency(item.price || 0)}/unit
                                            </div>
                                            <div className="flex items-center justify-between mt-1 h-7">
                                                <div className="flex items-center bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 h-full overflow-hidden">
                                                    <button onClick={() => updateQty(idx, -1)} className="w-7 h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border-r border-slate-200 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[16px]">remove</span>
                                                    </button>
                                                    <span className="w-8 text-center text-xs font-bold text-slate-800 dark:text-white">{item.quantity}</span>
                                                    <button onClick={() => updateQty(idx, 1)} className="w-7 h-full flex items-center justify-center bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border-l border-slate-200 dark:border-slate-700">
                                                        <span className="material-symbols-outlined text-[16px]">add</span>
                                                    </button>
                                                </div>
                                                <button onClick={() => removeItem(idx)} className="w-7 h-7 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center sm:opacity-0 group-hover:opacity-100">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer / Payment */}
                    <div className="flex-none p-4 md:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a2634]">

                        {/* Discount */}
                        <div className="mb-4">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Quick Discount</label>
                            <div className="flex gap-2">
                                {[0, 5, 10, 15].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDiscount(d)}
                                        className={`flex-1 h-8 rounded text-xs font-bold transition-colors border ${discount === d ? 'bg-primary/10 text-primary border-primary/30' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary/50'}`}
                                    >
                                        {d === 0 ? 'None' : `${d}%`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="space-y-1.5 mb-5 border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span>Subtotal</span>
                                <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm text-primary">
                                    <span>Discount ({discount}%)</span>
                                    <span className="font-medium">-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                                <span className="text-xs">Tax ({orderType === 'Local' ? 'CGST+SGST 18%' : 'IGST 18%'})</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-end">
                                <span className="text-base font-bold text-slate-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {[
                                { id: 'Card', icon: 'credit_card', label: 'Card' },
                                { id: 'Cash', icon: 'payments', label: 'Cash' },
                                { id: 'Transfer', icon: 'account_balance', label: 'Transfer' },
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id as any)}
                                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${paymentMethod === method.id ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                                >
                                    <span className="material-symbols-outlined mb-1 text-[20px]">{method.icon}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wide">{method.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Pay Button */}
                        <button
                            onClick={handlePayment}
                            disabled={cart.length === 0 || createOrder.isPending}
                            className="w-full h-[52px] flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            {createOrder.isPending ? 'Processing...' : `Pay ${formatCurrency(total)}`}
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </aside>
            </main>

            {/* --- MODALS --- */}

            {/* Variant Selector Modal */}
            {showVariantSelector && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-1">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">{showVariantSelector.name}</h3>
                            <button onClick={() => setShowVariantSelector(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 bg-slate-100 dark:bg-slate-700 rounded-full transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">Select a variant to add to cart</p>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
                            {showVariantSelector.variants?.map(v => (
                                <button key={v.id} disabled={(v.stock || 0) <= 0} onClick={() => addToCart(showVariantSelector, v)}
                                    className="w-full text-left flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                                    <div>
                                        <span className="font-bold text-slate-800 dark:text-white block mb-0.5 group-hover:text-primary transition-colors">{v.name}</span>
                                        <span className={`text-[11px] font-medium ${v.stock! > 0 ? 'text-slate-500 dark:text-slate-400' : 'text-red-500 dark:text-red-400'}`}>{v.stock! > 0 ? `${v.stock} in stock` : 'Out of Stock'}</span>
                                    </div>
                                    <span className="text-primary font-bold group-hover:scale-110 transition-transform">{formatCurrency(v.price || 0)}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Receipt Modal (Matches template style for invoice/receipt preview) */}
            {showReceipt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="flex flex-col items-center gap-6 my-auto w-full max-w-[80mm]">
                        <div id="receipt-print" className="bg-white text-black p-6 w-full min-h-[100mm] shadow-2xl relative font-mono text-xs leading-tight rounded">
                            {/* Zig-zag top & bottom purely CSS illusion (or skip for strictness, let's keep it simple) */}
                            <div className="text-center mb-5 border-b-2 border-slate-200 pb-5 border-dashed">
                                <h2 className="font-bold text-lg uppercase mb-1 tracking-widest">{companySettings.name}</h2>
                                <p className="text-slate-600">{companySettings.address}</p>
                                <p className="text-slate-600">GSTIN: {(companySettings as any).gstNumber || (companySettings as any).gstin || 'N/A'}</p>
                                <p className="text-slate-600">Ph: {companySettings.phone}</p>
                            </div>
                            <div className="mb-5 space-y-1">
                                <div className="flex justify-between"><span className="text-slate-500">Receipt No:</span><span className="font-bold">{showReceipt.id}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Date:</span><span>{showReceipt.date}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Customer:</span><span className="truncate max-w-[120px] text-right">{showReceipt.client}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Cashier:</span><span>{user?.name || 'Staff'}</span></div>
                            </div>
                            <table className="w-full text-left mb-5">
                                <thead><tr className="border-b-2 border-slate-200 border-dashed"><th className="py-2 text-slate-500 font-normal">Item</th><th className="py-2 text-center text-slate-500 font-normal">Qty</th><th className="py-2 text-right text-slate-500 font-normal">Amt</th></tr></thead>
                                <tbody>
                                    {showReceipt.items?.map((item: any, i: number) => (
                                        <tr key={i}><td className="py-2 pr-1 border-b border-slate-100"><span className="block">{item.desc}</span>{item.variant && <span className="block text-[10px] text-slate-500">{item.variant}</span>}</td><td className="py-2 text-center border-b border-slate-100">{item.qty}</td><td className="py-2 text-right border-b border-slate-100 font-medium">{(item.total).toFixed(2)}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="border-t-2 border-slate-200 border-dashed pt-3 space-y-2 text-right">
                                <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>{(showReceipt.baseAmount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-slate-600"><span>Tax (18%):</span><span>{(showReceipt.taxAmount || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between text-base font-bold pt-3 mt-1 border-t border-slate-200"><span>TOTAL:</span><span>₹{(showReceipt.amount || 0).toFixed(2)}</span></div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-2 rounded mt-4">
                                <span className="text-slate-500 text-[10px] uppercase">Payment</span>
                                <span className="font-bold uppercase tracking-wider">{paymentMethod}</span>
                            </div>
                            <div className="text-center mt-6 pt-4 border-t-2 border-slate-200 border-dashed">
                                <p className="font-bold text-sm mb-1">Thank you!</p>
                                <p className="text-[10px] text-slate-500">Visit us again.</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 w-full no-print">
                            <button onClick={() => window.print()} className="w-full py-3.5 bg-primary text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all outline-none">
                                <span className="material-symbols-outlined text-[20px]">print</span> Print Receipt
                            </button>
                            <button onClick={() => setShowReceipt(null)} className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-700 transition-colors">Start New Sale</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Mgmt Modal (Left unchanged from logic, styled similarly to others) */}
            {/* Omitted for brevity in formatting, but I must include it because React requires it to be there - keeping it in simple Tailwind */}
            {showProductModal && isAdmin && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setShowProductModal(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 bg-slate-100 dark:bg-slate-700 rounded-full"><span className="material-symbols-outlined text-[20px]">close</span></button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                                    <input value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary" placeholder="Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SKU</label>
                                        <input value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm font-mono text-slate-900 dark:text-white" placeholder="SKU" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                                        <input value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white" placeholder="Category" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Selling Price</label>
                                        <input type="number" value={productForm.price || ''} onChange={e => setProductForm({ ...productForm, price: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white" placeholder="0.00" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                                        <input type="number" value={productForm.stock || ''} onChange={e => setProductForm({ ...productForm, stock: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white" placeholder="0" disabled={productForm.variants && productForm.variants.length > 0} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-2 flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">layers</span> Variants</h4>
                                    <div className="flex gap-2 items-end mb-3">
                                        <div className="flex-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 block">Name</label>
                                            <input value={newVariant.name} onChange={e => setNewVariant({ ...newVariant, name: e.target.value })} placeholder="Color/Size" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 block">Price</label>
                                            <input type="number" value={newVariant.price || ''} onChange={e => setNewVariant({ ...newVariant, price: Number(e.target.value) })} placeholder="0.00" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-900 dark:text-white" />
                                        </div>
                                        <div className="w-16">
                                            <label className="text-[10px] uppercase font-bold text-slate-500 mb-0.5 block">Stock</label>
                                            <input type="number" value={newVariant.stock || ''} onChange={e => setNewVariant({ ...newVariant, stock: Number(e.target.value) })} placeholder="0" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1.5 text-xs text-slate-900 dark:text-white" />
                                        </div>
                                        <button onClick={addVariant} className="p-1.5 bg-primary text-white rounded text-xs shrink-0 w-8 h-[28px] flex justify-center items-center"><span className="material-symbols-outlined text-[16px]">add</span></button>
                                    </div>
                                    <div className="space-y-1">
                                        {productForm.variants?.map((v, i) => (
                                            <div key={i} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-700 rounded">
                                                <span className="font-bold text-slate-700 dark:text-white">{v.name}</span>
                                                <div className="flex gap-3 text-slate-500"><span title="Stock">x{v.stock}</span><span>{formatCurrency(v.price || 0)}</span></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
                            <button onClick={() => setShowProductModal(false)} className="px-4 py-2 font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSaveProduct} disabled={createProduct.isPending || updateProductMut.isPending} className="px-6 py-2 bg-primary hover:bg-blue-600 text-white font-bold rounded-lg shadow-sm disabled:opacity-50 transition-colors">Save Product</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
