import React, { memo } from 'react';
import type { Player, Card } from '@shared/models';
import { OrganSlot } from './OrganSlot';
import { cn } from '../utils/cn';

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
  pendingTargets = [],
  onOrganClick,
  canTargetOrgan,
  onPlayerClick,
  canTargetPlayer,
  isGameWinner,
  compact = false
}) => {
  const isTargetable = canTargetPlayer?.(player.id);

  // Always render 4 slots
  const slots = [0, 1, 2, 3];

  return (
    <div 
      onClick={isTargetable ? () => onPlayerClick?.(player.id) : undefined}
      className={cn(
      'rounded-[1.5rem] md:rounded-[2rem] transition-all border-[2px] md:border-[3px] flex flex-col relative overflow-hidden will-change-transform',
      isActive ? 'bg-slate-800/95 border-yellow-500 shadow-[0_0_40px_rgba(234,179,8,0.2)]' : 'bg-slate-900/40 border-white/5 opacity-70 hover:opacity-100',
      compact ? 'p-2 md:p-3 w-full' : 'p-3 md:p-6 w-full shadow-2xl',
      isTargetable && 'cursor-pointer ring-4 ring-blue-500 ring-offset-4 ring-offset-slate-900 animate-pulse z-20'
    )}>
      {isTargetable && (
          <div className="absolute inset-0 bg-blue-500/10 z-10 pointer-events-none" />
      )}

      <div className="flex justify-between items-center mb-2 md:mb-4 px-1 relative z-10 gap-2">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
          <h2 className={cn(
             'font-black uppercase tracking-tight flex items-center gap-1.5 min-w-0',
             isActive ? 'text-yellow-400' : 'text-slate-200',
             compact ? 'text-xs md:text-sm' : 'text-sm xs:text-base md:text-2xl'
           )}>
            <span className="truncate">{player.name}</span>
            {isGameWinner && <span className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)] shrink-0">🏆</span>}
          </h2>
          {isActive && <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(234,179,8,1)] shrink-0" />}
        </div>
        
        <div className={cn(
          "font-black rounded-full bg-black/40 px-2 py-0.5 md:px-3 md:py-1 border border-white/10 text-white/80 shadow-inner shrink-0",
          compact ? 'text-[8px] md:text-[9px]' : 'text-[9px] md:text-xs'
        )}>
          {player.body.length}/4 <span className="hidden sm:inline opacity-60">ÓRGANOS</span>
        </div>
      </div>

      {/* Organs Area - Uses CSS Grid for perfect alignment */}
      <div className={cn(
        "grid gap-2 md:gap-4 items-center justify-items-center border-2 border-dashed border-white/5 rounded-xl md:rounded-2xl bg-black/20 p-2 md:p-4 min-h-[120px] xs:min-h-[140px] md:min-h-[180px]",
        // Always 4 columns to save vertical space and maintain consistent layout
        "grid-cols-4"
      )}>
        {slots.map((idx) => {
          const organ = player.body[idx];
          return (
            <div key={idx} className="w-full flex justify-center aspect-[2/3] max-w-[80px] xs:max-w-[100px] md:max-w-none">
              {organ ? (
                <OrganSlot 
                  organ={organ} 
                  onClick={() => onOrganClick(player.id, organ.id)}
                  canTarget={canTargetOrgan(player.id, organ.id)}
                  isSelected={pendingTargets.some(t => t.playerId === player.id && t.organId === organ.id)}
                  small={compact || player.body.length > 4}
                />
              ) : (
                <div className="w-full h-full border-2 border-dashed border-white/10 rounded-lg md:rounded-xl flex items-center justify-center opacity-20">
                  <div className="w-6 h-6 md:w-12 md:h-12 border-2 border-white/20 rounded-full" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PlayerBoard = memo(PlayerBoardBase, (prev, next) => {
  return (
    prev.isActive === next.isActive &&
    prev.isGameWinner === next.isGameWinner &&
    prev.compact === next.compact &&
    prev.player === next.player &&
    prev.pendingTargets === next.pendingTargets
  );
});
