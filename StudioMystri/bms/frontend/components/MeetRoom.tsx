import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Camera,
    CameraOff,
    Hand,
    Link2,
    Lock,
    LogOut,
    Mic,
    MicOff,
    Monitor,
    MonitorOff,
    MoreVertical,
    Phone,
    Pin,
    RefreshCcw,
    Shield,
    Unlock,
    UserPlus,
    X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface Participant {
    id: string;
    peerId: string;
    userName: string;
    stream?: MediaStream;
    isLocal?: boolean;
    muted?: boolean;
    videoOff?: boolean;
    isScreenShare?: boolean;
    speakerLevel?: number;
    handRaised?: boolean;
}

interface WaitingUser {
    participantId: string;
    userId: string;
    userName: string;
    isGuest: boolean;
}

type FacingMode = 'user' | 'environment';

// ─── VIDEO TILE ──────────────────────────────────────────────────────────────

const VideoTile: React.FC<{
    participant: Participant;
    pinned?: boolean;
    activeSpeaker?: boolean;
    large?: boolean;
    onPin?: () => void;
}> = ({ participant, pinned, activeSpeaker, large, onPin }) => {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        if (!participant.stream || participant.videoOff) {
            ref.current.srcObject = null;
            return;
        }
        if (ref.current.srcObject !== participant.stream) {
            ref.current.srcObject = participant.stream;
        }
        ref.current.play().catch(() => undefined);
    }, [participant.stream, participant.videoOff]);

    const initials = (participant.userName || 'U').slice(0, 2).toUpperCase();

    return (
        <div
            className={`relative rounded-xl overflow-hidden border-2 transition-all duration-300 ${activeSpeaker
                ? 'border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,.5)]'
                : pinned
                    ? 'border-blue-400 shadow-[0_0_12px_rgba(59,130,246,.4)]'
                    : 'border-white/10'
                } bg-gradient-to-br from-slate-800 to-slate-900 ${large ? 'col-span-full row-span-2 aspect-video' : 'aspect-video'
                }`}
        >
            {participant.videoOff || !participant.stream ? (
                <div className="h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2 shadow-lg">
                        {initials}
                    </div>
                    <p className="text-white/70 text-sm">{participant.userName}</p>
                </div>
            ) : (
                <video
                    ref={ref}
                    autoPlay
                    playsInline
                    muted={participant.isLocal}
                    className={`w-full h-full object-cover ${participant.isLocal && !participant.isScreenShare ? 'scale-x-[-1]' : ''}`}
                />
            )}

            {/* Bottom bar */}
            <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-white font-medium truncate max-w-[100px]">
                        {participant.isLocal ? 'You' : participant.userName}
                    </span>
                    {participant.handRaised && (
                        <span className="text-yellow-400 animate-bounce">✋</span>
                    )}
                </div>
                <div className="flex items-center gap-1">
                    {participant.muted && (
                        <div className="bg-red-500/80 rounded-full p-0.5">
                            <MicOff className="w-3 h-3 text-white" />
                        </div>
                    )}
                    {participant.isScreenShare && (
                        <div className="bg-blue-500/80 rounded-full p-0.5">
                            <Monitor className="w-3 h-3 text-white" />
                        </div>
                    )}
                    {onPin && (
                        <button
                            onClick={onPin}
                            className={`rounded-full p-1 ${pinned ? 'bg-blue-500 text-white' : 'bg-black/40 text-white/70 hover:text-white'}`}
                        >
                            <Pin className="w-3 h-3" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── MEET ROOM ───────────────────────────────────────────────────────────────

export const MeetRoom: React.FC = () => {
    const { meetingCode } = useParams<{ meetingCode: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const guestToken = searchParams.get('guestToken');
    const participantId = searchParams.get('pid') || '';
    const isHost = searchParams.get('host') === '1';

    // ── State ──
    const [connected, setConnected] = useState(false);
    const [muted, setMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [facingMode, setFacingMode] = useState<FacingMode>('user');
    const [pinnedPeer, setPinnedPeer] = useState<string | null>(null);
    const [waitingRoom, setWaitingRoom] = useState<WaitingUser[]>([]);
    const [showWaiting, setShowWaiting] = useState(false);
    const [meetingEnded, setMeetingEnded] = useState(false);
    const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
    const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
    const [gridPage, setGridPage] = useState(0);

    // ── Refs ──
    const streamRef = useRef<MediaStream | null>(null);
    const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
    const analyzersRef = useRef<Map<string, { ctx: AudioContext; analyser: AnalyserNode; data: Uint8Array<ArrayBuffer> }>>(new Map());
    const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

    const userId = user?.id || `guest_${participantId}`;
    const userName = user?.name || searchParams.get('guestName') || 'Guest';

    // ── ICE Configuration ──
    const iceConfig: RTCConfiguration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    // ── Initialize Media ──
    const initMedia = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: facingMode } },
                audio: true,
            });
            streamRef.current = stream;

            // Add local participant
            setParticipants(prev => {
                const next = new Map(prev);
                next.set('local', {
                    id: 'local',
                    peerId: userId,
                    userName,
                    stream,
                    isLocal: true,
                    muted: false,
                    videoOff: false,
                });
                return next;
            });

            return stream;
        } catch {
            toast.error('Camera or mic permission denied');
            return null;
        }
    }, [facingMode, userId, userName]);

    // ── Create Peer Connection ──
    const createPeer = useCallback((targetId: string, initiator: boolean) => {
        if (peersRef.current.has(targetId)) return peersRef.current.get(targetId)!;

        const pc = new RTCPeerConnection(iceConfig);
        peersRef.current.set(targetId, pc);
        const socket = socketRef.current;

        // Add local tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, streamRef.current!);
            });
        }

        pc.onicecandidate = (e) => {
            if (e.candidate && socket) {
                socket.emit('peer:ice', {
                    targetId,
                    candidate: e.candidate,
                    meetingCode,
                });
            }
        };

        pc.ontrack = (e) => {
            const [remoteStream] = e.streams;
            if (remoteStream) {
                setParticipants(prev => {
                    const next = new Map(prev);
                    const existing = next.get(targetId);
                    next.set(targetId, {
                        id: targetId,
                        peerId: targetId,
                        userName: existing?.userName || 'Participant',
                        stream: remoteStream,
                        isLocal: false,
                        muted: existing?.muted || false,
                        videoOff: existing?.videoOff || false,
                    });
                    return next;
                });
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
                pc.close();
                peersRef.current.delete(targetId);
            }
        };

        if (initiator) {
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .then(() => {
                    if (socket && pc.localDescription) {
                        socket.emit('peer:offer', {
                            targetId,
                            sdp: pc.localDescription,
                            meetingCode,
                        });
                    }
                })
                .catch(() => { });
        }

        return pc;
    }, [meetingCode]);

    // ── Replace video track ──
    const replaceVideoTrack = useCallback((newTrack: MediaStreamTrack) => {
        if (!streamRef.current) return;
        const oldTrack = streamRef.current.getVideoTracks()[0];
        if (oldTrack) {
            streamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
        }
        streamRef.current.addTrack(newTrack);

        // Update all peer connections
        peersRef.current.forEach((pc) => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) sender.replaceTrack(newTrack).catch(() => { });
        });

        // Update local participant
        setParticipants(prev => {
            const next = new Map(prev);
            const local = next.get('local');
            if (local) {
                next.set('local', { ...local, stream: streamRef.current! });
            }
            return next;
        });
    }, []);

    // ── Active speaker detection ──
    useEffect(() => {
        const interval = setInterval(() => {
            if (!streamRef.current || !socketRef.current) return;

            // Check local audio level
            const localAnalyzer = analyzersRef.current.get('local');
            if (!localAnalyzer) {
                try {
                    const ctx = new AudioContext();
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 256;
                    const source = ctx.createMediaStreamSource(streamRef.current);
                    source.connect(analyser);
                    const data = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>;
                    analyzersRef.current.set('local', { ctx, analyser, data });
                } catch { /* ignore */ }
                return;
            }

            localAnalyzer.analyser.getByteFrequencyData(localAnalyzer.data);
            const avg = localAnalyzer.data.reduce((a, b) => a + b, 0) / localAnalyzer.data.length;

            if (avg > 15 && !muted) {
                // Send sample to server — server decides active speaker (Fix #5)
                socketRef.current.emit('active-speaker:sample', {
                    meetingCode,
                    level: Math.round(avg),
                });
            }
        }, 500);

        return () => clearInterval(interval);
    }, [meetingCode, muted]);

    // ── Socket Connection & Events ──
    useEffect(() => {
        if (!meetingCode) return;

        const socket = getSocket();
        socketRef.current = socket;
        if (!socket.connected) socket.connect();

        const init = async () => {
            const stream = await initMedia();
            if (!stream) return;

            socket.emit('meeting:join', { meetingCode, participantId });
        };

        init();

        // ── Socket Event Handlers ──

        socket.on('meeting:joined', () => {
            setConnected(true);
            toast.success('Joined meeting');
        });

        socket.on('meeting:waiting', () => {
            toast('Waiting for host to admit you...', { icon: '⏳', duration: 10000 });
        });

        socket.on('waiting:admitted', () => {
            setConnected(true);
            toast.success('You have been admitted to the meeting');
        });

        socket.on('waiting:rejected', () => {
            toast.error('Your request to join was denied');
            navigate('/team-hub');
        });

        socket.on('meeting:user-joined', ({ userId: joinedId, userName: joinedName }) => {
            toast(`${joinedName} joined`, { icon: '👤' });
            setParticipants(prev => {
                const next = new Map(prev);
                if (!next.has(joinedId)) {
                    next.set(joinedId, {
                        id: joinedId,
                        peerId: joinedId,
                        userName: joinedName,
                        isLocal: false,
                        muted: false,
                        videoOff: false,
                    });
                }
                return next;
            });
            // Create peer connection (initiator)
            createPeer(joinedId, true);
        });

        socket.on('meeting:user-left', ({ userId: leftId, userName: leftName }) => {
            toast(`${leftName} left`, { icon: '👋' });
            const pc = peersRef.current.get(leftId);
            if (pc) {
                pc.close();
                peersRef.current.delete(leftId);
            }
            setParticipants(prev => {
                const next = new Map(prev);
                next.delete(leftId);
                return next;
            });
        });

        socket.on('meeting:ended', () => {
            setMeetingEnded(true);
            toast.error('Meeting has ended');
            // Cleanup
            streamRef.current?.getTracks().forEach(t => t.stop());
            peersRef.current.forEach(pc => pc.close());
            peersRef.current.clear();
            setTimeout(() => navigate('/team-hub'), 3000);
        });

        // ── WebRTC Signaling ──

        socket.on('peer:offer', async ({ senderId, sdp }) => {
            const pc = createPeer(senderId, false);
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('peer:answer', {
                targetId: senderId,
                sdp: pc.localDescription,
                meetingCode,
            });
        });

        socket.on('peer:answer', async ({ senderId, sdp }) => {
            const pc = peersRef.current.get(senderId);
            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            }
        });

        socket.on('peer:ice', async ({ senderId, candidate }) => {
            const pc = peersRef.current.get(senderId);
            if (pc) {
                try {
                    await pc.addIceCandidate(new RTCIceCandidate(candidate));
                } catch { /* late ICE */ }
            }
        });

        // ── Participant State ──

        socket.on('participant:mute', ({ userId: uid, muted: m }) => {
            setParticipants(prev => {
                const next = new Map(prev);
                const p = next.get(uid);
                if (p) next.set(uid, { ...p, muted: m });
                return next;
            });
        });

        socket.on('participant:video-toggle', ({ userId: uid, videoOff: v }) => {
            setParticipants(prev => {
                const next = new Map(prev);
                const p = next.get(uid);
                if (p) next.set(uid, { ...p, videoOff: v });
                return next;
            });
        });

        socket.on('active-speaker:update', ({ userId: uid }) => {
            setActiveSpeakerId(uid);
        });

        socket.on('raise-hand', ({ userId: uid, userName: uName, raised }) => {
            setParticipants(prev => {
                const next = new Map(prev);
                const p = next.get(uid);
                if (p) next.set(uid, { ...p, handRaised: raised });
                return next;
            });
            if (raised) toast(`${uName} raised hand`, { icon: '✋' });
        });

        // ── Waiting Room (Host) ──

        socket.on('waiting:request', (data: WaitingUser) => {
            setWaitingRoom(prev => [...prev, data]);
            toast(`${data.userName} is waiting to join`, { icon: '🚪', duration: 10000 });
        });

        // ── Screen Share ──

        socket.on('screen:started', ({ userId: uid, userName: uName }) => {
            setParticipants(prev => {
                const next = new Map(prev);
                const p = next.get(uid);
                if (p) next.set(uid, { ...p, isScreenShare: true });
                return next;
            });
            toast(`${uName} is sharing screen`, { icon: '🖥️' });
        });

        socket.on('screen:stopped', ({ userId: uid }) => {
            setParticipants(prev => {
                const next = new Map(prev);
                const p = next.get(uid);
                if (p) next.set(uid, { ...p, isScreenShare: false });
                return next;
            });
        });

        return () => {
            socket.emit('meeting:leave', { meetingCode });
            socket.off('meeting:joined');
            socket.off('meeting:waiting');
            socket.off('waiting:admitted');
            socket.off('waiting:rejected');
            socket.off('meeting:user-joined');
            socket.off('meeting:user-left');
            socket.off('meeting:ended');
            socket.off('peer:offer');
            socket.off('peer:answer');
            socket.off('peer:ice');
            socket.off('participant:mute');
            socket.off('participant:video-toggle');
            socket.off('active-speaker:update');
            socket.off('raise-hand');
            socket.off('waiting:request');
            socket.off('screen:started');
            socket.off('screen:stopped');

            streamRef.current?.getTracks().forEach(t => t.stop());
            peersRef.current.forEach(pc => pc.close());
            peersRef.current.clear();
            analyzersRef.current.forEach(a => a.ctx.close());
            analyzersRef.current.clear();
        };
    }, [meetingCode]);

    // ── Controls ──

    const toggleMute = () => {
        if (!streamRef.current) return;
        const tracks = streamRef.current.getAudioTracks();
        tracks.forEach(t => { t.enabled = muted; });
        setMuted(!muted);
        socketRef.current?.emit('participant:mute', { meetingCode, muted: !muted });
    };

    const toggleCamera = () => {
        if (!streamRef.current) return;
        const track = streamRef.current.getVideoTracks()[0];
        if (!track) return;
        track.enabled = camOff;
        setCamOff(!camOff);
        socketRef.current?.emit('participant:video-toggle', { meetingCode, videoOff: !camOff });
    };

    const switchCamera = async () => {
        if (isScreenSharing) return;
        try {
            const next: FacingMode = facingMode === 'user' ? 'environment' : 'user';
            const swap = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: next } },
                audio: false,
            });
            const newTrack = swap.getVideoTracks()[0];
            if (newTrack) {
                replaceVideoTrack(newTrack);
                setFacingMode(next);
                setCamOff(false);
            }
        } catch {
            toast.error('Unable to switch camera');
        }
    };

    const toggleScreenShare = async () => {
        if (!streamRef.current) return;
        const socket = socketRef.current;

        if (isScreenSharing) {
            try {
                const cam = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: facingMode } },
                    audio: false,
                });
                const camTrack = cam.getVideoTracks()[0];
                if (camTrack) replaceVideoTrack(camTrack);
                setIsScreenSharing(false);
                setCamOff(false);
                socket?.emit('screen:stop', { meetingCode });
            } catch {
                toast.error('Unable to restore camera');
            }
            return;
        }

        try {
            const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const displayTrack = display.getVideoTracks()[0];
            if (!displayTrack) return;

            displayTrack.onended = () => {
                setIsScreenSharing(false);
                socket?.emit('screen:stop', { meetingCode });
                navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facingMode } }, audio: false })
                    .then(cam => {
                        const t = cam.getVideoTracks()[0];
                        if (t) replaceVideoTrack(t);
                    }).catch(() => { });
            };

            replaceVideoTrack(displayTrack);
            setIsScreenSharing(true);
            socket?.emit('screen:start', { meetingCode });
        } catch {
            toast.error('Screen share denied');
        }
    };

    const toggleHand = () => {
        const raised = !handRaised;
        setHandRaised(raised);
        socketRef.current?.emit('raise-hand', { meetingCode, raised });
        setParticipants(prev => {
            const next = new Map(prev);
            const local = next.get('local');
            if (local) next.set('local', { ...local, handRaised: raised });
            return next;
        });
    };

    const leaveMeeting = () => {
        socketRef.current?.emit('meeting:leave', { meetingCode });
        streamRef.current?.getTracks().forEach(t => t.stop());
        peersRef.current.forEach(pc => pc.close());
        navigate('/team-hub');
    };

    const endForAll = () => {
        socketRef.current?.emit('meeting:end', { meetingCode });
    };

    const admitUser = (w: WaitingUser) => {
        socketRef.current?.emit('waiting:admit', {
            meetingCode,
            participantId: w.participantId,
            targetUserId: w.userId,
        });
        setWaitingRoom(prev => prev.filter(p => p.participantId !== w.participantId));
    };

    const rejectUser = (w: WaitingUser) => {
        socketRef.current?.emit('waiting:reject', {
            meetingCode,
            participantId: w.participantId,
            targetUserId: w.userId,
        });
        setWaitingRoom(prev => prev.filter(p => p.participantId !== w.participantId));
    };

    const copyLink = async () => {
        const link = `${window.location.origin}/meet/${meetingCode}`;
        await navigator.clipboard.writeText(link);
        toast.success('Meeting link copied!');
    };

    // ── Grid Layout ──

    const allParticipants = useMemo(() => Array.from(participants.values()), [participants]);
    const TILES_PER_PAGE = 9;

    const sortedParticipants = useMemo(() => {
        const arr = [...allParticipants];
        // Pin goes first, then active speaker, then local
        if (pinnedPeer) {
            const pinIdx = arr.findIndex(p => p.id === pinnedPeer);
            if (pinIdx > -1) {
                const [pinned] = arr.splice(pinIdx, 1);
                arr.unshift(pinned);
            }
        } else if (activeSpeakerId && allParticipants.length > 9) {
            const speakerIdx = arr.findIndex(p => p.peerId === activeSpeakerId);
            if (speakerIdx > -1) {
                const [speaker] = arr.splice(speakerIdx, 1);
                arr.unshift(speaker);
            }
        }
        return arr;
    }, [allParticipants, pinnedPeer, activeSpeakerId]);

    const totalPages = Math.ceil(sortedParticipants.length / TILES_PER_PAGE);
    const visibleParticipants = sortedParticipants.slice(
        gridPage * TILES_PER_PAGE,
        (gridPage + 1) * TILES_PER_PAGE
    );

    const gridCols = useMemo(() => {
        const count = visibleParticipants.length;
        if (count <= 1) return 'grid-cols-1';
        if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
        if (count <= 4) return 'grid-cols-2';
        if (count <= 6) return 'grid-cols-2 sm:grid-cols-3';
        return 'grid-cols-3';
    }, [visibleParticipants.length]);

    // ── Meeting Ended Overlay ──
    if (meetingEnded) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center">
                <div className="text-center">
                    <Phone className="w-16 h-16 text-red-500 mx-auto mb-4 rotate-[135deg]" />
                    <h1 className="text-2xl font-bold text-white mb-2">Meeting Ended</h1>
                    <p className="text-slate-400">Redirecting to TeamHub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
            {/* ── Header ── */}
            <header className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/80 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white/80 text-sm font-medium">{meetingCode}</span>
                    <span className="text-white/40 text-xs hidden sm:inline">
                        • {allParticipants.length} participant{allParticipants.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {waitingRoom.length > 0 && (
                        <button
                            onClick={() => setShowWaiting(!showWaiting)}
                            className="relative px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-medium hover:bg-amber-500/30 transition-colors"
                        >
                            <UserPlus className="w-4 h-4 inline mr-1" />
                            {waitingRoom.length} waiting
                        </button>
                    )}
                    <button onClick={copyLink} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors" title="Copy link">
                        <Link2 className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* ── Waiting Room Panel ── */}
            {showWaiting && waitingRoom.length > 0 && (
                <div className="absolute top-12 right-3 z-50 w-72 bg-slate-800 border border-white/10 rounded-xl shadow-2xl p-3">
                    <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        Waiting Room ({waitingRoom.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {waitingRoom.map((w) => (
                            <div key={w.participantId} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-2">
                                <div>
                                    <p className="text-white text-sm">{w.userName}</p>
                                    <p className="text-slate-400 text-[10px]">{w.isGuest ? 'Guest' : 'Team member'}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => admitUser(w)}
                                        className="px-2 py-1 text-xs rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                    >
                                        Admit
                                    </button>
                                    <button
                                        onClick={() => rejectUser(w)}
                                        className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    >
                                        Deny
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Video Grid ── */}
            <main className="flex-1 p-2 sm:p-4 overflow-hidden">
                <div className={`grid ${gridCols} gap-2 sm:gap-3 h-full auto-rows-fr`}>
                    {visibleParticipants.map((p) => (
                        <VideoTile
                            key={p.id}
                            participant={p}
                            pinned={pinnedPeer === p.id}
                            activeSpeaker={activeSpeakerId === p.peerId}
                            large={
                                (pinnedPeer === p.id || (activeSpeakerId === p.peerId && !pinnedPeer)) &&
                                allParticipants.length > 4
                            }
                            onPin={
                                !p.isLocal
                                    ? () => setPinnedPeer(pinnedPeer === p.id ? null : p.id)
                                    : undefined
                            }
                        />
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setGridPage(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${gridPage === i ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* ── Controls Bar ── */}
            <footer className="flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-slate-900/90 border-t border-white/5">
                <button
                    onClick={toggleMute}
                    className={`p-3 rounded-full transition-all ${muted
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    title={muted ? 'Unmute' : 'Mute'}
                >
                    {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-full transition-all ${camOff
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    title={camOff ? 'Turn on camera' : 'Turn off camera'}
                >
                    {camOff ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                </button>

                <button
                    onClick={toggleScreenShare}
                    className={`p-3 rounded-full transition-all ${isScreenSharing
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                >
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </button>

                <button
                    onClick={switchCamera}
                    className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all sm:hidden"
                    title="Switch camera"
                >
                    <RefreshCcw className="w-5 h-5" />
                </button>

                <button
                    onClick={toggleHand}
                    className={`p-3 rounded-full transition-all ${handRaised
                        ? 'bg-yellow-500 text-white shadow-lg shadow-yellow-500/30'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                    title={handRaised ? 'Lower hand' : 'Raise hand'}
                >
                    <Hand className="w-5 h-5" />
                </button>

                <div className="w-px h-8 bg-white/10 mx-1 hidden sm:block" />

                <button
                    onClick={leaveMeeting}
                    className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
                    title="Leave meeting"
                >
                    <LogOut className="w-5 h-5" />
                </button>

                {isHost && (
                    <button
                        onClick={endForAll}
                        className="px-3 py-2 rounded-full bg-red-800 text-white text-xs font-medium hover:bg-red-900 transition-all"
                        title="End for all"
                    >
                        <Phone className="w-4 h-4 inline mr-1 rotate-[135deg]" />
                        End
                    </button>
                )}
            </footer>
        </div>
    );
};
