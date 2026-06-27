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
const MAX_ROOMS = 5;

export const getPublicRooms = () => {
    return Object.values(rooms)
        .filter(r => r.status === 'waiting')
        .map(r => ({ id: r.id, playerCount: r.players.length, host: r.players[0]?.name || 'Sala' }));
};

export const createRoom = (roomId: string) => {
    if (!rooms[roomId]) {
        if (Object.keys(rooms).length >= MAX_ROOMS) {
            throw new Error('Límite máximo de salas alcanzado (5).');
        }
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

export const closeRoom = (roomId: string, playerId: string) => {
    const room = rooms[roomId];
    if (room && room.players.length > 0 && room.players[0].id === playerId) {
        delete rooms[roomId];
        return true;
    }
    throw new Error('No tienes permisos para cerrar esta sala o la sala no existe.');
};

export const leaveRoom = (roomId: string, playerId: string) => {
    const room = rooms[roomId];
    if (!room) return null;
    
    room.players = room.players.filter(p => p.id !== playerId);
    
    if (room.status === 'playing' && room.gameState) {
        // Player surrendered
        const pIndex = room.gameState.players.findIndex(p => p.id === playerId);
        if (pIndex !== -1) {
            // Handle turn pass if it was their turn
            if (room.gameState.currentTurn === playerId) {
                const nextIndex = (pIndex + 1) % room.gameState.players.length;
                room.gameState.currentTurn = room.gameState.players[nextIndex]?.id || '';
            }
            // Remove from game state
            room.gameState.players.splice(pIndex, 1);
            
            // Check if only one player left (Winner!)
            if (room.gameState.players.length === 1) {
                room.gameState.winnerId = room.gameState.players[0].id;
                room.status = 'finished';
            }
        }
    }

    if (room.players.length === 0) {
        delete rooms[roomId];
        return null; // Room deleted
    }
    
    room.lastActivity = Date.now();
    return room;
};

export const joinRoom = (roomId: string, player: { id: string, name: string, socketId: string, sessionToken: string }) => {
    if (!rooms[roomId]) {
        throw new Error('Código de Sala Inválido o Cerrado.');
    }
    const room = rooms[roomId];
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
    let roomRef: any = null;

    Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.socketId === socketId);
        
        if (playerIndex !== -1) {
            affectedRoomId = roomId;
            roomRef = room;
            
            if (room.status === 'waiting') {
                room.players.splice(playerIndex, 1);
                if (room.players.length === 0) {
                    delete rooms[roomId];
                    roomRef = null;
                }
            } else {
                room.players[playerIndex].socketId = '';
                const activeConnections = room.players.filter(p => p.socketId !== '').length;
                if (activeConnections === 0) {
                    room.lastActivity = Date.now();
                }
            }
        }
    });

    return { roomId: affectedRoomId, room: roomRef };
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
