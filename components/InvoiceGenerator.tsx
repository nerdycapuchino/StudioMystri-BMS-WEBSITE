
import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Invoice } from '../types';
import { Printer, Save, Plus, Trash2, RefreshCw, ArrowLeft, Search, MapPin, Calculator } from 'lucide-react';

export const InvoiceGenerator: React.FC = () => {
  const { addInvoice, formatCurrency, companySettings, products, inventory } = useGlobal();
  
  // States for State & Pincode logic
  const [sellerState, setSellerState] = useState('Gujarat');
  const [buyerState, setBuyerState] = useState('Gujarat');
  const [buyerPincode, setBuyerPincode] = useState('');

  const [data, setData] = useState<Partial<Invoice>>({
      id: `INV-${Date.now().toString().substr(-6)}`,
      date: new Date().toISOString().split('T')[0],
      client: '',
      buyerAddress: '',
      gstNumber: '', 
      shippingAddress: '',
      sellerName: companySettings.name,
      sellerAddress: companySettings.address,
      sellerGst: companySettings.gstNumber,
      deliveryType: 'Standard',
      paymentMode: 'Bank Transfer',
      items: [],
      // Extra Fields
      referenceNo: '',
      referenceDate: '',
      buyerOrderNo: '',
      dispatchDocNo: '',
      dispatchThrough: '',
      destination: '',
      termsOfDelivery: '',
      pan: companySettings.gstNumber.substr(2, 10),
      declaration: 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.',
      jurisdiction: 'Ahmedabad'
  });

  // Sync settings
  useEffect(() => {
      setData(prev => ({
          ...prev,
          sellerName: companySettings.name,
          sellerAddress: companySettings.address,
          sellerGst: companySettings.gstNumber,
          pan: companySettings.gstNumber.substr(2, 10)
      }));
  }, [companySettings]);

  // Determine Tax Type
  // Logic: IGST if states are different. CGST+SGST if states are same.
  const isInterState = buyerState.trim().toLowerCase() !== sellerState.trim().toLowerCase();

  const [newItem, setNewItem] = useState({ id: '', desc: '', hsn: '9403', qty: 1, rate: 0, gstRate: 18 });

  // Handle Product Selection from Dropdown
  const handleProductSelect = (prodId: string) => {
      const prod = products.find(p => p.id === prodId);
      if(prod) {
          setNewItem({ 
              id: prod.id, 
              desc: prod.name, 
              rate: prod.price, 
              hsn: '9403', // Default HSN, can be updated if product has it
              qty: 1, 
              gstRate: 18 
          });
      }
  };

  const addItem = () => {
      if(newItem.desc && newItem.rate > 0) {
          setData(prev => ({
              ...prev,
              items: [...(prev.items || []), { 
                  desc: newItem.desc, 
                  hsn: newItem.hsn,
                  qty: newItem.qty, 
                  rate: newItem.rate, 
                  gstRate: newItem.gstRate,
                  total: newItem.qty * newItem.rate 
              }]
          }));
          setNewItem({ id: '', desc: '', hsn: '9403', qty: 1, rate: 0, gstRate: 18 });
      }
  };

  const removeItem = (idx: number) => {
      setData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== idx) }));
  };

  const calculateTotals = () => {
      const subtotal = data.items?.reduce((acc, item) => acc + (item.qty * item.rate), 0) || 0;
      const taxAmount = subtotal * 0.18; // Simplified for demo. In real app, calculate per item based on GST Rate
      return { subtotal, taxAmount, total: subtotal + taxAmount };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleSave = () => {
      if(!data.client) return alert("Buyer name is required");
      addInvoice({
          ...data,
          amount: total,
          baseAmount: subtotal,
          taxAmount: taxAmount,
          taxRate: 18,
          paidAmount: 0,
          status: 'Pending',
          type: 'Income',
          currency: 'INR',
          history: []
      } as Invoice);
      alert("Invoice Saved to Finance!");
  };

  const toWords = (n: number) => {
      // Very basic implementation for demo
      return `Rupees ${Math.floor(n)} Only`; 
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-black overflow-hidden relative">
        {/* Editor Panel */}
        <div className="w-full md:w-1/2 flex flex-col border-r border-white/10 bg-surface-darker h-full no-print">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface-dark">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Invoice Editor</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setData(prev => ({...prev, id: `INV-${Date.now().toString().substr(-6)}`}))} className="p-2 bg-white/5 rounded hover:text-white text-zinc-400"><RefreshCw className="w-4 h-4"/></button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary text-black font-bold rounded text-xs uppercase tracking-widest hover:bg-[#2ecc71]">Save Record</button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* 1. Header Details */}
                <section>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Invoice Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input value={data.id} onChange={e => setData({...data, id: e.target.value})} placeholder="Invoice No" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input type="date" value={data.date} onChange={e => setData({...data, date: e.target.value})} className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.deliveryType} onChange={e => setData({...data, deliveryType: e.target.value as any})} placeholder="Delivery Note" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.paymentMode} onChange={e => setData({...data, paymentMode: e.target.value})} placeholder="Payment Mode" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                    </div>
                </section>

                {/* 2. Parties */}
                <section>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Buyer Info</h3>
                    <div className="space-y-4">
                        <input value={data.client} onChange={e => setData({...data, client: e.target.value})} placeholder="Buyer Name" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.gstNumber} onChange={e => setData({...data, gstNumber: e.target.value})} placeholder="Buyer GSTIN" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <textarea value={data.buyerAddress} onChange={e => setData({...data, buyerAddress: e.target.value})} placeholder="Billing Address" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm h-20" />
                        <textarea value={data.shippingAddress} onChange={e => setData({...data, shippingAddress: e.target.value})} placeholder="Shipping Address (leave empty if same)" className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm h-20" />
                    </div>
                </section>

                {/* 3. Tax & Location Logic */}
                <section className="bg-primary/5 p-4 rounded-2xl border border-primary/20">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 flex items-center gap-2"><MapPin className="w-4 h-4"/> Tax & Location Details</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Buyer State</label>
                            <input value={buyerState} onChange={e => setBuyerState(e.target.value)} placeholder="e.g. Maharashtra" className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-zinc-500 uppercase font-bold ml-1">Buyer Pincode</label>
                            <input value={buyerPincode} onChange={e => setBuyerPincode(e.target.value)} placeholder="e.g. 400050" className="w-full bg-black/40 border border-white/10 rounded p-2 text-white text-sm" />
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400">Seller State: <strong className="text-white">{sellerState}</strong></span>
                        <span className={`font-bold px-2 py-1 rounded ${isInterState ? 'bg-amber-500/20 text-amber-500' : 'bg-green-500/20 text-green-500'}`}>
                            Type: {isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
                        </span>
                    </div>
                </section>

                {/* 4. Logistics */}
                <section>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Dispatch & Shipping</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <input value={data.buyerOrderNo} onChange={e => setData({...data, buyerOrderNo: e.target.value})} placeholder="Buyer Order No" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.dispatchDocNo} onChange={e => setData({...data, dispatchDocNo: e.target.value})} placeholder="Dispatch Doc No" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.dispatchThrough} onChange={e => setData({...data, dispatchThrough: e.target.value})} placeholder="Dispatch Through" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.destination} onChange={e => setData({...data, destination: e.target.value})} placeholder="Destination" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm" />
                        <input value={data.termsOfDelivery} onChange={e => setData({...data, termsOfDelivery: e.target.value})} placeholder="Terms of Delivery" className="bg-black/20 border border-white/10 rounded p-2 text-white text-sm col-span-2" />
                    </div>
                </section>

                {/* 5. Items */}
                <section>
                    <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Line Items</h3>
                    <div className="space-y-2 mb-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="relative mb-2">
                            <select 
                                value={newItem.id} 
                                onChange={(e) => handleProductSelect(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded p-2 text-white text-sm appearance-none focus:outline-none focus:border-primary"
                            >
                                <option value="">-- Select Product from Inventory --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name} - ₹{p.price}</option>)}
                            </select>
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"/>
                        </div>

                        <div className="grid grid-cols-12 gap-2">
                            <input value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} placeholder="Description" className="col-span-5 bg-black/20 border border-white/10 rounded p-2 text-white text-xs" />
                            <input value={newItem.hsn} onChange={e => setNewItem({...newItem, hsn: e.target.value})} placeholder="HSN" className="col-span-2 bg-black/20 border border-white/10 rounded p-2 text-white text-xs" />
                            <input type="number" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: Number(e.target.value)})} placeholder="Qty" className="col-span-1 bg-black/20 border border-white/10 rounded p-2 text-white text-xs" />
                            <input type="number" value={newItem.rate} onChange={e => setNewItem({...newItem, rate: Number(e.target.value)})} placeholder="Rate" className="col-span-2 bg-black/20 border border-white/10 rounded p-2 text-white text-xs" />
                            <div className="col-span-2">
                                <button onClick={addItem} className="w-full h-full bg-primary text-black rounded font-bold text-xs flex items-center justify-center gap-1"><Plus className="w-3 h-3"/> Add</button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {data.items?.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-2 rounded border border-white/5 text-xs text-zinc-300">
                                <span className="w-5/12 truncate font-bold">{item.desc}</span>
                                <span className="w-2/12 text-center">{item.hsn}</span>
                                <span className="w-1/12 text-center text-white">{item.qty}</span>
                                <span className="w-2/12 text-right">{item.rate}</span>
                                <button onClick={() => removeItem(i)} className="text-red-500 hover:text-white"><Trash2 className="w-3 h-3"/></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>

        {/* Preview Panel (A4) */}
        <div className="w-full md:w-1/2 bg-zinc-900 overflow-y-auto p-8 flex items-start justify-center relative">
            
            {/* Floating Exit Button for Full Screen / Mobile Context */}
            <div className="fixed top-4 right-8 z-50 flex gap-2 no-print">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-primary text-black px-6 py-2.5 rounded-full font-bold shadow-glow hover:scale-105 transition-transform"><Printer className="w-4 h-4"/> Print A4</button>
            </div>

            <div id="invoice-print-area" className="bg-white text-black w-[210mm] min-h-[297mm] shadow-2xl p-[10mm] text-xs font-sans leading-tight relative my-4 mx-auto">
                <div className="h-full flex flex-col">
                    {/* Optional Logo */}
                    {companySettings.logoUrl && (
                        <div className="mb-4 text-center">
                            <img src={companySettings.logoUrl} alt="Company Logo" className="h-16 mx-auto object-contain" />
                        </div>
                    )}

                    <div className="text-center font-bold text-xl mb-4 uppercase tracking-wider underline decoration-2 underline-offset-4">Tax Invoice</div>
                    
                    {/* Bordered Container */}
                    <div className="border border-black flex-1 flex flex-col">
                        {/* Row 1: Seller & Invoice Info */}
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="p-2 border-r border-black">
                                <h4 className="font-bold mb-1">Seller Details:</h4>
                                <h2 className="font-bold text-lg">{data.sellerName}</h2>
                                <p className="whitespace-pre-wrap">{data.sellerAddress}</p>
                                <p className="mt-1"><span className="font-bold">GSTIN:</span> {data.sellerGst}</p>
                                <p><span className="font-bold">State:</span> {sellerState}</p>
                                <p><span className="font-bold">Email:</span> {companySettings.email}</p>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex border-b border-black flex-1">
                                    <div className="p-2 w-1/2 border-r border-black">
                                        <p className="font-bold">Invoice No.</p>
                                        <p>{data.id}</p>
                                    </div>
                                    <div className="p-2 w-1/2">
                                        <p className="font-bold">Date</p>
                                        <p>{data.date}</p>
                                    </div>
                                </div>
                                <div className="p-2 border-b border-black">
                                    <p className="font-bold">Delivery Note</p>
                                    <p>{data.deliveryType}</p>
                                </div>
                                <div className="p-2">
                                    <p className="font-bold">Mode/Terms of Payment</p>
                                    <p>{data.paymentMode}</p>
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Buyer & Consignee */}
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="p-2 border-r border-black">
                                <h4 className="font-bold mb-1">Buyer (Bill to):</h4>
                                <p className="font-bold">{data.client}</p>
                                <p className="whitespace-pre-wrap">{data.buyerAddress}</p>
                                <p className="font-bold">State: {buyerState} {buyerPincode ? `- ${buyerPincode}` : ''}</p>
                                <p className="mt-1"><span className="font-bold">GSTIN:</span> {data.gstNumber || 'Unregistered'}</p>
                            </div>
                            <div className="p-2">
                                <h4 className="font-bold mb-1">Consignee (Ship to):</h4>
                                <p className="font-bold">{data.client}</p>
                                <p className="whitespace-pre-wrap">{data.shippingAddress || data.buyerAddress}</p>
                            </div>
                        </div>

                        {/* Row 3: Logistics */}
                        <div className="grid grid-cols-2 border-b border-black">
                            <div className="flex flex-col border-r border-black">
                                <div className="flex border-b border-black">
                                    <div className="p-2 w-1/2 border-r border-black">
                                        <p className="font-bold">Buyer Order No.</p>
                                        <p>{data.buyerOrderNo || '-'}</p>
                                    </div>
                                    <div className="p-2 w-1/2">
                                        <p className="font-bold">Dated</p>
                                        <p>{data.referenceDate || '-'}</p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="font-bold">Terms of Delivery</p>
                                    <p>{data.termsOfDelivery || 'Immediate'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex border-b border-black">
                                    <div className="p-2 w-1/2 border-r border-black">
                                        <p className="font-bold">Dispatch Doc No.</p>
                                        <p>{data.dispatchDocNo || '-'}</p>
                                    </div>
                                    <div className="p-2 w-1/2">
                                        <p className="font-bold">Dispatch Through</p>
                                        <p>{data.dispatchThrough || 'Self'}</p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <p className="font-bold">Destination</p>
                                    <p>{data.destination || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Row 4: Items */}
                        <div className="flex-1 flex flex-col">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-black bg-gray-100">
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
                                    {data.items?.map((item, i) => (
                                        <tr key={i} className="align-top border-b border-black last:border-b-0">
                                            <td className="border-r border-black p-2 text-center">{i + 1}</td>
                                            <td className="border-r border-black p-2 font-bold">{item.desc}</td>
                                            <td className="border-r border-black p-2 text-center">{item.hsn}</td>
                                            <td className="border-r border-black p-2 text-center">{item.gstRate}%</td>
                                            <td className="border-r border-black p-2 text-center font-bold">{item.qty}</td>
                                            <td className="border-r border-black p-2 text-right">{item.rate.toFixed(2)}</td>
                                            <td className="p-2 text-right font-bold">{item.total.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="mt-auto border-t border-black">
                                <div className="flex border-b border-black">
                                    <div className="flex-1 border-r border-black text-right p-2 font-bold">Taxable Amount</div>
                                    <div className="w-24 text-right p-2">{subtotal.toFixed(2)}</div>
                                </div>
                                {isInterState ? (
                                    <div className="flex border-b border-black">
                                        <div className="flex-1 border-r border-black text-right p-2 font-bold">Add: IGST (18%)</div>
                                        <div className="w-24 text-right p-2">{taxAmount.toFixed(2)}</div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex border-b border-black">
                                            <div className="flex-1 border-r border-black text-right p-2 font-bold">Add: CGST (9%)</div>
                                            <div className="w-24 text-right p-2">{(taxAmount/2).toFixed(2)}</div>
                                        </div>
                                        <div className="flex border-b border-black">
                                            <div className="flex-1 border-r border-black text-right p-2 font-bold">Add: SGST (9%)</div>
                                            <div className="w-24 text-right p-2">{(taxAmount/2).toFixed(2)}</div>
                                        </div>
                                    </>
                                )}
                                <div className="flex bg-gray-200">
                                    <div className="flex-1 border-r border-black text-right p-2 font-bold uppercase">Total Payable</div>
                                    <div className="w-24 text-right p-2 font-bold">₹ {total.toFixed(2)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Row 5: Amount in Words */}
                        <div className="border-t border-black p-2">
                            <p className="font-bold">Amount Chargeable (in words)</p>
                            <p className="italic">{toWords(total)}</p>
                        </div>

                        {/* Row 6: Bank & Sign */}
                        <div className="grid grid-cols-2 border-t border-black">
                            <div className="p-2 border-r border-black">
                                <h4 className="font-bold underline mb-1">Bank Details</h4>
                                <p><span className="font-bold">Bank:</span> Axis Bank Ltd</p>
                                <p><span className="font-bold">A/c No:</span> 922020034183057</p>
                                <p><span className="font-bold">Branch & IFS:</span> Vasna, Ahmedabad & UTIB0001210</p>
                                <p className="mt-2"><span className="font-bold">PAN:</span> {data.pan}</p>
                            </div>
                            <div className="p-2 flex flex-col justify-between">
                                <div className="text-right">
                                    <p className="font-bold">For {data.sellerName}</p>
                                </div>
                                <div className="text-right mt-12">
                                    <p className="font-bold">(Authorized Signatory)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-center font-bold text-[10px] mt-2">
                        SUBJECT TO {data.jurisdiction?.toUpperCase()} JURISDICTION
                    </div>
                    <div className="mt-4 text-[10px]">
                        <p className="font-bold underline">Declaration:</p>
                        <p>{data.declaration}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
