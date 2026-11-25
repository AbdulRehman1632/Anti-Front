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

export const CallProvider = ({ children }) => {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState(null); // { channelId, channelName }
  const [participants, setParticipants] = useState([]);
  const [activeCallsMap, setActiveCallsMap] = useState({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map()); // socketId -> RTCPeerConnection

  // Listen to socket events for active calls and signaling
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

    socket.on('call:active_list', handleActiveList);
    socket.on('call:status_changed', handleStatusChanged);
    socket.on('call:peer_joined', handlePeerJoined);
    socket.on('call:peer_left', handlePeerLeft);
    socket.on('call:media_state_changed', handleMediaChanged);

    return () => {
      socket.off('call:active_list', handleActiveList);
      socket.off('call:status_changed', handleStatusChanged);
      socket.off('call:peer_joined', handlePeerJoined);
      socket.off('call:peer_left', handlePeerLeft);
      socket.off('call:media_state_changed', handleMediaChanged);
    };
  }, [activeCall]);

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

  const joinCall = async (channelId, channelName = 'Meeting') => {
    const socket = getSocket();
    if (!socket || !user) return;

    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (err) {
      console.warn('Real webcam/mic unavailable. Using synthetic enterprise video stream:', err.message);
      stream = createSyntheticMediaStream();
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    setActiveCall({ channelId, channelName });
    setIsAudioMuted(false);
    setIsVideoOff(false);
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
      isVideoOff: false,
    });
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
        participants,
        activeCallsMap,
        localStream,
        isAudioMuted,
        isVideoOff,
        isScreenSharing,
        joinCall,
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
