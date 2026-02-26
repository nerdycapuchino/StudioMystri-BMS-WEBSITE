import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AtSign, Bell, CameraOff, Download, Hash, Lock, Menu, Mic, MicOff, MoreVertical, Paperclip, Search, Send, Smile, Video, VideoOff, X } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Channel, ChatMessage } from '../types';
import { useChannels, useCreateChannel, useMembers, useMessages } from '../hooks/useTeam';
import { useMarkAllRead, useNotifications, useUnreadCount } from '../hooks/useNotifications';
import { clearConversation, reportConversation, uploadFileWithProgress } from '../services/team.service';
import { getSocket } from '../services/socket';

type Member = { id: string; name: string; email: string; role: string };
type FileItem = { id: string; name: string; url?: string; preview?: string; progress: number; error?: string };
type CallState = 'Connecting' | 'Connected' | 'Disconnected';

const MAX = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const initials = (v?: string) => (v || 'U').slice(0, 2).toUpperCase();

export const TeamHub: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const createChannel = useCreateChannel();
  const markAllRead = useMarkAllRead();
  const { data: channelsRaw } = useChannels();
  const { data: membersRaw } = useMembers();
  const { data: unreadRaw = 0 } = useUnreadCount();
  const { data: notificationsRaw } = useNotifications({ page: 1, limit: 20 });
  const channels: Channel[] = Array.isArray((channelsRaw as any)?.data || channelsRaw) ? ((channelsRaw as any)?.data || channelsRaw) : [];
  const members: Member[] = Array.isArray((membersRaw as any)?.data || membersRaw) ? ((membersRaw as any)?.data || membersRaw) : [];
  const notifications = Array.isArray((notificationsRaw as any)?.data || notificationsRaw) ? ((notificationsRaw as any)?.data || notificationsRaw) : [];
  const unread = Number((unreadRaw as any)?.data?.unread ?? unreadRaw ?? 0);

  const [selected, setSelected] = useState<Channel>({ id: '', name: 'general', type: 'public' });
  const [text, setText] = useState('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [typing, setTyping] = useState<string[]>([]);
  const [online, setOnline] = useState<string[]>([]);
  const [showMobile, setShowMobile] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMention, setShowMention] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showDM, setShowDM] = useState(false);
  const [newChannel, setNewChannel] = useState('');
  const [newType, setNewType] = useState<'public' | 'private'>('public');
  const [dmSearch, setDmSearch] = useState('');
  const [sound, setSound] = useState(() => localStorage.getItem('teamhub_sound_enabled') !== '0');
  const [armed, setArmed] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callState, setCallState] = useState<CallState>('Disconnected');
  const [activeCall, setActiveCall] = useState<{ channelId: string; startedBy: string } | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mentionRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const [remote, setRemote] = useState<Map<string, MediaStream>>(new Map());

  const { data: messagesRaw } = useMessages(selected?.id || null);
  const messages: (ChatMessage & { senderId?: string; senderName: string })[] = useMemo(() => {
    const raw = Array.isArray((messagesRaw as any)?.data || messagesRaw) ? ((messagesRaw as any)?.data || messagesRaw) : [];
    return raw.map((m: any) => ({ ...m, senderName: typeof m.sender === 'string' ? m.sender : (m.sender?.name || 'Unknown'), senderId: m.senderId || m.sender?.id, timestamp: m.timestamp || (m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '') }));
  }, [messagesRaw]);

  useEffect(() => { if (channels.length && (!selected.id || !channels.find((c) => c.id === selected.id))) setSelected(channels.find((c) => c.name.toLowerCase() === 'general') || channels[0]); }, [channels, selected.id]);
  useEffect(() => { if (selected.id && unread > 0) markAllRead.mutate(); }, [selected.id]);
  useEffect(() => { const arm = () => setArmed(true); window.addEventListener('pointerdown', arm, { once: true }); return () => window.removeEventListener('pointerdown', arm); }, []);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (showMenu && menuRef.current && !menuRef.current.contains(t)) setShowMenu(false);
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(t)) setShowEmoji(false);
      if (showMention && mentionRef.current && !mentionRef.current.contains(t)) setShowMention(false);
      if (showNotif && notifRef.current && !notifRef.current.contains(t)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, showEmoji, showMention, showNotif]);

  useEffect(() => {
    const s = getSocket(); if (!selected.id || !s) return; if (!s.connected) s.connect();
    s.emit('channel:join', selected.id); s.emit('presence:ping'); s.emit('notifications:ping');
    const onNew = (m: any) => { if (m.channelId === selected.id) qc.invalidateQueries({ queryKey: ['team', 'messages', selected.id] }); };
    const onTyping = ({ userName, isTyping, channelId }: any) => { if (channelId === selected.id) setTyping((p) => isTyping ? Array.from(new Set([...p, userName])) : p.filter((u) => u !== userName)); };
    const onPresence = (ids: string[]) => setOnline(ids);
    const onCallStart = (p: any) => { if (p.channelId === selected.id) setActiveCall(p); };
    const onCallEnd = (p: any) => { if (p.channelId === selected.id) { setActiveCall(null); stopCall(false); } };
    const onJoined = ({ userId }: any) => { if (inCall) createPeer(userId, true); };
    const onSignal = async ({ senderId, signal }: any) => {
      let pc = peersRef.current.get(senderId); if (!pc) pc = createPeer(senderId, false); if (!pc) return;
      if (signal?.sdp) { await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp)); if (signal.sdp.type === 'offer') { const ans = await pc.createAnswer(); await pc.setLocalDescription(ans); s.emit('webrtc:signal', { targetId: senderId, signal: { sdp: pc.localDescription }, channelId: selected.id }); } }
      if (signal?.ice) { try { await pc.addIceCandidate(new RTCIceCandidate(signal.ice)); } catch { } }
    };
    const onNotif = () => { qc.invalidateQueries({ queryKey: ['notifications'] }); qc.invalidateQueries({ queryKey: ['notifications', 'unread'] }); if (sound && armed && audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => undefined); } };
    s.on('message:new', onNew); s.on('typing:update', onTyping); s.on('presence:update', onPresence); s.on('call:started', onCallStart); s.on('call:ended', onCallEnd); s.on('call:user-joined', onJoined); s.on('webrtc:signal', onSignal); s.on('notification:new', onNotif);
    return () => { s.off('message:new', onNew); s.off('typing:update', onTyping); s.off('presence:update', onPresence); s.off('call:started', onCallStart); s.off('call:ended', onCallEnd); s.off('call:user-joined', onJoined); s.off('webrtc:signal', onSignal); s.off('notification:new', onNotif); s.emit('channel:leave', selected.id); };
  }, [selected.id, qc, inCall, sound, armed]);

  const createPeer = (targetId: string, initiator: boolean) => {
    const s = getSocket(); const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }); peersRef.current.set(targetId, pc);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => pc.addTrack(t, streamRef.current!));
    pc.onicecandidate = (e) => { if (e.candidate) s.emit('webrtc:signal', { targetId, signal: { ice: e.candidate }, channelId: selected.id }); };
    pc.ontrack = (e) => { setRemote((prev) => { const n = new Map(prev); n.set(targetId, e.streams[0]); return n; }); setCallState('Connected'); };
    if (initiator) pc.createOffer().then(async (offer) => { await pc.setLocalDescription(offer); s.emit('webrtc:signal', { targetId, signal: { sdp: pc.localDescription }, channelId: selected.id }); }).catch(() => toast.error('Failed to start call'));
    return pc;
  };
  const startCall = async (mode: 'start' | 'join') => {
    try {
      setMediaError(null); setCallState('Connecting');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream; setInCall(true); setMuted(false); setCamOff(false); if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      getSocket().emit(mode === 'start' ? 'call:start' : 'call:join', { channelId: selected.id });
    } catch { setMediaError('Camera or microphone permission denied.'); setCallState('Disconnected'); }
  };
  const stopCall = (notify: boolean) => {
    if (notify) getSocket().emit('call:end', { channelId: selected.id });
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    peersRef.current.forEach((p) => p.close()); peersRef.current.clear(); setRemote(new Map()); setInCall(false); setCallState('Disconnected');
  };
  const toggleMute = () => { const t = streamRef.current?.getAudioTracks()[0]; if (!t) return; t.enabled = !t.enabled; setMuted(!t.enabled); };
  const toggleCamera = () => { const t = streamRef.current?.getVideoTracks()[0]; if (!t) return; t.enabled = !t.enabled; setCamOff(!t.enabled); };

  const insertAtCursor = (val: string) => { const t = textRef.current; if (!t) return; const s = t.selectionStart ?? text.length; const e = t.selectionEnd ?? text.length; setText(`${text.slice(0, s)}${val}${text.slice(e)}`); };
  const send = (e?: React.FormEvent) => { if (e) e.preventDefault(); const urls = files.filter((f) => f.url).map((f) => f.url!); if (!text.trim() && !urls.length) return; getSocket().emit('message:send', { channelId: selected.id, content: text.trim(), attachments: urls }); setText(''); setFiles([]); };
  const onDeleteMsg = (id: string) => getSocket().emit('message:delete', id);
  const onType = (v: string) => { setText(v); const i = v.lastIndexOf('@'); if (selected.type !== 'dm' && i >= 0) { setMentionSearch(v.slice(i + 1)); setShowMention(true); } else setShowMention(false); };
  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); return; } const s = getSocket(); s.emit('typing:start', selected.id); window.setTimeout(() => s.emit('typing:stop', selected.id), 1300); };
  const onEmoji = (d: EmojiClickData) => insertAtCursor(d.emoji);
  const mentionCandidates = members.filter((m) => m.id !== user?.id && m.name.toLowerCase().includes(mentionSearch.toLowerCase()));
  const pickMention = (m: Member) => { const t = textRef.current; if (!t) return; const s = t.selectionStart ?? text.length; const left = text.slice(0, s); const i = left.lastIndexOf('@'); if (i < 0) return; setText(`${text.slice(0, i)}@${m.name.replace(/\s+/g, '_')} ${text.slice(s)}`); setShowMention(false); };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return; if (!ALLOWED.includes(file.type)) return toast.error('Unsupported file type'); if (file.size > MAX) return toast.error('Maximum file size is 10MB');
    const id = `${Date.now()}-${file.name}`; const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined; setFiles((p) => [...p, { id, name: file.name, preview, progress: 0 }]);
    const fd = new FormData(); fd.append('file', file);
    try { const data = await uploadFileWithProgress(fd, (pct) => setFiles((p) => p.map((f) => f.id === id ? { ...f, progress: pct } : f))); setFiles((p) => p.map((f) => f.id === id ? { ...f, progress: 100, url: data?.data?.url } : f)); } catch { setFiles((p) => p.map((f) => f.id === id ? { ...f, error: 'Upload failed' } : f)); }
  };
  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));

  const exportChat = () => { const lines = messages.filter((m) => m.channelId === selected.id).map((m) => `[${m.timestamp}] ${m.senderName}: ${m.content}`); const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${selected.name.replace(/\s+/g, '_')}-chat.txt`; a.click(); URL.revokeObjectURL(url); };
  const confirmDeleteConversation = async () => { setDeleteLoading(true); try { await clearConversation(selected.id); await qc.invalidateQueries({ queryKey: ['team', 'messages'] }); toast.success('Conversation deleted'); setShowDelete(false); } catch (e: any) { toast.error(e?.response?.data?.message || 'Delete failed'); } finally { setDeleteLoading(false); } };
  const confirmReport = async () => { setReportLoading(true); try { await reportConversation({ channelId: selected.id, reason: reportReason.trim(), details: reportDetails.trim() || undefined }); toast.success('Conversation reported'); setShowReport(false); setReportReason(''); setReportDetails(''); } catch { toast.error('Report failed'); } finally { setReportLoading(false); } };
  const toggleSound = () => { const next = !sound; setSound(next); localStorage.setItem('teamhub_sound_enabled', next ? '1' : '0'); };
  const dms = members.filter((m) => m.id !== user?.id && (m.name.toLowerCase().includes(dmSearch.toLowerCase()) || m.email.toLowerCase().includes(dmSearch.toLowerCase())));

  const channelMessages = messages.filter((m) => m.channelId === selected.id);
  const isGroup = selected.type !== 'dm';
  return (
    <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/cartoon/pop.ogg" preload="auto" />
      <aside className={`${showMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} absolute md:relative z-20 w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform`}>
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="text-sm font-semibold">{user?.name || 'User'}</div>
          <div className="text-xs text-slate-500">{user?.role}</div>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto h-[calc(100%-52px)]">
          <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Channels</div>
          {[...channels.filter((c) => c.type === 'public'), ...channels.filter((c) => c.type === 'private')].map((c) => (
            <button key={c.id} onClick={() => { setSelected(c); setShowMobile(false); }} className={`w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${selected.id === c.id ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`}>
              {c.type === 'private' ? <Lock className="w-4 h-4 inline mr-2" /> : <Hash className="w-4 h-4 inline mr-2" />}{c.name}
            </button>
          ))}
          <button onClick={() => setShowNewChannel(true)} className="w-full mt-1 text-sm px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">+ Create Channel</button>
          <div className="px-2 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase">Direct Messages</div>
          {channels.filter((c) => c.type === 'dm').map((c) => (
            <button key={c.id} onClick={() => { setSelected(c); setShowMobile(false); }} className={`w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${selected.id === c.id ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''}`}>
              <span className="inline-flex w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] items-center justify-center mr-2">{initials(c.name)}</span>{c.name}
            </button>
          ))}
          <button onClick={() => setShowDM(true)} className="w-full mt-1 text-sm px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">+ New Message</button>
        </div>
      </aside>
      {showMobile && <div className="fixed inset-0 z-10 bg-black/40 md:hidden" onClick={() => setShowMobile(false)} />}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={() => setShowMobile((v) => !v)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Menu className="w-4 h-4" /></button>
            {selected.type === 'private' ? <Lock className="w-4 h-4 text-slate-400" /> : selected.type === 'public' ? <Hash className="w-4 h-4 text-slate-400" /> : <span className="w-2 h-2 rounded-full bg-green-500" />}
            <h2 className="font-semibold truncate">{selected.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full ${callState === 'Connected' ? 'bg-green-100 text-green-700' : callState === 'Connecting' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{callState}</span>
          </div>
          <div className="flex items-center gap-1">
            {isGroup && <div className="hidden sm:flex -space-x-2 mr-1">{members.slice(0, 3).map((m) => <div key={m.id} className="w-7 h-7 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">{initials(m.name)}</div>)}</div>}
            <button onClick={() => startCall('start')} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Start call"><Video className="w-4 h-4" /></button>
            {activeCall && !inCall && <button onClick={() => startCall('join')} className="px-2 py-1 text-xs rounded bg-emerald-500 text-white">Join</button>}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotif((v) => !v); if (unread > 0) markAllRead.mutate(); }} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Bell className="w-4 h-4" />{unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}</button>
              {showNotif && <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30"><div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"><span className="text-sm font-semibold">Notifications</span><button onClick={toggleSound} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">{sound ? 'Sound On' : 'Sound Off'}</button></div><div className="max-h-72 overflow-y-auto">{notifications.length ? notifications.map((n: any) => <div key={n.id} className="px-3 py-2 border-b border-slate-100 dark:border-slate-800"><div className="text-sm">{n.title}</div><div className="text-xs text-slate-500">{n.message}</div></div>) : <div className="p-3 text-sm text-slate-500">No notifications</div>}</div></div>}
            </div>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu((v) => !v)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><MoreVertical className="w-4 h-4" /></button>
              {showMenu && <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30"><button onClick={() => { setShowDelete(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Delete Conversation</button><button onClick={() => { setShowReport(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">Report Conversation</button><button onClick={() => { exportChat(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"><Download className="w-4 h-4" />Export Chat</button></div>}
            </div>
          </div>
        </header>
        {mediaError && <div className="px-3 py-1 text-xs text-red-500">{mediaError}</div>}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">{channelMessages.map((m, i) => { const self = m.senderId === user?.id; const showAvatar = !self && (i === 0 || channelMessages[i - 1].senderName !== m.senderName); return <div key={m.id} className={`flex gap-2 ${self ? 'flex-row-reverse' : ''}`}><div className={`w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center ${!showAvatar && !self ? 'invisible' : ''}`}>{initials(m.senderName)}</div><div className={`max-w-[85%] ${self ? 'items-end' : ''} flex flex-col`}><div className="text-xs text-slate-500 mb-1">{self ? 'You' : m.senderName} · {m.timestamp}</div><div className={`px-3 py-2 text-sm rounded-xl border ${self ? 'bg-primary/10 border-primary/20' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>{m.content}</div>{self && <button onClick={() => onDeleteMsg(m.id)} className="text-xs mt-1 text-slate-400 hover:text-red-500">Delete</button>}</div></div>; })}{!channelMessages.length && <div className="h-full flex items-center justify-center text-slate-400">No messages yet</div>}</div>
        <div className="px-4 pb-1 min-h-[20px]">{typing.length > 0 && <p className="text-xs text-slate-500 italic">{typing.join(', ')} typing...</p>}</div>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form onSubmit={send} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
            <textarea ref={textRef} value={text} onChange={(e) => onType(e.target.value)} onKeyDown={onKeyDown} className="w-full p-3 bg-transparent outline-none text-sm resize-none min-h-[64px]" placeholder={`Message ${selected.type === 'dm' ? '@' : '#'}${selected.name}...`} />
            {files.length > 0 && <div className="px-3 pb-2 flex flex-wrap gap-2">{files.map((f) => <div key={f.id} className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"><span>{f.name}</span> {!f.url && !f.error && <span className="ml-1 text-slate-500">{f.progress}%</span>} {f.error && <span className="ml-1 text-red-500">{f.error}</span>} <button type="button" onClick={() => removeFile(f.id)} className="ml-2 text-slate-400 hover:text-red-500"><X className="w-3 h-3 inline" /></button></div>)}</div>}
            <div className="flex items-center justify-between px-2 py-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => fileRef.current?.click()} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Paperclip className="w-4 h-4" /></button><input ref={fileRef} type="file" className="hidden" onChange={upload} />
                <div className="relative" ref={emojiRef}><button type="button" onClick={() => setShowEmoji((v) => !v)} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><Smile className="w-4 h-4" /></button>{showEmoji && <div className="absolute bottom-12 left-0 z-40"><EmojiPicker onEmojiClick={onEmoji} width={320} height={380} searchPlaceholder="Search emojis" theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT} /></div>}</div>
                {selected.type !== 'dm' && <div className="relative" ref={mentionRef}><button type="button" onClick={() => { setShowMention((v) => !v); insertAtCursor('@'); }} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"><AtSign className="w-4 h-4" /></button>{showMention && <div className="absolute bottom-12 left-0 z-40 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2"><input value={mentionSearch} onChange={(e) => setMentionSearch(e.target.value)} placeholder="Search teammate..." className="w-full px-2 py-1.5 text-sm rounded bg-slate-100 dark:bg-slate-800 outline-none mb-2" /><div className="max-h-40 overflow-y-auto">{mentionCandidates.map((m) => <button key={m.id} type="button" onClick={() => pickMention(m)} className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-800">{m.name}</button>)}</div></div>}</div>}
              </div>
              <button type="submit" disabled={!text.trim() && !files.some((f) => f.url)} className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50 flex items-center gap-1">Send <Send className="w-4 h-4" /></button>
            </div>
          </form>
        </div>
      </main>
      {showDelete && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"><div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800"><h3 className="font-semibold">Delete conversation?</h3><p className="text-sm text-slate-500 mt-1">This is destructive.</p><div className="mt-3 flex gap-2"><button onClick={() => setShowDelete(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">Cancel</button><button onClick={confirmDeleteConversation} disabled={deleteLoading} className="flex-1 px-3 py-2 rounded bg-red-600 text-white">{deleteLoading ? 'Deleting...' : 'Delete'}</button></div></div></div>}
      {showReport && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"><div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800"><h3 className="font-semibold">Report conversation</h3><input value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Reason" className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none" /><textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Details" className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none min-h-24" /><div className="mt-3 flex gap-2"><button onClick={() => setShowReport(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">Cancel</button><button onClick={confirmReport} disabled={reportLoading || !reportReason.trim()} className="flex-1 px-3 py-2 rounded bg-primary text-white">{reportLoading ? 'Submitting...' : 'Submit'}</button></div></div></div>}
      {showNewChannel && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"><div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800"><h3 className="font-semibold">Create channel</h3><div className="mt-2 grid grid-cols-2 gap-2"><button onClick={() => setNewType('public')} className={`px-2 py-2 rounded ${newType === 'public' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Public</button><button onClick={() => setNewType('private')} className={`px-2 py-2 rounded ${newType === 'private' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>Private</button></div><input value={newChannel} onChange={(e) => setNewChannel(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="channel-name" className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none" /><div className="mt-3 flex gap-2"><button onClick={() => setShowNewChannel(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">Cancel</button><button onClick={() => createChannel.mutate({ name: newChannel.trim(), type: newType, participants: [] }, { onSuccess: (ch: any) => { setSelected(ch); setShowNewChannel(false); setNewChannel(''); } })} disabled={!newChannel.trim()} className="flex-1 px-3 py-2 rounded bg-primary text-white disabled:opacity-50">Create</button></div></div></div>}
      {showDM && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"><div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col"><h3 className="font-semibold">New Message</h3><div className="mt-2 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded px-2 py-2"><Search className="w-4 h-4 text-slate-400" /><input value={dmSearch} onChange={(e) => setDmSearch(e.target.value)} placeholder="Search team members..." className="bg-transparent outline-none w-full text-sm" /></div><div className="mt-2 overflow-y-auto">{dms.map((m) => <button key={m.id} onClick={() => createChannel.mutate({ name: `${user?.name || 'User'} & ${m.name}`, type: 'dm', participants: [user?.id || '', m.id] }, { onSuccess: (ch: any) => { setSelected(ch); setShowDM(false); } })} className="w-full text-left px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"><span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">{initials(m.name)}</span><span className="flex-1">{m.name}</span><span className={`w-2 h-2 rounded-full ${online.includes(m.id) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span></button>)}</div><button onClick={() => setShowDM(false)} className="mt-2 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">Close</button></div></div>}
      {inCall && <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col"><div className="p-3 border-b border-white/10 text-white flex items-center justify-between"><span>{selected.name} · {callState}</span><button onClick={() => stopCall(true)} className="p-2 rounded hover:bg-white/10"><X className="w-4 h-4" /></button></div><div className="flex-1 p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"><div className="rounded-lg overflow-hidden bg-slate-900 border border-white/10 aspect-video relative">{camOff ? <div className="h-full flex flex-col items-center justify-center text-slate-300"><CameraOff className="w-8 h-8 mb-2" /><p>{user?.name || 'You'}</p></div> : <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />}<span className="absolute left-2 bottom-2 text-xs bg-black/50 px-2 py-1 rounded">You</span></div>{Array.from(remote.entries()).map(([peerId, stream]) => <div key={peerId} className="rounded-lg overflow-hidden bg-slate-900 border border-white/10 aspect-video relative"><video autoPlay playsInline ref={(el) => { if (el) el.srcObject = stream; }} className="w-full h-full object-cover" /><span className="absolute left-2 bottom-2 text-xs bg-black/50 px-2 py-1 rounded text-white">{members.find((m) => m.id === peerId)?.name || 'Participant'}</span></div>)}{!remote.size && <div className="rounded-lg border border-dashed border-white/20 text-slate-400 flex items-center justify-center">Waiting for participants...</div>}</div><div className="p-3 border-t border-white/10 flex justify-center gap-3"><button onClick={toggleMute} className={`w-12 h-12 rounded-full flex items-center justify-center ${muted ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'}`}>{muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}</button><button onClick={toggleCamera} className={`w-12 h-12 rounded-full flex items-center justify-center ${camOff ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'}`}>{camOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}</button><button onClick={() => stopCall(true)} className="px-6 h-12 rounded-xl bg-red-600 text-white font-semibold">End Call</button></div></div>}
    </div>
  );
};
