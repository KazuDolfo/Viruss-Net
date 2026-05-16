import React from 'react';
import type { Card } from '@shared/models';
import { CardUI, colorMap } from './CardUI';
import { Trash2, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface ActionOverlayProps {
  selectedCards: Card[];
  isMyTurn: boolean;
  isDrawingState: boolean;
  onPlayOrgan: () => void;
  onPlaySpecial: () => void;
  onDiscard: () => void;
  onClear: () => void;
  getCardHint: (card: Card) => string;
}

export const ActionOverlay: React.FC<ActionOverlayProps> = ({
  selectedCards,
  isMyTurn,
  isDrawingState,
  onPlayOrgan,
  onPlaySpecial,
  onDiscard,
  onClear,
  getCardHint
}) => {
  const isVisible = selectedCards.length > 0 && isMyTurn && !isDrawingState;

  return (
    <div className={cn(
      "fixed inset-x-0 bottom-[calc(var(--hand-height,140px)+0.25rem)] md:bottom-[calc(var(--hand-height,180px)+1rem)] z-50 p-2 md:p-4 pb-4 transition-transform duration-500 ease-out pointer-events-none",
      isVisible ? "translate-y-0" : "translate-y-[250%]"
    )}>
      <div className="max-w-xl md:max-w-4xl mx-auto pointer-events-auto">
        {selectedCards.length === 1 && (
          <div className="bg-slate-900/95 backdrop-blur-2xl p-3 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border-[2px] md:border-[3px] border-white/10 shadow-[0_-20px_60px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-10">
            <div className="flex flex-row md:flex-row gap-3 md:gap-6 items-center">
              <div className="shrink-0 w-16 xs:w-20 md:w-32">
                <CardUI card={selectedCards[0]} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={cn("w-2 h-2 md:w-2.5 md:h-2.5 rounded-full", colorMap[selectedCards[0].color])} />
                  <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">{selectedCards[0].type}</span>
                </div>
                <h3 className="text-lg xs:text-xl md:text-4xl font-black uppercase italic text-yellow-400 tracking-tighter mb-0.5 md:mb-1 truncate leading-none">
                  {selectedCards[0].name}
                </h3>
                <p className="text-[9px] md:text-sm text-slate-300 font-medium italic mb-3 md:mb-4 max-w-xl line-clamp-2 leading-tight">
                  {getCardHint(selectedCards[0])}
                </p>
                
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {selectedCards[0].type === 'organ' && (
                    <button 
                      onClick={onPlayOrgan} 
                      className="bg-green-600 hover:bg-green-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-[3px] md:border-b-4 border-green-800"
                    >
                      📥 BAJAR
                    </button>
                  )}
                  {(selectedCards[0].name === 'Guante de látex' || selectedCards[0].name === 'Contagio') && (
                    <button 
                      onClick={onPlaySpecial} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-[3px] md:border-b-4 border-blue-800"
                    >
                      🚀 USAR
                    </button>
                  )}
                  <button 
                    onClick={onDiscard} 
                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 md:px-5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-[3px] md:border-b-4 border-red-800"
                  >
                    <Trash2 size={12} className="inline mr-1" /> DESCARTAR
                  </button>
                </div>
              </div>
              <button 
                onClick={onClear} 
                className="p-2 md:p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-all self-start shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </div>
        )}

        {selectedCards.length > 1 && (
          <div className="flex justify-center">
            <div className="bg-slate-900/90 backdrop-blur-3xl p-4 rounded-[2rem] border-[3px] border-white/10 shadow-2xl flex items-center gap-4">
               <button 
                  onClick={onDiscard} 
                  className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl border-b-4 border-red-800"
                >
                  <Trash2 size={20} className="inline mr-2" /> DESCARTAR {selectedCards.length} CARTAS
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
