import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChannels, useMessages } from '../hooks/useTeam';
import { useEmployees } from '../hooks/useHR';
import { ChatMessage, Channel } from '../types';
// Import lucide-react icons that match the Material Symbols used in the template
import { Plus, Hash, Lock, Search, Paperclip, Send, Bell, Settings, MoreVertical, Menu, Home, Folder, MessageSquare, Users as UsersIcon, X, Mic, Video, Trash2, Download, Smile, AtSign } from 'lucide-react';
import { getSocket } from '../services/socket';
import { useQueryClient } from '@tanstack/react-query';

export const TeamHub: React.FC = () => {
   const { user: currentUser } = useAuth();
   const { data: channelData } = useChannels();
   const { data: empData } = useEmployees();
   const qc = useQueryClient();

   const teamChannels: Channel[] = Array.isArray(channelData?.data || channelData) ? (channelData?.data || channelData) as Channel[] : [];
   const employees: any[] = Array.isArray(empData?.data || empData) ? (empData?.data || empData) as any[] : [];

   const initialChannel = teamChannels && teamChannels.length > 0 ? teamChannels[0] : { id: 'general', name: 'general', type: 'public' as const };
   const [selectedChannel, setSelectedChannel] = useState<Channel>(initialChannel);

   const { data: msgData } = useMessages(selectedChannel?.id || null);
   const teamMessages: ChatMessage[] = Array.isArray(msgData?.data || msgData) ? (msgData?.data || msgData) as ChatMessage[] : [];

   const [newMessage, setNewMessage] = useState('');
   const [isInCall, setIsInCall] = useState(false);
   const localVideoRef = useRef<HTMLVideoElement>(null);
   const streamRef = useRef<MediaStream | null>(null);

   // Socket specific state
   const [typingUsers, setTypingUsers] = useState<string[]>([]);
   const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

   // Modal States
   const [showChannelModal, setShowChannelModal] = useState(false);
   const [showDMModal, setShowDMModal] = useState(false);
   const [newChannelName, setNewChannelName] = useState('');
   const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');

   // Mobile Sidebar State
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

   useEffect(() => {
      if (teamChannels && teamChannels.length > 0 && !teamChannels.find(c => c.id === selectedChannel.id)) {
         setSelectedChannel(teamChannels[0]);
      }
   }, [teamChannels]);

   // Real-time Socket bindings
   useEffect(() => {
      let socket: ReturnType<typeof getSocket>;
      try {
         socket = getSocket();
         if (!socket) return;
         if (!socket.connected) socket.connect();
      } catch {
         return; // Socket not ready — graceful degradation
      }

      socket.emit('channel:join', selectedChannel.id);

      const onNewMessage = (message: any) => {
         if (message.channel !== selectedChannel.id) return;
         qc.setQueryData(['team', 'messages', selectedChannel.id, undefined], (old: any) => ({
            ...old,
            data: [...(old?.data || []), message]
         }));
         // Scroll on new message
         setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      };

      const onMessageDeleted = ({ messageId, channel }: any) => {
         if (channel !== selectedChannel.id) return;
         qc.setQueryData(['team', 'messages', selectedChannel.id, undefined], (old: any) => ({
            ...old,
            data: (old?.data || []).filter((m: any) => m.id !== messageId)
         }));
      };

      const onTypingUpdate = ({ userName, isTyping, channel }: any) => {
         if (channel !== selectedChannel.id) return;
         setTypingUsers(prev =>
            isTyping
               ? Array.from(new Set([...prev, userName]))
               : prev.filter(u => u !== userName)
         );
      };

      const onPresenceUpdate = (userIds: string[]) => {
         setOnlineUserIds(userIds);
      };

      // Request initial presence ping
      socket.emit('presence:ping');

      socket.on('message:new', onNewMessage);
      socket.on('message:deleted', onMessageDeleted);
      socket.on('typing:update', onTypingUpdate);
      socket.on('presence:update', onPresenceUpdate);

      return () => {
         socket.off('message:new', onNewMessage);
         socket.off('message:deleted', onMessageDeleted);
         socket.off('typing:update', onTypingUpdate);
         socket.off('presence:update', onPresenceUpdate);
         try { socket.emit('channel:leave', selectedChannel.id); } catch { /* ignore */ }
      };
   }, [selectedChannel.id, qc]);

   // Scroll to bottom on initial load of messages
   useEffect(() => {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
   }, [selectedChannel.id, teamMessages.length]);

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

   const handleSendMessage = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (!newMessage.trim() || !currentUser) return;
      try {
         const socket = getSocket();
         socket.emit('message:send', { channel: selectedChannel.id, content: newMessage });
      } catch { /* socket not ready */ }
      setNewMessage('');
   };

   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
         e.preventDefault();
         handleSendMessage();
         return;
      }
      try {
         const socket = getSocket();
         socket.emit('typing:start', selectedChannel.id);
         if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
         typingTimeoutRef.current = setTimeout(() => {
            try { socket.emit('typing:stop', selectedChannel.id); } catch { /* ignore */ }
         }, 2000);
      } catch { /* socket not ready */ }
   };

   const handleDeleteMessage = (messageId: string) => {
      try { getSocket().emit('message:delete', messageId); } catch { /* ignore */ }
   };

   const handleCreateChannel = () => {
      if (!newChannelName.trim()) return;
      // Channel creation logic...
      setShowChannelModal(false);
      setNewChannelName('');
   };

   const handleStartDM = (targetEmployee: any) => {
      const dmId = `dm-${[currentUser?.id, targetEmployee.id].sort().join('-')}`;
      const existing = teamChannels.find(c => c.id === dmId);
      if (existing) {
         setSelectedChannel(existing);
      }
      setShowDMModal(false);
      setIsMobileMenuOpen(false);
   };

   const currentMessages = teamMessages.filter(m => m.channelId === selectedChannel.id);
   const publicChannels = teamChannels.filter(c => c.type === 'public');
   const privateChannels = teamChannels.filter(c => c.type === 'private');
   const dmChannels = teamChannels.filter(c => c.type === 'dm');

   // Helper for rendering channel list items
   const renderChannelItem = (ch: Channel, icon: React.ReactNode, isDM = false, targetId?: string) => {
      const isActive = selectedChannel.id === ch.id;
      const isOnline = isDM && targetId ? onlineUserIds.includes(targetId) : false;

      return (
         <button
            key={ch.id}
            onClick={() => { setSelectedChannel(ch); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg group transition-colors ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 border-l-4 border-primary dark:text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-l-4 border-transparent'}`}
         >
            <div className="flex items-center gap-3 truncate">
               {isDM ? (
                  <div className="relative shrink-0">
                     <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 uppercase">
                        {ch.name.substring(0, 2)}
                     </div>
                     <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-white dark:border-slate-900 rounded-full ${isOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                  </div>
               ) : (
                  <span className={`text-[18px] opacity-70 group-hover:opacity-100 transition-opacity ${isActive ? 'text-primary' : ''}`}>
                     {icon}
                  </span>
               )}
               <span className={`text-sm truncate ${isActive ? 'font-medium' : ''}`}>{ch.name}</span>
            </div>
         </button>
      );
   };

   return (
      <div className="flex flex-col md:flex-row h-full w-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden relative">

         {/* Mobile Header */}
         <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">MB</div>
               <span className="font-bold text-lg">MystriBMS</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500 dark:text-slate-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
         </div>

         {/* Sidebar Navigation */}
         <aside className={`absolute md:relative z-40 w-72 h-[calc(100%-65px)] md:h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 flex' : '-translate-x-full md:flex hidden'}`}>
            {/* Sidebar Header */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50">
               <div className="flex items-center gap-3">
                  <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-10 w-10 relative flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold uppercase border border-slate-300 dark:border-slate-600">
                     {currentUser?.name?.substring(0, 2) || 'U'}
                     <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                  </div>
                  <div className="flex flex-col">
                     <h1 className="text-slate-900 dark:text-white text-sm font-semibold leading-tight truncate w-32">{currentUser?.name || 'User'}</h1>
                     <p className="text-slate-500 dark:text-slate-400 text-xs font-normal capitalize">{currentUser?.role || 'Member'}</p>
                  </div>
               </div>
               <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
                  <Settings className="w-5 h-5" />
               </button>
            </div>

            {/* Search Sidebar */}
            <div className="px-4 py-4 shrink-0">
               <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2 border border-slate-200/50 dark:border-slate-700/50 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
                  <Search className="text-slate-400 w-4 h-4 shrink-0" />
                  <input className="bg-transparent border-none text-sm w-full focus:ring-0 text-slate-700 dark:text-slate-200 placeholder-slate-400 py-0.5 ml-2 outline-none" placeholder="Jump to..." type="text" />
               </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-6 custom-scrollbar">
               {/* Main Menu (Static Links for UI Completeness) */}
               <div>
                  <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
                  <nav className="space-y-1">
                     <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                        <Home className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Overview</span>
                     </a>
                     <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                        <Folder className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">All Projects</span>
                     </a>
                     <div className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg transition-colors group cursor-pointer">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Messages</span>
                     </div>
                     <a href="#" className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors group">
                        <UsersIcon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                        <span className="text-sm font-medium">Team</span>
                     </a>
                  </nav>
               </div>

               {/* Channels */}
               <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                     <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Channels</div>
                     <button onClick={() => setShowChannelModal(true)} className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                     </button>
                  </div>
                  <nav className="space-y-0.5">
                     {publicChannels.map(ch => renderChannelItem(ch, <Hash className="w-4 h-4" />))}
                     {privateChannels.map(ch => renderChannelItem(ch, <Lock className="w-4 h-4" />))}
                  </nav>
               </div>

               {/* Direct Messages */}
               <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                     <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Messages</div>
                     <button onClick={() => setShowDMModal(true)} className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                     </button>
                  </div>
                  <nav className="space-y-0.5">
                     {dmChannels.map(ch => {
                        const targetId = ch.id.replace('dm-', '').replace(currentUser?.id || '', '').replace('-', '');
                        return renderChannelItem(ch, null, true, targetId);
                     })}
                  </nav>
               </div>
            </div>
         </aside>

         {/* Mobile overlay for sidebar */}
         {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
         )}

         {/* Main Content Area */}
         <main className="flex-1 flex flex-col h-full relative min-w-0 bg-background-light dark:bg-background-dark">

            {/* Chat Header */}
            <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
               <div className="flex flex-col min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                     {selectedChannel.type === 'private' ? <Lock className="w-4 h-4 text-slate-400 shrink-0" /> : selectedChannel.type === 'public' ? <Hash className="w-4 h-4 text-slate-400 shrink-0" /> : <div className={`w-2 h-2 rounded-full shrink-0 ${selectedChannel.type === 'dm' ? 'bg-green-500' : ''}`} />}
                     <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">{selectedChannel.name}</h2>
                     <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-medium text-primary bg-primary/10 rounded-full uppercase tracking-wider shrink-0">{selectedChannel.type === 'dm' ? 'DM' : 'Channel'}</span>
                  </div>
               </div>

               <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  {/* Participants Avatar Group (Hidden on tiny screens) */}
                  <div className="hidden sm:flex -space-x-2 mr-2">
                     {employees.slice(0, 3).map((emp, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 uppercase">
                           {emp.name.substring(0, 2)}
                        </div>
                     ))}
                     {employees.length > 3 && (
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-medium text-white bg-slate-400 border-2 border-white dark:border-slate-900 rounded-full hover:bg-slate-500 z-10">
                           +{employees.length - 3}
                        </div>
                     )}
                  </div>

                  <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                  <button onClick={startCall} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors tooltip" title="Start Call">
                     <Video className="w-5 h-5" />
                  </button>

                  <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hidden sm:block">
                     <Bell className="w-5 h-5" />
                     <span className="absolute top-1.5 right-1.5 block w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
                  </button>

                  <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                     <MoreVertical className="w-5 h-5" />
                  </button>
               </div>
            </header>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 flex flex-col custom-scrollbar">

               {currentMessages.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center opacity-40 py-10">
                     {selectedChannel.type === 'dm' ? <AtSign className="w-16 h-16 mb-4 text-slate-400" /> : <Hash className="w-16 h-16 mb-4 text-slate-400" />}
                     <p className="font-bold text-slate-500">This is the beginning of {selectedChannel.name}</p>
                     <p className="text-sm text-slate-400 mt-2">Send a message to start the conversation.</p>
                  </div>
               )}

               {currentMessages.map((msg, i) => {
                  const isSelf = msg.sender === (currentUser?.name || '');
                  const showAvatar = !isSelf && (i === 0 || currentMessages[i - 1].sender !== msg.sender);

                  if (isSelf) {
                     return (
                        <div key={msg.id} className="flex gap-3 flex-row-reverse group animate-in slide-in-from-right-4 duration-300">
                           {/* Self Avatar Spacer or Render */}
                           <div className="w-8 h-8 rounded-lg shrink-0 mt-1 flex items-center justify-center bg-primary text-white font-bold text-[10px] uppercase shadow-sm">
                              {msg.sender.substring(0, 2)}
                           </div>
                           <div className="flex flex-col items-end max-w-[85%] md:max-w-2xl">
                              <div className="flex items-baseline gap-2 mb-1 flex-row-reverse">
                                 <span className="text-sm font-bold text-slate-900 dark:text-white">You</span>
                                 <span className="text-xs text-slate-400">{msg.timestamp}</span>
                              </div>
                              <div className="bg-primary/10 dark:bg-primary/20 p-3 md:p-4 rounded-xl rounded-tr-sm text-slate-800 dark:text-slate-100 text-sm leading-relaxed relative border border-primary/20 dark:border-primary/10 inline-block text-left break-words max-w-full">
                                 {msg.content}
                                 <button type="button" onClick={() => handleDeleteMessage(msg.id)} className="absolute opacity-0 group-hover:opacity-100 -left-10 top-1/2 -translate-y-1/2 p-2 hover:text-red-500 text-slate-400 transition-all rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     );
                  } else {
                     // Incoming format (mimicking template)
                     return (
                        <div key={msg.id} className="flex gap-3 group animate-in slide-in-from-left-4 duration-300">
                           <div className={`w-8 h-8 rounded-lg shrink-0 mt-1 flex items-center justify-center font-bold text-[10px] uppercase text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 shadow-sm border border-slate-300 dark:border-slate-600 ${!showAvatar && 'invisible'}`}>
                              {msg.sender.substring(0, 2)}
                           </div>
                           <div className="flex flex-col max-w-[85%] md:max-w-2xl">
                              <div className="flex items-baseline gap-2 mb-1">
                                 <span className="text-sm font-bold text-slate-900 dark:text-white">{msg.sender}</span>
                                 <span className="text-xs text-slate-400">{msg.timestamp}</span>
                              </div>
                              <div className="bg-white dark:bg-slate-800 p-3 md:p-4 rounded-xl rounded-tl-sm shadow-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm leading-relaxed inline-block break-words max-w-full">
                                 {msg.content}
                              </div>
                           </div>
                        </div>
                     );
                  }
               })}
               <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Typing Indicator */}
            <div className="px-6 pb-1 min-h-[20px] shrink-0">
               {typingUsers.length > 0 && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic animate-pulse">
                     {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </p>
               )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
               <div className="max-w-5xl mx-auto">
                  <div className="relative flex flex-col bg-background-light dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                     <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent border-none focus:ring-0 p-3 pt-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none min-h-[60px] outline-none"
                        placeholder={`Message ${selectedChannel.type === 'dm' ? '@' : '#'}${selectedChannel.name}...`}
                     />
                     {/* Bottom Actions */}
                     <div className="flex items-center justify-between p-2 border-t border-slate-100 dark:border-slate-700/50">
                        <div className="flex items-center gap-1">
                           <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Attach file">
                              <Paperclip className="w-4 h-4" />
                           </button>
                           <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hidden sm:block" title="Emoji">
                              <Smile className="w-4 h-4" />
                           </button>
                           <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors hidden sm:block" title="Mention">
                              <AtSign className="w-4 h-4" />
                           </button>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="text-xs text-slate-400 hidden md:inline-block"><strong>Enter</strong> to send, <strong>Shift + Enter</strong> for new line</span>
                           <button
                              onClick={() => handleSendMessage()}
                              disabled={!newMessage.trim()}
                              className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
                           >
                              <span className="hidden sm:inline">Send</span>
                              <Send className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </main>

         {/* Video Call Modal */}
         {isInCall && (
            <div className="fixed inset-0 z-[200] bg-slate-900 flex flex-col animate-in fade-in duration-300">
               <header className="p-4 md:p-6 flex justify-between items-center bg-slate-900/50 backdrop-blur-md absolute top-0 w-full z-10">
                  <div className="flex items-center gap-3">
                     <div className="size-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                     <span className="font-bold text-sm text-white">Live Meeting • {selectedChannel.name}</span>
                  </div>
                  <button onClick={endCall} className="p-2 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors">
                     <X className="w-6 h-6" />
                  </button>
               </header>
               <main className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
                  <video ref={localVideoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />

                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 md:gap-6 bg-slate-900/80 backdrop-blur-md px-6 md:px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
                     <button className="size-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"><Mic className="w-5 h-5" /></button>
                     <button className="size-12 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center transition-colors"><Video className="w-5 h-5" /></button>
                     <div className="w-px h-8 bg-white/20 mx-1 md:mx-2"></div>
                     <button onClick={endCall} className="px-6 h-12 bg-red-600 rounded-xl font-bold text-sm text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">End Call</button>
                  </div>
               </main>
            </div>
         )}

         {/* New Channel Modal */}
         {showChannelModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create Channel</h3>
                     <button onClick={() => setShowChannelModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="space-y-6">
                     <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        <button
                           onClick={() => setNewChannelType('public')}
                           className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newChannelType === 'public' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                           Public
                        </button>
                        <button
                           onClick={() => setNewChannelType('private')}
                           className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newChannelType === 'private' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                           Private
                        </button>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Channel Name</label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                              {newChannelType === 'public' ? <Hash className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                           </span>
                           <input
                              value={newChannelName}
                              onChange={e => setNewChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none"
                              placeholder="e.g. design-sync"
                              autoFocus
                           />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Names must be lowercase, without spaces or periods.</p>
                     </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button onClick={() => setShowChannelModal(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                     <button
                        onClick={handleCreateChannel}
                        disabled={!newChannelName.trim()}
                        className="flex-1 py-2.5 bg-primary disabled:opacity-50 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
                     >
                        Create
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* New DM Modal */}
         {showDMModal && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Message</h3>
                     <button onClick={() => setShowDMModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                        <X className="w-5 h-5" />
                     </button>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0 mb-4 focus-within:border-primary/50 transition-colors">
                     <Search className="w-4 h-4 text-slate-400" />
                     <input className="bg-transparent border-none text-sm w-full focus:ring-0 text-slate-800 dark:text-slate-200 outline-none placeholder:text-slate-400" placeholder="Search team members..." autoFocus />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
                     <div className="space-y-1">
                        {employees.filter(e => e.id !== currentUser?.id).map(emp => {
                           const isOnline = onlineUserIds.includes(emp.id);
                           return (
                              <button
                                 key={emp.id}
                                 onClick={() => handleStartDM(emp)}
                                 className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left group"
                              >
                                 <div className="relative shrink-0">
                                    <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 uppercase text-xs">
                                       {emp.name.substring(0, 2)}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-slate-800 ${isOnline ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                 </div>
                                 <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{emp.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{emp.role || emp.email}</p>
                                 </div>
                              </button>
                           );
                        })}
                        {employees.length <= 1 && (
                           <div className="text-center py-8 text-sm text-slate-500">
                              No other team members found.
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
