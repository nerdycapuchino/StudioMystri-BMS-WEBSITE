import React from 'react';
import { useGlobal } from '../context/GlobalContext';

export const HR: React.FC = () => {
  const { employees, formatCurrency, checkAccess } = useGlobal();
  const salaryAccess = checkAccess('salary');

  return (
    <div className="flex flex-col h-full relative overflow-hidden bg-background-dark industrial-grid-bg">
      <header className="w-full shrink-0 border-b border-border-dark bg-background-dark/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-6 md:px-10">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">HR & Payroll</h2>
              <p className="text-text-secondary font-medium">Manage staff, track attendance, and process monthly stipends.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="relative group grow xl:grow-0">
                <span className="material-symbols-outlined absolute inset-y-0 left-0 pl-3 flex items-center text-text-secondary pointer-events-none">search</span>
                <input className="block w-full xl:w-80 pl-10 pr-3 py-2.5 border-none rounded-full leading-5 bg-surface-dark text-white placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-darker sm:text-sm transition-all shadow-inner" placeholder="Search name, ID, or role..." type="text"/>
              </div>
              <button className="hidden md:flex ml-auto xl:ml-2 items-center justify-center w-10 h-10 rounded-full bg-surface-dark border border-dashed border-text-secondary text-primary hover:bg-primary hover:text-black hover:border-solid hover:border-primary transition-all duration-300">
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-[1600px] mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-darker p-4 rounded-xl border border-border-dark flex flex-col">
              <span className="text-text-secondary text-xs font-mono uppercase">Total Staff</span>
              <span className="text-2xl font-bold text-white mt-1">{employees.length}</span>
            </div>
            <div className="bg-surface-darker p-4 rounded-xl border border-border-dark flex flex-col">
              <span className="text-text-secondary text-xs font-mono uppercase">Present Today</span>
              <span className="text-2xl font-bold text-primary mt-1">{employees.filter(e => e.attendance === 'Present').length}</span>
            </div>
            <div className="bg-surface-darker p-4 rounded-xl border border-border-dark flex flex-col">
              <span className="text-text-secondary text-xs font-mono uppercase">On Leave</span>
              <span className="text-2xl font-bold text-white mt-1">{employees.filter(e => e.status === 'Leave').length}</span>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
            {employees.map(emp => (
              <div key={emp.id} className="group relative bg-surface-dark hover:bg-surface-darker border border-border-dark hover:border-primary/50 transition-all duration-300 rounded-2xl p-6 flex flex-col items-center">
                <div className="absolute top-4 right-4 flex gap-1">
                  <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${emp.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                <div className="relative mb-5">
                  <div className="w-24 h-24 rounded-full p-1 border border-border-dark group-hover:border-primary/50 transition-colors flex items-center justify-center bg-surface-darker text-2xl font-bold text-text-secondary">
                     {emp.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-white">{emp.name}</h3>
                <p className="text-sm text-text-secondary mb-4">{emp.role}</p>
                <div className="flex gap-2 mb-6">
                  <span className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide bg-white/5 text-text-secondary border border-white/5">FT</span>
                  <span className="px-2 py-1 rounded text-[10px] font-mono uppercase tracking-wide bg-white/5 text-text-secondary border border-white/5">{emp.status}</span>
                </div>
                <button className="w-full py-2.5 rounded-full border border-border-dark bg-transparent text-sm font-medium text-text-secondary hover:text-white hover:border-primary hover:bg-primary/10 transition-all flex items-center justify-center gap-2 group-hover:shadow-glow">
                  <span className="material-symbols-outlined text-lg">receipt_long</span>
                  {salaryAccess !== 'hidden' ? formatCurrency(emp.salary) : 'Hidden'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};