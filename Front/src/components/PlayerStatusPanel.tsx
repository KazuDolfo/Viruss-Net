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
    <div className="fixed top-[calc(var(--safe-top)+0.5rem)] left-0 right-0 z-30 px-3 flex justify-end md:hidden pointer-events-none">
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pointer-events-auto max-w-[85vw]">
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
                "flex flex-col items-center gap-1.5 px-4 py-2 rounded-2xl border transition-all shrink-0 shadow-xl backdrop-blur-xl active:scale-90",
                isFocused 
                  ? "bg-slate-800 border-blue-400 ring-2 ring-blue-400/30 scale-105" 
                  : isCurrentTurn 
                    ? "bg-yellow-500/10 border-yellow-500/40" 
                    : "bg-slate-900/80 border-white/5"
              )}
            >
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isFocused ? "text-blue-400" : isCurrentTurn ? "text-yellow-400" : "text-white/40"
              )}>
                {player.name}
              </span>
              
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((idx) => {
                  const organ = player.body[idx];
                  if (!organ) return <div key={idx} className="w-2.5 h-2.5 rounded-full bg-white/5 border border-white/10" />;
                  
                  const baseColor = organ.organCard.color;
                  const dotColor = colorClasses[baseColor] || 'bg-slate-500';
                  
                  return (
                    <div 
                      key={idx}
                      className={cn(
                        "w-2.5 h-2.5 rounded-full relative",
                        dotColor,
                        organ.isImmune && "ring-2 ring-white shadow-[0_0_8px_rgba(255,255,255,0.8)]",
                        organ.viruses.length > 0 && "animate-pulse"
                      )}
                    >
                      {organ.viruses.length > 0 && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-white/20" />
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
