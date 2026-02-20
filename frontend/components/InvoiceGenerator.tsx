
import React, { useState, useMemo, useRef } from 'react';
import { useCreateInvoice } from '../hooks/useInvoices';
import { useProducts } from '../hooks/useProducts';
import { useCompanySettings } from '../hooks/useAdmin';
import { Plus, Trash2, Eye, Download, X, Search, FileText, Printer } from 'lucide-react';
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
    const companySettings: any = (settingsData?.data || settingsData) || { name: 'Studio Mystri', address: '', phone: '', email: '', gstNumber: '', logoUrl: '' };

    const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    // Invoice State
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientGST, setClientGST] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceLineItem[]>([]);
    const [notes, setNotes] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [searchProduct, setSearchProduct] = useState('');
    const [showProductSearch, setShowProductSearch] = useState(false);
    const previewRef = useRef<HTMLDivElement>(null);

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
    const gstAmount = useMemo(() => subtotal * 0.18, [subtotal]);
    const total = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const handleSave = () => {
        if (!clientName || items.length === 0) {
            toast.error('Please add client name and at least one item');
            return;
        }

        createInvoice.mutate({
            invoiceNumber,
            client: clientName,
            clientAddress,
            clientGST,
            clientPhone,
            date: invoiceDate,
            dueDate,
            items: items.map(i => ({ name: i.name, description: i.description, quantity: i.quantity, rate: i.rate, amount: i.amount })),
            subtotal,
            gst: gstAmount,
            total,
            notes,
            status: 'Pending',
            type: 'Income',
            amount: total,
        } as any, {
            onSuccess: () => {
                toast.success('Invoice saved!');
                // Reset form
                setClientName(''); setClientAddress(''); setClientGST(''); setClientPhone('');
                setItems([]); setNotes(''); setShowPreview(false);
            }
        });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && previewRef.current) {
            printWindow.document.write(`
        <html><head><title>Invoice ${invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f1f5f9; font-weight: 600; }
          .total-row { font-weight: bold; font-size: 16px; }
          @media print { body { padding: 0; } }
        </style></head>
        <body>${previewRef.current.innerHTML}</body></html>
      `);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchProduct.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Invoice Generator</h2>
                    <p className="text-sm text-slate-500">Create professional invoices</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowPreview(!showPreview)} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                        <Eye className="w-4 h-4" /> {showPreview ? 'Edit' : 'Preview'}
                    </button>
                    <button onClick={handleSave} disabled={createInvoice.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 disabled:opacity-50">
                        {createInvoice.isPending ? 'Saving...' : 'Save Invoice'}
                    </button>
                </div>
            </div>

            {!showPreview ? (
                <div className="space-y-6">
                    {/* Client Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Bill To</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Client Name *" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <input value={clientPhone} onChange={e => setClientPhone(e.target.value)} placeholder="Phone" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <input value={clientGST} onChange={e => setClientGST(e.target.value)} placeholder="GST Number" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <textarea value={clientAddress} onChange={e => setClientAddress(e.target.value)} placeholder="Address" className="border border-slate-200 p-2.5 rounded-lg text-sm" rows={2} />
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-4">Invoice Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Invoice #</label>
                                <input value={invoiceNumber} readOnly className="border border-slate-200 p-2.5 rounded-lg text-sm bg-slate-50 w-full font-mono" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Date</label>
                                <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className="border border-slate-200 p-2.5 rounded-lg text-sm w-full" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 block mb-1">Due Date</label>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="border border-slate-200 p-2.5 rounded-lg text-sm w-full" />
                            </div>
                        </div>
                    </div>

                    {/* Line Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold text-slate-800">Line Items</h3>
                            <div className="flex gap-2">
                                <button onClick={() => setShowProductSearch(true)} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center gap-1">
                                    <Search className="w-3 h-3" /> From Products
                                </button>
                                <button onClick={addBlankItem} className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>
                        </div>

                        {items.length > 0 && (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Item</th>
                                        <th className="px-3 py-2 text-right w-20">Qty</th>
                                        <th className="px-3 py-2 text-right w-28">Rate</th>
                                        <th className="px-3 py-2 text-right w-28">Amount</th>
                                        <th className="px-3 py-2 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {items.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-3 py-2">
                                                <input value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} className="border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none w-full py-1" placeholder="Item name" />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none w-16 text-right py-1" />
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <input type="number" value={item.rate} onChange={e => updateItem(item.id, 'rate', Number(e.target.value))} className="border-b border-transparent hover:border-slate-200 focus:border-indigo-400 outline-none w-24 text-right py-1" />
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                                            <td className="px-3 py-2">
                                                <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {items.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">No items added yet. Click "Add Item" to start.</div>
                        )}

                        {/* Totals */}
                        {items.length > 0 && (
                            <div className="border-t border-slate-200 mt-4 pt-4 flex justify-end">
                                <div className="w-64 space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                                    <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span>{formatCurrency(gstAmount)}</span></div>
                                    <div className="flex justify-between font-bold text-lg border-t border-slate-200 pt-2"><span>Total</span><span className="text-indigo-600">{formatCurrency(total)}</span></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-semibold text-slate-800 mb-2">Notes</h3>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm h-20" placeholder="Payment terms, thank you notes, etc." />
                    </div>
                </div>
            ) : (
                /* Preview Mode */
                <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200" ref={previewRef}>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800">{companySettings.name || 'Studio Mystri'}</h1>
                            <p className="text-sm text-slate-500 mt-1">{companySettings.address}</p>
                            <p className="text-sm text-slate-500">{companySettings.phone}</p>
                            {companySettings.gstNumber && <p className="text-xs text-slate-400 mt-1">GST: {companySettings.gstNumber}</p>}
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-indigo-600">INVOICE</h2>
                            <p className="text-sm text-slate-500 font-mono">{invoiceNumber}</p>
                            <p className="text-sm text-slate-500 mt-2">Date: {invoiceDate}</p>
                            {dueDate && <p className="text-sm text-slate-500">Due: {dueDate}</p>}
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Bill To</h3>
                        <p className="font-bold text-slate-800">{clientName || '—'}</p>
                        {clientAddress && <p className="text-sm text-slate-500">{clientAddress}</p>}
                        {clientPhone && <p className="text-sm text-slate-500">Phone: {clientPhone}</p>}
                        {clientGST && <p className="text-sm text-slate-500">GST: {clientGST}</p>}
                    </div>

                    <table className="w-full text-sm mb-8">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-4 py-3 text-left font-semibold text-slate-600">Item</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Qty</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Rate</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {items.map(item => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-slate-800">{item.name}</td>
                                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(item.rate)}</td>
                                    <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.amount)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="flex justify-end mb-8">
                        <div className="w-64 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">GST (18%)</span><span>{formatCurrency(gstAmount)}</span></div>
                            <div className="flex justify-between font-bold text-lg border-t-2 border-slate-800 pt-2"><span>Total</span><span>{formatCurrency(total)}</span></div>
                        </div>
                    </div>

                    {notes && (
                        <div className="border-t border-slate-200 pt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Notes</h4>
                            <p className="text-sm text-slate-500">{notes}</p>
                        </div>
                    )}

                    <div className="mt-8 flex justify-end">
                        <button onClick={handlePrint} className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                            <Printer className="w-4 h-4" /> Print / PDF
                        </button>
                    </div>
                </div>
            )}

            {/* Product Search Modal */}
            {showProductSearch && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">Select Product</h3>
                            <button onClick={() => setShowProductSearch(false)}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={searchProduct} onChange={e => setSearchProduct(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm" placeholder="Search products..." />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {filteredProducts.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => addFromProduct(p)}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 flex items-center justify-between transition-colors"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{p.name}</p>
                                        <p className="text-xs text-slate-400">{p.category}</p>
                                    </div>
                                    <span className="text-sm font-medium text-indigo-600">{formatCurrency(p.price || p.cost || 0)}</span>
                                </button>
                            ))}
                            {filteredProducts.length === 0 && <p className="text-center text-sm text-slate-400 py-4">No products found</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
