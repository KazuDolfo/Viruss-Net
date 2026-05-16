import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { createRoom, joinRoom, startGame, getRoom, processAction, cleanupRooms, handleDisconnect } from './gameManager';
import cardImagesRouter from './routes/cardImages';
import { logger } from './core/logger';

const app = express();

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Self-ping to keep Render Free instance alive
const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_EXTERNAL_URL) {
  setInterval(() => {
    fetch(`${RENDER_EXTERNAL_URL}/health`)
      .catch(err => logger.error('Keep-alive ping failed:', { message: err.message }));
  }, 10 * 60 * 1000); // Every 10 minutes
}

// Health check for Render
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(cors({
  origin: '*', 
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
  pingTimeout: 60000,
});

app.set('io', io);

// Periodic cleanup every 15 minutes
setInterval(cleanupRooms, 15 * 60 * 1000);

io.on('connection', (socket: Socket) => {
  logger.info('User connected', { socketId: socket.id });

  socket.on('join_room', ({ roomId, playerName, playerId, sessionToken }) => {
    try {
        logger.info('Player joining room', { roomId, playerName, playerId });
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
        logger.error('Join room failed', { error: e.message, roomId, playerId });
        socket.emit('error', e.message);
    }
  });

  socket.on('start_game', ({ roomId }) => {
    try {
        logger.info('Starting game', { roomId });
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
        logger.error('Start game failed', { error: e.message, roomId });
        socket.emit('error', e.message);
    }
  });

  socket.on('play_action', ({ roomId, playerId, sessionToken, action }) => {
    try {
        logger.info('Processing action', { roomId, playerId, actionType: action.type });
        const room = getRoom(roomId);
        if (!room) throw new Error('Room not found');
        
        const player = room.players.find(p => p.id === playerId);
        if (!player || player.sessionToken !== sessionToken) {
            throw new Error('Unauthorized: Invalid session');
        }

        player.socketId = socket.id;

        const newState = processAction(roomId, playerId, action);
        
        room.players.forEach(p => {
            io.to(p.socketId).emit('game_update', sanitizeState(newState, p.id));
        });

        if (newState.winnerId) {
            const winner = newState.players.find(p => p.id === newState.winnerId);
            logger.info('Game Over', { roomId, winner: winner?.name });
            io.to(roomId).emit('game_over', { winner: winner ? winner.name : 'Unknown' });
        }
    } catch (e: any) {
        logger.error('Action failed', { error: e.message, roomId, playerId, action });
        socket.emit('error', e.message);
    }
  });

  socket.on('send_social', ({ roomId, playerId, reactionId, text }) => {
    try {
        // Broadcast reaction/text to everyone in the room
        io.to(roomId).emit('social_event', {
            playerId,
            reactionId,
            text,
            timestamp: Date.now()
        });
    } catch (e: any) {
        logger.error('Social event failed', { error: e.message, roomId, playerId });
    }
  });

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id });
    const result = handleDisconnect(socket.id);
    
    if (result.roomId) {
        const room = getRoom(result.roomId);
        if (room) {
            io.to(result.roomId).emit('room_update', { 
                players: room.players.map(p => ({ id: p.id, name: p.name })),
                status: room.status 
            });
            
            // Notify other players if the game is active (they might want to know someone is offline)
            if (room.gameState) {
                room.players.forEach(p => {
                    if (p.socketId) {
                        io.to(p.socketId).emit('game_update', sanitizeState(room.gameState, p.id));
                    }
                });
            }
        }
    }
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
