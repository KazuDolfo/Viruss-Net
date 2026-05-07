import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { createRoom, joinRoom, startGame, getRoom, processAction, cleanupRooms } from './gameManager';
import cardImagesRouter from './routes/cardImages';

const app = express();

app.use(express.json());

// Self-ping to keep Render Free instance alive
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(`${RENDER_EXTERNAL_URL}/health`)
      .catch(err => console.error('Keep-alive ping failed:', err.message));
  }, 10 * 60 * 1000); // Every 10 minutes
}

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(cors({
  origin: '*', // En producción podrías restringirlo al dominio del front
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use('/api/card-images', cardImagesRouter);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Recomendado para evitar problemas de buffering en algunos hosts
  pingTimeout: 60000,
});

app.set('io', io);

// Periodic cleanup every 15 minutes
setInterval(cleanupRooms, 15 * 60 * 1000);

io.on('connection', (socket: Socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', ({ roomId, playerName, playerId, sessionToken }) => {
    try {
        const room = joinRoom(roomId, { 
            id: playerId, 
            name: playerName, 
            socketId: socket.id, 
            sessionToken: sessionToken 
        });
        
        socket.join(roomId);
        
        io.to(roomId).emit('room_update', { 
            players: room.players.map(p => ({ id: p.id, name: p.name })),
            status: room.status 
        });

        if (room.gameState) {
            socket.emit('game_update', sanitizeState(room.gameState, playerId));
        }
    } catch (e: any) {
        socket.emit('error', e.message);
    }
  });

  socket.on('start_game', ({ roomId }) => {
    try {
        const state = startGame(roomId);
        if (state) {
            const room = getRoom(roomId);
            io.to(roomId).emit('room_update', { 
                players: room.players.map(p => ({ id: p.id, name: p.name })),
                status: room.status 
            });
            room.players.forEach(p => {
                io.to(p.socketId).emit('game_update', sanitizeState(state, p.id));
            });
        }
    } catch (e: any) {
        socket.emit('error', e.message);
    }
  });

  socket.on('play_action', ({ roomId, playerId, sessionToken, action }) => {
    try {
        const room = getRoom(roomId);
        if (!room) throw new Error('Room not found');
        
        const player = room.players.find(p => p.id === playerId);
        if (!player || player.sessionToken !== sessionToken) {
            throw new Error('Unauthorized: Invalid session');
        }

        // Update socket ID in case they reconnected
        player.socketId = socket.id;

        const newState = processAction(roomId, playerId, action);
        
        room.players.forEach(p => {
            io.to(p.socketId).emit('game_update', sanitizeState(newState, p.id));
        });

        if (newState.winnerId) {
            const winner = newState.players.find(p => p.id === newState.winnerId);
            io.to(roomId).emit('game_over', { winner: winner ? winner.name : 'Unknown' });
        }
    } catch (e: any) {
        socket.emit('error', e.message);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Hide other players' card details but keep the count visible
function sanitizeState(state: any, playerId: string) {
    const sanitized = JSON.parse(JSON.stringify(state));
    sanitized.deck = sanitized.deck.length; // Only send deck count
    sanitized.players.forEach((p: any) => {
        if (p.id !== playerId) {
            p.hand = p.hand.map((c: any) => ({ id: c.id, type: 'hidden' }));
        }
    });
    return sanitized;
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
