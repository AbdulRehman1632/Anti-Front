import { io } from 'socket.io-client';

let socket = null;

export const initSocketClient = (currentUser) => {
  if (socket) {
    socket.disconnect();
  }

  // Connect to same origin, which Vite proxies to backend port 5000
  socket = io(window.location.origin, {
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
