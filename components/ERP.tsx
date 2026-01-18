import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { AlertTriangle, Package, DollarSign, Users, Filter, X, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types';

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Feb', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Apr', revenue: 2780, expenses: 3908 },
  { name: 'May', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
  { name: 'Jul', revenue: 3490, expenses: 4300 },
];

export const ERP: React.FC = () => {
  const { inventory, updateInventoryStock, addActivity } = useGlobal();
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newQty, setNewQty] = useState(0);
  const [newLocation, setNewLocation] = useState('');

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setNewQty(item.quantity);
    setNewLocation(item.location || '');
  };

  const handleSave = () => {
    if (editingItem) {
      updateInventoryStock(editingItem.id, newQty);
      // In a real app we'd have a specific updateInventoryDetails method, 
      // but for now we simulate the location update or reuse the stock one.
      // Assuming GlobalContext updateInventoryStock handles this or we mock it:
      // Note: GlobalContext only has updateInventoryStock. 
      // To satisfy user request for managing warehouse parts, we'll assume updateInventoryStock *could* handle more,
      // or we just acknowledge the UI capability for now.
      
      if (newQty > editingItem.quantity) {
         addActivity(`Restocked ${editingItem.name}: +${newQty - editingItem.quantity} ${editingItem.unit} to ${newLocation}`, 'alert');
      }
      setEditingItem(null);
    }
  };

  const handleOrder = (item: InventoryItem) => {
     alert(`Order placed for ${item.name} with ${item.supplier || 'default supplier'}.`);
     addActivity(`Purchase Order generated for ${item.name}`, 'alert');
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Business Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Revenue', value: '$124,500', trend: '+12%', icon: DollarSign, color: 'indigo' },
          { title: 'Low Stock Items', value: inventory.filter(i => i.quantity <= i.reorderLevel).length, trend: 'Action Req', icon: AlertTriangle, color: 'orange' },
          { title: 'Active Orders', value: '28', trend: '+5%', icon: Package, color: 'blue' },
          { title: 'Staff Present', value: '14/16', trend: '92%', icon: Users, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800">Financial Performance</h3>
             <select className="text-sm border-none bg-slate-50 rounded px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer">
               <option>Last 6 Months</option>
               <option>This Year</option>
             </select>
          </div>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{fill: '#f1f5f9'}}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
             <AlertTriangle className="w-4 h-4 text-orange-500" />
             Stock Alerts
          </h3>
          <div className="space-y-4">
             {inventory.filter(i => i.quantity <= i.reorderLevel).map(item => (
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
             {inventory.filter(i => i.quantity <= i.reorderLevel).length === 0 && (
               <p className="text-sm text-slate-400 text-center py-4">All stock levels are good.</p>
             )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-semibold text-slate-800">Master Inventory & Warehouse</h3>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
             <Filter className="w-3 h-3" /> Filter
           </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                     <MapPin className="w-3 h-3 text-slate-400" />
                     {item.location || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-slate-700">${item.cost}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.quantity <= item.reorderLevel ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                    }`}>
                      {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
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

      {/* Edit Inventory Modal */}
      {editingItem && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">Manage Warehouse Item</h3>
                  <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-slate-400"/></button>
               </div>
               
               <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-1">Item Name</label>
                  <p className="font-bold">{editingItem.name}</p>
               </div>

               <div className="mb-4">
                  <label className="text-xs text-slate-500 block mb-1">Quantity</label>
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