import React from 'react';
import { PlayerBoard } from './PlayerBoard';
import { cn } from '../utils/cn';
import type { Player, Card, GameState } from '@shared/models';

interface GameTableProps {
  gameState: GameState;
  currentPlayer: Player;
  myPlayer: Player;
  rivals: readonly Player[];
  selectedCards: Card[];
  pendingTargets: { playerId: string, organId: string }[];
  isMyTurn: boolean;
  isDrawingState: boolean;
  handleCardClick: (card: Card) => void;
  handleOrganClick: (pid: string, oid: string) => void;
  canTargetOrgan: (pid: string, oid: string) => boolean;
  handlePlayerTarget: (pid: string) => void;
  canTargetPlayer: (pid: string) => boolean;
  neverTargetPlayer: (pid: string) => boolean;
}

import { useGameStore } from '../store/gameStore';

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  currentPlayer,
  myPlayer,
  rivals,
  selectedCards,
  pendingTargets,
  isMyTurn,
  isDrawingState,
  handleCardClick,
  handleOrganClick,
  canTargetOrgan,
  handlePlayerTarget,
  canTargetPlayer,
  neverTargetPlayer
}) => {
  const rivalsCount = rivals.length;
  const focusedPlayerId = useGameStore(state => state.focusedPlayerId);
  const setFocusedPlayerId = useGameStore(state => state.setFocusedPlayerId);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // Sync scroll position when focusedPlayerId changes programmatically (e.g., via button click)
  React.useEffect(() => {
    if (window.innerWidth < 768 && focusedPlayerId && carouselRef.current) {
      const element = document.getElementById(`player-board-${focusedPlayerId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [focusedPlayerId]);

  // Sync focused player when scrolling horizontally on mobile
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (window.innerWidth >= 768) return;
    const container = e.currentTarget;
    const scrollLeft = container.scrollLeft;
    const itemWidth = container.offsetWidth * 0.92; // matching w-[92vw]
    const index = Math.round(scrollLeft / (itemWidth + 16)); // +16 for gap
    if (rivals[index] && rivals[index].id !== focusedPlayerId) {
      // Use a small timeout or check to prevent feedback loops if needed, 
      // but usually React state batching handles this.
      setFocusedPlayerId(rivals[index].id);
    }
  };

  return (
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden px-3 md:px-8 pt-[30px] md:pt-12 pb-[280px] lg:pb-8 no-scrollbar layer-world flex flex-col items-center">
      
      {/* 1. RIVALS AREA (Carousel on Mobile, Grid on Desktop) */}
      <div 
        ref={carouselRef}
        onScroll={handleScroll}
        className={cn(
          "w-full max-w-7xl flex flex-nowrap overflow-x-auto snap-x snap-mandatory gap-4 pb-4 no-scrollbar transition-all duration-500",
          "md:grid md:overflow-visible md:gap-8 md:pb-0",
          rivalsCount <= 2 ? "md:grid-cols-2" : 
          rivalsCount <= 3 ? "md:grid-cols-3" : 
          "md:grid-cols-3 lg:grid-cols-5"
        )}
      >
        {rivals.map((p) => (
          <div 
            key={p.id} 
            id={`player-board-${p.id}`}
            className="w-[92vw] md:w-auto shrink-0 snap-center transform hover:scale-[1.01] transition-transform duration-500"
          >
            <PlayerBoard 
              player={p} 
              isActive={p.id === currentPlayer.id} 
              selectedCards={selectedCards} 
              pendingTargets={pendingTargets}
              onCardClick={handleCardClick} 
              onOrganClick={handleOrganClick} 
              canTargetOrgan={canTargetOrgan}
              onPlayerClick={handlePlayerTarget}
              canTargetPlayer={canTargetPlayer}
              compact={window.innerWidth < 768} // Compact only on small screens
              isGameWinner={gameState.winnerId === p.id}
            />
          </div>
        ))}
      </div>

      {/* 2. TABLE CENTERPIECE (Turn Indicator) */}
      <div className="flex justify-center items-center py-4 md:py-8 order-first md:order-none">
        <div className={cn(
          "px-6 py-2 md:px-10 md:py-4 rounded-[2rem] border-2 backdrop-blur-2xl transition-all duration-700 shadow-2xl flex flex-col items-center",
          isMyTurn 
            ? "bg-yellow-500/10 border-yellow-500/40 shadow-yellow-500/5 scale-110" 
            : "bg-slate-900/40 border-white/5 opacity-80"
        )}>
          <div className="flex items-center gap-3">
            {isMyTurn && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)]" />}
            <span className={cn(
              "text-[9px] md:text-xs font-black uppercase tracking-[0.3em] leading-none",
              isMyTurn ? "text-yellow-500" : "text-slate-500"
            )}>
              {isMyTurn ? "TU TURNO" : `TURNO DE`}
            </span>
            {isMyTurn && <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)]" />}
          </div>
          {!isMyTurn && (
            <span className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-white mt-1">
              {currentPlayer.name}
            </span>
          )}
          {isMyTurn && (
             <span className="text-xl md:text-4xl font-black uppercase italic tracking-tighter text-yellow-400 mt-1 animate-pulse">
              ¡TE TOCA!
            </span>
          )}
        </div>
      </div>

      {/* 3. LOCAL PLAYER STAGE (Always visible at bottom) */}
      <div id={`player-board-${myPlayer.id}`} className="w-full flex justify-center mt-4 md:mt-8 pb-12">
        <div className="w-full max-w-3xl transform hover:scale-[1.01] transition-transform duration-500">
          <PlayerBoard 
            player={myPlayer} 
            isActive={isMyTurn && !isDrawingState} 
            selectedCards={selectedCards} 
            pendingTargets={pendingTargets}
            onCardClick={handleCardClick} 
            onOrganClick={handleOrganClick} 
            canTargetOrgan={canTargetOrgan}
            onPlayerClick={handlePlayerTarget}
            canTargetPlayer={neverTargetPlayer}
            isGameWinner={gameState.winnerId === myPlayer.id}
          />
        </div>
      </div>

      {/* Table Decorative Center (Only on Large Screens) */}
      <div className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-slate-800 rounded-full border-[10px] border-dashed border-white/20 animate-[spin_60s_linear_infinite]" />
      </div>
    </main>
  );
};
