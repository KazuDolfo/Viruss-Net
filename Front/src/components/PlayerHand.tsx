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
      "fixed bottom-0 left-0 right-0 z-40 transition-all duration-700 ease-out p-4 pb-8",
      isMyTurn ? "translate-y-0" : "translate-y-[80%] opacity-40 hover:translate-y-0 hover:opacity-100"
    )}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-end mb-4 px-4">
          <div className="flex flex-col bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Recursos</span>
             <span className="text-sm font-black text-white italic">TU MANO ({hand.length}/3)</span>
          </div>
          {isMyTurn && isDrawingState && (
            <div className="bg-yellow-500 text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg animate-bounce flex items-center gap-2 border-2 border-black/10">
               <Hand size={16} className="animate-pulse" /> ROBA PARA TERMINAR
            </div>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth snap-x">
          {hand.map((card) => (
            <div key={card.id} className="snap-center shrink-0 w-[120px] md:w-[140px]">
              <CardUI 
                card={card} 
                selected={selectedCards.some(c => c.id === card.id)}
                onClick={() => onCardClick(card)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
