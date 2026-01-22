
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Project, ProjectPayment } from '../types';
import { 
  Plus, Search, MapPin, Calendar, Trash2, Maximize2, FileText, Image as ImageIcon, Ruler, Clock, CheckCircle2, ChevronRight, X, Eye, DollarSign, Upload, Save, Edit2, Wallet
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, addProject, updateProject, deleteProject, currentUser, formatCurrency } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State for Selected Project
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'financials'>('details');

  const [newProject, setNewProject] = useState<Partial<Project>>({ 
    name: '', client: '', budget: 0, dimensions: '', description: '', siteAddress: '' 
  });

  // Payment Form & State
  const [payAmount, setPayAmount] = useState<string>('');
  const [payNote, setPayNote] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);

  // Role Security Check
  const canSeeBudget = currentUser?.roleId === 'admin' || currentUser?.roleId === 'finance';

  const handleCreate = () => {
     if(newProject.name && newProject.client) {
        addProject({
           id: Math.random().toString(36).substr(2, 9),
           name: newProject.name,
           client: newProject.client,
           stages: ['Concept', 'Design', 'Procurement', 'Execution', 'Handover'],
           currentStage: 'Concept',
           progress: 0,
           dueDate: new Date(Date.now() + 60*24*60*60*1000).toISOString().split('T')[0],
           budget: Number(newProject.budget),
           dimensions: newProject.dimensions,
           description: newProject.description,
           siteAddress: newProject.siteAddress,
           files: [],
           referenceImages: [],
           payments: []
        } as Project);
        setShowAddModal(false);
        setNewProject({ name: '', client: '', budget: 0, dimensions: '', description: '', siteAddress: '' });
     }
  };

  const handleUpdate = () => {
      if (editForm && selectedProject) {
          updateProject(selectedProject.id, editForm);
          setSelectedProject(editForm);
          setIsEditing(false);
      }
  };

  const handlePaymentSubmit = () => {
      if (!payAmount || !selectedProject) return;

      const amountVal = Number(payAmount);
      let updatedPayments = [...(selectedProject.payments || [])];

      if (editingPaymentId) {
          // Update existing
          updatedPayments = updatedPayments.map(p => p.id === editingPaymentId ? { ...p, amount: amountVal, note: payNote || p.note } : p);
      } else {
          // Create new
          const payment: ProjectPayment = {
              id: Math.random().toString(36).substr(2, 9),
              amount: amountVal,
              date: new Date().toLocaleDateString(),
              note: payNote || 'Partial Entry',
              method: 'Bank Transfer'
          };
          updatedPayments.push(payment);
      }

      const updatedProject = { ...selectedProject, payments: updatedPayments };
      updateProject(selectedProject.id, updatedProject);
      setSelectedProject(updatedProject);
      
      // Reset
      setPayAmount('');
      setPayNote('');
      setEditingPaymentId(null);
  };

  const editPayment = (p: ProjectPayment) => {
      setEditingPaymentId(p.id);
      setPayAmount(p.amount.toString());
      setPayNote(p.note);
  };

  const deletePayment = (pid: string) => {
      if (!selectedProject) return;
      const updatedPayments = selectedProject.payments?.filter(p => p.id !== pid) || [];
      const updatedProject = { ...selectedProject, payments: updatedPayments };
      updateProject(selectedProject.id, updatedProject);
      setSelectedProject(updatedProject);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'doc' | 'img') => {
      if (e.target.files && editForm) {
          const files: File[] = Array.from(e.target.files);
          const urls = files.map(f => URL.createObjectURL(f));
          
          if (type === 'img') {
              setEditForm({ ...editForm, referenceImages: [...(editForm.referenceImages || []), ...urls] });
          } else {
              const names = files.map(f => f.name);
              setEditForm({ ...editForm, files: [...(editForm.files || []), ...names] });
          }
      }
  };
  
  const toggleStage = (stage: string) => {
      if (!editForm) return;
      const stageIdx = editForm.stages.indexOf(stage);
      const newProgress = Math.round(((stageIdx) / (editForm.stages.length - 1)) * 100);
      setEditForm({ ...editForm, currentStage: stage, progress: newProgress });
  };

  const startEdit = () => {
      setEditForm(selectedProject);
      setIsEditing(true);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.client.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-dark">
      {/* Module Header */}
      <header className="p-8 pb-4 border-b border-white/5 bg-surface-dark/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter">Site Workspace</h2>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage sites, references, and installations</p>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search sites..." 
                className="w-full bg-surface-dark border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)} 
              className="px-8 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-all"
            >
              + Launch Project
            </button>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {filteredProjects.map(p => (
            <article 
              key={p.id} 
              onClick={() => setSelectedProject(p)}
              className="group bg-surface-dark border border-white/5 rounded-[2rem] overflow-hidden hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-xl relative flex flex-col"
            >
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={p.referenceImages?.[0] || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60" 
                  alt={p.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-primary uppercase tracking-widest border border-white/5">
                   {p.currentStage}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-bold text-white tracking-tight leading-tight">{p.name}</h3>
                   <button 
                     onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                     className="text-zinc-600 hover:text-red-500 transition-colors"
                   >
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
                <div className="flex items-center gap-2 text-zinc-500 text-xs font-bold mb-4">
                  <MapPin className="w-3 h-3" /> {p.siteAddress || 'Location Pending'}
                </div>

                <div className="mt-auto space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-600">
                       <span>Progress</span>
                       <span className="text-primary">{p.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-primary shadow-glow transition-all duration-1000" style={{ width: `${p.progress}%` }}></div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                       <span className="text-xs font-bold text-zinc-300">{p.dueDate}</span>
                    </div>
                    {canSeeBudget && (
                      <span className="text-sm font-bold text-white font-mono">{formatCurrency(p.budget)}</span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Detailed Project Workspace Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10">
          <div className="bg-surface-dark border border-white/10 rounded-[3rem] w-full max-w-7xl h-full flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-start shrink-0">
               <div className="flex gap-6 items-center">
                  <div className="size-20 rounded-[1.5rem] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Maximize2 className="w-10 h-10" />
                  </div>
                  <div>
                    {isEditing ? (
                        <input 
                            value={editForm?.name} 
                            onChange={e => setEditForm(prev => prev ? {...prev, name: e.target.value} : null)}
                            className="text-3xl font-black text-white tracking-tighter uppercase bg-transparent border-b border-white/20 focus:border-primary outline-none w-full mb-2"
                        />
                    ) : (
                        <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedProject.name}</h3>
                    )}
                    
                    <div className="flex gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
                          <MapPin className="w-3.5 h-3.5" /> 
                          {isEditing ? <input value={editForm?.siteAddress} onChange={e => setEditForm(prev => prev ? {...prev, siteAddress: e.target.value} : null)} className="bg-transparent border-b border-white/20 text-white w-40" /> : selectedProject.siteAddress}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold">
                          <Clock className="w-3.5 h-3.5" /> Est. Handover: 
                          {isEditing ? <input type="date" value={editForm?.dueDate} onChange={e => setEditForm(prev => prev ? {...prev, dueDate: e.target.value} : null)} className="bg-transparent border-b border-white/20 text-white ml-2" /> : selectedProject.dueDate}
                      </div>
                    </div>
                  </div>
               </div>
               <div className="flex gap-4">
                 <div className="flex bg-white/5 rounded-full p-1 border border-white/5">
                     <button onClick={() => setActiveTab('details')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'details' ? 'bg-primary text-black shadow-glow' : 'text-zinc-500'}`}>Overview</button>
                     <button onClick={() => setActiveTab('financials')} className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'financials' ? 'bg-primary text-black shadow-glow' : 'text-zinc-500'}`}>Financials</button>
                 </div>
                 {!isEditing ? (
                     <button onClick={startEdit} className="px-6 py-3 bg-white/5 text-white font-bold rounded-full hover:bg-white/10 flex items-center gap-2">
                         <Edit2 className="w-4 h-4" /> Edit Project
                     </button>
                 ) : (
                     <button onClick={handleUpdate} className="px-6 py-3 bg-primary text-black font-bold rounded-full shadow-glow flex items-center gap-2">
                         <Save className="w-4 h-4" /> Save Changes
                     </button>
                 )}
                 <button onClick={() => { setSelectedProject(null); setIsEditing(false); }} className="size-12 bg-white/5 hover:bg-red-500/20 rounded-full flex items-center justify-center text-zinc-500 hover:text-red-500 transition-all">
                   <X className="w-6 h-6" />
                 </button>
               </div>
            </div>

            {/* Modal Body */}
            {activeTab === 'details' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 grid grid-cols-1 xl:grid-cols-3 gap-10">
                   {/* Left Column: Details & Finances */}
                   <div className="space-y-8">
                      <div className="bg-surface-darker p-8 rounded-[2rem] border border-white/5">
                         <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6">Site Specifications</h4>
                         <div className="space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><Ruler className="w-5 h-5" /></div>
                               <div className="flex-1">
                                   <p className="text-[10px] font-black text-zinc-500 uppercase">Dimensions</p>
                                   {isEditing ? <input value={editForm?.dimensions} onChange={e => setEditForm(prev => prev ? {...prev, dimensions: e.target.value} : null)} className="bg-transparent border-b border-white/20 text-white w-full font-bold" /> : <p className="text-white font-bold">{selectedProject.dimensions || 'No dimensions recorded'}</p>}
                               </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-400"><FileText className="w-5 h-5" /></div>
                               <div className="flex-1">
                                   <p className="text-[10px] font-black text-zinc-500 uppercase">Client</p>
                                   {isEditing ? <input value={editForm?.client} onChange={e => setEditForm(prev => prev ? {...prev, client: e.target.value} : null)} className="bg-transparent border-b border-white/20 text-white w-full font-bold" /> : <p className="text-white font-bold">{selectedProject.client}</p>}
                               </div>
                            </div>
                            {canSeeBudget && (
                              <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                                 <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary"><DollarSign className="w-5 h-5" /></div>
                                 <div className="flex-1">
                                     <p className="text-[10px] font-black text-primary/60 uppercase">Project Worth</p>
                                     {isEditing ? <input type="number" value={editForm?.budget} onChange={e => setEditForm(prev => prev ? {...prev, budget: Number(e.target.value)} : null)} className="bg-transparent border-b border-primary/30 text-white w-full text-xl font-mono font-bold" /> : <p className="text-white text-xl font-mono font-bold">{formatCurrency(selectedProject.budget)}</p>}
                                 </div>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="bg-surface-darker p-8 rounded-[2rem] border border-white/5">
                         <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6">Execution Roadmap</h4>
                         <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                            {(isEditing ? editForm?.stages : selectedProject.stages)?.map((stage, idx) => {
                               const currentS = isEditing ? editForm?.currentStage : selectedProject.currentStage;
                               const stagesList = isEditing ? editForm?.stages! : selectedProject.stages;
                               const isDone = stagesList.indexOf(currentS!) >= idx;
                               const isCurrent = currentS === stage;
                               return (
                                 <div 
                                    key={stage} 
                                    className={`flex gap-6 items-start relative ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                                    onClick={() => isEditing && toggleStage(stage)}
                                 >
                                    <div className={`size-10 rounded-full flex items-center justify-center z-10 border-2 transition-all ${isDone ? 'bg-primary border-primary text-black' : 'bg-background-dark border-white/10 text-zinc-700'}`}>
                                       {isDone ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-bold text-sm">{idx+1}</span>}
                                    </div>
                                    <div className="flex-1">
                                       <p className={`font-black text-sm uppercase tracking-widest ${isDone ? 'text-white' : 'text-zinc-600'}`}>{stage}</p>
                                       {isCurrent && <p className="text-[10px] text-primary font-bold">Currently Active</p>}
                                    </div>
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                   </div>

                   {/* Center Column: Gallery & References */}
                   <div className="xl:col-span-2 space-y-8">
                      <div className="bg-surface-darker p-8 rounded-[3rem] border border-white/5 h-fit">
                         <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Visual References & Site Photos</h4>
                            {isEditing && (
                                <div className="relative overflow-hidden">
                                    <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline pointer-events-none"><Plus className="w-3 h-3"/> Add Media</button>
                                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'img')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            )}
                         </div>
                         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {((isEditing ? editForm?.referenceImages : selectedProject.referenceImages) || []).length > 0 ? (
                              (isEditing ? editForm?.referenceImages : selectedProject.referenceImages)?.map((img, i) => (
                                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 group relative">
                                   <img src={img} className="w-full h-full object-cover" alt="Site reference" />
                                   <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="w-6 h-6 text-white" />
                                   </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10 flex flex-col items-center justify-center text-zinc-600">
                                 <ImageIcon className="w-12 h-12 mb-4 opacity-20" />
                                 <p className="text-sm font-bold">No references uploaded yet</p>
                              </div>
                            )}
                         </div>
                      </div>

                      <div className="bg-surface-darker p-8 rounded-[3rem] border border-white/5 h-fit">
                         <div className="flex justify-between items-center mb-6">
                            <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Project Documentation</h4>
                            {isEditing && (
                                <div className="relative overflow-hidden">
                                    <button className="text-primary text-xs font-bold flex items-center gap-1 hover:underline pointer-events-none"><Upload className="w-3 h-3"/> Upload Doc</button>
                                    <input type="file" multiple accept=".pdf,.doc,.docx" onChange={(e) => handleFileUpload(e, 'doc')} className="absolute inset-0 opacity-0 cursor-pointer" />
                                </div>
                            )}
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {((isEditing ? editForm?.files : selectedProject.files) || []).length > 0 ? (
                               (isEditing ? editForm?.files : selectedProject.files)?.map(file => (
                                  <div key={file} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all cursor-pointer group">
                                     <div className="size-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-primary"><FileText className="w-6 h-6" /></div>
                                     <div className="flex-1 overflow-hidden">
                                        <p className="text-white text-sm font-bold truncate">{file}</p>
                                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Document</p>
                                     </div>
                                     <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-primary" />
                                  </div>
                               ))
                            ) : (
                               <p className="col-span-full text-center text-zinc-700 py-6 italic text-sm">Clear</p>
                            )}
                         </div>
                      </div>

                      <div className="bg-primary/10 p-8 rounded-[3rem] border border-primary/10">
                         <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4">Designer's Notes</h4>
                         {isEditing ? (
                             <textarea 
                                 value={editForm?.description} 
                                 onChange={e => setEditForm(prev => prev ? {...prev, description: e.target.value} : null)}
                                 className="w-full bg-transparent text-zinc-300 leading-relaxed italic border border-white/10 rounded-xl p-4 h-32 outline-none focus:border-primary"
                             />
                         ) : (
                             <p className="text-zinc-300 leading-relaxed italic">
                                {selectedProject.description || 'No site descriptions or designer notes have been added to this project yet.'}
                             </p>
                         )}
                      </div>
                   </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="bg-surface-darker p-8 rounded-[2rem] border border-white/5 max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-white">Project Financials</h3>
                            <div className="text-right">
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Total Contract Value</p>
                                <p className="text-2xl font-black text-white font-mono">{formatCurrency(selectedProject.budget)}</p>
                            </div>
                        </div>

                        {/* Add Payment Form */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5 mb-8">
                            <h4 className="text-sm font-bold text-primary uppercase tracking-widest mb-4">{editingPaymentId ? 'Edit Entry' : 'Record New Partial Payment'}</h4>
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block">Amount Received</label>
                                    <input 
                                        type="number" 
                                        value={payAmount} 
                                        onChange={e => setPayAmount(e.target.value)} 
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" 
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2 mb-1 block">Note / Reference</label>
                                    <input 
                                        value={payNote} 
                                        onChange={e => setPayNote(e.target.value)} 
                                        className="w-full bg-surface-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" 
                                        placeholder="Advance / 1st Installment"
                                    />
                                </div>
                                <button onClick={handlePaymentSubmit} className="px-6 py-3 bg-primary text-black font-bold rounded-xl shadow-glow">
                                    {editingPaymentId ? 'Update' : 'Add Entry'}
                                </button>
                                {editingPaymentId && (
                                    <button onClick={() => { setEditingPaymentId(null); setPayAmount(''); setPayNote(''); }} className="px-4 py-3 bg-white/5 text-white font-bold rounded-xl">Cancel</button>
                                )}
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Payment Ledger</h4>
                                <p className="text-xs font-bold text-zinc-500">
                                    Received: <span className="text-primary">{formatCurrency((selectedProject.payments || []).reduce((sum, p) => sum + p.amount, 0))}</span>
                                    <span className="mx-2">•</span>
                                    Pending: <span className="text-red-400">{formatCurrency(selectedProject.budget - (selectedProject.payments || []).reduce((sum, p) => sum + p.amount, 0))}</span>
                                </p>
                            </div>
                            {(selectedProject.payments || []).length > 0 ? (
                                selectedProject.payments?.map(p => (
                                    <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 group">
                                        <div>
                                            <p className="font-bold text-white">{p.note}</p>
                                            <p className="text-xs text-zinc-500">{p.date} • {p.method}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <p className="font-mono font-bold text-primary text-lg">{formatCurrency(p.amount)}</p>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => editPayment(p)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-zinc-300 hover:text-white"><Edit2 className="w-4 h-4"/></button>
                                                <button onClick={() => deletePayment(p.id)} className="p-2 bg-white/10 hover:bg-red-500/20 rounded-lg text-zinc-300 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-zinc-600 italic">No payments recorded yet.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal Actions */}
            <div className="p-8 border-t border-white/5 bg-surface-dark/50 flex justify-end gap-4 shrink-0">
               <button onClick={() => { setSelectedProject(null); setIsEditing(false); }} className="px-10 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-all">Return to Dashboard</button>
            </div>
          </div>
        </div>
      )}

      {/* Launch New Project Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl space-y-8 flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center">
                 <h3 className="text-3xl font-black text-white tracking-tight uppercase">Launch Site</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Site/Project Name</label>
                       <input 
                          className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none" 
                          placeholder="Oberoi Apartment Interior" 
                          value={newProject.name} 
                          onChange={e => setNewProject({...newProject, name: e.target.value})} 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Client Identity</label>
                       <input 
                          className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none" 
                          placeholder="Client Full Name" 
                          value={newProject.client} 
                          onChange={e => setNewProject({...newProject, client: e.target.value})} 
                       />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Site Address</label>
                    <input 
                       className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none" 
                       placeholder="Full address of the site" 
                       value={newProject.siteAddress} 
                       onChange={e => setNewProject({...newProject, siteAddress: e.target.value})} 
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Dimensions / Sizing</label>
                       <input 
                          className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none" 
                          placeholder="e.g. 1500 sqft / 3BHK" 
                          value={newProject.dimensions} 
                          onChange={e => setNewProject({...newProject, dimensions: e.target.value})} 
                       />
                    </div>
                    {canSeeBudget && (
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Contract Budget (Worth)</label>
                         <input 
                            type="number"
                            className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none" 
                            placeholder="0.00" 
                            value={newProject.budget || ''} 
                            onChange={e => setNewProject({...newProject, budget: Number(e.target.value)})} 
                         />
                      </div>
                    )}
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4 tracking-widest">Project Brief / Notes</label>
                    <textarea 
                       className="w-full bg-background-dark border border-white/10 rounded-[1.5rem] px-8 py-4 text-white focus:ring-1 focus:ring-primary outline-none h-32 resize-none" 
                       placeholder="Enter detailed site requirements or aesthetic directions..." 
                       value={newProject.description} 
                       onChange={e => setNewProject({...newProject, description: e.target.value})} 
                    />
                 </div>
              </div>

              <div className="flex gap-4 pt-4 shrink-0">
                 <button onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-full border border-white/10">Abort</button>
                 <button 
                    onClick={handleCreate} 
                    className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow active:scale-95 transition-all"
                 >
                    Confirm Launch
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
