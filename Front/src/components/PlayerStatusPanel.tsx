import React from 'react';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';
import { Heart, Shield, Skull, CheckCircle2 } from 'lucide-react';

export const PlayerStatusPanel: React.FC = () => {
  const gameState = useGameStore(state => state.gameState);
  const myPlayerId = useGameStore(state => state.playerId);

  if (!gameState) return null;

  const scrollToPlayer = (playerId: string) => {
    const element = document.getElementById(`player-board-${playerId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  };

  return (
    <div className="fixed top-[calc(var(--safe-top)+4.5rem)] md:top-[calc(var(--safe-top)+6.5rem)] left-0 right-0 z-30 px-3 md:hidden">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {gameState.players.map((player) => {
          const isMe = player.id === myPlayerId;
          const isCurrentTurn = gameState.players[gameState.currentPlayerIndex].id === player.id;
          const healthyOrgans = player.body.filter(o => o.medicines.length === 0 && o.viruses.length === 0).length;
          const totalOrgans = player.body.length;

          return (
            <button
              key={player.id}
              onClick={() => scrollToPlayer(player.id)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all shrink-0 shadow-lg backdrop-blur-md",
                isCurrentTurn 
                  ? "bg-yellow-500/20 border-yellow-500 shadow-yellow-500/10" 
                  : "bg-slate-900/80 border-white/10"
              )}
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-tight truncate max-w-[60px]",
                    isCurrentTurn ? "text-yellow-400" : "text-white/70"
                  )}>
                    {isMe ? "TÚ" : player.name}
                  </span>
                  {isCurrentTurn && <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse" />}
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
