import React from 'react';
import { Zap } from 'lucide-react';
import { cn } from '../utils/cn';

interface GameHeaderProps {
  isMyTurn: boolean;
  isDrawingState: boolean;
  currentPlayerName: string;
  onLeave: () => void;
  isConnected?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  onLeave,
  isConnected = true
}) => {
  return (
    <>
      <div className="fixed top-[calc(var(--safe-top)+0.75rem)] left-4 z-[60] pointer-events-auto">
        <button 
          onClick={onLeave}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/10 backdrop-blur-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl active:scale-90 group"
          title="Salir de la sala"
        >
          <Zap size={18} className="rotate-180 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="fixed top-[calc(var(--safe-top)+0.75rem)] right-4 z-[60] pointer-events-auto">
        <div className={cn(
          "px-2 py-1 md:px-3 md:py-1.5 rounded-full backdrop-blur-xl border flex items-center gap-2 shadow-xl",
          isConnected ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className={cn(
            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"
          )} />
          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/50">
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </>
  );
};
