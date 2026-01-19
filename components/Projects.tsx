import React from 'react';
import { useGlobal } from '../context/GlobalContext';

export const Projects: React.FC = () => {
  const { projects } = useGlobal();

  return (
    <div className="flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
      <header className="shrink-0 px-6 py-6 md:px-10 md:py-8 flex flex-col gap-6 bg-background-dark/95 backdrop-blur-md sticky top-0 z-20 border-b border-border-dark">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-white text-3xl md:text-4xl font-black tracking-tight">Active Projects <span className="text-text-muted font-light text-2xl ml-2 align-middle">({projects.length})</span></h2>
            <p className="text-text-muted text-sm md:text-base">Track progress, deadlines, and installations for ongoing sites.</p>
          </div>
          <button className="flex shrink-0 items-center justify-center gap-2 rounded-full h-12 px-6 bg-primary hover:bg-[#2bc968] text-background-dark text-sm font-bold tracking-wide shadow-glow transition-all transform hover:scale-105 active:scale-95">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>NEW PROJECT</span>
          </button>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-end xl:items-center">
          <div className="w-full xl:max-w-md relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-text-muted group-focus-within:text-primary transition-colors">search</span>
            </div>
            <input className="block w-full h-12 pl-12 pr-4 bg-surface-dark border border-border-dark rounded-2xl text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-medium" placeholder="Search client, location, or stage..." type="text"/>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 xl:pb-0 w-full xl:w-auto no-scrollbar">
            <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-full bg-white text-background-dark text-sm font-bold border border-transparent transition-all">All Projects</button>
            <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-full bg-surface-dark text-text-muted hover:text-white hover:bg-border-dark border border-border-dark text-sm font-medium transition-all">
               In Progress <span className="ml-2 flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            </button>
            <button className="flex h-10 shrink-0 items-center justify-center px-5 rounded-full bg-surface-dark text-text-muted hover:text-white hover:bg-border-dark border border-border-dark text-sm font-medium transition-all">
               Completed
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
          {projects.map(p => (
            <article key={p.id} className="group relative flex flex-col bg-surface-dark border border-border-dark hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-glow-hover hover:-translate-y-1">
              <div className="relative h-56 overflow-hidden bg-surface-highlight">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-60 z-10"></div>
                {/* Placeholder pattern/image */}
                <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop')] bg-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"></div>
                <div className="absolute top-4 right-4 z-20">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg ${p.progress === 100 ? 'bg-primary text-background-dark' : 'bg-surface-dark border border-text-muted/20 text-white'}`}>
                    {p.currentStage}
                  </span>
                </div>
              </div>
              
              <div className="p-5 flex flex-col gap-5 flex-1 justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-white text-xl font-bold leading-tight line-clamp-1">{p.name}</h3>
                    <button className="text-text-muted hover:text-white transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                  </div>
                  <div className="flex items-center gap-1 text-text-muted text-sm mb-4">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                    {p.client}
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{p.currentStage}</span>
                      <span className="text-xs text-text-muted">{p.progress}%</span>
                    </div>
                    {/* Segmented Progress Bar */}
                    <div className="flex gap-1 h-1.5 w-full">
                       {[20, 40, 60, 80, 100].map(step => (
                          <div key={step} className={`w-full rounded-full ${p.progress >= step ? 'bg-primary' : 'bg-border-dark'}`}></div>
                       ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-text-muted mt-1 font-medium uppercase tracking-widest">
                      <span>Concept</span>
                      <span>Handover</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border-dark">
                  <div className="flex -space-x-2">
                    <button className="flex items-center justify-center size-8 rounded-full bg-border-dark text-text-muted border border-surface-dark hover:bg-primary hover:text-background-dark transition-colors" title="Files">
                      <span className="material-symbols-outlined text-[16px]">folder</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-background-dark px-3 py-1.5 rounded-full border border-border-dark">
                    <span className="material-symbols-outlined text-text-muted text-[16px]">calendar_month</span>
                    <span className="text-xs text-white font-medium">{p.dueDate}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};