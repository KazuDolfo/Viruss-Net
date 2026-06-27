import { createRoom, getPublicRooms, joinRoom, closeRoom } from '../src/gameManager';
import { performance } from 'perf_hooks';

describe('Room Management (kazu-qa / kazu-perf)', () => {
    afterEach(() => {
        // Cleanup para aislar pruebas
        const rooms = getPublicRooms();
        rooms.forEach(r => closeRoom(r.id, 'test_player'));
    });

    test('Crear sala y obtener salas activas - Performance check', () => {
        const start = performance.now();
        
        // 1. Crear Sala
        const roomId = 'SALA-PERF-1';
        const playerId = 'test_player';
        const playerName = 'Dr. Prueba';
        
        createRoom(roomId);
        joinRoom(roomId, { id: playerId, name: playerName, socketId: 'sock1', sessionToken: 'tok1' });
        
        // 2. Obtener Salas Públicas
        const publicRooms = getPublicRooms();
        
        const end = performance.now();
        const duration = end - start;

        expect(publicRooms).toHaveLength(1);
        expect(publicRooms[0].id).toBe(roomId);
        expect(publicRooms[0].host).toBe(playerName);
        expect(publicRooms[0].playerCount).toBe(1);
        
        // Rendimiento esperado: < 10ms para operaciones síncronas simples
        expect(duration).toBeLessThan(10);
    });

    test('Límite de salas máximas (MAX_ROOMS = 5)', () => {
        for (let i = 0; i < 5; i++) {
            createRoom(`SALA-${i}`);
        }
        expect(() => createRoom('SALA-6')).toThrow('Límite máximo de salas alcanzado (5).');
    });

    test('Desconexión de jugador en fase waiting lo elimina completamente de la sala', () => {
        const roomId = 'SALA-DISCONNECT';
        createRoom(roomId);
        
        joinRoom(roomId, { id: 'host_id', name: 'Host', socketId: 'host_socket', sessionToken: 'tok1' });
        joinRoom(roomId, { id: 'guest_id', name: 'Guest', socketId: 'guest_socket', sessionToken: 'tok2' });
        
        const publicRoomsBefore = getPublicRooms();
        expect(publicRoomsBefore[0].playerCount).toBe(2);

        // Simulamos que el guest se desconecta (al darle a "atrás")
        const { roomId: affectedId, room } = require('../src/gameManager').handleDisconnect('guest_socket');
        
        expect(affectedId).toBe(roomId);
        expect(room.players).toHaveLength(1);
        expect(room.players[0].id).toBe('host_id');

        const publicRoomsAfter = getPublicRooms();
        expect(publicRoomsAfter[0].playerCount).toBe(1);
    });
});
