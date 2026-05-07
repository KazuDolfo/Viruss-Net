import { create } from 'zustand';
import type { GameState } from '@shared/models';

interface GameStore {
  gameState: GameState | null;
  playerId: string | null;
  roomCode: string | null;
  roomPlayers: { id: string, name: string }[];
  roomStatus: 'waiting' | 'playing' | 'finished';
  isDrawingState: boolean;
  isConnected: boolean;
  
  // Actions
  setGameState: (state: GameState) => void;
  setRoomPlayers: (players: { id: string, name: string }[]) => void;
  setRoomStatus: (status: 'waiting' | 'playing' | 'finished') => void;
  setPlayerId: (id: string) => void;
  setRoomCode: (code: string | null) => void;
  setIsDrawingState: (isDrawing: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  resetStore: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: null,
  playerId: null,
  roomCode: null,
  roomPlayers: [],
  roomStatus: 'waiting',
  isDrawingState: false,
  isConnected: false,

  setGameState: (gameState) => set({ gameState }),
  setRoomPlayers: (roomPlayers) => set({ roomPlayers }),
  setRoomStatus: (roomStatus) => set({ roomStatus }),
  setPlayerId: (playerId) => set({ playerId }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setIsDrawingState: (isDrawingState) => set({ isDrawingState }),
  setIsConnected: (isConnected) => set({ isConnected }),
  
  resetStore: () => set({ 
    gameState: null, 
    roomCode: null, 
    roomPlayers: [],
    roomStatus: 'waiting',
    isDrawingState: false,
    isConnected: false
  }),
}));
