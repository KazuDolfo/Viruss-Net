import { io, Socket } from 'socket.io-client';

// URL del backend desplegado en Render
const BACKEND_URL = 'https://virus-backend-8nvg.onrender.com';

export const socket: Socket = io(BACKEND_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  // Útil para evitar problemas con el modo "sleep" de Render Free
  timeout: 20000,
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Desconectado:', reason);
});

socket.on('connect_error', (error) => {
  console.error('⚠️ Error de conexión:', error);
});
