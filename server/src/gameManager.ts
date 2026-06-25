import { 
    GameState, 
    initGame, 
    reduceGameState, 
    validateAction,
    ActionRequest,
    GameAction
} from '../../shared/index';

interface Room {
    id: string;
    players: { id: string, name: string, socketId: string, sessionToken: string }[];
    gameState: GameState | null;
    status: 'waiting' | 'playing' | 'finished';
    lastActivity: number;
}

const rooms: Record<string, Room> = {};

export const createRoom = (roomId: string) => {
    if (!rooms[roomId]) {
        rooms[roomId] = {
            id: roomId,
            players: [],
            gameState: null,
            status: 'waiting',
            lastActivity: Date.now()
        };
    }
    return rooms[roomId];
};

export const joinRoom = (roomId: string, player: { id: string, name: string, socketId: string, sessionToken: string }) => {
    const room = rooms[roomId] || createRoom(roomId);
    room.lastActivity = Date.now();

    // Reconnection check
    const existingPlayer = room.players.find(p => p.id === player.id);
    if (existingPlayer) {
        if (existingPlayer.sessionToken === player.sessionToken) {
            existingPlayer.socketId = player.socketId;
            return room;
        } else {
            throw new Error('Invalid session token');
        }
    }

    if (room.status !== 'waiting') {
        throw new Error('Room is already playing');
    }
    if (room.players.length >= 6) {
        throw new Error('Room is full');
    }
    
    room.players.push(player);
    return room;
};

export const startGame = (roomId: string) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'waiting') return null;
    if (room.players.length < 2) throw new Error('Not enough players (min 2)');
    
    const initialPlayers = room.players.map(p => ({ id: p.id, name: p.name }));
    room.gameState = initGame(initialPlayers);
    
    room.status = 'playing';
    room.lastActivity = Date.now();
    return room.gameState;
};

export const getRoom = (roomId: string) => rooms[roomId];

/**
 * Authoritative Action Processor
 */
export const processAction = (roomId: string, playerId: string, action: GameAction) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'playing' || !room.gameState) {
        throw new Error('Game not active');
    }
    
    const request: ActionRequest = { playerId, action };
    
    const error = validateAction(room.gameState, request);
    if (error) {
        console.error('Validation failed!', { error, action });
        throw new Error(error);
    }

    const nextState = reduceGameState(room.gameState, request);

    room.gameState = nextState;
    room.lastActivity = Date.now();

    if (nextState.winnerId) {
        room.status = 'finished';
    }

    return nextState;
};

export const handleDisconnect = (socketId: string) => {
    let affectedRoomId: string | null = null;

    Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const player = room.players.find(p => p.socketId === socketId);
        
        if (player) {
            affectedRoomId = roomId;
            // Mark player as disconnected by clearing socketId
            // but DO NOT remove them from the room to allow reconnection
            player.socketId = '';
            
            // If the room is now completely empty, we can clean it up
            const activeConnections = room.players.filter(p => p.socketId !== '').length;
            if (activeConnections === 0) {
                // Keep the room for a while even if empty, but cleanupRooms will handle it
                room.lastActivity = Date.now();
            }
        }
    });

    return { roomId: affectedRoomId };
};

export const cleanupRooms = () => {
    const now = Date.now();
    const TTL = 1000 * 60 * 60; // 1 hour of inactivity
    Object.keys(rooms).forEach(id => {
        if (now - rooms[id].lastActivity > TTL) {
            console.log(`Cleaning up room: ${id}`);
            delete rooms[id];
        }
    });
};
