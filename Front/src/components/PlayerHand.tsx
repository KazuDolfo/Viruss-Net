import React from 'react';
import type { Card } from '@shared/models';
import { CardUI } from './CardUI';
import { cn } from '../utils/cn';
import { Hand, Zap } from 'lucide-react';

interface PlayerHandProps {
  hand: readonly Card[];
  selectedCards: readonly Card[];
  onCardClick: (card: Card) => void;
  isMyTurn: boolean;
  isDrawingState: boolean;
  onLeave: () => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  hand,
  selectedCards,
  onCardClick,
  isMyTurn,
  isDrawingState,
  onLeave
}) => {
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-in-out px-2 pt-4",
        "pb-[calc(var(--safe-bottom)+var(--ios-extra-bottom)+0.5rem)]",
        isMyTurn ? "translate-y-0" : "translate-y-[calc(100%-2.5rem)] opacity-60 hover:translate-y-0 hover:opacity-100"
      )}
    >
      {/* GLOW BACKGROUND EFFECT */}
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950/95 to-transparent pointer-events-none" />

      {/* EXIT BUTTON */}
      <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-50 pointer-events-auto">
        <button 
          onClick={onLeave}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-90"
          title="Salir de la sala"
        >
          <Zap size={18} className="rotate-180 md:w-6 md:h-6" />
        </button>
      </div>

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
        <div 
          className="flex justify-center items-end transition-all duration-500 px-2 sm:px-4 pb-2 gap-2 sm:gap-4 md:gap-6"
        >
          {hand.map((card, index) => {
            const isSelected = selectedCards.some(c => c.id === card.id);
            return (
              <div 
                key={card.id} 
                className={cn(
                  "relative transition-all duration-300 ease-out will-change-transform transform-gpu",
                  // Dynamic Z-Index: selected cards always on top, others follow index
                  isSelected ? "z-50 -translate-y-4 md:-translate-y-8 scale-105 md:scale-110" : "z-[index] hover:z-40 hover:-translate-y-2 hover:scale-[1.02]",
                  // Fan effect: keep it subtle
                  index === 0 && hand.length > 1 && "-rotate-[2deg] sm:-rotate-2 lg:rotate-0 origin-bottom-right",
                  index === hand.length - 1 && hand.length > 1 && "rotate-[2deg] sm:rotate-2 lg:rotate-0 origin-bottom-left"
                )}
                style={{ zIndex: isSelected ? 50 : 10 + index }}
              >
                <CardUI 
                  card={card} 
                  selected={isSelected}
                  onClick={() => onCardClick(card)}
                  className="shadow-[0_15px_45px_rgba(0,0,0,0.6)]"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
