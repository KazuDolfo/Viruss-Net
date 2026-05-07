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
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden p-4 md:p-8 no-scrollbar pb-64 lg:pb-8 layer-world">
      {/* Dynamic Grid Layout */}
      <div className={cn(
        "grid gap-6 md:gap-8 transition-all duration-500",
        // Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols (focusing local player)
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-center max-w-7xl mx-auto"
      )}>
        
        {/* Rivals */}
        {rivals.map((p) => (
          <div key={p.id} className="w-full transform hover:scale-[1.02] transition-transform duration-500">
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

        {/* Local Player Stage (Always highlighted in its own area) */}
        <div className="sm:col-span-2 lg:col-span-3 mt-8 flex justify-center">
          <div className="w-full max-w-4xl transform hover:scale-[1.01] transition-transform duration-500">
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
