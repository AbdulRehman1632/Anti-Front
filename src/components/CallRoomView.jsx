import React, { useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  PhoneOff,
  Users,
  Radio,
  Sparkles,
  Shield,
  Volume2,
} from 'lucide-react';
import { useCall } from '../context/CallContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export const CallRoomView = ({ channels = [] }) => {
  const { user } = useAuth();
  const {
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
  } = useCall();

  const localVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (!activeCall) {
    // Lobby view when not currently in a call
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 200px)',
          textAlign: 'center',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--accent-glow)',
            marginBottom: '20px',
            color: 'white',
          }}
        >
          <VideoIcon size={36} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '8px' }}>
          WebRTC Real-Time Video & Audio Rooms
        </h1>
        <p style={{ fontSize: '0.9375rem', color: '#94a3b8', maxWidth: '520px', marginBottom: '32px' }}>
          Connect with team members and clients in peer-to-peer encrypted HD video syncs with screen sharing and low-latency audio.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            width: '100%',
            maxWidth: '850px',
          }}
        >
          {channels.map((ch) => {
            const currentParticipants = activeCallsMap[ch._id] || [];
            const isLive = currentParticipants.length > 0;

            return (
              <div
                key={ch._id}
                style={{
                  background: 'rgba(15, 23, 42, 0.7)',
                  border: isLive ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
                      #{ch.name}
                    </span>
                    {isLive && (
                      <span
                        style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          fontSize: '0.6875rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Radio size={10} className="animate-pulse" /> {currentParticipants.length} In Call
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '16px' }}>
                    {ch.description || 'Enterprise collaboration channel room'}
                  </p>
                </div>

                <button
                  className={`btn ${isLive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ width: '100%' }}
                  onClick={() => joinCall(ch._id, ch.name)}
                >
                  <VideoIcon size={15} />
                  <span>{isLive ? 'Join Ongoing Call' : 'Start Conference'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active Call Screen
  return (
    <div className="call-stage-container">
      {/* Call Header */}
      <div
        style={{
          padding: '14px 20px',
          background: 'rgba(11, 16, 27, 0.85)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} className="animate-pulse" />
          <span style={{ fontSize: '1rem', fontWeight: 700 }}>
            Active Sync: #{activeCall.channelName}
          </span>
          <span className="category-tag">
            <Users size={12} /> {participants.length + 1} Connected
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
          <Shield size={14} style={{ color: '#10b981' }} />
          <span>WebRTC P2P Encrypted</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="call-participants-grid">
        {/* Local Stream Tile */}
        <div className="call-video-box active-speaker">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: isScreenSharing ? 'none' : 'scaleX(-1)',
              display: isVideoOff ? 'none' : 'block',
            }}
          />

          {isVideoOff && (
            <div style={{ textAlign: 'center' }}>
              <img
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt=""
                style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 8px', border: '3px solid #6366f1' }}
              />
              <div style={{ fontWeight: 600 }}>{user?.name} (You)</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Camera Off</div>
            </div>
          )}

          {/* Bottom name overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
            }}
          >
            <span>{user?.name} (You)</span>
            {isAudioMuted ? (
              <MicOff size={12} style={{ color: '#ef4444' }} />
            ) : (
              <Volume2 size={12} style={{ color: '#10b981' }} />
            )}
            {isScreenSharing && (
              <span style={{ color: '#38bdf8', fontSize: '0.6875rem' }}>• Sharing Screen</span>
            )}
          </div>
        </div>

        {/* Remote Participants Tiles */}
        {participants.map((p) => {
          return (
            <div key={p.socketId} className="call-video-box">
              <div style={{ textAlign: 'center' }}>
                <img
                  src={
                    p.user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user?.name || 'Member'}`
                  }
                  alt=""
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    margin: '0 auto 8px',
                    border: '3px solid #38bdf8',
                  }}
                />
                <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.user?.role || 'Team Member'}</div>
              </div>

              {/* Bottom name overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.75rem',
                }}
              >
                <span>{p.user?.name}</span>
                {p.isAudioMuted ? (
                  <MicOff size={12} style={{ color: '#ef4444' }} />
                ) : (
                  <Volume2 size={12} style={{ color: '#10b981' }} />
                )}
                {p.isScreenSharing && (
                  <span style={{ color: '#38bdf8', fontSize: '0.6875rem' }}>• Presenting</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Call Controls Bar */}
      <div className="call-controls-bar">
        {/* Toggle Audio */}
        <button
          className={`call-ctrl-btn ${isAudioMuted ? 'active-muted' : ''}`}
          onClick={toggleAudio}
          title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {isAudioMuted ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Toggle Video */}
        <button
          className={`call-ctrl-btn ${isVideoOff ? 'active-muted' : ''}`}
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <VideoOff size={18} /> : <VideoIcon size={18} />}
        </button>

        {/* Screen Share */}
        <button
          className={`call-ctrl-btn ${isScreenSharing ? 'btn-primary' : ''}`}
          onClick={toggleScreenShare}
          title="Share Screen"
          style={isScreenSharing ? { background: '#6366f1' } : {}}
        >
          <Monitor size={18} />
        </button>

        {/* Leave / Hang up */}
        <button
          className="call-ctrl-btn danger-hangup"
          onClick={leaveCall}
          title="Leave Call"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};
