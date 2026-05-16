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
          <div className="bg-slate-900/95 backdrop-blur-2xl p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] border-[2px] md:border-[4px] border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-10">
            <div className="flex flex-col md:flex-row gap-4 md:gap-12 items-center text-center md:text-left">
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <div className={cn("w-3 h-3 md:w-4 md:h-4 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]", colorMap[selectedCards[0].color])} />
                  <span className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.3em] leading-none">{selectedCards[0].type}</span>
                </div>
                <h3 className="text-2xl xs:text-3xl md:text-6xl font-black uppercase italic text-yellow-400 tracking-tighter mb-2 truncate leading-none">
                  {selectedCards[0].name}
                </h3>
                <p className="text-xs md:text-xl text-slate-200 font-medium italic mb-6 md:mb-8 max-w-2xl line-clamp-2 leading-tight">
                  {getCardHint(selectedCards[0])}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-4">
                  {selectedCards[0].type === 'organ' && (
                    <button 
                      onClick={onPlayOrgan} 
                      className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-xl uppercase tracking-widest transition-all active:scale-95 shadow-xl border-b-[4px] md:border-b-8 border-green-800"
                    >
                      📥 BAJAR ÓRGANO
                    </button>
                  )}
                  {(selectedCards[0].name === 'Guante de látex' || selectedCards[0].name === 'Contagio') && (
                    <button 
                      onClick={onPlaySpecial} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-xl uppercase tracking-widest transition-all active:scale-95 shadow-xl border-b-[4px] md:border-b-8 border-blue-800"
                    >
                      🚀 USAR ACCIÓN
                    </button>
                  )}
                  <button 
                    onClick={onDiscard} 
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 md:px-10 md:py-5 rounded-xl md:rounded-2xl font-black text-xs md:text-xl uppercase tracking-widest transition-all active:scale-95 shadow-xl border-b-[4px] md:border-b-8 border-red-800"
                  >
                    <Trash2 size={20} className="inline mr-2" /> DESCARTAR
                  </button>
                </div>
              </div>
              <button 
                onClick={onClear} 
                className="hidden md:flex p-4 bg-white/5 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-all shrink-0"
              >
                <CheckCircle2 className="w-10 h-10" />
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
