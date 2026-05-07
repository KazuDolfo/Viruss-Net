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
      "fixed inset-x-0 bottom-[var(--hand-height,180px)] z-50 p-4 pb-4 transition-transform duration-500 ease-out pointer-events-none",
      isVisible ? "translate-y-0" : "translate-y-[200%]"
    )}>
      <div className="max-w-4xl mx-auto pointer-events-auto">
        {selectedCards.length === 1 && (
          <div className="bg-slate-900/80 backdrop-blur-2xl p-6 rounded-[2.5rem] border-[3px] border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10">
            <div className="flex gap-6 items-center">
              <div className="shrink-0 w-24 md:w-32">
                <CardUI card={selectedCards[0]} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn("w-2.5 h-2.5 rounded-full", colorMap[selectedCards[0].color])} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedCards[0].type}</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black uppercase italic text-yellow-400 tracking-tighter mb-1 truncate leading-none">
                  {selectedCards[0].name}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 font-medium italic mb-4 max-w-xl line-clamp-2">
                  {getCardHint(selectedCards[0])}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {selectedCards[0].type === 'organ' && (
                    <button 
                      onClick={onPlayOrgan} 
                      className="bg-green-600 hover:bg-green-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-4 border-green-800"
                    >
                      📥 BAJAR ÓRGANO
                    </button>
                  )}
                  {(selectedCards[0].name === 'Guante de látex' || selectedCards[0].name === 'Contagio') && (
                    <button 
                      onClick={onPlaySpecial} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-4 border-blue-800"
                    >
                      🚀 USAR PODER
                    </button>
                  )}
                  <button 
                    onClick={onDiscard} 
                    className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg border-b-4 border-red-800"
                  >
                    <Trash2 size={14} className="inline mr-1" /> DESCARTAR
                  </button>
                </div>
              </div>
              <button 
                onClick={onClear} 
                className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-all self-start"
              >
                <CheckCircle2 size={24} />
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
