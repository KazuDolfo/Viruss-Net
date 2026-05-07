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
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden px-3 md:px-8 py-4 no-scrollbar pb-[300px] lg:pb-8 layer-world">
      {/* Dynamic Grid Layout */}
      <div className={cn(
        "grid gap-4 md:gap-8 transition-all duration-500",
        // Mobile: rivals at top, Tablet: 2 cols, Desktop: 3 cols
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-start justify-center max-w-7xl mx-auto"
      )}>
        
        {/* Rivals Area */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:col-span-2 lg:col-span-2 order-1">
          {rivals.map((p) => (
            <div key={p.id} className="w-full transform hover:scale-[1.01] transition-transform duration-500">
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
        <div className="sm:col-span-2 lg:col-span-1 mt-4 md:mt-0 flex justify-center order-2 lg:order-2">
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
