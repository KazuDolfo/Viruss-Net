import React, { memo } from 'react';
import type { Player, Card } from '@shared/models';
import { OrganSlot } from './OrganSlot';
import { CardUI } from './CardUI';
import { Heart } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlayerBoardProps {
  player: Player;
  isActive: boolean;
  selectedCards: Card[];
  pendingTargets?: {playerId: string, organId: string}[];
  onCardClick: (card: Card) => void;
  onOrganClick: (playerId: string, organId: string) => void;
  canTargetOrgan: (playerId: string, organId: string) => boolean;
  onPlayerClick?: (playerId: string) => void;
  canTargetPlayer?: (playerId: string) => boolean;
  isGameWinner?: boolean;
  compact?: boolean;
}

const PlayerBoardBase: React.FC<PlayerBoardProps> = ({ 
  player, 
  isActive, 
  selectedCards, 
  pendingTargets = [],
  onCardClick, 
  onOrganClick,
  canTargetOrgan,
  onPlayerClick,
  canTargetPlayer,
  isGameWinner,
  compact = false
}) => {
  const isTargetable = canTargetPlayer?.(player.id);

  return (
    <div 
      onClick={isTargetable ? () => onPlayerClick?.(player.id) : undefined}
      className={cn(
      'rounded-[clamp(1.5rem,3vw,3rem)] transition-all border-[clamp(2px,0.4vw,6px)] flex flex-col relative overflow-hidden',
      isActive ? 'bg-slate-800/95 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.2)]' : 'bg-slate-900/60 border-white/5',
      compact ? 'p-3 w-full max-w-[min(100%,320px)]' : 'p-[clamp(1rem,2.5vw,2rem)] w-full shadow-2xl',
      isTargetable && 'cursor-pointer ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-900 animate-pulse z-20'
    )}>
      {isTargetable && (
          <div className="absolute inset-0 bg-blue-500/10 z-10 pointer-events-none" />
      )}
      {/* Visual background element */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-20 pointer-events-none",
        isActive ? "bg-yellow-400" : "bg-blue-400"
      )} />

      <div className="flex justify-between items-center mb-[clamp(0.5rem,1.5vw,1.5rem)] px-1 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className={cn(
             'font-black uppercase tracking-tight truncate flex items-center gap-2',
             isActive ? 'text-yellow-400' : 'text-slate-200',
             compact ? 'text-[clamp(12px,4vw,16px)]' : 'text-[clamp(16px,3vw,28px)]'
           )}>
            {player.name}
            {isGameWinner && <span className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">🏆</span>}
          </h2>
          {isActive && <div className="w-[clamp(6px,1.5vw,10px)] h-[clamp(6px,1.5vw,10px)] bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)] shrink-0" />}
        </div>
        
        <div className={cn(
          "font-black rounded-full bg-black/40 px-[clamp(8px,1.5vw,14px)] py-[clamp(4px,1vw,8px)] border border-white/10 text-white/80 shadow-inner shrink-0",
          compact ? 'text-[clamp(9px,2.5vw,11px)]' : 'text-[clamp(11px,2vw,14px)]'
        )}>
          {player.organs.length}/4 <span className="hidden sm:inline opacity-60">ÓRGANOS</span>
        </div>
      </div>

      {/* Organs Area - Uses CSS Grid for perfect alignment */}
      <div className={cn(
        "grid gap-[clamp(0.5rem,1.5vw,1.5rem)] items-center justify-items-center border-2 border-dashed border-white/10 rounded-[clamp(1rem,2vw,2rem)] bg-black/30 p-[clamp(0.8rem,2vw,1.5rem)] transition-all relative z-10",
        compact ? 'grid-cols-2 xs:grid-cols-4 sm:grid-cols-2 md:grid-cols-4 min-h-[clamp(6rem,15vw,8rem)]' : 'grid-cols-2 sm:grid-cols-4 min-h-[clamp(10rem,20vw,16rem)]'
      )}>
        {player.organs.length === 0 ? (
          <div className="col-span-full py-10 flex flex-col items-center gap-2 opacity-20">
            <Heart size={40} className="text-slate-500" />
            <p className="text-slate-500 text-[clamp(10px,2vw,14px)] font-black uppercase tracking-[0.2em]">Cuerpo Vacío</p>
          </div>
        ) : (
          player.organs.map((organ: any) => (
            <div key={organ.id} className="w-full flex justify-center">
              <OrganSlot 
                organ={organ} 
                onClick={() => onOrganClick(player.id, organ.id)}
                canTarget={canTargetOrgan(player.id, organ.id)}
                isSelected={pendingTargets.some(t => t.playerId === player.id && t.organId === organ.id)}
                small={compact || player.organs.length > 3}
              />
            </div>
          ))
        )}
      </div>

      {/* Hand Area - Only if active and not compact */}
      {isActive && !compact && (
        <div className="mt-[clamp(1rem,2vw,2rem)] pt-[clamp(1rem,2vw,2rem)] border-t border-white/10 relative z-10">
          <div className="flex justify-between items-end mb-[clamp(0.5rem,1.5vw,1.5rem)] px-1">
            <div className="flex flex-col">
               <span className="text-[clamp(8px,1.5vw,10px)] font-black text-slate-500 uppercase tracking-[0.3em]">Recursos Disponibles</span>
               <span className="text-[clamp(12px,2.5vw,18px)] font-black text-white italic">TU MANO ({player.hand.length}/3)</span>
            </div>
            <span className="md:hidden text-[clamp(8px,1.5vw,10px)] font-bold text-blue-400 animate-pulse bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">DESLIZA PARA ELEGIR →</span>
          </div>
          
          <div className="flex gap-[clamp(0.5rem,1.5vw,1.2rem)] overflow-x-auto pb-6 px-1 no-scrollbar scroll-smooth snap-x snap-proximity">
            {player.hand.map((card: any) => (
              <div key={card.id} className="snap-center shrink-0 first:pl-2 last:pr-2">
                <CardUI 
                  card={card} 
                  selected={selectedCards.some(c => c.id === card.id)}
                  onClick={() => onCardClick(card)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const PlayerBoard = memo(PlayerBoardBase, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.isGameWinner === next.isGameWinner &&
    prev.compact === next.compact &&
    prev.player === next.player &&
    prev.selectedCards === next.selectedCards &&
    prev.pendingTargets === next.pendingTargets
  );
});
