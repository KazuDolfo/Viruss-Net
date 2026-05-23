import React from 'react';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';
import { CheckCircle2 } from 'lucide-react';

export const PlayerStatusPanel: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const myPlayerId = useGameStore(state => state.playerId);
  const focusedPlayerId = useGameStore(state => state.focusedPlayerId);
  const setFocusedPlayerId = useGameStore(state => state.setFocusedPlayerId);

  if (!gameState) return null;

  const rivals = React.useMemo(() => {
    return gameState.players.filter(p => p.id !== myPlayerId);
  }, [gameState.players, myPlayerId]);

  // Initialize focus to first rival if none is focused
  React.useEffect(() => {
    if (!focusedPlayerId && rivals.length > 0) {
      setFocusedPlayerId(rivals[0].id);
    }
  }, [focusedPlayerId, rivals, setFocusedPlayerId]);

  return (
    <div className="fixed top-[calc(var(--safe-top)+0.5rem)] left-0 right-0 z-50 px-16 flex justify-center">
      <div className="flex gap-1.5 md:gap-3 overflow-x-auto no-scrollbar pb-2 max-w-full">
        {rivals.map((player) => {
          const isFocused = focusedPlayerId === player.id;
          const isCurrentTurn = gameState.players[gameState.currentPlayerIndex].id === player.id;
          
          // Map of organ colors for the dots
          const colorClasses: Record<string, string> = {
            red: 'bg-red-500',
            blue: 'bg-blue-500',
            yellow: 'bg-yellow-400',
            green: 'bg-green-500', // for bone/default in this context
            wildcard: 'bg-purple-500'
          };

          return (
            <button
              key={player.id}
              onClick={() => setFocusedPlayerId(player.id)}
              className={cn(
                "flex flex-col items-center gap-1 px-2.5 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl border transition-all shrink-0 shadow-xl backdrop-blur-xl active:scale-95",
                isFocused 
                  ? "bg-slate-800 border-blue-400 ring-2 ring-blue-400/30 scale-105" 
                  : isCurrentTurn 
                    ? "bg-yellow-500/10 border-yellow-500/40" 
                    : "bg-slate-900/80 border-white/5 opacity-60 hover:opacity-100"
              )}
            >
              <span className={cn(
                "text-[7px] md:text-[9px] font-black uppercase tracking-tighter truncate max-w-[50px] md:max-w-none",
                isFocused ? "text-blue-400" : isCurrentTurn ? "text-yellow-400" : "text-white/60"
              )}>
                {player.name}
              </span>
              
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((idx) => {
                  const organ = player.body[idx];
                  if (!organ) return <div key={idx} className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white/5 border border-white/10" />;
                  
                  const baseColor = organ.organCard.color;
                  const dotColor = colorClasses[baseColor] || 'bg-slate-500';
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full relative",
                        dotColor,
                        organ.isImmune && "ring-1 ring-white shadow-[0_0_5px_rgba(255,255,255,0.8)]",
                        organ.viruses.length > 0 && "animate-pulse"
                      )}
                    >
                      {organ.viruses.length > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-1 h-1 md:w-1.5 md:h-1.5 bg-red-600 rounded-full border border-white/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
