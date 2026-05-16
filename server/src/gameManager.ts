import { 
    GameState, 
    initGame, 
    reduceGameState, 
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
    
    // The engine handles validation and reduction in one pure step
    // (though validateAction is called inside reduceGameState)
    const nextState = reduceGameState(room.gameState, request);
    
    // If state didn't change, it means validation failed or action did nothing
    if (nextState === room.gameState) {
        throw new Error('Action rejected by engine');
    }

    room.gameState = nextState;
    room.lastActivity = Date.now();

    if (nextState.winnerId) {
        room.status = 'finished';
    }

    return nextState;
};

export const handleDisconnect = (socketId: string) => {
    let affectedRoomId: string | null = null;
    let winnerId: string | null = null;

    Object.keys(rooms).forEach(roomId => {
        const room = rooms[roomId];
        const playerIndex = room.players.findIndex(p => p.socketId === socketId);
        
        if (playerIndex !== -1) {
            affectedRoomId = roomId;
            // Remove player from room list
            room.players.splice(playerIndex, 1);
            
            // If game is active and only 1 player remains, they win
            if (room.status === 'playing' && room.players.length === 1) {
                winnerId = room.players[0].id;
                room.status = 'finished';
                if (room.gameState) {
                    room.gameState = {
                        ...room.gameState,
                        winnerId: winnerId
                    };
                }
            }

            // Cleanup empty rooms
            if (room.players.length === 0) {
                delete rooms[roomId];
                affectedRoomId = null; // No need to notify
            }
        }
    });

    return { roomId: affectedRoomId, winnerId };
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
