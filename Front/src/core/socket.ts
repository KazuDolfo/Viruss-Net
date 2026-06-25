import { io, Socket } from 'socket.io-client';

// URL del backend desplegado en Render o Local
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://virus-backend01.onrender.com';

export const socket: Socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket'], // Prefer standard WebSocket for better performance
});

