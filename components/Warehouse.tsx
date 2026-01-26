

import React, { useState, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { InventoryItem } from '../types';
import { Plus, X, Search, Edit2, Trash2, Barcode, Scan, Camera, Package, MapPin, Truck, Layers, Printer, Hammer, ArrowRight } from 'lucide-react';

export const Warehouse: React.FC = () => {
  const { inventory, formatCurrency, addInventoryItem, updateInventoryItem, deleteInventoryItem, manufactureProduct } = useGlobal();
  const [activeTab, setActiveTab] = useState<'inventory' | 'production'>('inventory');
  const [showAdd, setShowAdd] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [printLabelItem, setPrintLabelItem] = useState<InventoryItem | null>(null);
  
  // Production State
  const [prodItem, setProdItem] = useState<string>('');
  const [prodQty, setProdQty] = useState<number>(1);
  const [prodResult, setProdResult] = useState<{success: boolean, message: string} | null>(null);

  // Enhanced Form State
  const [form, setForm] = useState<Partial<InventoryItem>>({ 
      name: '', quantity: 0, cost: 0, unit: 'pcs', type: 'Raw Material', 
      location: '', supplier: '', batchNumber: '', expiryDate: '', barcode: '',
      bom: [] 
  });
  
  // BOM Item State
  const [bomItemName, setBomItemName] = useState('');
  const [bomItemQty, setBomItemQty] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);

  const generateBarcode = () => {
      const code = `SKU-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
      setForm({ ...form, barcode: code });
  };

  const handleSave = () => {
    if (editItem) { updateInventoryItem(editItem.id, form); setEditItem(null); }
    else { addInventoryItem({ ...form, id: Math.random().toString(36).substr(2, 9), barcode: form.barcode || `SKU-${Date.now()}` } as InventoryItem); setShowAdd(false); }
    resetForm();
  };

  const resetForm = () => {
      setForm({ name: '', quantity: 0, cost: 0, unit: 'pcs', type: 'Raw Material', location: '', supplier: '', batchNumber: '', expiryDate: '', barcode: '', bom: [] });
  };

  const openEdit = (item: InventoryItem) => {
      setEditItem(item);
      setForm(item);
      setShowAdd(true);
  };

  const addBomItem = () => {
      if (bomItemName && bomItemQty > 0) {
          setForm(prev => ({
              ...prev,
              bom: [...(prev.bom || []), { itemName: bomItemName, qty: bomItemQty }]
          }));
          setBomItemName('');
          setBomItemQty(0);
      }
  };

  const executeProduction = () => {
      if (!prodItem || prodQty <= 0) return;
      const result = manufactureProduct(prodItem, prodQty);
      setProdResult(result);
      if (result.success) {
          setProdQty(1);
          setTimeout(() => setProdResult(null), 3000);
      }
  };

  // Mock scanner for warehouse view (use actual scanner component for real scan)
  const startScanner = async () => {
      setShowScanner(true);
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
              videoRef.current.srcObject = stream;
          }
      } catch (e) {
          console.error("Camera access denied", e);
          alert("Camera access is required for scanning.");
          setShowScanner(false);
      }
  };

  const stopScanner = () => {
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
      setShowScanner(false);
  };

  const simulateScan = () => {
      if (inventory.length > 0) {
          const randomItem = inventory[Math.floor(Math.random() * inventory.length)];
          alert(`Scanned: ${randomItem.name} (${randomItem.quantity} in stock)`);
          stopScanner();
      } else {
          alert("No items in inventory to match.");
      }
  };

  // Filter finished goods for production
  const finishedGoods = inventory.filter(i => i.type === 'Finished Good' && i.bom && i.bom.length > 0);

  return (
    <div className="h-full flex flex-col p-6 md:p-8 bg-background-dark overflow-hidden relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Warehouse Master</h2>
            <p className="text-zinc-400 text-sm mt-1">Manage Stock, BOM, and Logistics</p>
        </div>
        
        <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
            <button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-primary text-black' : 'text-zinc-500'}`}>Inventory</button>
            <button onClick={() => setActiveTab('production')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'production' ? 'bg-primary text-black' : 'text-zinc-500'}`}>Production</button>
        </div>

        <div className="flex gap-3">
            <button onClick={startScanner} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-full text-sm font-bold hover:bg-white/10 flex items-center gap-2 transition-all">
                <Scan className="w-4 h-4 text-primary" /> Scan Item
            </button>
            <button onClick={() => { setEditItem(null); resetForm(); setShowAdd(true); }} className="px-6 py-2.5 bg-primary text-background-dark rounded-full font-bold shadow-glow flex items-center gap-2 transition-all">
                <Plus className="w-4 h-4" /> Add SKU
            </button>
        </div>
      </div>

      {activeTab === 'inventory' ? (
      <div className="flex-1 overflow-y-auto bg-surface-dark border border-white/5 rounded-2xl custom-scrollbar">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-highlight text-zinc-500 uppercase text-xs font-bold tracking-widest sticky top-0 z-10">
              <tr className="border-b border-white/5">
                  <th className="p-6">Item Details</th>
                  <th className="p-6">Location & Supplier</th>
                  <th className="p-6 text-center">Stock Level</th>
                  <th className="p-6 text-right">Value</th>
                  <th className="p-6 text-right">Actions</th>
              </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6">
                    <p className="font-bold text-white text-base">{item.name}</p>
                    <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 border border-white/5">{item.type}</span>
                        {item.barcode && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400 border border-white/5 font-mono flex items-center gap-1"><Barcode className="w-3 h-3"/> {item.barcode}</span>}
                    </div>
                </td>
                <td className="p-6 text-zinc-400 text-xs">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.location || 'Unassigned'}</span>
                        <span className="flex items-center gap-1"><Truck className="w-3 h-3"/> {item.supplier || 'Unknown'}</span>
                    </div>
                </td>
                <td className="p-6 text-center">
                    <div className={`inline-flex flex-col items-center px-3 py-1 rounded-lg ${item.quantity <= item.reorderLevel ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        <span className="font-bold text-lg">{item.quantity}</span>
                        <span className="text-[10px] uppercase font-bold">{item.unit}</span>
                    </div>
                </td>
                <td className="p-6 text-right font-mono text-zinc-300">{formatCurrency(item.cost)}</td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setPrintLabelItem(item)} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors" title="Print Label"><Printer className="w-4 h-4"/></button>
                    <button onClick={() => openEdit(item)} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => deleteInventoryItem(item.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : (
          <div className="flex-1 bg-surface-dark border border-white/5 rounded-2xl p-8 overflow-y-auto custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                  <div className="bg-black/20 p-8 rounded-[2rem] border border-white/5 mb-8">
                      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Hammer className="w-5 h-5 text-primary"/> Run Production Cycle</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          <div>
                              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Select Item to Build</label>
                              <div className="relative">
                                  <select 
                                    className="w-full bg-surface-highlight border border-white/10 rounded-xl p-4 text-white appearance-none focus:outline-none focus:border-primary"
                                    value={prodItem}
                                    onChange={e => { setProdItem(e.target.value); setProdResult(null); }}
                                  >
                                      <option value="" disabled>Choose Finished Good...</option>
                                      {finishedGoods.map(g => <option key={g.id} value={g.id}>{g.name} (In Stock: {g.quantity})</option>)}
                                  </select>
                                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                              </div>
                          </div>
                          <div>
                              <label className="text-xs font-bold text-zinc-500 uppercase block mb-2">Quantity to Produce</label>
                              <input 
                                type="number" 
                                className="w-full bg-surface-highlight border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary" 
                                value={prodQty}
                                onChange={e => { setProdResult(null); setProdQty(Number(e.target.value)); }}
                                min="1"
                              />
                          </div>
                      </div>

                      {prodItem && (
                          <div className="bg-white/5 rounded-xl p-4 mb-6">
                              <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2"><Layers className="w-4 h-4"/> Required Materials</h4>
                              <div className="space-y-2">
                                  {inventory.find(i => i.id === prodItem)?.bom?.map((b, idx) => {
                                      const rawMat = inventory.find(r => r.name === b.itemName);
                                      const totalReq = b.qty * prodQty;
                                      const hasStock = (rawMat?.quantity || 0) >= totalReq;
                                      return (
                                          <div key={idx} className="flex justify-between items-center text-sm p-2 bg-black/20 rounded-lg">
                                              <span className="text-zinc-300">{b.itemName}</span>
                                              <div className="flex items-center gap-4">
                                                  <span className="text-zinc-500 text-xs">Requires: <span className="text-white font-bold">{totalReq}</span></span>
                                                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${hasStock ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                                      Stock: {rawMat?.quantity || 0}
                                                  </span>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>
                      )}

                      <button 
                        onClick={executeProduction}
                        className="w-full py-4 bg-primary text-black font-black uppercase text-sm tracking-widest rounded-xl shadow-glow hover:scale-[1.01] active:scale-95 transition-all"
                      >
                          Confirm & Build
                      </button>

                      {prodResult && (
                          <div className={`mt-4 p-4 rounded-xl text-center font-bold text-sm ${prodResult.success ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {prodResult.message}
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Add/Edit Modal */}
      {(showAdd) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-2xl font-black text-white">{editItem ? 'Edit SKU' : 'New Inventory Item'}</h3>
                  <button onClick={() => setShowAdd(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="flex-1 space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Item Name</label>
                          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Teak Wood Grade A" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Category Type</label>
                          <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary appearance-none">
                              <option value="Raw Material">Raw Material</option>
                              <option value="Finished Good">Finished Good</option>
                              <option value="Consumable">Consumable</option>
                          </select>
                      </div>
                  </div>

                  {/* Stock & Cost */}
                  <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Quantity</label>
                          <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Unit</label>
                          <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="pcs/kg" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Unit Cost</label>
                          <input type="number" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                      </div>
                  </div>

                  {/* Logistics */}
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-4">
                      <h4 className="text-xs font-black uppercase text-zinc-400 flex items-center gap-2"><Truck className="w-4 h-4"/> Logistics Data</h4>
                      <div className="grid grid-cols-2 gap-4">
                          <input value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="Warehouse Location (Aisle/Bin)" className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary" />
                          <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} placeholder="Supplier Name" className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary" />
                          <input value={form.batchNumber} onChange={e => setForm({...form, batchNumber: e.target.value})} placeholder="Batch No" className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary" />
                          <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary" />
                      </div>
                  </div>

                  {/* Barcode & BOM */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-zinc-500 ml-2">Barcode / SKU</label>
                          <div className="flex gap-2">
                              <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} className="flex-1 bg-background-dark border border-white/10 rounded-xl p-3 text-white font-mono text-sm focus:outline-none focus:border-primary" placeholder="Scan or Generate" />
                              <button onClick={generateBarcode} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-400 hover:text-white" title="Generate New"><Barcode className="w-5 h-5"/></button>
                          </div>
                      </div>
                      
                      {/* BOM Section */}
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                          <label className="text-[10px] font-black uppercase text-zinc-400 block mb-2 flex items-center gap-2"><Layers className="w-3 h-3"/> Bill of Materials (BOM)</label>
                          <div className="flex gap-2 mb-2">
                              <input value={bomItemName} onChange={e => setBomItemName(e.target.value)} placeholder="Sub-item Name" className="flex-1 bg-background-dark border border-white/10 rounded-lg p-2 text-xs text-white" />
                              <input type="number" value={bomItemQty} onChange={e => setBomItemQty(Number(e.target.value))} placeholder="Qty" className="w-16 bg-background-dark border border-white/10 rounded-lg p-2 text-xs text-white" />
                              <button onClick={addBomItem} className="p-2 bg-primary text-black rounded-lg hover:opacity-90"><Plus className="w-3 h-3"/></button>
                          </div>
                          <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
                              {form.bom?.map((b, i) => (
                                  <div key={i} className="flex justify-between text-xs bg-black/20 p-1.5 rounded px-2">
                                      <span className="text-zinc-300">{b.itemName}</span>
                                      <span className="text-primary font-bold">x{b.qty}</span>
                                  </div>
                              ))}
                              {(!form.bom || form.bom.length === 0) && <p className="text-[10px] text-zinc-600 italic">No sub-items added.</p>}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5 shrink-0">
                  <button onClick={() => {setShowAdd(false); setEditItem(null);}} className="flex-1 py-4 bg-white/5 rounded-full font-bold text-white border border-white/5 hover:bg-white/10">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-4 bg-primary text-background-dark rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Save Master Record</button>
              </div>
           </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      {showScanner && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black">
              <div className="relative w-full max-w-md aspect-[3/4] bg-black rounded-2xl overflow-hidden border border-white/20">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-primary/50 m-12 rounded-xl flex items-center justify-center">
                      <div className="w-full h-0.5 bg-red-500 animate-pulse"></div>
                  </div>
                  <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
                      <button onClick={simulateScan} className="px-6 py-3 bg-white text-black font-bold rounded-full text-xs uppercase tracking-widest">Simulate Scan</button>
                      <button onClick={stopScanner} className="px-6 py-3 bg-red-600 text-white font-bold rounded-full text-xs uppercase tracking-widest">Close</button>
                  </div>
                  <div className="absolute top-4 left-0 right-0 text-center text-white font-bold text-sm bg-black/50 py-2">Align Barcode in Frame</div>
              </div>
          </div>
      )}

      {/* Label Printing Modal */}
      {printLabelItem && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 p-4">
              <div className="bg-white p-8 rounded-xl text-black text-center w-[300px]">
                  <h3 className="font-bold mb-4">Print Label</h3>
                  <div className="border-2 border-black p-4 inline-block mb-4">
                      <p className="font-black text-lg">{printLabelItem.name}</p>
                      <p className="font-mono text-sm">{printLabelItem.barcode || 'NO-BARCODE'}</p>
                      <p className="text-xs font-bold mt-2">{formatCurrency(printLabelItem.cost)}</p>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => window.print()} className="flex-1 py-2 bg-black text-white font-bold rounded-lg flex items-center justify-center gap-2"><Printer className="w-4 h-4"/> Print</button>
                      <button onClick={() => setPrintLabelItem(null)} className="flex-1 py-2 bg-gray-200 text-black font-bold rounded-lg">Close</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
