import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useEmployees } from '../hooks/useHR';
import { Customer } from '../types';
import {
   Plus, X, Edit2, Trash2, Search, Calendar, DollarSign,
   Briefcase, ChevronRight, FolderOpen, MapPin, FileText,
   Image, CreditCard, MoreVertical, UploadCloud, TrendingUp, AlertTriangle, UserPlus
} from 'lucide-react';
import { Project } from '../types';
import toast from 'react-hot-toast';

export const Projects: React.FC = () => {
   const { user: currentUser } = useAuth();
   const { data: projData, isLoading, isError, error } = useProjects();
   const { data: empData } = useEmployees();
   const createProject = useCreateProject();
   const updateProjectMut = useUpdateProject();
   const deleteProjectMut = useDeleteProject();

   const projects: Project[] = Array.isArray(projData?.data || projData) ? (projData?.data || projData) as Project[] : [];
   const employees = Array.isArray(empData?.data || empData) ? (empData?.data || empData) : [];

   const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n || 0);

   const [selectedProject, setSelectedProject] = useState<Project | null>(null);
   const [showAddModal, setShowAddModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [filterStage, setFilterStage] = useState('All');

   const [newProject, setNewProject] = useState({ name: '', client: '', budget: 0, dimensions: '', description: '', siteAddress: '' });

   const stages = ['Concept', 'Design', 'Procurement', 'Execution', 'Handover'];

   const filteredProjects = projects.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.client?.toLowerCase().includes(searchQuery.toLowerCase());
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
               toast.success("Project created successfully");
            }
         });
      } else {
         toast.error("Name and Client are required");
      }
   };

   const handleDelete = (id: string) => {
      if (window.confirm('Are you sure you want to delete this project?')) {
         deleteProjectMut.mutate(id as any, {
            onSuccess: () => {
               toast.success("Project deleted");
               if (selectedProject?.id === id) setSelectedProject(null);
            }
         });
      }
   };

   if (isLoading) {
      return (
         <div className="h-full flex flex-col p-6 space-y-6">
            <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-48" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}
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

   // --- DETAILED PROJECT VIEW (Based on project_detailed_overview template) ---
   if (selectedProject) {
      const p = selectedProject;
      const totalPaid = (p.payments || []).reduce((sum: number, pay: any) => sum + pay.amount, 0);
      const stageIdx = stages.indexOf(p.currentStage || 'Concept');
      const progressPercent = p.progress || Math.round((stageIdx / Math.max(1, stages.length - 1)) * 100);
      const remainingBudget = (p.budget || 0) - totalPaid; // simplified logic
      const isOverBudget = remainingBudget < 0;

      return (
         <div className="h-full flex flex-col w-full overflow-y-auto custom-scrollbar font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-10 py-8 gap-8 flex flex-col">
               {/* Breadcrumb & Header */}
               <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                     <button onClick={() => setSelectedProject(null)} className="hover:text-primary transition-colors cursor-pointer">Projects</button>
                     <ChevronRight className="w-4 h-4" />
                     <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-[200px]">{p.name}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-start gap-4">
                     <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                           <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-bold tracking-tight">{p.name}</h1>
                           <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800 tracking-wide">{p.currentStage}</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Project ID: #{p.id?.substring(0, 6).toUpperCase()} • Due: {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'TBD'}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                           <UploadCloud className="w-4 h-4" /> Upload File
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm">
                           <Trash2 className="w-4 h-4" /> Delete
                        </button>
                        <button onClick={() => { setEditingProject(p); setShowAddModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-primary/20">
                           <Edit2 className="w-4 h-4" /> Edit Project
                        </button>
                     </div>
                  </div>
               </div>

               {/* Main Content Grid */}
               <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-4">

                  {/* Left Column: Main Overview (2/3 width) */}
                  <div className="xl:col-span-2 flex flex-col gap-8">

                     {/* Progress Card */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex justify-between items-end mb-4">
                           <div>
                              <h3 className="text-slate-900 dark:text-white text-lg font-bold">Project Progress</h3>
                              <p className="text-slate-500 dark:text-slate-400 text-sm">Current Phase: {p.currentStage}</p>
                           </div>
                           <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
                        </div>
                        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-6">
                           <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs font-medium text-slate-500 dark:text-slate-400 relative">
                           {stages.map((stage, i) => {
                              const isPast = i <= stageIdx;
                              const isCurrent = i === stageIdx;
                              return (
                                 <div key={stage} className={`flex flex-col gap-1 items-center ${i === 0 ? 'items-start' : i === stages.length - 1 ? 'items-end' : ''} z-10 relative`}>
                                    <span className={`${isCurrent ? 'text-primary font-bold' : isPast ? 'text-slate-900 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{stage}</span>
                                    {isCurrent && <span className="text-primary text-[10px]">Current</span>}
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* Financials Grid */}
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                              <DollarSign className="w-5 h-5 text-slate-400" /> Total Budget
                           </div>
                           <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{formatCurrency(p.budget || 0)}</p>
                           <p className="text-green-600 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" /> Funded
                           </p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                              <CreditCard className="w-5 h-5 text-slate-400" /> Amount Collected
                           </div>
                           <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{formatCurrency(totalPaid)}</p>
                           <p className="text-slate-400 text-xs font-medium">{p.budget ? Math.round((totalPaid / p.budget) * 100) : 0}% of total</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm flex flex-col gap-2">
                           <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                              <Briefcase className="w-5 h-5 text-slate-400" /> Remaining Balance
                           </div>
                           <p className="text-slate-900 dark:text-white text-2xl font-bold tracking-tight">{formatCurrency(remainingBudget)}</p>
                           {isOverBudget ? (
                              <p className="text-red-500 dark:text-red-400 text-xs font-medium flex items-center gap-1">
                                 <AlertTriangle className="w-3.5 h-3.5" /> Over Budget
                              </p>
                           ) : remainingBudget < (p.budget! * 0.2) ? (
                              <p className="text-amber-500 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                                 <AlertTriangle className="w-3.5 h-3.5" /> Tight Margin
                              </p>
                           ) : (
                              <p className="text-green-500 dark:text-green-400 text-xs font-medium flex items-center gap-1">
                                 On Track
                              </p>
                           )}
                        </div>
                     </div>

                     {/* Details Section */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Project Details</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">{p.description || 'No description provided.'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                           <div className="flex gap-3">
                              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                              <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Site Address</p>
                                 <p className="text-sm text-slate-700 dark:text-slate-200">{p.siteAddress || 'N/A'}</p>
                              </div>
                           </div>
                           <div className="flex gap-3">
                              <Briefcase className="w-5 h-5 text-slate-400 shrink-0" />
                              <div>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Dimensions</p>
                                 <p className="text-sm text-slate-700 dark:text-slate-200">{p.dimensions || 'N/A'}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* Document Repository */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                           <h3 className="text-slate-900 dark:text-white text-lg font-bold">Project Files</h3>
                           <a className="text-primary text-sm font-medium hover:underline cursor-pointer">View All</a>
                        </div>
                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 dark:border-slate-700/50 px-6 gap-6 overflow-x-auto hide-scroll">
                           <button className="py-3 text-primary border-b-2 border-primary text-sm font-medium whitespace-nowrap">All Files</button>
                           <button className="py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium whitespace-nowrap">Blueprints</button>
                           <button className="py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium whitespace-nowrap">Site Photos</button>
                           <button className="py-3 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium whitespace-nowrap">Contracts</button>
                        </div>
                        {/* Files Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-slate-50/50 dark:bg-slate-900/20">
                           {(!p.files || p.files.length === 0) && (!p.referenceImages || p.referenceImages.length === 0) ? (
                              <div className="col-span-full py-8 text-center text-slate-400 text-sm">No files uploaded yet.</div>
                           ) : (
                              <>
                                 {/* Render reference images if any */}
                                 {p.referenceImages?.map((img, i) => (
                                    <div key={`img-${i}`} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                                       <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden mb-3">
                                          <img src={img} className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" alt="Reference" />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                       </div>
                                       <div className="flex items-start justify-between">
                                          <div className="min-w-0">
                                             <p className="text-slate-900 dark:text-white text-sm font-medium truncate w-32">Reference_Image_{i + 1}.jpg</p>
                                             <p className="text-slate-500 dark:text-slate-400 text-xs">Image</p>
                                          </div>
                                          <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                       </div>
                                    </div>
                                 ))}
                                 {/* Render other files */}
                                 {p.files?.map((file, i) => (
                                    <div key={`file-${i}`} className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer">
                                       <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 rounded-md overflow-hidden mb-3 flex items-center justify-center">
                                          <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                       </div>
                                       <div className="flex items-start justify-between">
                                          <div className="min-w-0">
                                             <p className="text-slate-900 dark:text-white text-sm font-medium truncate w-32 border">{typeof file === 'string' ? file.split('/').pop() : 'Document.pdf'}</p>
                                             <p className="text-slate-500 dark:text-slate-400 text-xs">Document</p>
                                          </div>
                                          <MoreVertical className="w-4 h-4 text-slate-400 shrink-0" />
                                       </div>
                                    </div>
                                 ))}
                              </>
                           )}
                        </div>
                     </div>
                  </div>

                  {/* Right Column: Sidebar (1/3 width) */}
                  <div className="flex flex-col gap-8">

                     {/* Client Info Card */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Client Details</h3>
                        <div className="flex items-center gap-4 mb-5">
                           <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex flex-shrink-0 items-center justify-center text-primary font-bold text-xl uppercase">
                              {p.client?.substring(0, 2) || 'CL'}
                           </div>
                           <div className="min-w-0">
                              <p className="text-slate-900 dark:text-white text-sm font-semibold truncate" title={p.client}>{p.client}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-xs truncate">{(p as any).clientPhone || 'No phone recorded'}</p>
                           </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                           <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <EnvelopeIcon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="truncate">{(p as any).clientEmail || 'johndoe@email.com'}</span>
                           </div>
                           <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="break-words">{p.siteAddress || 'N/A'}</span>
                           </div>
                        </div>
                     </div>

                     {/* Team Widget (Simulated with random employees for now or real ones if assigned) */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-slate-900 dark:text-white text-lg font-bold">Team Members</h3>
                           <button className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors"><UserPlus className="w-4 h-4" /></button>
                        </div>
                        <div className="flex flex-col gap-5">
                           {/* Render active assignees if we had an array, simulating taking the first 3 employees */}
                           {employees.slice(0, 3).map((emp: any, idx: number) => (
                              <div key={emp.id || idx} className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden">
                                       {emp.profilePictureUrl ? <img src={emp.profilePictureUrl} className="w-full h-full object-cover" alt={emp.name} /> : emp.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                       <p className="text-slate-900 dark:text-white text-sm font-semibold">{emp.name}</p>
                                       <p className="text-slate-500 dark:text-slate-400 text-xs">{emp.role}</p>
                                    </div>
                                 </div>
                                 <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wide rounded border border-slate-200 dark:border-slate-600">Staff</span>
                              </div>
                           ))}
                           {employees.length === 0 && <p className="text-sm text-slate-500 text-center py-2">No team recorded</p>}
                        </div>
                     </div>

                     {/* Recent Activity Feed Placeholder */}
                     <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex-1 mb-8">
                        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-4">Recent Activity</h3>
                        <div className="relative border-l border-slate-200 dark:border-slate-700 ml-2 space-y-6">
                           <div className="ml-6 relative">
                              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"></span>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Project Viewed</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">You accessed the project overview.</p>
                              <p className="text-[10px] text-slate-400 mt-1">Just now</p>
                           </div>
                           <div className="ml-6 relative">
                              <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800 ring-1 ring-slate-200 dark:ring-slate-700"></span>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">Phase Transition</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Project stage updated to <span className="font-semibold">{p.currentStage}</span></p>
                              <p className="text-[10px] text-slate-400 mt-1">Recent</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Edit Modal reusing New Project form style visually later */}
            <ProjectModal
               isOpen={showAddModal}
               onClose={() => { setShowAddModal(false); setEditingProject(null); }}
               projectData={editingProject || newProject}
               setProjectData={editingProject ? setEditingProject : setNewProject}
               onSave={() => editingProject ? handleUpdate(editingProject) : handleCreate()}
               isPending={createProject.isPending || updateProjectMut.isPending}
               isEdit={!!editingProject}
               stages={stages}
            />
         </div>
      );
   }

   // --- PROJECTS LIST VIEW ---
   return (
      <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark font-display">
         <div className="px-6 md:px-10 py-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 shadow-sm z-10">
            <div>
               <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">Project Portfolio</h1>
               <p className="text-sm text-slate-500 dark:text-slate-400">Manage all ongoing and completed architectural projects.</p>
            </div>
            <button
               onClick={() => { setEditingProject(null); setShowAddModal(true); }}
               className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-sm shadow-blue-500/20 active:scale-95 whitespace-nowrap"
            >
               <span className="material-symbols-outlined text-[20px]">add</span>
               New Project
            </button>
         </div>

         {/* Filters Bar */}
         <div className="px-6 md:px-10 py-5 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
            <div className="relative w-full md:max-w-md group">
               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                  <Search className="w-4 h-4" />
               </span>
               <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow"
                  placeholder="Search projects or clients..."
               />
            </div>
            <div className="flex items-center w-full md:w-auto overflow-x-auto pb-1 md:pb-0 gap-2 hide-scroll">
               <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                  <button onClick={() => setFilterStage('All')} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${filterStage === 'All' ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>All Stages</button>
                  {stages.map(s => (
                     <button key={s} onClick={() => setFilterStage(s)} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${filterStage === s ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {s}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Projects Grid */}
         <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/20">
            {filteredProjects.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-80 mt-10">
                  <FolderOpen className="w-16 h-16 mb-4 text-slate-300 dark:text-slate-600" />
                  <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No projects found</p>
                  <p className="text-sm mt-1">Try adjusting your search or filters.</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProjects.map(project => {
                     const isDone = project.currentStage === 'Handover';
                     const progressPct = project.progress || Math.round((stages.indexOf(project.currentStage || 'Concept') / Math.max(1, stages.length - 1)) * 100);

                     return (
                        <div
                           key={project.id}
                           onClick={() => setSelectedProject(project)}
                           className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5 cursor-pointer hover:shadow-md hover:border-primary/50 transition-all group flex flex-col min-h-[220px]"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div className="min-w-0 pr-3">
                                 <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors truncate" title={project.name}>{project.name}</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{project.client}</p>
                              </div>
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${isDone ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-primary/10 text-primary'}`}>
                                 {project.currentStage || 'Start'}
                              </span>
                           </div>

                           <div className="flex-1">
                              <p className="text-xs text-slate-500 dark:text-slate-400 border-l-2 border-slate-200 dark:border-slate-700 pl-2 italic line-clamp-2 min-h-[32px]">
                                 {project.description || 'No description available for this project.'}
                              </p>
                           </div>

                           <div className="mt-4">
                              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                 <span>Progress</span>
                                 <span>{progressPct}%</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-5 overflow-hidden">
                                 <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
                              </div>

                              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700/50 pt-3">
                                 <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                                    {formatCurrency(project.budget || 0)}
                                 </div>
                                 <div className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    {project.dueDate ? new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Create Project Modal */}
         <ProjectModal
            isOpen={showAddModal && !editingProject}
            onClose={() => setShowAddModal(false)}
            projectData={newProject}
            setProjectData={setNewProject}
            onSave={handleCreate}
            isPending={createProject.isPending}
            isEdit={false}
         />
      </div>
   );

   // Simple un-exported functional component for the mail icon used in detailed view
   function EnvelopeIcon(props: any) {
      return (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
         </svg>
      )
   }

   // Local variables for modal logic that must be at top but placed here to satisfy rules
   var [editingProject, setEditingProject] = useState<any>(null);

   function handleUpdate(p: any) {
      updateProjectMut.mutate({ id: p.id, ...p }, { onSuccess: () => { toast.success("Updated"); setShowAddModal(false); setEditingProject(null); setSelectedProject(p); } });
   }
};

// Modal Component defined outside to keep main component clean
const ProjectModal = ({ isOpen, onClose, projectData, setProjectData, onSave, isPending, isEdit, stages = [] }: any) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
         <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-xl text-slate-900 dark:text-white">{isEdit ? 'Edit Project' : 'New Project Initiation'}</h3>
               <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Project Name *</label>
                  <input value={projectData.name || ''} onChange={e => setProjectData({ ...projectData, name: e.target.value })} placeholder="e.g. Villa Renovation" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" autoFocus />
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Client Name *</label>
                  <input value={projectData.client || ''} onChange={e => setProjectData({ ...projectData, client: e.target.value })} placeholder="John Doe" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Budget ($)</label>
                     <div className="relative">
                        <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="number" value={projectData.budget || ''} onChange={e => setProjectData({ ...projectData, budget: Number(e.target.value) })} placeholder="0" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 pl-8 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
                     </div>
                  </div>
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Dimensions</label>
                     <input value={projectData.dimensions || ''} onChange={e => setProjectData({ ...projectData, dimensions: e.target.value })} placeholder="e.g. 5000 sq ft" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
               </div>

               {isEdit && stages && stages.length > 0 && (
                  <div className="space-y-1">
                     <label className="text-xs font-bold text-slate-500 uppercase">Current Stage</label>
                     <select value={projectData.currentStage || ''} onChange={e => setProjectData({ ...projectData, currentStage: e.target.value })} className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary">
                        {stages.map((s: string) => <option key={s} value={s}>{s}</option>)}
                     </select>
                  </div>
               )}

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Site Address</label>
                  <input value={projectData.siteAddress || ''} onChange={e => setProjectData({ ...projectData, siteAddress: e.target.value })} placeholder="Full address" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary" />
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea value={projectData.description || ''} onChange={e => setProjectData({ ...projectData, description: e.target.value })} placeholder="Project details and scope..." className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary h-24 resize-none" />
               </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
               <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
               <button
                  onClick={onSave}
                  disabled={isPending || !projectData.name || !projectData.client}
                  className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
               >
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
               </button>
            </div>
         </div>
      </div>
   );
};
