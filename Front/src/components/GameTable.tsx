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

  return (
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden px-3 md:px-8 pt-[30px] md:pt-12 pb-[250px] lg:pb-8 no-scrollbar layer-world flex flex-col items-center">
      {/* 1. MOBILE FOCUS VIEW (Single Rival Board) */}
      <div className="md:hidden w-full max-w-lg animate-in fade-in zoom-in-95 duration-500 mt-12">
        {rivals.map((p) => (
          p.id === focusedPlayerId && (
            <div key={p.id} className="w-full">
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
                compact={false}
                isGameWinner={gameState.winnerId === p.id}
              />
            </div>
          )
        ))}
        {/* Local player board is HIDDEN on mobile as per request */}
      </div>

      {/* 2. DESKTOP GRID VIEW (Both Rivals and Local) */}
      <div className={cn(
        "hidden md:flex w-full max-w-7xl flex-col gap-8 transition-all duration-500",
      )}>
        {/* Rivals Area */}
        <div className={cn(
          "md:grid md:overflow-visible md:gap-6",
          rivalsCount <= 2 ? "md:grid-cols-2" : 
          rivalsCount <= 3 ? "md:grid-cols-3" : 
          "md:grid-cols-3 lg:grid-cols-5"
        )}>
          {rivals.map((p) => (
            <div 
              key={p.id} 
              className="md:w-auto shrink-0 transform hover:scale-[1.01] transition-transform duration-500"
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
                compact
              />
            </div>
          ))}
        </div>

        {/* Local Player Stage (Desktop only, always visible at bottom) */}
        <div className="w-full flex justify-center mt-4">
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
      </div>

      {/* Turn Indicator (Visible on both, but styled for center) */}
      <div className="flex justify-center items-center py-4 md:py-6 order-first md:order-none">
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

      {/* Table Decorative Center (Only on Large Screens) */}
      <div className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-slate-800 rounded-full border-[10px] border-dashed border-white/20 animate-[spin_60s_linear_infinite]" />
      </div>
    </main>
  );
};
