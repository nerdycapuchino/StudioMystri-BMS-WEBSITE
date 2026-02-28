import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, VideoOff, Shield, Users, Clock, AlertTriangle, LogIn, User } from 'lucide-react';
import { getMeeting, joinMeeting as joinMeetingApi } from '../services/team.service';
import toast from 'react-hot-toast';

type MeetingState = 'loading' | 'ready' | 'ended' | 'not_found' | 'error' | 'joining' | 'joined';

interface MeetingInfo {
    id: string;
    meetingCode: string;
    title: string;
    status: 'SCHEDULED' | 'ACTIVE' | 'ENDED';
    isScheduled: boolean;
    startsAt: string | null;
    allowGuests: boolean;
    createdBy: { id: string; name: string };
    participants: any[];
}

export const MeetJoin: React.FC = () => {
    const { meetingCode } = useParams<{ meetingCode: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [meetingState, setMeetingState] = useState<MeetingState>('loading');
    const [meeting, setMeeting] = useState<MeetingInfo | null>(null);
    const [guestName, setGuestName] = useState('');
    const [guestEmail, setGuestEmail] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Fetch meeting info
    useEffect(() => {
        if (!meetingCode) {
            setMeetingState('not_found');
            return;
        }

        getMeeting(meetingCode)
            .then((data) => {
                setMeeting(data);
                if (data.status === 'ENDED') {
                    setMeetingState('ended');
                } else if (data.status === 'SCHEDULED') {
                    setMeetingState('ready');
                } else {
                    setMeetingState('ready');
                }
            })
            .catch((err) => {
                const status = err?.response?.status;
                if (status === 404) {
                    setMeetingState('not_found');
                } else if (status === 410) {
                    setMeetingState('ended');
                } else {
                    setMeetingState('error');
                    setErrorMsg(err?.response?.data?.message || 'Failed to load meeting');
                }
            });
    }, [meetingCode]);

    const handleJoin = async () => {
        if (!meetingCode) return;

        // Validate guest fields
        if (!isAuthenticated) {
            if (!meeting?.allowGuests) {
                toast.error('Guest access is not allowed for this meeting');
                return;
            }
            if (!guestName.trim() || guestName.trim().length < 2) {
                toast.error('Please enter your name (at least 2 characters)');
                return;
            }
        }

        setMeetingState('joining');

        try {
            const result = await joinMeetingApi(meetingCode, isAuthenticated ? undefined : {
                guestName: guestName.trim(),
                guestEmail: guestEmail.trim() || undefined,
            });

            const pid = result?.participantId || '';
            const guestTokenParam = result?.guestToken ? `&guestToken=${result.guestToken}` : '';
            const isHostParam = meeting?.createdBy?.id === user?.id ? '&host=1' : '';
            const guestNameParam = !isAuthenticated ? `&guestName=${encodeURIComponent(guestName.trim())}` : '';

            // Navigate to MeetRoom
            navigate(`/meet/${meetingCode}/room?pid=${pid}${isHostParam}${guestTokenParam}${guestNameParam}`);
        } catch (err: any) {
            setMeetingState('ready');
            toast.error(err?.response?.data?.message || 'Failed to join meeting');
        }
    };

    // ── RENDER ──

    if (meetingState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Video className="w-8 h-8 text-blue-400 animate-pulse" />
                    </div>
                    <p className="text-slate-400 text-lg">Loading meeting...</p>
                </div>
            </div>
        );
    }

    if (meetingState === 'not_found') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Meeting Not Found</h1>
                    <p className="text-slate-400 mb-6">
                        The meeting link is invalid or has been removed.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (meetingState === 'ended') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Meeting Has Ended</h1>
                    <p className="text-slate-400 mb-2">
                        This meeting was hosted by <span className="text-white font-medium">{meeting?.createdBy?.name || 'Unknown'}</span>
                    </p>
                    <p className="text-slate-500 text-sm mb-6">
                        The meeting link cannot be reused. Ask the host to create a new meeting.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    if (meetingState === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
                    <p className="text-slate-400 mb-6">{errorMsg}</p>
                    <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // ── READY / JOIN FORM ──
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Video className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">{meeting?.title || 'Team Meeting'}</h1>
                        <p className="text-sm text-slate-400">
                            Hosted by {meeting?.createdBy?.name || 'Unknown'}
                        </p>
                    </div>
                </div>

                {/* Active participants */}
                {meeting?.participants && meeting.participants.filter(p => !p.leftAt).length > 0 && (
                    <div className="flex items-center gap-2 mb-6 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <Users className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-medium">
                            {meeting.participants.filter(p => !p.leftAt).length} participant(s) in the meeting
                        </span>
                    </div>
                )}

                {/* Auth Status */}
                {isAuthenticated ? (
                    <div className="mb-6 p-4 bg-slate-700/40 rounded-xl border border-slate-600/30">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-white font-medium">{user?.name}</p>
                                <p className="text-slate-400 text-sm">{user?.email}</p>
                            </div>
                            <Shield className="w-5 h-5 text-green-400 ml-auto" />
                        </div>
                    </div>
                ) : (
                    /* Guest Join Form */
                    <>
                        {!meeting?.allowGuests ? (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-red-400" />
                                    <p className="text-red-400 font-medium">Login Required</p>
                                </div>
                                <p className="text-slate-400 text-sm mb-4">
                                    This meeting does not allow guest access. Please log in to join.
                                </p>
                                <button
                                    onClick={() => navigate(`/login?redirect=/meet/${meetingCode}`)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                                >
                                    <LogIn className="w-4 h-4" />
                                    Log In
                                </button>
                            </div>
                        ) : (
                            <div className="mb-6 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-5 h-5 text-blue-400" />
                                    <p className="text-blue-400 font-medium text-sm">Joining as Guest</p>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Your Name *</label>
                                    <input
                                        type="text"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        placeholder="Enter your name"
                                        className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1.5">Email (optional)</label>
                                    <input
                                        type="email"
                                        value={guestEmail}
                                        onChange={(e) => setGuestEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full px-4 py-3 bg-slate-700/60 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Join Button */}
                {(isAuthenticated || meeting?.allowGuests) && (
                    <button
                        onClick={handleJoin}
                        disabled={meetingState === 'joining'}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        {meetingState === 'joining' ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Joining...
                            </>
                        ) : (
                            <>
                                <Video className="w-5 h-5" />
                                Join Meeting
                            </>
                        )}
                    </button>
                )}

                {/* Meeting Code */}
                <div className="mt-6 pt-4 border-t border-slate-700/50 text-center">
                    <p className="text-slate-500 text-xs">
                        Meeting Code: <span className="text-slate-400 font-mono">{meetingCode}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MeetJoin;
