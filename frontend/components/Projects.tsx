
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { Plus, X, Edit2, Trash2, Search, Calendar, DollarSign, Briefcase, ChevronRight, FolderOpen, MapPin, FileText, Image, CreditCard } from 'lucide-react';
import { Project } from '../types';
import toast from 'react-hot-toast';

export const Projects: React.FC = () => {
   const { user: currentUser } = useAuth();
   const { data: projData, isLoading, isError, error } = useProjects();
   const createProject = useCreateProject();
   const updateProjectMut = useUpdateProject();
   const deleteProjectMut = useDeleteProject();

   const projects: Project[] = Array.isArray(projData?.data || projData) ? (projData?.data || projData) as Project[] : [];

   const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [filterStage, setFilterStage] = useState('All');

   const [newProject, setNewProject] = useState({ name: '', client: '', budget: 0, dimensions: '', description: '', siteAddress: '' });

   const stages = ['Concept', 'Design', 'Procurement', 'Execution', 'Handover'];
   const uniqueStages = Array.from(new Set(projects.map(p => p.currentStage)));

   const filteredProjects = projects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStage = filterStage === 'All' || p.currentStage === filterStage;
      return matchesSearch && matchesStage;
   });

   const handleCreate = () => {
      if (newProject.name && newProject.client) {
         createProject.mutate({
            name: newProject.name,
            client: newProject.client,
            stages: ['Concept', 'Design', 'Procurement', 'Execution', 'Handover'],
            currentStage: 'Concept',
            progress: 0,
            dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            budget: Number(newProject.budget),
            dimensions: newProject.dimensions,
            description: newProject.description,
            siteAddress: newProject.siteAddress,
            files: [],
            referenceImages: [],
            payments: []
         } as any, {
            onSuccess: () => {
               setShowAddModal(false);
               setNewProject({ name: '', client: '', budget: 0, dimensions: '', description: '', siteAddress: '' });
            }
         });
      }
   };

   const handleDelete = (id: string) => {
      if (confirm('Delete this project?')) {
         deleteProjectMut.mutate(id as any);
         if (selectedProject?.id === id) setSelectedProject(null);
      }
   };

   if (isLoading) {
      return (
         <div className="h-full flex flex-col p-6 space-y-6">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
         </div>
      );
   }

   if (isError) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 font-bold mb-2">Failed to load projects</p>
               <p className="text-slate-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
         </div>
      );
   }

   // Detailed Project View
   if (selectedProject) {
      const p = selectedProject;
      const totalPaid = (p.payments || []).reduce((sum: number, pay: any) => sum + pay.amount, 0);
      const stageIdx = stages.indexOf(p.currentStage);

      return (
         <div className="h-full flex flex-col overflow-y-auto pr-2">
            <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-sm text-indigo-600 hover:underline mb-4">
               ← Back to Projects
            </button>

            <div className="flex justify-between items-start mb-6">
               <div>
                  <h2 className="text-2xl font-bold text-slate-800">{p.name}</h2>
                  <p className="text-slate-500">{p.client} • {p.currentStage}</p>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 text-red-500 text-sm hover:bg-red-50 rounded-lg">
                     <Trash2 className="w-4 h-4 inline" /> Delete
                  </button>
               </div>
            </div>

            {/* Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
               <h3 className="font-semibold text-slate-800 mb-4">Project Stages</h3>
               <div className="flex items-center gap-2">
                  {stages.map((stage, i) => (
                     <React.Fragment key={stage}>
                        <div className={`flex-1 text-center py-2 rounded-lg text-xs font-medium ${i <= stageIdx ? 'bg-indigo-600 text-slate-800' : 'bg-slate-100 text-slate-400'}`}>
                           {stage}
                        </div>
                        {i < stages.length - 1 && <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />}
                     </React.Fragment>
                  ))}
               </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <DollarSign className="w-5 h-5 text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{formatCurrency(p.budget || 0)}</p>
                  <p className="text-xs text-slate-500">Budget</p>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <CreditCard className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs text-slate-500">Collected</p>
               </div>
               <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <Calendar className="w-5 h-5 text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{p.dueDate || 'TBD'}</p>
                  <p className="text-xs text-slate-500">Due Date</p>
               </div>
            </div>

            {/* Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="font-semibold text-slate-800 mb-4">Details</h3>
               <div className="grid grid-cols-2 gap-4 text-sm text-slate-600">
                  {p.dimensions && <div><span className="font-medium text-slate-700">Dimensions:</span> {p.dimensions}</div>}
                  {p.siteAddress && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.siteAddress}</div>}
                  {p.description && <div className="col-span-2"><span className="font-medium text-slate-700">Description:</span> {p.description}</div>}
               </div>
            </div>
         </div>
      );
   }

   // Projects List View
   return (
      <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Projects</h2>
            <button
               onClick={() => setShowAddModal(true)}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-slate-800 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
            >
               <Plus className="w-4 h-4" /> New Project
            </button>
         </div>

         {/* Filters */}
         <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm" placeholder="Search projects..." />
            </div>
            <select value={filterStage} onChange={e => setFilterStage(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600">
               <option value="All">All Stages</option>
               {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
         </div>

         {/* Projects Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
            {filteredProjects.map(project => (
               <div key={project.id} onClick={() => setSelectedProject(project)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 cursor-pointer hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{project.name}</h3>
                        <p className="text-sm text-slate-500">{project.client}</p>
                     </div>
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.currentStage === 'Handover' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                        {project.currentStage}
                     </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                     <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${project.progress || 0}%` }} />
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                     <span>{formatCurrency(project.budget || 0)}</span>
                     <span>{project.dueDate || 'No due date'}</span>
                  </div>

                  <div className="flex justify-end mt-2">
                     <button onClick={(e) => { e.stopPropagation(); handleDelete(project.id); }} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {/* Add Project Modal */}
         {showAddModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">New Project</h3>
                     <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="space-y-3">
                     <input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Project Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newProject.client} onChange={e => setNewProject({ ...newProject, client: e.target.value })} placeholder="Client Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input type="number" value={newProject.budget || ''} onChange={e => setNewProject({ ...newProject, budget: Number(e.target.value) })} placeholder="Budget" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newProject.dimensions} onChange={e => setNewProject({ ...newProject, dimensions: e.target.value })} placeholder="Dimensions (e.g., 20x30 ft)" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newProject.siteAddress} onChange={e => setNewProject({ ...newProject, siteAddress: e.target.value })} placeholder="Site Address" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <textarea value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} placeholder="Description" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm h-20" />
                  </div>
                  <button
                     onClick={handleCreate}
                     disabled={createProject.isPending}
                     className="w-full mt-4 bg-indigo-600 text-slate-800 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                     {createProject.isPending ? 'Creating...' : 'Create Project'}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};
