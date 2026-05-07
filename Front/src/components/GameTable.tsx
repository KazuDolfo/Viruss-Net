import React from 'react';
import { PlayerBoard } from './PlayerBoard';
import { Layers } from 'lucide-react';
import type { Player, Card, GameState } from '@shared/models';

interface GameTableProps {
  gameState: GameState;
  playerId: string;
  currentPlayer: Player;
  myPlayer: Player;
  rivals: Player[];
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
  playerId,
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
    <main className="flex-1 relative overflow-y-auto lg:overflow-hidden p-4 md:p-8 no-scrollbar pb-[clamp(8rem,20vh,16rem)] lg:pb-8">
      {/* Circular Table (Desktop Layout) */}
      <div className="hidden lg:flex flex-col h-full gap-8">
        {/* Top Row (Rivals) */}
        <div className="flex justify-center gap-8 px-4 h-1/3">
          {rivals.slice(0, Math.ceil(rivals.length / 2)).map(p => (
            <div key={p.id} className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
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

        {/* Middle Row (Sides + Deck Center) */}
        <div className="flex-1 flex items-center justify-between gap-12 px-12 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35vh] h-[35vh] pointer-events-none">
            <div className="absolute inset-0 bg-slate-800/10 rounded-full border-[10px] border-dashed border-white/[0.02] animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-4 bg-slate-900/40 rounded-full border border-white/5 flex flex-col items-center justify-center backdrop-blur-sm shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
              <div className="text-white/5 font-black text-6xl italic rotate-12 select-none tracking-tighter">VIRUS!</div>
              <div className="mt-4 flex gap-4 opacity-20">
                <Layers size={32} />
                <div className="w-8 h-12 bg-white/10 rounded-md border border-white/20 rotate-6" />
                <div className="w-8 h-12 bg-white/10 rounded-md border border-white/20 -rotate-12 translate-x-2" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-8 w-1/4" />
          <div className="flex flex-col gap-8 w-1/4 text-right" />
        </div>

        {/* Bottom Row (Local Player & Bottom Rivals) */}
        <div className="flex flex-col items-center gap-8 h-2/5">
          <div className="flex justify-center gap-8 w-full">
            {rivals.slice(Math.ceil(rivals.length / 2)).map(p => (
              <div key={p.id} className="w-full max-w-sm transform hover:scale-[1.02] transition-transform duration-500">
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

          <div className="w-full max-w-5xl px-8 transform hover:scale-[1.01] transition-transform duration-500">
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
              isGameWinner={gameState.winner?.id === playerId} 
            />
          </div>
        </div>
      </div>

      {/* Mobile / Responsive Grid Layout */}
      <div className="lg:hidden flex flex-col gap-10">
        <section className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-6 justify-center w-full">
          {rivals.map((p) => (
            <div key={p.id}>
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
        </section>

        <section className="flex justify-center w-full">
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
            isGameWinner={gameState.winner?.id === playerId} 
          />
        </section>
      </div>
    </main>
  );
};
