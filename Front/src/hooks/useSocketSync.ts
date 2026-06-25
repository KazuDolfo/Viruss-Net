import { useEffect, useCallback } from 'react';
import { socket } from '../core/socket';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../core/session';
import type { GameState } from '@shared/models';

export const useSocketSync = () => {
  const { 
    setGameState, 
    setRoomPlayers, 
    setRoomStatus, 
    setIsDrawingState,
    setIsConnected,
    setPlayerId,
    setRoomCode
  } = useGameStore();

  const attemptRejoin = useCallback(() => {
    if (!socket.connected) return;

    const session = sessionManager.get();
    
    if (session.roomCode && session.playerId && session.playerName && session.sessionToken) {
      console.log('🔄 Attempting auto-rejoin to room:', session.roomCode);
      
      // Update store with session data immediately for UI consistency
      setPlayerId(session.playerId);
      setRoomCode(session.roomCode);

      socket.emit('join_room', { 
        roomId: session.roomCode, 
        playerName: session.playerName, 
        playerId: session.playerId, 
        sessionToken: session.sessionToken 
      });
    }
  }, [setPlayerId, setRoomCode]);

  useEffect(() => {
    const onConnect = () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
      attemptRejoin();
    };

    const onDisconnect = (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    };

    const onConnectError = (error: Error) => {
      console.error('⚠️ Connection error:', error);
      setIsConnected(false);
    };

    const onRoomUpdate = (data: { 
      players: { id: string, name: string }[], 
      status: 'waiting' | 'playing' | 'finished' 
    }) => {
      setRoomPlayers(data.players);
      setRoomStatus(data.status);
    };

    const onGameUpdate = (state: GameState) => {
      setGameState(state);
      setRoomStatus(state.winnerId ? 'finished' : 'playing');
      setIsDrawingState(false);
    };

    const onSocialEvent = (event: any) => {
      useGameStore.getState().addSocialEvent(event);
    };

    const onError = (error: string) => {
      console.error('🔥 Game Error:', error);
      if (
        error === 'Room is already playing' || 
        error === 'Room not found' || 
        error === 'Unauthorized: Invalid session' ||
        error === 'Invalid session token'
      ) {
        sessionManager.clear();
        window.location.reload();
      } else {
        alert(error);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && socket.connected) {
        console.log('📱 App foregrounded, verifying sync...');
        attemptRejoin();
      }
    };

    // Attach listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('room_update', onRoomUpdate);
    socket.on('game_update', onGameUpdate);
    socket.on('social_event', onSocialEvent);
    socket.on('error', onError);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('room_update', onRoomUpdate);
      socket.off('game_update', onGameUpdate);
      socket.off('social_event', onSocialEvent);
      socket.off('error', onError);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [
    setGameState, 
    setRoomPlayers, 
    setRoomStatus, 
    setIsDrawingState, 
    setIsConnected, 
    attemptRejoin
  ]);

  return { isConnected: socket.connected };
};
