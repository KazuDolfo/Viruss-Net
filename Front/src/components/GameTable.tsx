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
  return (
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden px-3 md:px-8 pt-[100px] md:pt-32 pb-[200px] lg:pb-8 no-scrollbar layer-world">
      {/* Dynamic Grid Layout */}
      <div className={cn(
        "grid gap-6 md:gap-12 transition-all duration-500",
        // Stack layout: Rivals full width top, local full width bottom
        "grid-cols-1 md:grid-cols-3 items-start justify-center max-w-7xl mx-auto"
      )}>
        
        {/* Rivals Area - Horizontal Scroll on Mobile, Grid on Desktop */}
        <div className="flex flex-nowrap overflow-x-auto snap-x gap-4 md:grid md:grid-cols-3 md:gap-6 md:col-span-3 order-1 pb-2 md:pb-0 scroll-smooth no-scrollbar">
          {rivals.map((p) => (
            <div key={p.id} className="w-[85vw] shrink-0 snap-center md:w-auto transform hover:scale-[1.01] transition-transform duration-500">
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

        {/* Local Player Stage (Always highlighted in its own area) */}
        <div className="md:col-span-3 mt-4 md:mt-12 flex justify-center order-2">
          <div className="w-full max-w-2xl lg:max-w-6xl transform hover:scale-[1.01] transition-transform duration-500">
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

      {/* Table Decorative Center (Only on Large Screens) */}
      <div className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-slate-800 rounded-full border-[10px] border-dashed border-white/20 animate-[spin_60s_linear_infinite]" />
      </div>
    </main>
  );
};
