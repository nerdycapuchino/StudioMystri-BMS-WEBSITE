import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Clock, CheckCircle, FileText, Upload, MoreVertical, X, Calendar, Edit2, Image, Lock } from 'lucide-react';
import { Project } from '../types';

export const Projects: React.FC = () => {
  const { projects, addProject, updateProject, userRole } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [formProject, setFormProject] = useState<Partial<Project>>({ name: '', client: '', budget: 0, dueDate: '', stages: ['Concept', 'Design', 'Execution', 'Handover'] });

  const calculateProgress = (stage: string, stages: string[]) => {
    const idx = stages.indexOf(stage);
    if (idx === -1) return 0;
    return Math.round(((idx + 1) / stages.length) * 100);
  };

  const handleCreateProject = () => {
    if (!formProject.name || !formProject.client) return;
    const stages = formProject.stages && formProject.stages.length > 0 ? formProject.stages : ['Concept', 'Design', 'Execution', 'Handover'];
    addProject({
       id: Math.random().toString(36).substr(2, 9),
       name: formProject.name!,
       client: formProject.client!,
       stages: stages,
       currentStage: stages[0],
       budget: formProject.budget || 0,
       dueDate: formProject.dueDate || new Date().toISOString().split('T')[0],
       progress: calculateProgress(stages[0], stages),
       files: []
    });
    setShowAddModal(false);
    setFormProject({ name: '', client: '', budget: 0, dueDate: '', stages: ['Concept', 'Design', 'Execution', 'Handover'] });
  };

  const handleUpdate = () => {
     if(editingProject) {
        updateProject(editingProject.id, editingProject);
        setEditingProject(null);
     }
  };

  const handleStageChange = (newStage: string) => {
    if (editingProject) {
      setEditingProject({
        ...editingProject,
        currentStage: newStage,
        progress: calculateProgress(newStage, editingProject.stages)
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && editingProject) {
      const fileName = e.target.files[0].name;
      setEditingProject({
        ...editingProject,
        files: [...(editingProject.files || []), fileName]
      });
    }
  };

  const toggleStage = (stage: string) => {
    const currentStages = formProject.stages || [];
    if (currentStages.includes(stage)) {
      setFormProject({ ...formProject, stages: currentStages.filter(s => s !== stage) });
    } else {
      setFormProject({ ...formProject, stages: [...currentStages, stage] });
    }
  };

  const canViewBudget = userRole === 'Super Admin' || userRole === 'Sales';
  const defaultStages = ['Concept', 'Design', 'Execution', 'Handover'];

  return (
    <div className="h-full overflow-y-auto relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Projects & Sites</h2>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">New Project</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                   <h3 className="font-bold text-lg text-slate-800">{project.name}</h3>
                   <p className="text-sm text-slate-500">{project.client}</p>
                </div>
                <button onClick={() => setEditingProject(project)} className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4"/></button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{project.currentStage}</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div className="flex items-center gap-2 text-slate-600"><Clock className="w-4 h-4 text-slate-400" /><span>{project.dueDate}</span></div>
                <div className="flex items-center gap-2 text-slate-600">
                   {canViewBudget ? (
                      <><CheckCircle className="w-4 h-4 text-slate-400" /><span>${project.budget.toLocaleString()}</span></>
                   ) : (
                      <><Lock className="w-4 h-4 text-slate-400" /><span>Hidden</span></>
                   )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <div className="flex-1 text-xs text-slate-500">{project.files?.length || 0} Files Attached</div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${project.currentStage === 'Handover' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{project.currentStage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
             <h3 className="font-bold text-lg mb-4">New Project</h3>
             <div className="space-y-3">
                <input className="w-full border p-2 rounded" placeholder="Project Name" value={formProject.name} onChange={e => setFormProject({...formProject, name: e.target.value})} />
                <input className="w-full border p-2 rounded" placeholder="Client" value={formProject.client} onChange={e => setFormProject({...formProject, client: e.target.value})} />
                {canViewBudget && <input className="w-full border p-2 rounded" type="number" placeholder="Budget" value={formProject.budget || ''} onChange={e => setFormProject({...formProject, budget: parseFloat(e.target.value)})} />}
                <input className="w-full border p-2 rounded" type="date" value={formProject.dueDate} onChange={e => setFormProject({...formProject, dueDate: e.target.value})} />
                <div>
                   <label className="text-xs text-slate-500 block mb-2">Select Stages</label>
                   <div className="grid grid-cols-2 gap-2">
                      {defaultStages.map(stage => (
                         <label key={stage} className="flex items-center gap-2 text-sm bg-slate-50 p-2 rounded border cursor-pointer hover:bg-slate-100">
                            <input 
                              type="checkbox" 
                              checked={formProject.stages?.includes(stage)} 
                              onChange={() => toggleStage(stage)} 
                            />
                            {stage}
                         </label>
                      ))}
                   </div>
                </div>
                <button onClick={handleCreateProject} className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Create</button>
                <button onClick={() => setShowAddModal(false)} className="w-full bg-slate-100 text-slate-600 py-2 rounded">Cancel</button>
             </div>
           </div>
        </div>
      )}

      {/* Edit/View Modal */}
      {editingProject && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
               <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-lg">Manage Project: {editingProject.name}</h3>
                  <button onClick={() => setEditingProject(null)}><X className="w-5 h-5"/></button>
               </div>
               <div className="space-y-6">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Current Stage</label>
                     <select className="w-full border p-2 rounded" value={editingProject.currentStage} onChange={e => handleStageChange(e.target.value)}>
                        {editingProject.stages.map(s => <option key={s} value={s}>{s}</option>)}
                     </select>
                     <p className="text-xs text-slate-500 mt-1">Changing stage automatically updates progress to {editingProject.progress}%.</p>
                  </div>
                  
                  {canViewBudget && (
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Budget</label>
                        <input className="w-full border p-2 rounded" type="number" value={editingProject.budget} onChange={e => setEditingProject({...editingProject, budget: parseFloat(e.target.value)})} />
                     </div>
                  )}

                  <div>
                     <h4 className="font-bold text-sm mb-2">Project Files</h4>
                     <div className="space-y-2 mb-2">
                        {editingProject.files?.length === 0 && <p className="text-xs text-slate-400">No files uploaded.</p>}
                        {editingProject.files?.map((f, i) => (
                           <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border">
                              <FileText className="w-4 h-4 text-indigo-500" /> {f}
                           </div>
                        ))}
                     </div>
                     <div className="flex gap-2">
                        <label className="flex-1 py-2 border border-dashed border-slate-300 rounded text-slate-500 text-xs hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer">
                           <Upload className="w-3 h-3"/> Upload File
                           <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                     </div>
                  </div>
                  <button onClick={handleUpdate} className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Save Changes</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};