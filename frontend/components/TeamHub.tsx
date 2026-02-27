import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AtSign,
  Bell,
  CameraOff,
  Download,
  Hash,
  Lock,
  Menu,
  Mic,
  MicOff,
  Monitor,
  MoreVertical,
  Paperclip,
  Pin,
  RefreshCcw,
  Search,
  Send,
  Smile,
  Video,
  VideoOff,
  X,
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Channel, ChatMessage } from '../types';
import { useChannels, useCreateChannel, useMembers, useMessages } from '../hooks/useTeam';
import { useMarkAllRead, useNotifications, useUnreadCount } from '../hooks/useNotifications';
import {
  clearConversation,
  deleteMessage as deleteMessageApi,
  reportConversation,
  sendMessage as sendMessageApi,
  uploadFileWithProgress,
} from '../services/team.service';
import { getSocket } from '../services/socket';

type Member = { id: string; name: string; email: string; role: string };
type FileItem = { id: string; name: string; url?: string; preview?: string; progress: number; error?: string };
type CallState = 'Connecting' | 'Connected' | 'Disconnected';
type FacingMode = 'user' | 'environment';

type UIMessage = ChatMessage & {
  senderId?: string;
  senderName: string;
  attachments?: string[];
};

const MAX = 10 * 1024 * 1024;
const ALLOWED = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const initials = (v?: string) => (v || 'U').slice(0, 2).toUpperCase();

const VideoTile: React.FC<{
  label: string;
  stream?: MediaStream;
  mirrored?: boolean;
  muted?: boolean;
  cameraOff?: boolean;
  highlighted?: boolean;
  pinned?: boolean;
  onPin?: () => void;
}> = ({ label, stream, mirrored, muted, cameraOff, highlighted, pinned, onPin }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (!stream || cameraOff) {
      ref.current.srcObject = null;
      return;
    }
    if (ref.current.srcObject !== stream) ref.current.srcObject = stream;
    ref.current.play().catch(() => undefined);
  }, [stream, cameraOff]);

  return (
    <div
      className={`relative aspect-video rounded-lg overflow-hidden border ${highlighted ? 'border-emerald-400 shadow-[0_0_0_2px_rgba(16,185,129,.4)]' : 'border-white/10'
        } bg-slate-900`}
    >
      {cameraOff || !stream ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-300">
          <CameraOff className="w-8 h-8 mb-2" />
          <p>{label}</p>
        </div>
      ) : (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        />
      )}
      <span className="absolute left-2 bottom-2 text-xs bg-black/50 px-2 py-1 rounded text-white">{label}</span>
      {onPin && (
        <button
          onClick={onPin}
          className={`absolute right-2 bottom-2 p-1.5 rounded ${pinned ? 'bg-primary text-white' : 'bg-black/50 text-white hover:bg-black/70'
            }`}
          title={pinned ? 'Unpin video' : 'Pin video'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export const TeamHub: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const createChannel = useCreateChannel();
  const markAllRead = useMarkAllRead();

  const { data: channelsRaw } = useChannels();
  const { data: membersRaw } = useMembers();
  const { data: unreadRaw = 0 } = useUnreadCount();
  const { data: notificationsRaw } = useNotifications({ page: 1, limit: 20 });

  const channels: Channel[] = Array.isArray((channelsRaw as any)?.data || channelsRaw)
    ? ((channelsRaw as any)?.data || channelsRaw)
    : [];
  const members: Member[] = Array.isArray((membersRaw as any)?.data || membersRaw)
    ? ((membersRaw as any)?.data || membersRaw)
    : [];
  const notifications = Array.isArray((notificationsRaw as any)?.data || notificationsRaw)
    ? ((notificationsRaw as any)?.data || notificationsRaw)
    : [];
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
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [sending, setSending] = useState(false);
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
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [speakerLevels, setSpeakerLevels] = useState<Record<string, number>>({});
  const [pinnedPeer, setPinnedPeer] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('user');
  const [isScreenSharing, setIsScreenSharing] = useState(false);

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
  const analyzersRef = useRef<Map<string, { ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array; source: MediaStreamAudioSourceNode }>>(
    new Map()
  );
  const inCallRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Keep inCallRef in sync so socket handlers always see the latest value
  useEffect(() => { inCallRef.current = inCall; }, [inCall]);

  const { data: messagesRaw } = useMessages(selected?.id || null, undefined);
  const messages: UIMessage[] = useMemo(() => {
    const raw = Array.isArray((messagesRaw as any)?.data || messagesRaw) ? ((messagesRaw as any)?.data || messagesRaw) : [];
    return raw.map((m: any) => ({
      ...m,
      senderName: typeof m.sender === 'string' ? m.sender : m.sender?.name || 'Unknown',
      senderId: m.senderId || m.sender?.id,
      timestamp:
        m.timestamp ||
        (m.createdAt
          ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : ''),
    }));
  }, [messagesRaw]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (channels.length && (!selected.id || !channels.find((c) => c.id === selected.id))) {
      setSelected(channels.find((c) => c.name.toLowerCase() === 'general') || channels[0]);
    }
  }, [channels, selected.id]);

  useEffect(() => {
    if (selected.id && unread > 0) markAllRead.mutate();
  }, [selected.id, unread, markAllRead]);

  useEffect(() => {
    const arm = () => setArmed(true);
    window.addEventListener('pointerdown', arm, { once: true });
    return () => window.removeEventListener('pointerdown', arm);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showMenu && menuRef.current && !menuRef.current.contains(target)) setShowMenu(false);
      if (showEmoji && emojiRef.current && !emojiRef.current.contains(target)) setShowEmoji(false);
      if (showMention && mentionRef.current && !mentionRef.current.contains(target)) setShowMention(false);
      if (showNotif && notifRef.current && !notifRef.current.contains(target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu, showEmoji, showMention, showNotif]);

  useEffect(() => {
    if (!localVideoRef.current || !streamRef.current) return;
    localVideoRef.current.srcObject = streamRef.current;
    localVideoRef.current.play().catch(() => undefined);
  }, [inCall, camOff, isScreenSharing]);

  useEffect(() => {
    if (!inCall) return;
    const interval = window.setInterval(() => {
      const next: Record<string, number> = {};
      analyzersRef.current.forEach((entry, id) => {
        entry.analyser.getByteFrequencyData(entry.data as unknown as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < entry.data.length; i += 1) sum += entry.data[i];
        next[id] = Math.round(sum / entry.data.length);
      });
      setSpeakerLevels(next);
    }, 250);
    return () => window.clearInterval(interval);
  }, [inCall]);

  const cleanupAnalyzers = () => {
    analyzersRef.current.forEach((entry) => {
      entry.source.disconnect();
      entry.analyser.disconnect();
      entry.ctx.close().catch(() => undefined);
    });
    analyzersRef.current.clear();
    setSpeakerLevels({});
  };

  const ensureAnalyzer = (id: string, stream: MediaStream) => {
    if (analyzersRef.current.has(id)) return;
    const hasAudio = stream.getAudioTracks().some((track) => track.enabled);
    if (!hasAudio) return;

    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyzersRef.current.set(id, { ctx, analyser, data: new Uint8Array(analyser.frequencyBinCount), source });
    } catch {
      // Ignore analyzer setup failures; call can still continue.
    }
  };

  const replaceOutgoingVideoTrack = (newTrack: MediaStreamTrack) => {
    const current = streamRef.current;
    if (!current) return;

    const oldTracks = current.getVideoTracks();
    oldTracks.forEach((track) => current.removeTrack(track));
    oldTracks.forEach((track) => track.stop());
    current.addTrack(newTrack);

    peersRef.current.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(newTrack).catch(() => undefined);
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = current;
      localVideoRef.current.play().catch(() => undefined);
    }
  };

  const createPeer = (targetId: string, initiator: boolean) => {
    const socket = getSocket();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peersRef.current.set(targetId, pc);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current!));
    }

    pc.onicecandidate = (event) => {
      if (!event.candidate || !selected.id) return;
      socket.emit('webrtc:signal', {
        targetId,
        signal: { ice: event.candidate },
        channelId: selected.id,
      });
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setCallState('Connected');
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') setCallState('Connecting');
      if (pc.connectionState === 'closed') setCallState('Disconnected');
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0];
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(targetId, stream);
        return next;
      });
      ensureAnalyzer(`remote:${targetId}`, stream);
      setCallState('Connected');
    };

    if (initiator) {
      pc.createOffer()
        .then(async (offer) => {
          await pc.setLocalDescription(offer);
          socket.emit('webrtc:signal', {
            targetId,
            signal: { sdp: pc.localDescription },
            channelId: selected.id,
          });
        })
        .catch(() => toast.error('Failed to start call'));
    }

    return pc;
  };

  const stopCall = (notify: boolean) => {
    const socket = getSocket();
    if (notify && selected.id) socket.emit('call:end', { channelId: selected.id });

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();
    cleanupAnalyzers();
    setRemoteStreams(new Map());
    setPinnedPeer(null);
    setIsScreenSharing(false);
    setInCall(false);
    setMuted(false);
    setCamOff(false);
    setCallState('Disconnected');
  };

  const startCall = async (mode: 'start' | 'join') => {
    if (!selected.id) return;
    try {
      const socket = getSocket();
      if (!socket.connected) socket.connect();

      setMediaError(null);
      setCallState('Connecting');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode } },
        audio: true,
      });

      streamRef.current = stream;
      ensureAnalyzer('local', stream);
      setInCall(true);
      setMuted(false);
      setCamOff(false);
      setIsScreenSharing(false);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => undefined);
      }

      socket.emit(mode === 'start' ? 'call:start' : 'call:join', { channelId: selected.id });
    } catch {
      setMediaError('Camera or microphone permission denied or unavailable.');
      setCallState('Disconnected');
    }
  };

  const toggleMute = () => {
    if (!streamRef.current) return;
    const audioTracks = streamRef.current.getAudioTracks();
    if (!audioTracks.length) return;
    const shouldEnable = !audioTracks[0].enabled;
    audioTracks.forEach((track) => {
      track.enabled = shouldEnable;
    });
    setMuted(!shouldEnable);
  };

  const toggleCamera = () => {
    if (!streamRef.current) return;
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setCamOff(!videoTrack.enabled);
  };

  const switchCamera = async () => {
    if (!streamRef.current || isScreenSharing) return;
    try {
      const nextMode: FacingMode = facingMode === 'user' ? 'environment' : 'user';
      const swap = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextMode } },
        audio: false,
      });
      const newTrack = swap.getVideoTracks()[0];
      if (!newTrack) return;
      replaceOutgoingVideoTrack(newTrack);
      setFacingMode(nextMode);
      setCamOff(false);
    } catch {
      toast.error('Unable to switch camera');
    }
  };

  const toggleScreenShare = async () => {
    if (!streamRef.current) return;

    if (isScreenSharing) {
      try {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode } },
          audio: false,
        });
        const camTrack = cam.getVideoTracks()[0];
        if (!camTrack) return;
        replaceOutgoingVideoTrack(camTrack);
        setIsScreenSharing(false);
        setCamOff(false);
      } catch {
        toast.error('Unable to restore camera');
      }
      return;
    }

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const displayTrack = display.getVideoTracks()[0];
      if (!displayTrack) return;

      displayTrack.onended = () => {
        setIsScreenSharing(false);
      };
      replaceOutgoingVideoTrack(displayTrack);
      setIsScreenSharing(true);
      setCamOff(false);
    } catch {
      toast.error('Screen share was blocked');
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!selected.id) return;
    if (!socket.connected) socket.connect();

    socket.emit('channel:join', selected.id);
    socket.emit('presence:ping');
    socket.emit('notifications:ping');

    const onNew = (message: any) => {
      if (message.channelId === selected.id) {
        qc.invalidateQueries({ queryKey: ['team', 'messages', selected.id] });
      }
    };

    const onDeleted = ({ channelId }: { channelId: string }) => {
      if (channelId === selected.id) {
        qc.invalidateQueries({ queryKey: ['team', 'messages', selected.id] });
      }
    };

    const onTyping = ({
      userName,
      isTyping,
      channelId,
    }: {
      userName: string;
      isTyping: boolean;
      channelId: string;
    }) => {
      if (channelId !== selected.id) return;
      setTyping((prev) => (isTyping ? Array.from(new Set([...prev, userName])) : prev.filter((u) => u !== userName)));
    };

    const onPresence = (ids: string[]) => setOnline(ids);
    const onCallStart = (payload: any) => {
      if (payload.channelId === selected.id) setActiveCall(payload);
    };
    const onCallEnd = (payload: any) => {
      if (payload.channelId === selected.id) {
        setActiveCall(null);
        stopCall(false);
      }
    };
    const onCallJoined = ({ userId }: { userId: string }) => {
      if (inCallRef.current && userId !== user?.id) createPeer(userId, true);
    };
    const onCallLeft = ({ userId }: { userId: string }) => {
      const pc = peersRef.current.get(userId);
      if (pc) {
        pc.close();
        peersRef.current.delete(userId);
      }
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.delete(userId);
        return next;
      });
    };

    const onSignal = async ({ senderId, signal }: any) => {
      let pc = peersRef.current.get(senderId);
      if (!pc) pc = createPeer(senderId, false);
      if (!pc) return;

      if (signal?.sdp) {
        await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
        if (signal.sdp.type === 'offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc:signal', {
            targetId: senderId,
            signal: { sdp: pc.localDescription },
            channelId: selected.id,
          });
        }
      }

      if (signal?.ice) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(signal.ice));
        } catch {
          // Ignore invalid/late ICE.
        }
      }
    };

    const onSocketError = ({ message }: { message?: string }) => {
      if (!message) return;
      toast.error(message);
    };

    const onNotification = () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['notifications', 'unread'] });
      if (sound && armed && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => undefined);
      }
    };

    socket.on('message:new', onNew);
    socket.on('message:deleted', onDeleted);
    socket.on('typing:update', onTyping);
    socket.on('presence:update', onPresence);
    socket.on('call:started', onCallStart);
    socket.on('call:ended', onCallEnd);
    socket.on('call:user-joined', onCallJoined);
    socket.on('call:user-left', onCallLeft);
    socket.on('webrtc:signal', onSignal);
    socket.on('notification:new', onNotification);
    socket.on('error', onSocketError);

    return () => {
      socket.off('message:new', onNew);
      socket.off('message:deleted', onDeleted);
      socket.off('typing:update', onTyping);
      socket.off('presence:update', onPresence);
      socket.off('call:started', onCallStart);
      socket.off('call:ended', onCallEnd);
      socket.off('call:user-joined', onCallJoined);
      socket.off('call:user-left', onCallLeft);
      socket.off('webrtc:signal', onSignal);
      socket.off('notification:new', onNotification);
      socket.off('error', onSocketError);
      socket.emit('channel:leave', selected.id);
    };
  }, [selected.id, qc, sound, armed, user?.id]);

  const insertAtCursor = (val: string) => {
    const textarea = textRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;
    setText(`${text.slice(0, start)}${val}${text.slice(end)}`);
  };

  const send = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (sending || !selected.id) return;

    const uploaded = files.filter((file) => file.url).map((file) => file.url!);
    const content = text.trim();
    if (!content && !uploaded.length) return;

    setSending(true);
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('message:send', { channelId: selected.id, content, attachments: uploaded });
      } else {
        await sendMessageApi({ channelId: selected.id, content, attachments: uploaded });
      }
      setText('');
      setFiles([]);
      qc.invalidateQueries({ queryKey: ['team', 'messages', selected.id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const onDeleteMsg = async (id: string) => {
    try {
      const socket = getSocket();
      if (socket.connected) {
        socket.emit('message:delete', id);
      } else {
        await deleteMessageApi(id);
      }
      await qc.invalidateQueries({ queryKey: ['team', 'messages', selected.id] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const onType = (value: string) => {
    setText(value);
    const idx = value.lastIndexOf('@');
    if (selected.type !== 'dm' && idx >= 0) {
      setMentionSearch(value.slice(idx + 1));
      setShowMention(true);
    } else {
      setShowMention(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
      return;
    }
    const socket = getSocket();
    socket.emit('typing:start', selected.id);
    window.setTimeout(() => socket.emit('typing:stop', selected.id), 1300);
  };

  const onEmoji = (emojiData: EmojiClickData) => insertAtCursor(emojiData.emoji);

  const mentionCandidates = members.filter(
    (member) => member.id !== user?.id && member.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const pickMention = (member: Member) => {
    const textarea = textRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart ?? text.length;
    const left = text.slice(0, pos);
    const idx = left.lastIndexOf('@');
    if (idx < 0) return;
    setText(`${text.slice(0, idx)}@${member.name.replace(/\s+/g, '_')} ${text.slice(pos)}`);
    setShowMention(false);
  };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      toast.error('Unsupported file type');
      return;
    }
    if (file.size > MAX) {
      toast.error('Maximum file size is 10MB');
      return;
    }

    const id = `${Date.now()}-${file.name}`;
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
    setFiles((prev) => [...prev, { id, name: file.name, preview, progress: 0 }]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const data = await uploadFileWithProgress(formData, (pct) =>
        setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: pct } : f)))
      );
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 100, url: data?.data?.url } : f)));
    } catch {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, error: 'Upload failed' } : f)));
    }
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const exportChat = () => {
    const lines = messages
      .filter((message) => message.channelId === selected.id)
      .map((message) => `[${message.timestamp}] ${message.senderName}: ${message.content}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selected.name.replace(/\s+/g, '_')}-chat.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const copyInviteLink = async () => {
    const link = `${window.location.origin}/team-hub?join=${encodeURIComponent(selected.id)}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Invite link copied');
    } catch {
      toast.error('Unable to copy invite link');
    }
  };

  const confirmDeleteConversation = async () => {
    if (!selected.id) return;
    setDeleteLoading(true);
    try {
      await clearConversation(selected.id);
      await qc.invalidateQueries({ queryKey: ['team', 'messages'] });
      toast.success('Conversation deleted');
      setShowDelete(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmReport = async () => {
    if (!selected.id) return;
    setReportLoading(true);
    try {
      await reportConversation({
        channelId: selected.id,
        reason: reportReason.trim(),
        details: reportDetails.trim() || undefined,
      });
      toast.success('Conversation reported');
      setShowReport(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      toast.error('Report failed');
    } finally {
      setReportLoading(false);
    }
  };

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    localStorage.setItem('teamhub_sound_enabled', next ? '1' : '0');
  };

  const dms = members.filter(
    (m) =>
      m.id !== user?.id &&
      (m.name.toLowerCase().includes(dmSearch.toLowerCase()) || m.email.toLowerCase().includes(dmSearch.toLowerCase()))
  );

  const channelMessages = messages.filter((message) => message.channelId === selected.id);
  const isGroup = selected.type !== 'dm';

  const speakerIds = useMemo(() => {
    return Object.entries(speakerLevels)
      .filter(([, level]) => level > 12)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);
  }, [speakerLevels]);

  const callTiles = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      stream?: MediaStream;
      local?: boolean;
      cameraOff?: boolean;
    }> = [];

    items.push({
      id: 'local',
      label: 'You',
      stream: streamRef.current || undefined,
      local: true,
      cameraOff: camOff,
    });

    Array.from(remoteStreams.entries()).forEach(([peerId, stream]) => {
      const member = members.find((m) => m.id === peerId);
      items.push({
        id: `remote:${peerId}`,
        label: member?.name || 'Participant',
        stream,
        local: false,
        cameraOff: stream.getVideoTracks().every((t) => !t.enabled),
      });
    });

    if (pinnedPeer) {
      const pinned = items.find((item) => item.id === pinnedPeer);
      if (pinned) {
        const others = items.filter((item) => item.id !== pinnedPeer);
        return [pinned, ...others];
      }
    }
    return items;
  }, [remoteStreams, members, camOff, pinnedPeer]);

  const visibleTiles = callTiles.slice(0, 6);
  const overflowCount = Math.max(0, callTiles.length - visibleTiles.length);

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-light dark:bg-background-dark">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/cartoon/pop.ogg" preload="auto" />

      <aside
        className={`${showMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } fixed md:relative inset-y-0 left-0 z-30 w-[280px] md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none`}
      >
        <div className="p-3 border-b border-slate-200 dark:border-slate-800">
          <div className="text-sm font-semibold">{user?.name || 'User'}</div>
          <div className="text-xs text-slate-500">{user?.role}</div>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto h-[calc(100%-52px)]">
          <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase">Channels</div>
          {[...channels.filter((c) => c.type === 'public'), ...channels.filter((c) => c.type === 'private')].map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelected(c);
                setShowMobile(false);
              }}
              className={`w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${selected.id === c.id ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''
                }`}
            >
              {c.type === 'private' ? <Lock className="w-4 h-4 inline mr-2" /> : <Hash className="w-4 h-4 inline mr-2" />}
              {c.name}
            </button>
          ))}
          <button onClick={() => setShowNewChannel(true)} className="w-full mt-1 text-sm px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            + Create Channel
          </button>
          <div className="px-2 pt-3 pb-1 text-xs font-semibold text-slate-500 uppercase">Direct Messages</div>
          {channels
            .filter((c) => c.type === 'dm')
            .map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelected(c);
                  setShowMobile(false);
                }}
                className={`w-full text-left px-2 py-2 rounded-lg text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${selected.id === c.id ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : ''
                  }`}
              >
                <span className="inline-flex w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] items-center justify-center mr-2">
                  {initials(c.name)}
                </span>
                {c.name}
              </button>
            ))}
          <button onClick={() => setShowDM(true)} className="w-full mt-1 text-sm px-2 py-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            + New Message
          </button>
        </div>
      </aside>
      {showMobile && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setShowMobile(false)} />}

      <main className="flex-1 flex flex-col min-w-0 w-full">
        <header className="flex items-center justify-between px-2 sm:px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            <button onClick={() => setShowMobile((v) => !v)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0">
              <Menu className="w-5 h-5" />
            </button>
            {selected.type === 'private' ? (
              <Lock className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            ) : selected.type === 'public' ? (
              <Hash className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
            )}
            <h2 className="font-semibold truncate text-sm sm:text-base">{selected.name}</h2>
            {callState !== 'Disconnected' && (
              <span
                className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${callState === 'Connected'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
                  }`}
              >
                {callState}
              </span>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            {isGroup && (
              <div className="hidden lg:flex -space-x-2 mr-1">
                {members.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center"
                  >
                    {initials(m.name)}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => startCall('start')} className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Start call">
              <Video className="w-4 h-4" />
            </button>
            {activeCall && !inCall && (
              <button onClick={() => startCall('join')} className="px-2 py-1 text-xs rounded bg-emerald-500 text-white">
                Join
              </button>
            )}
            <button onClick={copyInviteLink} className="hidden sm:block p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Copy invite link">
              <Download className="w-4 h-4" />
            </button>
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => {
                  setShowNotif((v) => !v);
                  if (unread > 0) markAllRead.mutate();
                }}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 relative"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </button>
              {showNotif && (
                <div className="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto top-14 sm:top-auto sm:mt-2 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30 max-h-[70vh] overflow-hidden flex flex-col">
                  <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-sm font-semibold">Notifications</span>
                    <button onClick={toggleSound} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">
                      {sound ? 'Sound On' : 'Sound Off'}
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length ? (
                      notifications.map((n: any) => (
                        <div key={n.id} className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                          <div className="text-sm">{n.title}</div>
                          <div className="text-xs text-slate-500">{n.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-slate-500">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={menuRef}>
              <button onClick={() => setShowMenu((v) => !v)} className="p-1.5 sm:p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-30">
                  <button
                    onClick={() => {
                      setShowDelete(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Delete Conversation
                  </button>
                  <button
                    onClick={() => {
                      setShowReport(true);
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Report Conversation
                  </button>
                  <button
                    onClick={() => {
                      exportChat();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {mediaError && <div className="px-3 py-1 text-xs text-red-500">{mediaError}</div>}

        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {channelMessages.map((m, i) => {
              const self = m.senderId === user?.id;
              const showAvatar = !self && (i === 0 || channelMessages[i - 1].senderName !== m.senderName);
              return (
                <div key={m.id} className={`flex gap-2 ${self ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center font-semibold ${!showAvatar && !self ? 'invisible' : ''}`}>
                    {initials(m.senderName)}
                  </div>
                  <div className={`max-w-[75%] sm:max-w-[70%] ${self ? 'items-end' : ''} flex flex-col`}>
                    <div className="text-xs text-slate-500 mb-1">
                      {self ? 'You' : m.senderName} · {m.timestamp}
                    </div>
                    <div className={`px-3 py-2 text-sm rounded-2xl shadow-sm ${self
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-md'
                      }`}>
                      {m.content}
                    </div>
                    {m.attachments?.length ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {m.attachments.map((url: string, idx: number) => (
                          <a key={idx} href={url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Attachment {idx + 1}</a>
                        ))}
                      </div>
                    ) : null}
                    {self && (
                      <button onClick={() => onDeleteMsg(m.id)} className="text-xs mt-1 text-slate-400 hover:text-red-500 transition-colors">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!channelMessages.length && <div className="h-full flex items-center justify-center text-slate-400 py-16">No messages yet</div>}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="px-4 pb-1 min-h-[20px]">
          {typing.length > 0 && <p className="text-xs text-slate-500 italic">{typing.join(', ')} typing...</p>}
        </div>

        <div className="p-2 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form onSubmit={send} className="border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
            <textarea
              ref={textRef}
              value={text}
              onChange={(e) => onType(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              className="w-full p-2 sm:p-3 bg-transparent outline-none text-sm resize-none min-h-[40px] sm:min-h-[56px] max-h-[120px]"
              placeholder={`Message ${selected.type === 'dm' ? '@' : '#'}${selected.name}...`}
            />
            {files.length > 0 && (
              <div className="px-3 pb-2 flex flex-wrap gap-2">
                {files.map((f) => (
                  <div key={f.id} className="text-xs px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span>{f.name}</span>
                    {!f.url && !f.error && <span className="ml-1 text-slate-500">{f.progress}%</span>}
                    {f.error && <span className="ml-1 text-red-500">{f.error}</span>}
                    <button type="button" onClick={() => removeFile(f.id)} className="ml-2 text-slate-400 hover:text-red-500">
                      <X className="w-3 h-3 inline" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between px-1.5 sm:px-2 py-1.5 sm:py-2 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button type="button" onClick={() => fileRef.current?.click()} className="p-1.5 sm:p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Paperclip className="w-4 h-4" />
                </button>
                <input ref={fileRef} type="file" className="hidden" onChange={upload} />
                <div className="relative" ref={emojiRef}>
                  <button type="button" onClick={() => setShowEmoji((v) => !v)} className="p-1.5 sm:p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
                    <Smile className="w-4 h-4" />
                  </button>
                  {showEmoji && (
                    <div className="fixed sm:absolute bottom-16 sm:bottom-12 left-2 sm:left-0 right-2 sm:right-auto z-40">
                      <EmojiPicker
                        onEmojiClick={onEmoji}
                        width="100%"
                        height={340}
                        searchPlaceholder="Search emojis"
                        theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                      />
                    </div>
                  )}
                </div>
                {selected.type !== 'dm' && (
                  <div className="relative" ref={mentionRef}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMention((v) => !v);
                        insertAtCursor('@');
                      }}
                      className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <AtSign className="w-4 h-4" />
                    </button>
                    {showMention && (
                      <div className="absolute bottom-12 left-0 z-40 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                        <input
                          value={mentionSearch}
                          onChange={(e) => setMentionSearch(e.target.value)}
                          placeholder="Search teammate..."
                          className="w-full px-2 py-1.5 text-sm rounded bg-slate-100 dark:bg-slate-800 outline-none mb-2"
                        />
                        <div className="max-h-40 overflow-y-auto">
                          {mentionCandidates.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => pickMention(m)}
                              className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={sending || (!text.trim() && !files.some((f) => f.url))}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-primary text-white text-sm disabled:opacity-50 flex items-center gap-1"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>

      {showDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold">Delete conversation?</h3>
            <p className="text-sm text-slate-500 mt-1">This is destructive.</p>
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowDelete(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={confirmDeleteConversation}
                disabled={deleteLoading}
                className="flex-1 px-3 py-2 rounded bg-red-600 text-white disabled:opacity-50"
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReport && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold">Report conversation</h3>
            <input
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Reason"
              className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none"
            />
            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Details"
              className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none min-h-24"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowReport(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={confirmReport}
                disabled={reportLoading || !reportReason.trim()}
                className="flex-1 px-3 py-2 rounded bg-primary text-white disabled:opacity-50"
              >
                {reportLoading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewChannel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold">Create channel</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button onClick={() => setNewType('public')} className={`px-2 py-2 rounded ${newType === 'public' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                Public
              </button>
              <button onClick={() => setNewType('private')} className={`px-2 py-2 rounded ${newType === 'private' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                Private
              </button>
            </div>
            <input
              value={newChannel}
              onChange={(e) => setNewChannel(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="channel-name"
              className="w-full mt-2 px-2 py-2 rounded bg-slate-100 dark:bg-slate-800 outline-none"
            />
            <div className="mt-3 flex gap-2">
              <button onClick={() => setShowNewChannel(false)} className="flex-1 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">
                Cancel
              </button>
              <button
                onClick={() =>
                  createChannel.mutate(
                    { name: newChannel.trim(), type: newType, participants: [] },
                    {
                      onSuccess: (ch: any) => {
                        setSelected(ch);
                        setShowNewChannel(false);
                        setNewChannel('');
                      },
                    }
                  )
                }
                disabled={!newChannel.trim()}
                className="flex-1 px-3 py-2 rounded bg-primary text-white disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showDM && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 max-h-[80vh] flex flex-col">
            <h3 className="font-semibold">New Message</h3>
            <div className="mt-2 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded px-2 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                value={dmSearch}
                onChange={(e) => setDmSearch(e.target.value)}
                placeholder="Search team members..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
            <div className="mt-2 overflow-y-auto">
              {dms.length ? (
                dms.map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      createChannel.mutate(
                        { name: `${user?.name || 'User'} & ${m.name}`, type: 'dm', participants: [user?.id || '', m.id] },
                        {
                          onSuccess: (ch: any) => {
                            setSelected(ch);
                            setShowDM(false);
                          },
                        }
                      )
                    }
                    className="w-full text-left px-2 py-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <span className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] flex items-center justify-center">{initials(m.name)}</span>
                    <span className="flex-1">{m.name}</span>
                    <span className={`w-2 h-2 rounded-full ${online.includes(m.id) ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                  </button>
                ))
              ) : (
                <div className="px-2 py-3 text-sm text-slate-500">No matching users</div>
              )}
            </div>
            <button onClick={() => setShowDM(false)} className="mt-2 px-3 py-2 rounded bg-slate-100 dark:bg-slate-800">
              Close
            </button>
          </div>
        </div>
      )}

      {inCall && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
          <div className="p-2 sm:p-3 border-b border-white/10 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-medium truncate">{selected.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${callState === 'Connected' ? 'bg-emerald-500/20 text-emerald-400' :
                callState === 'Connecting' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-slate-500/20 text-slate-400'
                }`}>{callState}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copyInviteLink} className="p-2 rounded hover:bg-white/10 text-xs" title="Copy invite link">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => stopCall(true)} className="p-2 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {speakerIds.length > 0 && (
            <div className="px-2 sm:px-3 py-1.5 border-b border-white/10 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {speakerIds.slice(0, 8).map((id) => {
                  const isLocal = id === 'local';
                  const cleanPeerId = id.replace('remote:', '');
                  const label = isLocal ? 'You' : members.find((m) => m.id === cleanPeerId)?.name || 'Participant';
                  return (
                    <div key={id} className="px-2 py-1 text-xs rounded-full border border-emerald-400/50 text-emerald-300 bg-emerald-500/10 animate-pulse">
                      {label} speaking
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex-1 p-2 sm:p-3 overflow-y-auto">
            {pinnedPeer && visibleTiles.length > 0 && visibleTiles[0].id === pinnedPeer ? (
              <div className="grid gap-2 sm:gap-3 h-full" style={{ gridTemplateRows: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
                <VideoTile
                  key={visibleTiles[0].id}
                  label={visibleTiles[0].label}
                  stream={visibleTiles[0].stream}
                  cameraOff={visibleTiles[0].cameraOff}
                  muted={visibleTiles[0].local}
                  mirrored={visibleTiles[0].local && !isScreenSharing}
                  pinned={true}
                  highlighted={speakerIds.includes(visibleTiles[0].id)}
                  onPin={() => setPinnedPeer(null)}
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {visibleTiles.slice(1).map((tile) => (
                    <VideoTile
                      key={tile.id}
                      label={tile.label}
                      stream={tile.stream}
                      cameraOff={tile.cameraOff}
                      muted={tile.local}
                      mirrored={tile.local && !isScreenSharing}
                      pinned={false}
                      highlighted={speakerIds.includes(tile.id)}
                      onPin={() => setPinnedPeer(tile.id)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 h-full">
                {visibleTiles.map((tile) => (
                  <VideoTile
                    key={tile.id}
                    label={tile.label}
                    stream={tile.stream}
                    cameraOff={tile.cameraOff}
                    muted={tile.local}
                    mirrored={tile.local && !isScreenSharing}
                    pinned={pinnedPeer === tile.id}
                    highlighted={speakerIds.includes(tile.id)}
                    onPin={() => setPinnedPeer((prev) => (prev === tile.id ? null : tile.id))}
                  />
                ))}
                {!remoteStreams.size && (
                  <div className="rounded-lg border border-dashed border-white/20 text-slate-400 flex items-center justify-center min-h-[120px]">
                    Waiting for participants...
                  </div>
                )}
                {overflowCount > 0 && (
                  <div className="rounded-lg border border-white/20 text-slate-300 flex items-center justify-center">
                    +{overflowCount} more in call
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="p-2 sm:p-3 border-t border-white/10 flex flex-wrap justify-center gap-2 sm:gap-3">
            <button onClick={toggleMute} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${muted ? 'bg-red-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`} title={muted ? 'Unmute' : 'Mute'}>
              {muted ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button onClick={toggleCamera} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${camOff ? 'bg-red-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`} title={camOff ? 'Turn on camera' : 'Turn off camera'}>
              {camOff ? <VideoOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Video className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <button onClick={toggleScreenShare} className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white hover:bg-slate-600'}`} title="Screen share">
              <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={switchCamera} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-slate-700 text-white hover:bg-slate-600 transition-colors" title="Switch camera">
              <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button onClick={() => stopCall(true)} className="px-4 sm:px-6 h-10 sm:h-12 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors text-sm sm:text-base">
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
