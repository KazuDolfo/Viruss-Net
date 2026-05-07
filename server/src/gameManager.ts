import { GameState, Player } from '@shared/models';
import { initGame, drawCard, playCard, discardCards, endTurn, canPlayCard } from '@shared/engine';

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
    
    const playerNames = room.players.map(p => p.name);
    room.gameState = initGame(playerNames);
    
    room.gameState.players.forEach((p, index) => {
        p.id = room.players[index].id;
    });

    room.status = 'playing';
    room.lastActivity = Date.now();
    return room.gameState;
};

export const getRoom = (roomId: string) => rooms[roomId];

export const processAction = (roomId: string, playerId: string, action: any) => {
    const room = rooms[roomId];
    if (!room || room.status !== 'playing' || !room.gameState) throw new Error('Game not active');
    
    const state = room.gameState;
    const currentPlayer = state.players[state.currentPlayerIndex];
    if (currentPlayer.id !== playerId) throw new Error('Not your turn');

    let newState = state;

    try {
        if (action.type === 'PLAY_CARD') {
            const { cardId, targetPlayerId, targetOrganId, targetPlayerId2, targetOrganId2 } = action.payload;
            
            // 1. Security check: ownership
            const card = currentPlayer.hand.find(c => c.id === cardId);
            if (!card) throw new Error('Card not in hand');

            // 2. Server-side authoritative validation
            if (!canPlayCard(state, card, playerId, targetPlayerId, targetOrganId, targetPlayerId2, targetOrganId2)) {
                throw new Error('Illegal move');
            }

            newState = playCard(state, cardId, targetPlayerId, targetOrganId, targetPlayerId2, targetOrganId2);
        } else if (action.type === 'DISCARD') {
            newState = discardCards(state, action.payload.cardIds);
        } else if (action.type === 'DRAW') {
            if (state.needsDrawing) {
                newState = drawCard(state);
            }
        } else if (action.type === 'PASS_TURN') {
            if (currentPlayer.hand.length === 0) {
                 newState = endTurn(state);
            }
        }
        
        room.gameState = newState;
        room.lastActivity = Date.now();
        if (newState.winner) {
            room.status = 'finished';
        }
        return newState;
    } catch (e) {
        console.error(e);
        throw new Error('Invalid action');
    }
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
