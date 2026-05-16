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
  const rivalsCount = rivals.length;

  return (
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden px-3 md:px-8 pt-[125px] md:pt-28 pb-[250px] lg:pb-8 no-scrollbar layer-world flex flex-col items-center">
      {/* Dynamic Grid Layout */}
      <div className={cn(
        "w-full max-w-7xl flex flex-col gap-6 md:gap-8 transition-all duration-500",
      )}>
        
        {/* Rivals Area - Horizontal Scroll on Mobile, Flexible Grid on Desktop */}
        <div className={cn(
          "flex flex-nowrap overflow-x-auto snap-x gap-4 pb-4 md:pb-0 scroll-smooth no-scrollbar",
          "md:grid md:overflow-visible md:gap-6",
          rivalsCount <= 2 ? "md:grid-cols-2" : 
          rivalsCount <= 3 ? "md:grid-cols-3" : 
          "md:grid-cols-3 lg:grid-cols-5"
        )}>
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
                compact
              />
            </div>
          ))}
        </div>

        {/* Local Player Stage (Always highlighted in its own area) */}
        <div id={`player-board-${myPlayer.id}`} className="w-full flex justify-center mt-2 md:mt-4">
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

      {/* Table Decorative Center (Only on Large Screens) */}
      <div className="hidden xl:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30vh] h-[30vh] pointer-events-none opacity-10">
        <div className="absolute inset-0 bg-slate-800 rounded-full border-[10px] border-dashed border-white/20 animate-[spin_60s_linear_infinite]" />
      </div>
    </main>
  );
};
