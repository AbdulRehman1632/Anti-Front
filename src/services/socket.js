import { io } from 'socket.io-client';

let socket = null;

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || window.location.origin;

// Vercel serverless functions do not support WebSockets (returning HTTP 404 on handshake upgrade).
// If connecting to *.vercel.app, force HTTP polling transport to prevent 404 console errors.
const isVercel = BACKEND_URL.includes('vercel.app');

export const initSocketClient = (currentUser) => {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {}
  }

  socket = io(BACKEND_URL, {
    transports: isVercel ? ['polling'] : ['polling', 'websocket'],
    upgrade: !isVercel,
    reconnectionAttempts: 3,
    reconnectionDelay: 2500,
    timeout: 6000,
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
    if (currentUser) {
      socket.emit('user:register', currentUser);
    }
  });

  socket.on('connect_error', (err) => {
    console.warn('ℹ️ Real-time socket sync notice:', err.message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;
