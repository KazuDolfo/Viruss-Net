import React from 'react';
import { ScrollText, Layers } from 'lucide-react';
import { cn } from '../utils/cn'; // Assuming we create a small utility for this

interface GameHeaderProps {
  isMyTurn: boolean;
  isDrawingState: boolean;
  currentPlayerName: string;
  deckCount: number;
  onShowLogs: () => void;
  onDrawCard: () => void;
  showLogsActive: boolean;
  isConnected?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  isMyTurn,
  isDrawingState,
  currentPlayerName,
  deckCount,
  onShowLogs,
  onDrawCard,
  showLogsActive,
  isConnected = true
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl pointer-events-auto">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative group">
           <div className={cn(
             "w-3 h-3 rounded-full absolute -top-1 -left-1 z-10",
             isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
           )} />
          <div className={cn(
            "px-4 md:px-6 py-2 md:py-3 rounded-2xl border-2 transition-all shadow-lg min-w-0",
            isMyTurn ? "bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/10" : "bg-slate-800/50 border-white/5 opacity-80"
          )}>
            <span className="text-[9px] md:text-[10px] block font-black uppercase tracking-[0.3em] text-yellow-500 leading-none mb-1 truncate">
              {isMyTurn ? (isDrawingState ? "FASE DE ROBO" : "TU TURNO") : "ESPERANDO JUGADA"}
            </span>
            <span className={cn(
              "text-lg md:text-2xl font-black uppercase italic tracking-tighter block truncate",
              isMyTurn ? "text-white" : "text-slate-400"
            )}>
              {currentPlayerName} {isMyTurn && "(TÚ)"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button 
          onClick={onShowLogs} 
          className="p-3 rounded-2xl bg-slate-800/50 border border-white/10 hover:bg-slate-700 active:scale-90 transition-all shadow-lg"
        >
          <ScrollText size={20} className={showLogsActive ? "text-blue-400" : "text-white/60"} />
        </button>
        
        <div 
          onClick={onDrawCard} 
          className={cn(
            "relative group flex items-center gap-3 px-5 py-2 md:py-3 rounded-2xl border-2 transition-all cursor-pointer shadow-lg",
            isMyTurn && isDrawingState ? "bg-yellow-500 border-black text-black scale-105" : "bg-slate-800/50 border-white/10 text-white/40"
          )}
        >
           <Layers size={20} className={isMyTurn && isDrawingState ? "animate-bounce" : ""} />
           <span className="text-xl md:text-2xl font-black tracking-tighter">{deckCount}</span>
           {isMyTurn && isDrawingState && (
             <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap shadow-2xl border-2 border-black/10 animate-pulse">
               ¡ROBA AQUÍ!
             </div>
           )}
        </div>
      </div>
    </header>
  );
};
