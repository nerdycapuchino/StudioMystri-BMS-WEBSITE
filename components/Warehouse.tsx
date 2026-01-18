import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { AlertTriangle, Package, DollarSign, Users, Filter, X, MapPin, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types';

export const Warehouse: React.FC = () => {
  const { inventory, updateInventoryStock, addActivity, currency, formatCurrency } = useGlobal();
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [newLocation, setNewLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);
  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setNewQty(item.quantity);
    setNewLocation(item.location || '');
  };

  const handleSave = () => {
    if (editingItem) {
      updateInventoryStock(editingItem.id, newQty);
      // In a real app, update location too. For now we assume stock is the main tracked numeric.
      // Ideally we would add updateInventoryDetails(id, { quantity, location }) to GlobalContext.
      
      if (newQty > editingItem.quantity) {
         addActivity(`Restocked ${editingItem.name}: +${newQty - editingItem.quantity} ${editingItem.unit} to ${newLocation}`, 'alert');
      }
      setEditingItem(null);
    }
  };

  const handleOrder = (item: InventoryItem) => {
     alert(`Purchase Order generated for ${item.name} with ${item.supplier || 'Primary Supplier'}.\nRef: PO-${Math.floor(Math.random()*10000)}`);
     addActivity(`Purchase Order generated for ${item.name}`, 'alert');
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto relative pb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Warehouse & Inventory</h2>
           <p className="text-slate-500 text-sm">Manage stock levels, locations, and reordering.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
              <input 
                placeholder="Search Item or Location..." 
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <button className="flex items-center gap-2 px-3 py-2 border bg-white rounded-lg text-sm hover:bg-slate-50">
             <Filter className="w-4 h-4" /> Filter
           </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><Package className="w-6 h-6"/></div>
           <div><p className="text-sm text-slate-500">Total SKU Count</p><h3 className="text-2xl font-bold">{inventory.length}</h3></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
           <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><AlertTriangle className="w-6 h-6"/></div>
           <div><p className="text-sm text-slate-500">Low Stock Alerts</p><h3 className="text-2xl font-bold">{lowStockItems.length}</h3></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
           <div className="p-3 bg-green-50 text-green-600 rounded-lg"><DollarSign className="w-6 h-6"/></div>
           <div><p className="text-sm text-slate-500">Inventory Value</p><h3 className="text-2xl font-bold">{formatCurrency(inventory.reduce((sum, i) => sum + (i.cost * i.quantity), 0))}</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 h-96 overflow-y-auto">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <AlertTriangle className="w-4 h-4 text-orange-500" />
             Critical Stock
          </h3>
          <div className="space-y-4">
             {lowStockItems.length === 0 && <p className="text-sm text-slate-400 text-center mt-10">Stock levels are healthy.</p>}
             {lowStockItems.map(item => (
               <div key={item.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                 <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm font-bold text-xs shrink-0">
                   {item.quantity}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-medium text-slate-800 truncate">{item.name}</h4>
                   <p className="text-xs text-slate-500">Below level ({item.reorderLevel})</p>
                 </div>
                 <button onClick={() => handleOrder(item)} className="text-xs bg-white text-orange-600 px-2 py-1 rounded border border-orange-200 font-medium hover:bg-orange-100">
                   Order
                 </button>
               </div>
             ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-96">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
             <h3 className="font-semibold text-slate-800">Master Stock List</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 font-medium sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                       <MapPin className="w-3 h-3 text-slate-400" />
                       {item.location || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                    <td className="px-4 py-3 text-slate-700">{formatCurrency(item.cost * item.quantity)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.quantity <= item.reorderLevel ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {item.quantity <= item.reorderLevel ? 'Low Stock' : 'Good'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                       <button onClick={() => handleEditClick(item)} className="text-indigo-600 cursor-pointer font-medium hover:underline">Manage</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Inventory Modal */}
      {editingItem && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Manage Item</h3>
                  <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-slate-400"/></button>
               </div>
               
               <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-1">Item Name</label>
                  <p className="font-bold text-lg">{editingItem.name}</p>
               </div>

               <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-1">Quantity ({editingItem.unit})</label>
                  <input 
                     type="number" 
                     value={newQty} 
                     onChange={e => setNewQty(parseInt(e.target.value) || 0)} 
                     className="w-full border p-2 rounded" 
                  />
               </div>

               <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-1">Warehouse Location / Bin</label>
                  <input 
                     type="text" 
                     value={newLocation} 
                     onChange={e => setNewLocation(e.target.value)} 
                     className="w-full border p-2 rounded"
                     placeholder="e.g., Aisle 4, Bin 12" 
                  />
               </div>

               <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">Update Inventory</button>
            </div>
         </div>
      )}
    </div>
  );
};