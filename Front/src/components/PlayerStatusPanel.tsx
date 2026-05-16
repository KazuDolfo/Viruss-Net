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
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pointer-events-auto max-w-[75vw]">
        {rivals.map((player) => {
          const isFocused = focusedPlayerId === player.id;
          const isCurrentTurn = gameState.players[gameState.currentPlayerIndex].id === player.id;
          const healthyOrgans = player.body.filter(o => o.medicines.length === 0 && o.viruses.length === 0).length;
          
          return (
            <button
              key={player.id}
              onClick={() => setFocusedPlayerId(player.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0 shadow-lg backdrop-blur-md active:scale-95",
                isFocused 
                  ? "bg-blue-600/40 border-blue-400 ring-2 ring-blue-400/50" 
                  : isCurrentTurn 
                    ? "bg-yellow-500/20 border-yellow-500/50" 
                    : "bg-slate-900/90 border-white/10"
              )}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]",
                    isFocused ? "text-white" : isCurrentTurn ? "text-yellow-400" : "text-white/60"
                  )}>
                    {player.name}
                  </span>
                  {isCurrentTurn && <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_5px_rgba(234,179,8,1)]" />}
                </div>
                
                <div className="flex gap-0.5 mt-0.5">
                  {player.body.map((organ, idx) => {
                    const status = organ.isImmune ? 'immune' : 
                                  organ.viruses.length > 0 ? 'virus' : 
                                  organ.medicines.length > 0 ? 'protected' : 'healthy';
                    
                    return (
                      <div 
                        key={idx}
                        className={cn(
                          "w-2 h-2 rounded-full",
                          status === 'immune' ? "bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]" :
                          status === 'virus' ? "bg-red-500" :
                          status === 'protected' ? "bg-blue-500" :
                          "bg-green-500"
                        )}
                      />
                    );
                  })}
                  {/* Empty slots placeholders */}
                  {Array.from({ length: 4 - player.body.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-2 h-2 rounded-full border border-white/20 bg-transparent" />
                  ))}
                </div>
              </div>

              {healthyOrgans >= 4 && (
                <CheckCircle2 size={14} className="text-yellow-500 animate-bounce" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
