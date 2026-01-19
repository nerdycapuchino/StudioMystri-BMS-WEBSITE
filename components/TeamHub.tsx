import React, { useState, useRef, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { MessageSquare, Folder, Video, Mic, MicOff, VideoOff, PhoneOff, Monitor, Paperclip, Send, Plus, MoreVertical, FileText, Image as ImageIcon, Download, Upload, Search, Users, Hash, User, Lock, Share2, X, Check, Eye } from 'lucide-react';
import { ChatMessage, Channel, FileItem } from '../types';

const KeyboardIcon = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" ry="2"/><path d="M6 8h.001"/><path d="M10 8h.001"/><path d="M14 8h.001"/><path d="M18 8h.001"/><path d="M6 12h.001"/><path d="M10 12h.001"/><path d="M14 12h.001"/><path d="M18 12h.001"/><path d="M7 16h10"/></svg>
);

export const TeamHub: React.FC = () => {
  const { currentUser, teamMessages, addTeamMessage, teamChannels, addTeamChannel, teamFiles, addTeamFile } = useGlobal();
  const [activeTab, setActiveTab] = useState<'chat' | 'files' | 'meet'>('chat');
  
  // --- CHAT STATE ---
  const [selectedChannel, setSelectedChannel] = useState<Channel>({ id: 'general', name: 'general', type: 'public' });
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');

  const directMessages = ['Vikram Malhotra', 'Ananya Singh', 'Kabir Khan', 'Accountant'];

  // Filter messages for current channel
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

  const handleCreateChannel = () => {
    if(newChannelName) {
      addTeamChannel({ 
        id: newChannelName.toLowerCase().replace(/\s/g, '-'), 
        name: newChannelName, 
        type: newChannelType 
      });
      setShowChannelModal(false);
      setNewChannelName('');
    }
  }

  const handleAttachFile = () => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      channelId: selectedChannel.id,
      sender: currentUser || 'Me',
      content: 'Shared a file',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser?.charAt(0) || 'M',
      attachment: { name: 'New_Specs_v2.pdf', type: 'pdf' }
    };
    addTeamMessage(msg);
  };

  const handleStartInstantMeeting = () => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      channelId: selectedChannel.id,
      sender: currentUser || 'Me',
      content: 'Started a meeting',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser?.charAt(0) || 'M',
      isMeeting: true
    };
    addTeamMessage(msg);
    setActiveTab('meet');
    setIsInCall(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, activeTab]);


  // --- FILES STATE ---
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [shareFile, setShareFile] = useState<FileItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement> | FileList) => {
    let fileList: FileList | null = null;
    if (e instanceof FileList) fileList = e;
    else if (e.target.files) fileList = e.target.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      const typeMap: any = { 'application/pdf': 'pdf', 'image/jpeg': 'image', 'image/png': 'image', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'sheet' };
      const newFile: FileItem = {
        id: Date.now().toString(),
        name: file.name,
        type: typeMap[file.type] || 'doc',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: new Date().toLocaleDateString(),
        owner: currentUser || 'Me'
      };
      addTeamFile(newFile);
    }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };


  // --- MEET STATE ---
  const [isInCall, setIsInCall] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [screenShare, setScreenShare] = useState(false);
  const [waitingRoom, setWaitingRoom] = useState(['Guest User 1']);

  const acceptUser = (user: string) => {
    setWaitingRoom(prev => prev.filter(u => u !== user));
  };

  // Renders
  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <MessageSquare className="w-4 h-4" /> Team Chat
        </button>
        <button 
          onClick={() => setActiveTab('files')} 
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'files' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Folder className="w-4 h-4" /> Enterprise Drive
        </button>
        <button 
          onClick={() => setActiveTab('meet')} 
          className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'meet' ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Video className="w-4 h-4" /> Online Meetings
        </button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* --- CHAT VIEW --- */}
        {activeTab === 'chat' && (
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
              <div className="p-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="w-full pl-8 pr-2 py-1.5 text-sm border rounded bg-white" placeholder="Jump to..." />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2">
                <div className="mb-6">
                  <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                    Channels <Plus className="w-3 h-3 cursor-pointer hover:text-indigo-600" onClick={() => setShowChannelModal(true)}/>
                  </h3>
                  <div className="space-y-0.5">
                    {teamChannels.map(ch => (
                      <button 
                        key={ch.id}
                        onClick={() => setSelectedChannel(ch)}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 ${selectedChannel.id === ch.id ? 'bg-indigo-100 text-indigo-900 font-medium' : 'text-slate-600 hover:bg-slate-100'}`}
                      >
                        {ch.type === 'public' ? <Hash className="w-3 h-3 opacity-50" /> : <Lock className="w-3 h-3 opacity-50" />} {ch.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="px-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex justify-between items-center">
                    Direct Messages <Plus className="w-3 h-3 cursor-pointer hover:text-indigo-600"/>
                  </h3>
                  <div className="space-y-0.5">
                    {directMessages.map(dm => (
                      <button 
                        key={dm}
                        className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center gap-2 text-slate-600 hover:bg-slate-100`}
                      >
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> {dm}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
              <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  {selectedChannel.type === 'public' ? <Hash className="w-5 h-5 text-slate-400"/> : <Lock className="w-5 h-5 text-slate-400"/>}
                  {selectedChannel.name}
                </h3>
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">U{i}</div>)}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {currentMessages.map(msg => (
                  <div key={msg.id} className={`flex gap-4 ${msg.sender === currentUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shrink-0 ${msg.sender === currentUser ? 'bg-indigo-600' : 'bg-slate-400'}`}>
                      {msg.avatar}
                    </div>
                    <div className={`flex flex-col ${msg.sender === currentUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-bold text-sm text-slate-900">{msg.sender}</span>
                        <span className="text-xs text-slate-400">{msg.timestamp}</span>
                      </div>
                      <div className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === currentUser ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                        {msg.content}
                        {msg.attachment && (
                           <div className="mt-2 bg-white/20 p-2 rounded flex items-center gap-2">
                              <FileText className="w-4 h-4"/> {msg.attachment.name}
                           </div>
                        )}
                        {msg.isMeeting && (
                           <button onClick={() => { setActiveTab('meet'); setIsInCall(true); }} className="mt-2 bg-white text-indigo-600 px-3 py-1 rounded font-bold text-xs flex items-center gap-1">
                              <Video className="w-3 h-3"/> Join Meeting
                           </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200">
                <form onSubmit={handleSendMessage} className="flex gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
                  <button type="button" onClick={handleAttachFile} className="p-2 text-slate-400 hover:text-slate-600"><Plus className="w-5 h-5" /></button>
                  <button type="button" onClick={handleStartInstantMeeting} className="p-2 text-slate-400 hover:text-slate-600" title="Start Meeting"><Video className="w-5 h-5" /></button>
                  <input 
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    placeholder={`Message ${selectedChannel.name}`}
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                  />
                  <button type="submit" className={`p-2 rounded-lg transition-colors ${newMessage.trim() ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* --- FILES VIEW --- */}
        {activeTab === 'files' && (
          <div className="h-full flex flex-col p-6 overflow-y-auto" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4">
                 <button className="text-sm font-bold text-slate-800 border-b-2 border-slate-800 pb-1">All Files</button>
                 <button className="text-sm text-slate-500 hover:text-slate-800 pb-1">Shared with me</button>
                 <button className="text-sm text-slate-500 hover:text-slate-800 pb-1">Recent</button>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer">
                 <Upload className="w-4 h-4" /> Upload New
                 <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            {isDragging && (
               <div className="absolute inset-0 bg-indigo-500/10 border-4 border-dashed border-indigo-500 z-10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <div className="text-indigo-600 font-bold text-xl flex flex-col items-center">
                     <Upload className="w-12 h-12 mb-2"/>
                     Drop files here to upload
                  </div>
               </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {teamFiles.map(file => (
                 <div key={file.id} className="group bg-white p-4 rounded-xl border border-slate-200 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 bg-white/80 rounded p-1">
                       <button onClick={(e) => { e.stopPropagation(); setShareFile(file); }} className="p-1 hover:bg-slate-100 rounded" title="Share"><Share2 className="w-4 h-4 text-slate-500"/></button>
                       <button onClick={(e) => { e.stopPropagation(); setPreviewFile(file); }} className="p-1 hover:bg-slate-100 rounded" title="Preview"><Eye className="w-4 h-4 text-slate-500"/></button>
                    </div>
                    <div className="h-32 bg-slate-50 rounded-lg mb-3 flex items-center justify-center text-slate-300">
                       {file.type === 'pdf' && <FileText className="w-12 h-12 text-red-400" />}
                       {file.type === 'sheet' && <FileText className="w-12 h-12 text-green-500" />}
                       {file.type === 'doc' && <FileText className="w-12 h-12 text-blue-500" />}
                       {file.type === 'image' && <ImageIcon className="w-12 h-12 text-purple-500" />}
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm truncate mb-1">{file.name}</h4>
                    <div className="flex justify-between text-[10px] text-slate-500">
                       <span>{file.size}</span>
                       <span>{file.date}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {/* --- MEET VIEW --- */}
        {activeTab === 'meet' && (
          <div className="h-full bg-slate-900 text-white relative flex flex-col">
            {!isInCall ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50 text-slate-900">
                 <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6">
                    <Video className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-bold mb-3">Team Meetings</h2>
                 <p className="text-slate-500 max-w-md mb-8">Connect with your team instantly. High-quality video and screen sharing for seamless collaboration.</p>
                 
                 <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                    <button onClick={() => setIsInCall(true)} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                       <Plus className="w-5 h-5" /> New Meeting
                    </button>
                    <div className="flex-1 relative">
                       <KeyboardIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                       <input placeholder="Enter a code" className="w-full h-full pl-12 pr-4 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                 </div>
                 
                 <div className="mt-12 w-full max-w-2xl">
                    <h3 className="text-left font-bold text-slate-800 mb-4 text-sm uppercase tracking-wide">Upcoming</h3>
                    <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg text-center min-w-[60px]">
                             <span className="block text-xs font-bold uppercase">Today</span>
                             <span className="block text-xl font-bold">2:00</span>
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-800">Weekly Design Review</h4>
                             <p className="text-xs text-slate-500">Oberoi Project Team • 1 hr</p>
                          </div>
                       </div>
                       <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50">Join</button>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col relative">
                 {/* Video Grid */}
                 <div className={`flex-1 grid ${waitingRoom.length > 0 ? 'grid-cols-[1fr_250px]' : 'grid-cols-1'} bg-black`}>
                    <div className="grid grid-cols-2 p-4 gap-4">
                        <div className="bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                           <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center text-3xl font-bold">A</div>
                           <div className="absolute bottom-4 left-4 text-sm font-medium bg-black/50 px-2 py-1 rounded">Ananya Singh</div>
                        </div>
                        <div className="bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                           <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-3xl font-bold">V</div>
                           <div className="absolute bottom-4 left-4 text-sm font-medium bg-black/50 px-2 py-1 rounded">Vikram M.</div>
                        </div>
                        <div className="bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center">
                           <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">K</div>
                           <div className="absolute bottom-4 left-4 text-sm font-medium bg-black/50 px-2 py-1 rounded">Kabir Khan</div>
                        </div>
                        <div className="bg-slate-800 rounded-2xl relative overflow-hidden flex items-center justify-center group">
                           {/* Self View */}
                           <div className="w-24 h-24 bg-slate-600 rounded-full flex items-center justify-center text-3xl font-bold border-2 border-white/20">You</div>
                           <div className="absolute bottom-4 left-4 text-sm font-medium bg-black/50 px-2 py-1 rounded">You (Me)</div>
                           {!cameraOn && <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center text-slate-400 text-sm">Camera Off</div>}
                           {screenShare && <div className="absolute top-2 right-2 bg-green-600 text-xs px-2 py-1 rounded">Sharing Screen</div>}
                        </div>
                    </div>

                    {/* Waiting Room Side Panel */}
                    {waitingRoom.length > 0 && (
                        <div className="bg-slate-900 border-l border-slate-800 p-4">
                           <h4 className="font-bold text-sm text-slate-400 mb-4 uppercase">Waiting Room ({waitingRoom.length})</h4>
                           <div className="space-y-3">
                              {waitingRoom.map(user => (
                                 <div key={user} className="bg-slate-800 p-3 rounded-lg">
                                    <p className="text-sm font-bold mb-2">{user}</p>
                                    <div className="flex gap-2">
                                       <button onClick={() => acceptUser(user)} className="flex-1 py-1 bg-green-600 rounded text-xs hover:bg-green-700">Admit</button>
                                       <button onClick={() => acceptUser(user)} className="flex-1 py-1 bg-red-600 rounded text-xs hover:bg-red-700">Deny</button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                    )}
                 </div>

                 {/* Controls */}
                 <div className="h-20 bg-slate-900 border-t border-slate-800 flex items-center justify-center gap-4 relative">
                    <button onClick={() => setMicOn(!micOn)} className={`p-4 rounded-full transition-colors ${micOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'}`}>
                       {micOn ? <Mic className="w-5 h-5"/> : <MicOff className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => setCameraOn(!cameraOn)} className={`p-4 rounded-full transition-colors ${cameraOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-500 hover:bg-red-600'}`}>
                       {cameraOn ? <Video className="w-5 h-5"/> : <VideoOff className="w-5 h-5"/>}
                    </button>
                    <button onClick={() => setScreenShare(!screenShare)} className={`p-4 rounded-full transition-colors ${screenShare ? 'bg-green-600 hover:bg-green-700' : 'bg-slate-700 hover:bg-slate-600'}`}>
                       <Monitor className="w-5 h-5"/>
                    </button>
                    <button onClick={() => alert('Muted all participants')} className="p-4 rounded-full bg-slate-700 hover:bg-slate-600" title="Mute All">
                       <MicOff className="w-5 h-5 text-red-400"/>
                    </button>
                    <button onClick={() => setIsInCall(false)} className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-full font-bold flex items-center gap-2">
                       <PhoneOff className="w-5 h-5" /> End Call
                    </button>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Channel Creation Modal */}
      {showChannelModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-80">
               <h3 className="font-bold text-lg mb-4">Create Channel</h3>
               <input className="w-full border p-2 rounded mb-3" placeholder="Channel Name" value={newChannelName} onChange={e => setNewChannelName(e.target.value)} />
               <select className="w-full border p-2 rounded mb-4" value={newChannelType} onChange={e => setNewChannelType(e.target.value as 'public' | 'private')}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
               </select>
               <div className="flex gap-2">
                  <button onClick={() => setShowChannelModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                  <button onClick={handleCreateChannel} className="flex-1 py-2 bg-indigo-600 text-white rounded">Create</button>
               </div>
            </div>
         </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-8">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-full flex flex-col overflow-hidden">
               <div className="flex justify-between items-center p-4 border-b">
                  <h3 className="font-bold text-lg">{previewFile.name}</h3>
                  <button onClick={() => setPreviewFile(null)}><X className="w-6 h-6"/></button>
               </div>
               <div className="flex-1 bg-slate-100 flex items-center justify-center">
                  <p className="text-slate-400 flex flex-col items-center">
                     <FileText className="w-16 h-16 mb-2"/>
                     Preview not available in demo
                  </p>
               </div>
            </div>
         </div>
      )}

      {/* Share Modal */}
      {shareFile && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl w-96">
               <h3 className="font-bold text-lg mb-4">Share "{shareFile.name}"</h3>
               <p className="text-sm text-slate-500 mb-4">Select users or channels to share with.</p>
               <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                  {directMessages.map(dm => (
                     <label key={dm} className="flex items-center gap-2 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input type="checkbox" /> {dm}
                     </label>
                  ))}
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setShareFile(null)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                  <button onClick={() => { alert('Shared successfully'); setShareFile(null); }} className="flex-1 py-2 bg-indigo-600 text-white rounded">Share</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};