import React from 'react';
import { Phone, PhoneOff, Video, Users } from 'lucide-react';
import { useCall } from '../context/CallContext.jsx';

export const IncomingCallModal = () => {
  const { incomingCall, acceptIncomingCall, declineIncomingCall } = useCall();

  if (!incomingCall) return null;

  const isVideo = incomingCall.callType !== 'audio';
  const isDirect = incomingCall.isDirect !== false;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        style={{
          width: '90%',
          maxWidth: '420px',
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          borderRadius: '20px',
          padding: '32px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(99, 102, 241, 0.25)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Pulsing ring visual effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            animation: 'pulse 1.8s infinite',
          }}
        />

        {/* Caller Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              padding: '3px',
              background: 'linear-gradient(135deg, #6366f1, #10b981)',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {incomingCall.caller?.avatar ? (
              <img
                src={incomingCall.caller.avatar}
                alt={incomingCall.caller.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: '#312e81',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {incomingCall.caller?.name ? incomingCall.caller.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: isVideo ? '#6366f1' : '#10b981',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 10px rgba(0,0,0,0.5)',
            }}
          >
            {isVideo ? <Video size={13} /> : <Phone size={13} />}
          </div>
        </div>

        {/* Caller Details */}
        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 6px' }}>
          {incomingCall.caller?.name || 'Incoming Caller'}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: isVideo ? 'rgba(99, 102, 241, 0.2)' : 'rgba(16, 185, 129, 0.2)',
              color: isVideo ? '#a5b4fc' : '#6ee7b7',
              border: isVideo ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {isDirect ? (
              isVideo ? '📹 Incoming 1-on-1 Video Call' : '📞 Incoming 1-on-1 Audio Call'
            ) : (
              <>
                <Users size={12} />
                <span>Conference: {incomingCall.channelName}</span>
              </>
            )}
          </span>
        </div>

        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 28px' }}>
          {isDirect
            ? `${incomingCall.caller?.name || 'User'} is calling you directly...`
            : `Group conference call starting in #${incomingCall.channelName}`}
        </p>

        {/* Action Buttons: Accept (Green) & Decline (Red) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
          {/* Decline */}
          <button
            type="button"
            onClick={declineIncomingCall}
            style={{
              flex: 1,
              maxWidth: '140px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.35)',
              transition: 'all 0.2s ease',
            }}
          >
            <PhoneOff size={16} />
            <span>Decline</span>
          </button>

          {/* Accept */}
          <button
            type="button"
            onClick={acceptIncomingCall}
            style={{
              flex: 1,
              maxWidth: '140px',
              padding: '12px',
              borderRadius: '12px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16, 185, 129, 0.45)',
              animation: 'pulse 1.5s infinite',
              transition: 'all 0.2s ease',
            }}
          >
            <Phone size={16} />
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};
