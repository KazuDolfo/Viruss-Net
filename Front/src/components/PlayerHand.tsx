import React from 'react';
import type { Card } from '@shared/models';
import { CardUI } from './CardUI';
import { cn } from '../utils/cn';
import { Hand } from 'lucide-react';

interface PlayerHandProps {
  hand: readonly Card[];
  selectedCards: readonly Card[];
  onCardClick: (card: Card) => void;
  isMyTurn: boolean;
  isDrawingState: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  selectedCards,
  onCardClick,
  isMyTurn,
  isDrawingState
}) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-in-out px-2 pb-[env(safe-area-inset-bottom,1.5rem)] md:pb-8 pt-10",
      isMyTurn ? "translate-y-0" : "translate-y-[85%] opacity-60 hover:translate-y-0 hover:opacity-100"
    )}>
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950/80 to-transparent pointer-events-none" />

      <div className="max-w-screen-xl mx-auto relative z-10">
        {/* Indicators */}
        <div className="flex justify-between items-center mb-2 md:mb-4 px-4">
          <div className="flex flex-col bg-slate-950/80 backdrop-blur-xl px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border border-white/10 shadow-2xl">
             <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none">Recursos</span>
             <span className="text-xs md:text-sm font-black text-white italic leading-tight">TU MANO ({hand.length}/3)</span>
          </div>
          
          {isMyTurn && isDrawingState && (
            <div className="bg-yellow-500 text-black px-4 py-1.5 md:px-6 md:py-2 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.4)] animate-bounce flex items-center gap-2 border-2 border-white/20">
               <Hand size={14} className="animate-pulse" /> ROBA
            </div>
          )}
        </div>

        {/* COMPRESSED HAND ENGINE */}
        <div className={cn(
          "flex justify-center items-end transition-all duration-500",
          // Overlap logic: -space-x-8 on mobile, -space-x-12 on desktop
          "-space-x-10 xs:-space-x-12 md:-space-x-16"
        )}>
          {hand.map((card, index) => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            return (
              <div 
                key={card.id} 
                className={cn(
                  "relative transition-all duration-300 ease-out will-change-transform transform-gpu",
                  // Dynamic Z-Index: selected cards always on top, others follow index
                  isSelected ? "z-50 -translate-y-6 md:-translate-y-10 scale-110" : "z-[index] hover:z-40 hover:-translate-y-8 hover:scale-105",
                  // Rotation effect for fan-like feel
                  index === 0 && hand.length > 1 && "-rotate-3",
                  index === hand.length - 1 && hand.length > 1 && "rotate-3"
                )}
                style={{ zIndex: isSelected ? 50 : 10 + index }}
              >
                <CardUI 
                  card={card} 
                  selected={isSelected}
                  onClick={() => onCardClick(card)}
                  className="shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
