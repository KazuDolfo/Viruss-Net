import { socket } from '../core/socket';
import { useGameStore } from '../store/gameStore';
import { sessionManager } from '../core/session';

export const useGameActions = () => {
  const { playerId, roomCode } = useGameStore();

  const joinRoom = (roomId: string, playerName: string, sessionToken: string) => {
    // When joining manually, we save the session
    sessionManager.save({ 
      roomCode: roomId, 
      playerName, 
      sessionToken,
      playerId // Note: playerId might be null initially if it's a new player
    });
    
    socket.emit('join_room', { roomId, playerName, playerId, sessionToken });
  };

  const startGame = () => {
    if (roomCode) {
      socket.emit('start_game', { roomId: roomCode });
    }
  };

  const sendAction = (type: string, payload: any) => {
    const session = sessionManager.get();

    if (roomCode && playerId && session.sessionToken) {
      socket.emit('play_action', { 
        roomId: roomCode, 
        playerId, 
        sessionToken: session.sessionToken, 
        action: { type, payload } 
      });
    } else {
      console.error('❌ Cannot send action: Missing context', { roomCode, playerId, hasToken: !!session.sessionToken });
    }
  };

  const leaveRoom = () => {
    sessionManager.clear();
    window.location.reload();
  };

  return {
    joinRoom,
    startGame,
    sendAction,
    leaveRoom
  };
};
