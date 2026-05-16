import React from 'react';
import { Layers, Zap } from 'lucide-react';
import { cn } from '../utils/cn';

interface GameHeaderProps {
  isMyTurn: boolean;
  isDrawingState: boolean;
  currentPlayerName: string;
  deckCount: number;
  onDrawCard: () => void;
  onLeave: () => void;
  isConnected?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  isMyTurn,
  isDrawingState,
  currentPlayerName,
  deckCount,
  onDrawCard,
  onLeave,
  isConnected = true
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-3 md:p-6 pt-[calc(var(--safe-top,0px)+0.75rem)] md:pt-8 bg-slate-900/90 backdrop-blur-xl border-b border-white/5 shadow-2xl pointer-events-auto transition-all">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button 
          onClick={onLeave}
          className="p-2 md:p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shrink-0 group shadow-lg"
          title="Salir de la sala"
        >
          <Zap size={18} className="rotate-180 md:w-5 md:h-5" />
        </button>

        <div className="relative group min-w-0">
           <div className={cn(
             "w-2 h-2 md:w-3 md:h-3 rounded-full absolute -top-0.5 -left-0.5 md:-top-1 md:-left-1 z-10",
             isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
           )} />
          <div className={cn(
            "px-3 py-1.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl border-[1.5px] md:border-2 transition-all shadow-lg min-w-0",
            isMyTurn ? "bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/10" : "bg-slate-800/50 border-white/5 opacity-80"
          )}>
            <span className="text-[7px] md:text-[10px] block font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-yellow-500 leading-none mb-0.5 md:mb-1 truncate">
              {isMyTurn ? (isDrawingState ? "ROBO" : "TU TURNO") : "ESPERA"}
            </span>
            <span className={cn(
              "text-sm md:text-2xl font-black uppercase italic tracking-tighter block truncate leading-tight",
              isMyTurn ? "text-white" : "text-slate-400"
            )}>
              {currentPlayerName}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        {/* Deck area removed to save space */}
      </div>
    </header>
  );
};
