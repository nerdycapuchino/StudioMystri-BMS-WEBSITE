
import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { ChatMessage, Channel } from '../types';
import { Plus, Hash, Lock, User, Send, Video, X, Shield, Search, Paperclip } from 'lucide-react';

export const TeamHub: React.FC = () => {
  const { currentUser, teamMessages, addTeamMessage, teamChannels, addTeamChannel, employees } = useGlobal();
  
  const initialChannel = teamChannels && teamChannels.length > 0 ? teamChannels[0] : { id: 'general', name: 'general', type: 'public' as const };
  const [selectedChannel, setSelectedChannel] = useState<Channel>(initialChannel);
  
  const [newMessage, setNewMessage] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Modal States
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [showDMModal, setShowDMModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');

  useEffect(() => {
    if (teamChannels && teamChannels.length > 0 && !teamChannels.find(c => c.id === selectedChannel.id)) {
       setSelectedChannel(teamChannels[0]);
    }
  }, [teamChannels]);

  const startCall = async () => {
     try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setIsInCall(true);
        setTimeout(() => { if (localVideoRef.current) localVideoRef.current.srcObject = stream; }, 100);
     } catch (err) { 
       console.error(err);
       alert("Camera Access Denied. Please check browser permissions."); 
     }
  };

  const endCall = () => {
     if (streamRef.current) { 
        streamRef.current.getTracks().forEach(t => t.stop()); 
        streamRef.current = null; 
     }
     setIsInCall(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault(); 
    if (!newMessage.trim() || !currentUser) return;
    addTeamMessage({
      id: Date.now().toString(), 
      channelId: selectedChannel.id, 
      sender: currentUser.name,
      content: newMessage, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser.name.charAt(0)
    });
    setNewMessage('');
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    const channel: Channel = {
      id: newChannelName.toLowerCase().replace(/\s+/g, '-'),
      name: newChannelName.trim(),
      type: newChannelType
    };
    addTeamChannel(channel);
    setSelectedChannel(channel);
    setShowChannelModal(false);
    setNewChannelName('');
  };

  const handleStartDM = (targetEmployee: any) => {
    const dmId = `dm-${[currentUser?.id, targetEmployee.id].sort().join('-')}`;
    const existing = teamChannels.find(c => c.id === dmId);
    if (existing) {
      setSelectedChannel(existing);
    } else {
      const channel: Channel = {
        id: dmId,
        name: targetEmployee.name,
        type: 'dm',
        participantIds: [currentUser!.id, targetEmployee.id]
      };
      addTeamChannel(channel);
      setSelectedChannel(channel);
    }
    setShowDMModal(false);
  };

  const currentMessages = teamMessages.filter(m => m.channelId === selectedChannel.id);

  const publicChannels = teamChannels.filter(c => c.type === 'public');
  const privateChannels = teamChannels.filter(c => c.type === 'private');
  const dmChannels = teamChannels.filter(c => c.type === 'dm');

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-dark text-white flex-col md:flex-row">
      {/* Channels Sidebar */}
      <aside className="w-full md:w-72 bg-surface-darker border-r border-white/5 flex flex-col h-auto md:h-full shrink-0 overflow-hidden">
        <div className="p-6 font-black tracking-tighter text-xl border-b border-white/5 hidden md:flex items-center justify-between uppercase">
          <span>Team Hub</span>
          <div className="flex gap-2">
             <button onClick={() => setShowChannelModal(true)} className="p-1 hover:bg-white/10 rounded-lg text-primary transition-colors">
               <Plus className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
           {/* Public Channels */}
           <div>
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 mb-2">
                 <span>Channels</span>
              </div>
              <div className="space-y-0.5">
                 {publicChannels.map(ch => (
                    <button 
                      key={ch.id} 
                      onClick={() => setSelectedChannel(ch)} 
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-all ${selectedChannel.id === ch.id ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Hash className="w-4 h-4 opacity-50" /> {ch.name}
                    </button>
                 ))}
              </div>
           </div>

           {/* Private Channels */}
           <div>
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 mb-2">
                 <span>Private</span>
              </div>
              <div className="space-y-0.5">
                 {privateChannels.map(ch => (
                    <button 
                      key={ch.id} 
                      onClick={() => setSelectedChannel(ch)} 
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-all ${selectedChannel.id === ch.id ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <Lock className="w-4 h-4 opacity-50" /> {ch.name}
                    </button>
                 ))}
              </div>
           </div>

           {/* Direct Messages */}
           <div>
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 mb-2">
                 <span>Direct Messages</span>
                 <button onClick={() => setShowDMModal(true)} className="hover:text-primary transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                 </button>
              </div>
              <div className="space-y-0.5">
                 {dmChannels.map(ch => (
                    <button 
                      key={ch.id} 
                      onClick={() => setSelectedChannel(ch)} 
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center gap-3 transition-all ${selectedChannel.id === ch.id ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <div className="size-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                      {ch.name}
                    </button>
                 ))}
              </div>
           </div>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 border-r border-white/5 bg-surface-dark flex flex-col shrink-0 min-h-0">
        <div className="h-16 flex items-center px-6 border-b border-white/5 bg-surface-dark/50 backdrop-blur-sm shrink-0 justify-between">
           <div className="flex items-center gap-3">
              {selectedChannel.type === 'public' ? <Hash className="w-5 h-5 text-primary" /> : selectedChannel.type === 'private' ? <Lock className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-indigo-400" />}
              <h2 className="font-black text-lg uppercase tracking-tight">
                 {selectedChannel.name}
              </h2>
           </div>
           <div className="flex gap-2">
              <button onClick={startCall} className="text-zinc-400 hover:text-primary p-2 bg-white/5 hover:bg-primary/10 rounded-full transition-all">
                <Video className="w-5 h-5" />
              </button>
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col-reverse custom-scrollbar">
           {[...currentMessages].reverse().map(msg => (
             <div key={msg.id} className={`flex gap-4 ${msg.sender === (currentUser?.name || '') ? 'flex-row-reverse' : ''}`}>
               <div className={`size-10 rounded-full flex items-center justify-center font-bold flex-shrink-0 border border-white/5 shadow-inner ${msg.sender === (currentUser?.name || '') ? 'bg-primary text-background-dark' : 'bg-zinc-800 text-zinc-300'}`}>
                 {msg.avatar}
               </div>
               <div className={`max-w-[70%] ${msg.sender === (currentUser?.name || '') ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                 <div className="flex items-center gap-2 px-1">
                   <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{msg.sender}</p>
                   <p className="text-[10px] text-zinc-600 font-medium">{msg.timestamp}</p>
                 </div>
                 <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed shadow-lg ${msg.sender === (currentUser?.name || '') ? 'bg-primary/10 text-primary border border-primary/20 rounded-tr-none' : 'bg-surface-darker rounded-tl-none text-zinc-300 border border-white/5'}`}>
                   {msg.content}
                 </div>
               </div>
             </div>
           ))}
           {currentMessages.length === 0 && (
             <div className="flex-1 flex flex-col items-center justify-center opacity-20">
               <Hash className="w-16 h-16 mb-4" />
               <p className="font-black uppercase tracking-widest text-xs">Beginning of history</p>
             </div>
           )}
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-surface-dark shrink-0">
           <div className="bg-background-dark rounded-full p-1.5 border border-white/10 flex items-center focus-within:ring-2 focus-within:ring-primary/30 transition-all shadow-2xl">
             <button type="button" className="p-2.5 text-zinc-400 hover:text-white transition-colors">
                <Paperclip className="w-5 h-5" />
             </button>
             <input 
               value={newMessage} 
               onChange={e => setNewMessage(e.target.value)} 
               className="flex-1 bg-transparent border-none text-sm px-4 focus:ring-0 outline-none placeholder:text-zinc-700" 
               placeholder={`Message ${selectedChannel.type === 'dm' ? '@' : '#'}${selectedChannel.name}...`} 
             />
             <button className="size-10 bg-primary text-background-dark rounded-full flex items-center justify-center shadow-glow active:scale-90 transition-transform">
               <Send className="w-5 h-5 fill-current" />
             </button>
           </div>
        </form>
      </div>

      {/* Direct Message (Desktop Only Info/Activity) */}
      <aside className="hidden xl:flex w-72 bg-surface-darker border-l border-white/5 p-6 flex-col">
          <div className="text-center mb-8">
             <div className="size-20 bg-white/5 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-black text-zinc-500 border border-white/10">
               {selectedChannel.name.charAt(0)}
             </div>
             <h3 className="text-lg font-black text-white">{selectedChannel.name}</h3>
             <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-1">
               {selectedChannel.type === 'dm' ? 'Personal Thread' : `${selectedChannel.type} Channel`}
             </p>
          </div>
          
          <div className="flex-1 space-y-6">
             <div>
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Channel Details</p>
                <div className="space-y-3">
                   <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <Clock className="w-4 h-4" />
                      Created 2 weeks ago
                   </div>
                   <div className="flex items-center gap-3 text-sm text-zinc-400">
                      <Shield className="w-4 h-4" />
                      Encrypted conversation
                   </div>
                </div>
             </div>
          </div>
      </aside>

      {/* Video Call (Toggleable Overlay) */}
      {isInCall && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col">
           <header className="p-6 flex justify-between items-center bg-black/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="size-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                 <span className="font-black text-xs uppercase tracking-widest text-white">Live Meeting • {selectedChannel.name}</span>
              </div>
              <button onClick={endCall} className="p-2 hover:bg-white/10 rounded-full text-zinc-400">
                <X className="w-6 h-6" />
              </button>
           </header>
           <main className="flex-1 relative flex items-center justify-center overflow-hidden">
              <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 bg-zinc-900/80 backdrop-blur-2xl px-12 py-6 rounded-full border border-white/10 shadow-2xl">
                 <button className="size-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><Mic className="w-6 h-6" /></button>
                 <button className="size-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"><Video className="w-6 h-6" /></button>
                 <div className="w-px h-8 bg-white/10 mx-2"></div>
                 <button onClick={endCall} className="px-10 h-14 bg-red-600 rounded-full font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">End Call</button>
              </div>
           </main>
        </div>
      )}

      {/* New Channel Modal */}
      {showChannelModal && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">New Channel</h3>
                  <button onClick={() => setShowChannelModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="space-y-6">
                  <div className="flex bg-background-dark p-1 rounded-2xl border border-white/5">
                     <button 
                        onClick={() => setNewChannelType('public')}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newChannelType === 'public' ? 'bg-primary text-black' : 'text-zinc-500'}`}
                     >
                        Public
                     </button>
                     <button 
                        onClick={() => setNewChannelType('private')}
                        className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${newChannelType === 'private' ? 'bg-amber-500 text-black' : 'text-zinc-500'}`}
                     >
                        Private
                     </button>
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Channel Name</label>
                     <input 
                        value={newChannelName} 
                        onChange={e => setNewChannelName(e.target.value)}
                        className="w-full bg-background-dark border border-white/10 rounded-full px-8 py-4 text-white focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-zinc-800" 
                        placeholder="e.g. design-sync" 
                     />
                  </div>
               </div>
               <button 
                  onClick={handleCreateChannel}
                  disabled={!newChannelName.trim()}
                  className="w-full py-5 bg-primary disabled:opacity-50 text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow"
               >
                  Construct Channel
               </button>
            </div>
         </div>
      )}

      {/* New DM Modal */}
      {showDMModal && (
         <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl space-y-8 max-h-[80vh] flex flex-col">
               <div className="flex justify-between items-center shrink-0">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Direct Message</h3>
                  <button onClick={() => setShowDMModal(false)} className="text-zinc-500 hover:text-white">
                     <X className="w-6 h-6" />
                  </button>
               </div>
               <div className="bg-background-dark rounded-2xl p-4 border border-white/5 flex items-center gap-3 shrink-0">
                  <Search className="w-4 h-4 text-zinc-600" />
                  <input className="bg-transparent border-none text-sm w-full focus:ring-0 text-white" placeholder="Search team members..." />
               </div>
               <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {employees.filter(e => e.id !== currentUser?.id).map(emp => (
                     <button 
                        key={emp.id} 
                        onClick={() => handleStartDM(emp)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all text-left"
                     >
                        <div className="size-12 rounded-full bg-zinc-800 flex items-center justify-center font-black text-zinc-500 border border-white/10">
                           {emp.name.charAt(0)}
                        </div>
                        <div>
                           <p className="font-bold text-white">{emp.name}</p>
                           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{emp.email}</p>
                        </div>
                        <div className="ml-auto size-2 bg-green-500 rounded-full"></div>
                     </button>
                  ))}
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

// Local icon placeholders missing from standard Lucide
const Mic = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);
const Clock = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
