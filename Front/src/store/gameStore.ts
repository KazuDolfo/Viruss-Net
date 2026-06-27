import { create } from 'zustand';
import type { GameState, SocialEvent } from '@shared/index';

interface GameStore {
  gameState: GameState | null;
  playerId: string | null;
  roomCode: string | null;
  roomPlayers: { id: string; name: string; connected?: boolean }[];
  roomStatus: 'waiting' | 'playing' | 'finished';
  isDrawingState: boolean;
  isConnected: boolean;
  focusedPlayerId: string | null;
  
  // Social State
  activeSocialEvents: SocialEvent[];
  addSocialEvent: (event: SocialEvent) => void;
  removeSocialEvent: (timestamp: number) => void;
  
  // Actions
  setGameState: (state: GameState) => void;
  setRoomPlayers: (players: { id: string; name: string; connected?: boolean }[]) => void;
  setRoomStatus: (status: 'waiting' | 'playing' | 'finished') => void;
  setPlayerId: (id: string) => void;
  setRoomCode: (code: string | null) => void;
  setIsDrawingState: (isDrawing: boolean) => void;
  setIsConnected: (connected: boolean) => void;
  setFocusedPlayerId: (id: string | null) => void;
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
  focusedPlayerId: null,
  activeSocialEvents: [],

  addSocialEvent: (event) => set((state) => ({ 
    activeSocialEvents: [...state.activeSocialEvents, event] 
  })),

  removeSocialEvent: (timestamp) => set((state) => ({
    activeSocialEvents: state.activeSocialEvents.filter(e => e.timestamp !== timestamp)
  })),

  setGameState: (gameState) => set({ gameState }),
  setRoomPlayers: (roomPlayers) => set({ roomPlayers }),
  setRoomStatus: (roomStatus) => set({ roomStatus }),
  setPlayerId: (playerId) => set({ playerId }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setIsDrawingState: (isDrawingState) => set({ isDrawingState }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setFocusedPlayerId: (focusedPlayerId) => set({ focusedPlayerId }),
  
  resetStore: () => set({ 
    gameState: null, 
    roomCode: null, 
    roomPlayers: [],
    roomStatus: 'waiting',
    isDrawingState: false,
    isConnected: false,
    focusedPlayerId: null,
    activeSocialEvents: []
  }),
}));
