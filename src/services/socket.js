import { io } from 'socket.io-client';

let socket = null;

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || window.location.origin;

export const initSocketClient = (currentUser) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(BACKEND_URL, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🟢 Socket connected:', socket.id);
    if (currentUser) {
      socket.emit('user:register', currentUser);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 Socket disconnected');
  });

  return socket;
};

export const getSocket = () => socket;


