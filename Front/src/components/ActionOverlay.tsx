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
      "fixed inset-x-0 bottom-[calc(var(--hand-height,110px)+0.5rem)] z-50 p-2 md:p-4 transition-all duration-500 ease-out pointer-events-none flex justify-center",
      isVisible ? "translate-y-0 opacity-100 scale-100" : "translate-y-20 opacity-0 scale-90"
    )}>
      <div className="w-full max-w-[320px] md:max-w-md pointer-events-auto">
        {selectedCards.length === 1 && (
          <div className="bg-slate-900/90 backdrop-blur-3xl p-3 md:p-4 rounded-[1.5rem] md:rounded-[2rem] border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
            <div className="flex flex-col gap-2 items-center text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full shadow-sm", colorMap[selectedCards[0].color])} />
                  <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{selectedCards[0].type}</span>
                </div>
                <h3 className="text-sm md:text-xl font-black uppercase italic text-yellow-400 tracking-tighter leading-none mb-0.5">
                  {selectedCards[0].name}
                </h3>
                <p className="text-[9px] md:text-xs text-slate-300 font-medium italic line-clamp-1 md:line-clamp-2 max-w-[240px] md:max-w-sm">
                  {getCardHint(selectedCards[0])}
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-1.5 w-full pt-0.5">
                {selectedCards[0].type === 'organ' && (
                  <button 
                    onClick={onPlayOrgan} 
                    className="flex-1 min-w-[70px] md:min-w-[100px] bg-green-600 hover:bg-green-500 text-white px-2 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-2 md:border-b-4 border-green-800"
                  >
                    📥 BAJAR
                  </button>
                )}
                {(selectedCards[0].name === 'Guante de látex' || selectedCards[0].name === 'Contagio') && (
                  <button 
                    onClick={onPlaySpecial} 
                    className="flex-1 min-w-[70px] md:min-w-[100px] bg-blue-600 hover:bg-blue-500 text-white px-2 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-2 md:border-b-4 border-blue-800"
                  >
                    🚀 ACCIÓN
                  </button>
                )}
                <button 
                  onClick={onDiscard} 
                  className="flex-1 min-w-[70px] md:min-w-[100px] bg-red-600 hover:bg-red-500 text-white px-2 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[9px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-2 md:border-b-4 border-red-800"
                >
                  <Trash2 size={12} className="inline mr-1" /> DESCARTAR
                </button>
                <button 
                  onClick={onClear} 
                  className="p-1.5 md:p-2.5 bg-white/5 hover:bg-white/10 rounded-lg md:rounded-xl text-white/40 hover:text-white transition-all shadow-inner border border-white/5"
                >
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedCards.length > 1 && (
          <div className="flex justify-center animate-in zoom-in-95">
            <div className="bg-slate-900/90 backdrop-blur-3xl p-2 rounded-2xl border-2 border-white/10 shadow-2xl flex items-center gap-2">
               <button 
                  onClick={onDiscard} 
                  className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-black text-[9px] md:text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-2 md:border-b-4 border-red-800"
                >
                  <Trash2 size={12} className="inline mr-2" /> DESCARTAR {selectedCards.length}
               </button>
               <button 
                onClick={onClear} 
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 transition-all"
              >
                <CheckCircle2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
