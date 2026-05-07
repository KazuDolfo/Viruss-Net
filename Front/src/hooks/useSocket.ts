import { useEffect, useCallback } from 'react';
import { socket } from '../core/socket';
import { useGameStore } from '../store/gameStore';
import type { GameState } from '@shared/models';

export const useSocket = () => {
  const { 
    setGameState, 
    setRoomPlayers, 
    setRoomStatus, 
    setIsDrawingState 
  } = useGameStore();

  const handleConnect = useCallback(() => {
    console.log('✅ Socket connected/reconnected:', socket.id);
    
    // Auto-rejoin logic
    const state = useGameStore.getState();
    const savedRoomCode = state.roomCode || localStorage.getItem('virus_room_code');
    const savedPlayerId = state.playerId || localStorage.getItem('virus_player_id');
    const savedPlayerName = localStorage.getItem('virus_player_name');
    const sessionToken = localStorage.getItem('virus_session_token');

    if (savedRoomCode && savedPlayerId && savedPlayerName && sessionToken) {
      console.log('🔄 Attempting auto-rejoin to room:', savedRoomCode);
      socket.emit('join_room', { 
        roomId: savedRoomCode, 
        playerName: savedPlayerName, 
        playerId: savedPlayerId, 
        sessionToken 
      });
    }
  }, []);

  useEffect(() => {
    const handleRoomUpdate = (data: { players: { id: string, name: string }[], status: 'waiting' | 'playing' | 'finished' }) => {
      setRoomPlayers(data.players);
      setRoomStatus(data.status);
    };

    const handleGameUpdate = (state: GameState) => {
      setGameState(state);
      if (state.winner) {
        setRoomStatus('finished');
      } else {
        setRoomStatus('playing');
      }
      
      // Reset local drawing state if turn transitioned
      if (!state.needsDrawing) {
        setIsDrawingState(false);
      }
    };

    const handleRoomError = (error: string) => {
      console.error('Socket Error:', error);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
        console.log('📱 App foregrounded, syncing state...');
        handleConnect();
      }
    };

    socket.on('connect', handleConnect);
    socket.on('room_update', handleRoomUpdate);
    socket.on('game_update', handleGameUpdate);
    socket.on('error', handleRoomError);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room_update', handleRoomUpdate);
      socket.off('game_update', handleGameUpdate);
      socket.off('error', handleRoomError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setGameState, setRoomPlayers, setRoomStatus, setIsDrawingState, handleConnect]);

  return socket;
};
