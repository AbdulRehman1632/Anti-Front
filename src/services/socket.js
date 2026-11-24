import { io } from 'socket.io-client';

let socket = null;

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || window.location.origin;

export const initSocketClient = (currentUser) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 2,
    reconnectionDelay: 2000,
    timeout: 4000,
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
    if (currentUser) {
      socket.emit('user:register', currentUser);
    }
  });

  socket.on('connect_error', (err) => {
    // Vercel serverless functions do not support WebSockets; log graceful fallback notice
    console.warn('ℹ️ Real-time WebSockets unavailable on host (falling back to REST API sync):', err.message);
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;


