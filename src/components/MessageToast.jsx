import React, { useEffect } from 'react';
import { MessageSquare, X } from 'lucide-react';

// Soft notification chime via Web Audio API
export const playMessageChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Friendly high-low two-tone chime
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  } catch (e) {
    // Non-blocking
  }
};

export const MessageToast = ({ toast, onClose, onNavigateToChat }) => {
  useEffect(() => {
    if (!toast) return;
    playMessageChime();
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const sender = toast.sender || {};
  const isChannel = Boolean(toast.channel);

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '24px',
        zIndex: 99990,
        maxWidth: '380px',
        width: 'calc(100% - 48px)',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 27, 75, 0.95))',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        borderRadius: '14px',
        padding: '14px 16px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.25)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        cursor: 'pointer',
        animation: 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transition: 'all 0.2s ease',
      }}
      onClick={() => {
        onNavigateToChat(toast);
        onClose();
      }}
    >
      {/* Sender Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        {sender.avatar ? (
          <img
            src={sender.avatar}
            alt={sender.name || 'Sender'}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#4f46e5',
              color: '#fff',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {sender.name ? sender.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <MessageSquare size={9} />
        </div>
      </div>

      {/* Message Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {sender.name || 'Team Member'}
          </span>
          <span
            style={{
              fontSize: '0.625rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '4px',
              background: 'rgba(99, 102, 241, 0.2)',
              color: '#a5b4fc',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            {isChannel ? 'Channel' : 'Direct Message'}
          </span>
        </div>

        <p
          style={{
            margin: '4px 0 0',
            fontSize: '0.8125rem',
            color: '#cbd5e1',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {toast.content || 'Sent an attachment / image'}
        </p>

        <span style={{ fontSize: '0.6875rem', color: '#6366f1', fontWeight: 600, marginTop: '4px', display: 'inline-block' }}>
          Click to reply →
        </span>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#94a3b8',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};
