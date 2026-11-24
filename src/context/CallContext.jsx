import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket.js';
import { useAuth } from './AuthContext.jsx';

const CallContext = createContext(null);

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

// Web Audio API Ringtone Generator (Cross-browser, no external audio file needed)
let ringtoneInterval = null;
let ringtoneAudioCtx = null;

const playRingtone = () => {
  stopRingtone();
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    ringtoneAudioCtx = new AudioCtx();

    const triggerDualBeep = () => {
      if (!ringtoneAudioCtx || ringtoneAudioCtx.state === 'closed') return;
      const now = ringtoneAudioCtx.currentTime;
      // Dual tone (European/US PBX standard: 440Hz + 480Hz)
      const osc1 = ringtoneAudioCtx.createOscillator();
      const osc2 = ringtoneAudioCtx.createOscillator();
      const gain = ringtoneAudioCtx.createGain();

      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ringtoneAudioCtx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.1);
      osc2.stop(now + 1.1);
    };

    triggerDualBeep();
    ringtoneInterval = setInterval(triggerDualBeep, 2400);
  } catch (e) {
    console.warn('Web Audio ringtone initialization notice:', e.message);
  }
};

const stopRingtone = () => {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if (ringtoneAudioCtx) {
    try {
      ringtoneAudioCtx.close();
    } catch (e) {}
    ringtoneAudioCtx = null;
  }
};

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState(null); // { channelId, channelName, callType }
  const [incomingCall, setIncomingCall] = useState(null); // { callId, caller, targetUserId, channelId, channelName, callType, isDirect, callerSocketId }
  const [outgoingCall, setOutgoingCall] = useState(null); // { targetUser, channelId, channelName, callType, status: 'ringing'|'accepted'|'declined', reason }
  const [participants, setParticipants] = useState([]);
  const [activeCallsMap, setActiveCallsMap] = useState({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection

  // Listen to socket events for active calls, ringing, and signaling
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleActiveList = (list) => {
      setActiveCallsMap(list || {});
    };

    const handleStatusChanged = ({ channelId, participantsCount, participants: list }) => {
      setActiveCallsMap((prev) => {
        const next = { ...prev };
        if (participantsCount > 0) {
          next[channelId] = list;
        } else {
          delete next[channelId];
        }
        return next;
      });

      // Update current active call participants if user is in this call
      if (activeCall && activeCall.channelId === channelId) {
        setParticipants(list);
      }
    };

    const handlePeerJoined = ({ channelId, participant }) => {
      if (activeCall && activeCall.channelId === channelId) {
        setParticipants((prev) => {
          if (prev.some((p) => p.socketId === participant.socketId)) return prev;
          return [...prev, participant];
        });
      }
    };

    const handlePeerLeft = ({ channelId, socketId }) => {
      if (activeCall && activeCall.channelId === channelId) {
        setParticipants((prev) => prev.filter((p) => p.socketId !== socketId));
        if (peersRef.current.has(socketId)) {
          peersRef.current.get(socketId).close();
          peersRef.current.delete(socketId);
        }
      }
    };

    const handleMediaChanged = ({ socketId, isAudioMuted, isVideoOff, isScreenSharing }) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.socketId === socketId
            ? { ...p, isAudioMuted, isVideoOff, isScreenSharing }
            : p
        )
      );
    };

    // ── Incoming Call Ringing ──
    const handleIncomingCall = (callData) => {
      if (!callData || !user) return;
      if (callData.caller?._id === user._id) return; // Don't ring self
      console.log('🔔 Incoming call received:', callData);
      setIncomingCall(callData);
      playRingtone();
    };

    const handleCallAccepted = ({ channelId, responder, callType }) => {
      console.log('✅ Call accepted by:', responder?.name);
      setOutgoingCall((prev) => (prev ? { ...prev, status: 'accepted' } : null));
      setTimeout(() => setOutgoingCall(null), 1200);
    };

    const handleCallDeclined = ({ reason, responder }) => {
      console.log('❌ Call declined:', reason);
      stopRingtone();
      setOutgoingCall((prev) => (prev ? { ...prev, status: 'declined', reason } : null));
      setTimeout(() => {
        setOutgoingCall(null);
        leaveCall();
      }, 2500);
    };

    const handleCallCancelled = () => {
      setIncomingCall(null);
      stopRingtone();
    };

    socket.on('call:active_list', handleActiveList);
    socket.on('call:status_changed', handleStatusChanged);
    socket.on('call:peer_joined', handlePeerJoined);
    socket.on('call:peer_left', handlePeerLeft);
    socket.on('call:media_state_changed', handleMediaChanged);

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:declined', handleCallDeclined);
    socket.on('call:cancelled', handleCallCancelled);

    return () => {
      socket.off('call:active_list', handleActiveList);
      socket.off('call:status_changed', handleStatusChanged);
      socket.off('call:peer_joined', handlePeerJoined);
      socket.off('call:peer_left', handlePeerLeft);
      socket.off('call:media_state_changed', handleMediaChanged);

      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:accepted', handleCallAccepted);
      socket.off('call:declined', handleCallDeclined);
      socket.off('call:cancelled', handleCallCancelled);
    };
  }, [activeCall, user]);

  // Helper to create synthetic video track if no real hardware is found
  const createSyntheticMediaStream = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    let hue = 220;
    const draw = () => {
      ctx.fillStyle = `hsl(${hue}, 40%, 15%)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user?.name || 'CRM Team Member', canvas.width / 2, canvas.height / 2);
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 + 40, 8, 0, Math.PI * 2);
      ctx.fill();
      hue = (hue + 0.5) % 360;
    };
    setInterval(draw, 100);
    draw();

    const stream = canvas.captureStream(25);
    // Add silent audio track via AudioContext
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const dst = osc.connect(audioCtx.createMediaStreamDestination());
      osc.start();
      const track = dst.stream.getAudioTracks()[0];
      track.enabled = false;
      stream.addTrack(track);
    } catch (e) {}

    return stream;
  };

  const joinCall = async (channelId, channelName = 'Meeting', callType = 'video') => {
    const socket = getSocket();
    if (!socket || !user) return;

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: callType !== 'audio',
        audio: true,
      });
    } catch (err) {
      console.warn('Real webcam/mic unavailable. Using synthetic enterprise video stream:', err.message);
      stream = createSyntheticMediaStream();
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    setActiveCall({ channelId, channelName, callType });
    setIsAudioMuted(false);
    setIsVideoOff(callType === 'audio');
    setIsScreenSharing(false);

    socket.emit('call:join', {
      channelId,
      user: {
        _id: user._id,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        title: user.title,
      },
      isAudioMuted: false,
      isVideoOff: callType === 'audio',
    });
  };

  // 1-on-1 Individual Calling (Audio or Video)
  const startDirectCall = (targetUser, callType = 'video') => {
    const socket = getSocket();
    if (!targetUser || !user) return;

    const directChannelId = `dm-${[user._id, targetUser._id].sort().join('-')}`;
    const directChannelName = `${targetUser.name}`;

    setOutgoingCall({
      targetUser,
      channelId: directChannelId,
      channelName: directChannelName,
      callType,
      status: 'ringing',
    });

    if (socket) {
      socket.emit('call:initiate', {
        caller: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        targetUserId: targetUser._id,
        channelId: directChannelId,
        channelName: user.name,
        callType,
        isDirect: true,
      });
    }

    joinCall(directChannelId, directChannelName, callType);
  };

  // Conference Calling: Rings all members in channel
  const startChannelCall = (channelId, channelName, callType = 'video') => {
    const socket = getSocket();
    if (!channelId || !user) return;

    if (socket) {
      socket.emit('call:initiate_channel', {
        caller: {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
        },
        channelId,
        channelName: channelName || 'Channel Conference',
        callType,
      });
    }

    joinCall(channelId, channelName, callType);
  };

  // Accept Incoming Call
  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();
    stopRingtone();

    if (socket) {
      socket.emit('call:accept', {
        callId: incomingCall.callId,
        callerSocketId: incomingCall.callerSocketId,
        channelId: incomingCall.channelId,
        channelName: incomingCall.channelName,
        callType: incomingCall.callType,
        responder: {
          _id: user?._id,
          name: user?.name,
          avatar: user?.avatar,
          role: user?.role,
        },
      });
    }

    joinCall(incomingCall.channelId, incomingCall.channelName, incomingCall.callType);
    setIncomingCall(null);
  };

  // Decline Incoming Call
  const declineIncomingCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();
    stopRingtone();

    if (socket) {
      socket.emit('call:decline', {
        callId: incomingCall.callId,
        callerSocketId: incomingCall.callerSocketId,
        responder: { _id: user?._id, name: user?.name },
      });
    }

    setIncomingCall(null);
  };

  // Cancel Outgoing Call (Caller Hangs Up While Ringing)
  const cancelOutgoingCall = () => {
    if (!outgoingCall) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('call:cancel', {
        targetUserId: outgoingCall.targetUser?._id,
        channelId: outgoingCall.channelId,
      });
    }
    setOutgoingCall(null);
    leaveCall();
  };

  const leaveCall = () => {
    const socket = getSocket();
    if (socket && activeCall) {
      socket.emit('call:leave', { channelId: activeCall.channelId });
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    setLocalStream(null);
    setActiveCall(null);
    setParticipants([]);
    setIsScreenSharing(false);
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const newMuted = !isAudioMuted;
      audioTracks.forEach((t) => (t.enabled = !newMuted));
      setIsAudioMuted(newMuted);

      const socket = getSocket();
      if (socket && activeCall) {
        socket.emit('call:toggle_media', {
          channelId: activeCall.channelId,
          isAudioMuted: newMuted,
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const newVideoOff = !isVideoOff;
      videoTracks.forEach((t) => (t.enabled = !newVideoOff));
      setIsVideoOff(newVideoOff);

      const socket = getSocket();
      if (socket && activeCall) {
        socket.emit('call:toggle_media', {
          channelId: activeCall.channelId,
          isVideoOff: newVideoOff,
        });
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert to camera
      leaveCall();
      if (activeCall) joinCall(activeCall.channelId, activeCall.channelName);
      setIsScreenSharing(false);
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];

      if (localStreamRef.current) {
        const oldVideo = localStreamRef.current.getVideoTracks()[0];
        if (oldVideo) {
          localStreamRef.current.removeTrack(oldVideo);
          localStreamRef.current.addTrack(screenTrack);
        }
      }

      screenTrack.onended = () => {
        setIsScreenSharing(false);
      };

      setIsScreenSharing(true);
      const socket = getSocket();
      if (socket && activeCall) {
        socket.emit('call:toggle_media', {
          channelId: activeCall.channelId,
          isScreenSharing: true,
        });
      }
    } catch (err) {
      console.warn('Screen share canceled or not supported:', err);
    }
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        incomingCall,
        outgoingCall,
        participants,
        activeCallsMap,
        localStream,
        isAudioMuted,
        isVideoOff,
        isScreenSharing,
        joinCall,
        startDirectCall,
        startChannelCall,
        acceptIncomingCall,
        declineIncomingCall,
        cancelOutgoingCall,
        leaveCall,
        toggleAudio,
        toggleVideo,
        toggleScreenShare,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
