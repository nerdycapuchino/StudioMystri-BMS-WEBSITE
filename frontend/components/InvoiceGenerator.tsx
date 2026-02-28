import React, { useState, useMemo, useRef } from 'react';
import { useCreateInvoice } from '../hooks/useInvoices';
import { useProducts } from '../hooks/useProducts';
import { useCompanySettings } from '../hooks/useAdmin';
import { Plus, Trash2, Eye, Download, X, Search, FileText, Printer, Building2, Save, MapPin, Ruler, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceLineItem {
    id: string;
    name: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export const InvoiceGenerator: React.FC = () => {
    const { data: prodData } = useProducts();
    const { data: settingsData } = useCompanySettings();
    const createInvoice = useCreateInvoice();

    const products: any[] = Array.isArray(prodData?.data || prodData) ? (prodData?.data || prodData) as any[] : [];
    const companySettings: any = ((settingsData as any)?.data || settingsData) || { name: 'Studio Mystri', address: '123 Studio Way', phone: '+1 234 567 8900', email: 'hello@studiomystri.com', gstNumber: '', logoUrl: '' };

    const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);

    // Invoice State
    const [clientName, setClientName] = useState('');
    const [clientAddressLine1, setClientAddressLine1] = useState('');
    const [clientCityZip, setClientCityZip] = useState('');

    const [projectTitle, setProjectTitle] = useState('');
    const [projectLocation, setProjectLocation] = useState('');
    const [projectScope, setProjectScope] = useState('');

    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // default 30 days
    const [items, setItems] = useState<InvoiceLineItem[]>([]);
    const [notes, setNotes] = useState('1. 50% deposit required to commence work.\n2. Quote valid for 30 days from date of issue.\n3. Materials are subject to market availability.');
    const [searchProduct, setSearchProduct] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);

    // Hardcoded tax for visual, though configurable in reality
    const taxRate = 0.18; // 18% GST

    const previewRef = useRef<HTMLDivElement>(null);

    const [invoiceNumber] = useState(`Q-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);

    const addBlankItem = () => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            name: '',
            description: '',
            quantity: 1,
            rate: 0,
            amount: 0
        }]);
    };

    const addFromProduct = (product: any) => {
        setItems([...items, {
            id: Math.random().toString(36).substr(2, 9),
            name: product.name,
            description: product.description || '',
            quantity: 1,
            rate: product.price || product.cost || 0,
            amount: product.price || product.cost || 0
        }]);
        setShowProductSearch(false);
        setSearchProduct('');
    };

    const updateItem = (id: string, field: keyof InvoiceLineItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                updated.amount = updated.quantity * updated.rate;
                return updated;
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(i => i.id !== id));
    };

    const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
    const taxAmount = useMemo(() => subtotal * taxRate, [subtotal, taxRate]);
    const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

    const handleSave = () => {
        if (!clientName || items.length === 0) {
            toast.error('Please add client name and at least one item');
            return;
        }

        const fullClientAddress = `${clientAddressLine1}, ${clientCityZip}`;

        createInvoice.mutate({
            invoiceNumber,
            client: clientName,
            clientAddress: fullClientAddress,
            clientGST: '', // ignored in new template
            clientPhone: '', // ignored in new template
            date: invoiceDate,
            dueDate,
            items: items.map(i => ({ name: i.name, description: i.description, quantity: i.quantity, rate: i.rate, amount: i.amount })),
            subtotal,
            gst: taxAmount,
            total,
            notes,
            status: 'Pending',
            type: 'Income',
            amount: total,
        } as any, {
            onSuccess: () => {
                toast.success('Invoice saved successfully!');
                // Reset form
                setClientName(''); setClientAddressLine1(''); setClientCityZip('');
                setProjectTitle(''); setProjectLocation(''); setProjectScope('');
                setItems([]);
            }
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.category?.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 overflow-hidden relative">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-3 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm shadow-primary/30">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h1 className="text-lg font-bold tracking-tight">Quotation Builder</h1>
                    </div>
                    <span className="hidden sm:inline-block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></span>
                    <div className="hidden sm:flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Draft</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSave}
                        disabled={createInvoice.isPending}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {createInvoice.isPending ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />}
                        Save Draft
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-sm shadow-primary/20 transition-colors focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                    >
                        <Printer className="w-4 h-4" />
                        Generate PDF
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto custom-scrollbar relative print:bg-white print:p-0">

                {/* Document Canvas */}
                <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 min-h-[1000px] flex flex-col print:shadow-none print:border-none print:bg-white">

                    {/* Document Header */}
                    <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 pt-10">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                            {/* Firm Logo & Info */}
                            <div className="flex flex-col gap-4">
                                {companySettings.logoUrl ? (
                                    <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                                        <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 bg-slate-900 dark:bg-black text-white flex items-center justify-center rounded-lg shadow-md">
                                        <span className="font-display font-black text-2xl tracking-tighter">{companySettings.name ? companySettings.name.substring(0, 3) : 'LX.'}</span>
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{companySettings.name || 'Studio Mystri'}</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1" dangerouslySetInnerHTML={{ __html: (companySettings.address || '').replace(/\n/g, '<br/>') || 'Your Address Here' }}></p>
                                    <p className="text-sm text-primary mt-2 font-medium">{companySettings.email || 'Email'}</p>
                                </div>
                            </div>

                            {/* Quote Meta Data */}
                            <div className="w-full md:w-auto flex flex-col gap-3 min-w-[240px]">
                                <div className="text-right mb-2">
                                    <h3 className="text-3xl font-light text-slate-300 dark:text-slate-600 uppercase tracking-widest">Quotation</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                    <label className="text-slate-500 dark:text-slate-400 font-medium self-center text-right">Quote #</label>
                                    <input
                                        type="text"
                                        value={invoiceNumber}
                                        readOnly
                                        className="text-right border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent rounded-md py-1 px-2 focus:ring-1 focus:ring-primary outline-none font-mono text-slate-900 dark:text-white transition-colors"
                                    />

                                    <label className="text-slate-500 dark:text-slate-400 font-medium self-center text-right">Date</label>
                                    <input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={e => setInvoiceDate(e.target.value)}
                                        className="text-right border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent rounded-md py-1 px-2 focus:ring-1 focus:ring-primary outline-none font-mono text-slate-900 dark:text-white transition-colors cursor-pointer"
                                    />

                                    <label className="text-slate-500 dark:text-slate-400 font-medium self-center text-right">Valid Until</label>
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        className="text-right border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-transparent rounded-md py-1 px-2 focus:ring-1 focus:ring-primary outline-none font-mono text-slate-900 dark:text-white transition-colors cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Client & Project Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Bill To (Client)</h4>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={e => setClientName(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-0 px-0 py-1 text-lg font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                                        placeholder="Client Name"
                                    />
                                    <input
                                        type="text"
                                        value={clientAddressLine1}
                                        onChange={e => setClientAddressLine1(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 transition-colors"
                                        placeholder="Address Line 1"
                                    />
                                    <input
                                        type="text"
                                        value={clientCityZip}
                                        onChange={e => setClientCityZip(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 transition-colors"
                                        placeholder="City, State, Zip"
                                    />
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                                {/* Decorative Map BG */}
                                <div className="absolute inset-0 opacity-10 dark:opacity-[0.05] bg-cover bg-center pointer-events-none mix-blend-multiply dark:mix-blend-screen" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" }}></div>
                                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 relative z-10">Project Details</h4>
                                <div className="space-y-2 relative z-10">
                                    <input
                                        type="text"
                                        value={projectTitle}
                                        onChange={e => setProjectTitle(e.target.value)}
                                        className="w-full bg-transparent border-0 border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-primary focus:ring-0 px-0 py-1 text-lg font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                                        placeholder="Project Title"
                                    />
                                    <div className="flex gap-2">
                                        <MapPin className="text-slate-400 w-4 h-4 mt-1.5 shrink-0" />
                                        <input
                                            type="text"
                                            value={projectLocation}
                                            onChange={e => setProjectLocation(e.target.value)}
                                            className="w-full bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 transition-colors"
                                            placeholder="Project Location"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Ruler className="text-slate-400 w-4 h-4 mt-1.5 shrink-0" />
                                        <input
                                            type="text"
                                            value={projectScope}
                                            onChange={e => setProjectScope(e.target.value)}
                                            className="w-full bg-transparent border-0 border-b border-dashed border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-0 px-0 py-1 text-sm text-slate-600 dark:text-slate-300 placeholder:text-slate-400 transition-colors"
                                            placeholder="Area Scope (e.g. Approx. 850 sq. ft)"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="p-8 md:p-12 flex-grow">
                        {/* Section: Project Items */}
                        <div className="mb-10 group/section">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-lg bg-blue-50 text-primary dark:bg-primary/20">
                                        <PenTool className="w-4 h-4" />
                                    </span>
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">1. Invoice Items</h3>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowProductSearch(true)}
                                        className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md"
                                    >
                                        <Search className="w-3.5 h-3.5" /> From Catalog
                                    </button>
                                    <button
                                        onClick={addBlankItem}
                                        className="text-xs font-semibold text-primary hover:text-blue-600 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 bg-blue-50 dark:bg-primary/10 px-3 py-1.5 rounded-md"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Line Item
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto custom-scrollbar">
                                <table className="w-full min-w-[600px] text-left text-sm border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-slate-500 dark:text-slate-400">
                                            <th className="pb-3 w-[45%] font-medium">Description</th>
                                            <th className="pb-3 w-[15%] text-right font-medium">Qty</th>
                                            <th className="pb-3 w-[15%] text-right font-medium">Unit Price</th>
                                            <th className="pb-3 w-[15%] text-right font-medium">Total</th>
                                            <th className="pb-3 w-10"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-transparent">
                                        {items.map(item => (
                                            <tr key={item.id} className="group/row hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="py-2 pr-4 border-b border-slate-100 dark:border-slate-800">
                                                    <input
                                                        value={item.name}
                                                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 py-1 px-2 rounded -ml-2 text-slate-700 dark:text-slate-200 focus:border-primary focus:ring-0 font-medium placeholder:text-slate-300 transition-colors"
                                                        placeholder="Item/Service Name"
                                                    />
                                                    <input
                                                        value={item.description}
                                                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                                                        className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 py-1 px-2 rounded -ml-2 text-xs text-slate-400 dark:text-slate-500 focus:border-primary focus:ring-0 mt-0.5 placeholder:text-slate-300 transition-colors"
                                                        placeholder="Description or specifics..."
                                                    />
                                                </td>
                                                <td className="py-2 text-right border-b border-slate-100 dark:border-slate-800">
                                                    <input
                                                        type="number"
                                                        value={item.quantity || ''}
                                                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                                                        className="w-20 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 py-1 px-2 rounded mt-1 text-right text-slate-600 dark:text-slate-300 focus:border-primary focus:ring-0 transition-colors ml-auto"
                                                    />
                                                </td>
                                                <td className="py-2 text-right border-b border-slate-100 dark:border-slate-800">
                                                    <input
                                                        type="number"
                                                        value={item.rate || ''}
                                                        onChange={e => updateItem(item.id, 'rate', Number(e.target.value))}
                                                        className="w-24 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 py-1 px-2 rounded mt-1 text-right text-slate-600 dark:text-slate-300 focus:border-primary focus:ring-0 transition-colors ml-auto"
                                                    />
                                                </td>
                                                <td className="py-2 text-right font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pt-3">
                                                    {formatCurrency(item.amount)}
                                                </td>
                                                <td className="py-2 text-center border-b border-slate-100 dark:border-slate-800 pt-3">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {items.length === 0 && (
                                    <div className="text-center py-10 text-slate-400 text-sm border-b border-slate-100 dark:border-slate-800">
                                        No items added. Add a line item or select from catalog to begin.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footer Summary */}
                        <div className="flex flex-col md:flex-row justify-between items-start border-t border-slate-200 dark:border-slate-800 pt-8 gap-12 mt-auto">

                            {/* Terms & Notes */}
                            <div className="w-full md:w-1/2">
                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">Terms & Conditions</h5>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    className="w-full h-32 p-3 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-slate-200 dark:border-slate-700 transition-colors resize-y focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    placeholder="Enter terms here..."
                                />
                            </div>

                            {/* Totals */}
                            <div className="w-full md:w-[40%] space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Tax ({taxRate * 100}%)</span>
                                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span className="text-lg font-bold text-slate-900 dark:text-white">Grand Total</span>
                                    <span className="text-2xl font-bold text-primary">{formatCurrency(total)}</span>
                                </div>
                                <p className="text-xs text-right text-slate-400 dark:text-slate-500 mt-1">Currency: USD</p>
                            </div>
                        </div>

                        {/* Signature Block */}
                        <div className="mt-16 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-8 md:gap-20 max-w-2xl text-slate-800 dark:text-white print:break-inside-avoid">
                            <div>
                                <div className="border-b border-slate-300 dark:border-slate-600 h-10 mb-2"></div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Authorized Signature</p>
                            </div>
                            <div>
                                <div className="border-b border-slate-300 dark:border-slate-600 h-10 mb-2 flex items-end justify-center pb-1">
                                    <span className="text-sm font-medium">{invoiceDate}</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Date</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center text-slate-400 dark:text-slate-500 text-sm pb-8 print:hidden">
                    © {new Date().getFullYear()} {companySettings.name}. All rights reserved.
                </div>
            </main>

            {/* Product Search Modal */}
            {showProductSearch && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6 flex flex-col h-[500px] border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Catalog Items</h3>
                            <button onClick={() => setShowProductSearch(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="relative mb-4 shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={searchProduct}
                                onChange={e => setSearchProduct(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Search products, materials..."
                                autoFocus
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addFromProduct(p)}
                                    className="w-full text-left px-4 py-3 rounded-lg border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-100 dark:hover:border-slate-600 flex items-center justify-between transition-all group"
                                >
                                    <div className="flex items-center gap-3 w-[70%]">
                                        <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                                            {p.images && p.images[0] ? (
                                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 className="w-4 h-4 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{p.category || 'Item'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(p.price || p.cost || 0)}</span>
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-primary/20 text-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="w-4 h-4" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                                    <Search className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">No items found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
