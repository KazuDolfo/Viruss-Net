import { socket } from '../core/socket';
import { useGameStore } from '../store/gameStore';

export const useActions = () => {
  const playerId = useGameStore(state => state.playerId);

  const joinRoom = (roomId: string, playerName: string, sessionToken: string) => {
    socket.emit('join_room', { roomId, playerName, playerId, sessionToken });
  };

  const startGame = (roomId: string) => {
    socket.emit('start_game', { roomId });
  };

  const sendAction = (type: string, payload: any) => {
    const sessionToken = localStorage.getItem('virus_session_token');
    const roomId = useGameStore.getState().roomCode;
    const pId = useGameStore.getState().playerId;

    if (roomId && pId) {
      socket.emit('play_action', { 
        roomId, 
        playerId: pId, 
        sessionToken, 
        action: { type, payload } 
      });
    }
  };

  const resetGame = () => {
    window.location.reload();
  };

  return {
    joinRoom,
    startGame,
    sendAction,
    resetGame
  };
};
