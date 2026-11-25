import React from 'react';
import { PhoneOff, Video, Phone } from 'lucide-react';
import { useCall } from '../context/CallContext.jsx';

export const OutgoingCallModal = () => {
  const { outgoingCall, cancelOutgoingCall } = useCall();

  if (!outgoingCall) return null;

  const isVideo = outgoingCall.callType !== 'audio';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99998,
        background: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        borderRadius: '16px',
        padding: '18px 22px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backdropFilter: 'blur(10px)',
        minWidth: '320px',
        animation: 'slideUp 0.3s ease',
      }}
    >
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            overflow: 'hidden',
          }}
        >
          {outgoingCall.targetUser?.avatar ? (
            <img
              src={outgoingCall.targetUser.avatar}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            outgoingCall.targetUser?.name?.charAt(0).toUpperCase() || 'U'
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: isVideo ? '#6366f1' : '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          {isVideo ? <Video size={10} /> : <Phone size={10} />}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>
          {outgoingCall.targetUser?.name || 'Team Member'}
        </div>
        <div style={{ fontSize: '0.75rem', color: outgoingCall.status === 'declined' ? '#f87171' : '#a5b4fc', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {outgoingCall.status === 'declined' ? (
            <span>{outgoingCall.reason || 'Call declined'}</span>
          ) : outgoingCall.status === 'accepted' ? (
            <span style={{ color: '#34d399' }}>Connected!</span>
          ) : (
            <>
              <span className="animate-pulse">●</span>
              <span>Ringing...</span>
            </>
          )}
        </div>
      </div>

      {/* Cancel button */}
      <button
        type="button"
        onClick={cancelOutgoingCall}
        style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '50%',
          width: '38px',
          height: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f87171',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        title="Cancel Call"
      >
        <PhoneOff size={16} />
      </button>
    </div>
  );
};
