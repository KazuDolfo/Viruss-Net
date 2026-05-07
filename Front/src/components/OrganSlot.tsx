import React, { memo } from 'react';
import type { OrganState } from '@shared/models';
import { CardUI } from './CardUI';
import { ShieldCheck } from 'lucide-react';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface OrganSlotProps {
  organ: OrganState;
  onClick?: () => void;
  canTarget?: boolean;
  isSelected?: boolean;
  small?: boolean;
}

const OrganSlotBase: React.FC<OrganSlotProps> = ({ organ, onClick, canTarget, isSelected, small }) => {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative group transition-all touch-manipulation",
        canTarget ? 'cursor-pointer hover:ring-4 ring-yellow-400 rounded-xl animate-pulse' : '',
        isSelected ? 'ring-4 ring-green-500 rounded-xl scale-105 z-20 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : ''
      )}
    >
      {/* Organ Card */}
      <CardUI card={organ.organCard} disabled={!canTarget && !isSelected && onClick === undefined} small={small} selected={isSelected} />

      {/* Virus layer */}
      <div className={cn(
        "absolute top-0 -left-1 md:-left-2 flex flex-col gap-1 z-20",
        small ? "scale-75 origin-top-right" : ""
      )}>
        {organ.viruses.map((v: any, i: number) => (
          <CardUI key={v.id} card={v} small className={cn("shadow-md border-white/20", i > 0 && "-mt-12 md:-mt-16")} />
        ))}
      </div>

      {/* Medicines layer */}
      <div className={cn(
        "absolute top-0 -right-1 md:-right-2 flex flex-col gap-1 z-20",
        small ? "scale-75 origin-top-left" : ""
      )}>
        {organ.medicines.map((m: any, i: number) => (
          <CardUI key={m.id} card={m} small className={cn("shadow-md border-white/20", i > 0 && "-mt-12 md:-mt-16")} />
        ))}
      </div>

      {/* Immune indicator */}
      {organ.isImmune && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/30 rounded-xl pointer-events-none border-4 border-blue-400 z-30 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
          <ShieldCheck size={small ? 32 : 56} className="text-blue-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      )}
      
      {canTarget && !isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[9px] md:text-[11px] font-black px-3 py-1 rounded-full shadow-2xl z-40 whitespace-nowrap border-2 border-black/10">
          ¡ELIGE AQUÍ!
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[9px] md:text-[11px] font-black px-3 py-1 rounded-full shadow-2xl z-40 whitespace-nowrap border-2 border-white/20">
          SELECCIONADO
        </div>
      )}
    </div>
  );
};

export const OrganSlot = memo(OrganSlotBase, (prev, next) => {
  return (
    prev.canTarget === next.canTarget &&
    prev.isSelected === next.isSelected &&
    prev.small === next.small &&
    prev.organ === next.organ
  );
});
