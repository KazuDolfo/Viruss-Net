import { socket } from '../core/socket';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../core/session';

export const useGameActions = () => {
  const joinRoom = (roomId: string, playerName: string, sessionToken: string) => {
    const session = sessionManager.get();
    const currentPid = session.playerId;
    
    sessionManager.save({ 
      roomCode: roomId, 
      playerName, 
      sessionToken,
      playerId: currentPid
    });
    
    socket.emit('join_room', { roomId, playerName, playerId: currentPid, sessionToken });
  };

  const startGame = () => {
    const session = sessionManager.get();
    if (session.roomCode) {
      socket.emit('start_game', { roomId: session.roomCode });
    }
  };

  const sendAction = (type: string, payload: any) => {
    const session = sessionManager.get();

    if (session.roomCode && session.playerId && session.sessionToken) {
      socket.emit('play_action', { 
        roomId: session.roomCode, 
        playerId: session.playerId, 
        sessionToken: session.sessionToken, 
        action: { type, ...payload } 
      });
    } else {
      console.error('❌ Cannot send action: Missing context', session);
    }
  };

  const leaveRoom = () => {
    const session = sessionManager.get();
    if (session.roomCode && session.playerId) {
      socket.emit('leave_room', { roomId: session.roomCode, playerId: session.playerId });
    }
    sessionManager.clear();
    window.location.reload();
  };

  const createRoom = (roomId: string, playerName: string, sessionToken: string) => {
    const session = sessionManager.get();
    const currentPid = session.playerId;

    sessionManager.save({ 
      roomCode: roomId, 
      playerName, 
      sessionToken,
      playerId: currentPid
    });
    socket.emit('create_room', { roomId, playerName, playerId: currentPid, sessionToken });
  };

  const closeRoom = () => {
    const session = sessionManager.get();
    if (session.roomCode && session.playerId) {
      socket.emit('close_room', { roomId: session.roomCode, playerId: session.playerId });
    }
  };

  return {
    joinRoom,
    createRoom,
    closeRoom,
    startGame,
    sendAction,
    leaveRoom
  };
};
