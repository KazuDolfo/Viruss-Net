import { io, Socket } from 'socket.io-client';

// URL del backend desplegado en Render
const BACKEND_URL = 'https://virus-backend-8nvg.onrender.com';

export const socket: Socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['websocket'], // Prefer standard WebSocket for better performance
});

