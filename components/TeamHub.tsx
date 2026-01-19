import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { ChatMessage, Channel } from '../types';

export const TeamHub: React.FC = () => {
  const { currentUser, teamMessages, addTeamMessage, teamChannels } = useGlobal();
  const [selectedChannel, setSelectedChannel] = useState<Channel>(teamChannels[0] || { id: 'general', name: 'general', type: 'public' });
  const [newMessage, setNewMessage] = useState('');

  // Mock Video Participants for UI
  const participants = [
     { name: 'Elena M.', role: 'Designer', bg: 'bg-purple-600', initials: 'EM' },
     { name: 'Marcus V.', role: 'Architect', bg: 'bg-blue-600', initials: 'MV' },
     { name: 'You', role: 'Admin', bg: 'bg-slate-600', initials: 'ME' }
  ];

  const currentMessages = teamMessages.filter(m => m.channelId === selectedChannel.id || (!m.channelId && selectedChannel.id === 'general'));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      channelId: selectedChannel.id,
      sender: currentUser || 'Me',
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser?.charAt(0) || 'M'
    };
    addTeamMessage(msg);
    setNewMessage('');
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-dark text-white">
      {/* 1. LEFT SIDEBAR: Navigation & Channels */}
      <aside className="w-[280px] flex-shrink-0 flex flex-col bg-surface-darker border-r border-white/5 h-full">
        <div className="p-5 flex gap-3 items-center">
           <div className="bg-gradient-to-br from-gold-muted to-yellow-600 aspect-square rounded-full size-10 flex items-center justify-center font-bold text-black border border-white/10">SM</div>
           <div className="flex flex-col">
              <h1 className="text-white text-base font-semibold tracking-wide">Studio Mystri</h1>
              <p className="text-gold-muted text-xs font-medium uppercase tracking-wider">Luxury BMS</p>
           </div>
        </div>
        
        <div className="px-4 flex-1 overflow-y-auto custom-scrollbar pt-4">
           <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-zinc-500 tracking-widest uppercase">Channels</h3>
              <button className="text-zinc-500 hover:text-primary"><span className="material-symbols-outlined text-[16px]">add</span></button>
           </div>
           <div className="flex flex-col gap-1 mb-6">
              {teamChannels.map(ch => (
                 <button 
                    key={ch.id}
                    onClick={() => setSelectedChannel(ch)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full text-left ${selectedChannel.id === ch.id ? 'bg-white/5 text-white border border-white/5' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                 >
                    <span className={`${selectedChannel.id === ch.id ? 'text-primary' : 'text-zinc-600'} font-bold`}>#</span>
                    <span className="text-sm">{ch.name}</span>
                 </button>
              ))}
           </div>
        </div>
      </aside>

      {/* 2. MIDDLE PANE: Chat Interface */}
      <section className="flex flex-col w-[400px] flex-shrink-0 bg-surface-dark border-r border-white/5 relative z-10 shadow-2xl">
         <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0 bg-surface-dark/95 backdrop-blur-sm z-10">
            <div>
               <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight">#{selectedChannel.name}</h2>
               </div>
               <p className="text-xs text-zinc-500">Project Discussion</p>
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6 custom-scrollbar">
            {currentMessages.map(msg => (
               <div key={msg.id} className={`flex gap-4 ${msg.sender === currentUser ? 'flex-row-reverse' : ''}`}>
                  <div className={`size-10 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 mt-1 ${msg.sender === currentUser ? 'bg-primary border border-primary/20' : 'bg-zinc-700'}`}>
                     {msg.avatar}
                  </div>
                  <div className={`flex flex-col gap-1 max-w-[85%] ${msg.sender === currentUser ? 'items-end' : ''}`}>
                     <div className={`flex items-baseline gap-2 ${msg.sender === currentUser ? 'flex-row-reverse' : ''}`}>
                        <span className="text-sm font-semibold text-zinc-300">{msg.sender}</span>
                        <span className="text-[10px] text-zinc-600">{msg.timestamp}</span>
                     </div>
                     <div className={`text-zinc-200 text-sm leading-relaxed p-3 rounded-2xl border border-white/5 ${msg.sender === currentUser ? 'bg-primary/10 rounded-tr-none' : 'bg-white/5 rounded-tl-none'}`}>
                        <p>{msg.content}</p>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="p-4 bg-surface-dark border-t border-white/5">
            <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#0b100d] rounded-full border border-white/10 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all shadow-inner">
               <button type="button" className="pl-4 pr-2 text-zinc-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-[20px]">add_circle</span></button>
               <input 
                  className="bg-transparent border-none text-sm text-white placeholder-zinc-600 w-full focus:ring-0 py-3.5 pl-1 focus:outline-none" 
                  placeholder={`Message #${selectedChannel.name}...`} 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
               />
               <button type="submit" className="p-2 bg-primary text-background-dark rounded-full hover:bg-primary/90 transition-colors mr-1 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">send</span>
               </button>
            </form>
         </div>
      </section>

      {/* 3. RIGHT PANE: Video / Live Room */}
      <main className="flex-1 flex flex-col bg-[#0b100d] relative overflow-hidden">
         <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </span>
            <span className="text-sm font-medium text-white tracking-wide">Weekly Design Sync</span>
         </div>

         <div className="flex-1 p-6 grid grid-cols-2 gap-4 h-full">
            {participants.map((p, i) => (
               <div key={i} className="relative group rounded-3xl overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl flex items-center justify-center">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white ${p.bg}`}>{p.initials}</div>
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
                     <span className="text-xs font-medium text-white">{p.name}</span>
                  </div>
               </div>
            ))}
         </div>

         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-surface-dark/90 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30">
            <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"><span className="material-symbols-outlined">mic</span></button>
            <button className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"><span className="material-symbols-outlined">videocam</span></button>
            <div className="w-px h-8 bg-white/10 mx-2"></div>
            <button className="h-10 px-6 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center gap-2 transition-all shadow-lg hover:shadow-red-500/20">
               <span className="material-symbols-outlined text-[20px]">call_end</span>
               <span className="text-sm font-semibold">End Call</span>
            </button>
         </div>
      </main>
    </div>
  );
};