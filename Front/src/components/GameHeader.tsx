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
    <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 pt-[calc(var(--safe-top,0px)+0.75rem)] pointer-events-none transition-all">
      <div className="flex items-center gap-4 pointer-events-auto">
        <button 
          onClick={onLeave}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-xl group"
          title="Salir de la sala"
        >
          <Zap size={20} className="rotate-180 md:w-6 md:h-6" />
        </button>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <div className={cn(
          "px-3 py-1 rounded-full backdrop-blur-xl border flex items-center gap-2 shadow-xl",
          isConnected ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"
        )}>
          <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
          )} />
          <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
            {isConnected ? "ONLINE" : "OFFLINE"}
          </span>
        </div>
      </div>
    </header>
  );
};
