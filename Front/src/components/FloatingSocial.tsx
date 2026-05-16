import React, { useEffect, useMemo } from 'react';
import { SocialEvent, REACTIONS } from '@shared/reactions';
import { useGameStore } from '../store/gameStore';
import { cn } from '../utils/cn';

interface FloatingSocialProps {
  playerId: string;
}

export const FloatingSocial: React.FC<FloatingSocialProps> = ({ playerId }) => {
  const events = useGameStore(state => state.activeSocialEvents);
  const playerEvents = useMemo(() => (events || []).filter(e => e.playerId === playerId), [events, playerId]);
  const removeEvent = useGameStore(state => state.removeSocialEvent);

  useEffect(() => {
    const timers = playerEvents.map((event: SocialEvent) => {
      return setTimeout(() => {
        removeEvent(event.timestamp);
      }, 4000);
    });
    
    return () => timers.forEach(clearTimeout);
  }, [playerEvents, removeEvent]);

  return (
    <div className="absolute -top-10 md:-top-20 inset-x-0 pointer-events-none z-[100] flex flex-col items-center justify-center overflow-visible">
      {playerEvents.map((event: SocialEvent) => {
        const reaction = (REACTIONS || []).find(r => r.id === event.reactionId);
        
        // Diagnostic Log
        if (event.reactionId) console.log(`[SOCIAL] Rendering reaction: ${event.reactionId}`, reaction);

        const animClass = reaction?.animation === 'spin' ? 'animate-social-spin' :
                         reaction?.animation === 'shake' ? 'animate-social-shake' :
                         reaction?.animation === 'slide' ? 'animate-social-slide' :
                         'animate-social-burst';
        
        return (
          <div 
            key={event.timestamp}
            className={cn(
              "absolute left-1/2 -translate-x-1/2 flex flex-col items-center w-full",
              animClass
            )}
          >
            {/* EMOJI */}
            {event.reactionId && (
              <div className="text-6xl md:text-9xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-2">
                {reaction?.value || "❓"}
              </div>
            )}

            {/* TEXT */}
            {event.text && (
              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm md:text-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative border-4 border-slate-900/10 text-center whitespace-nowrap scale-110">
                {event.text}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45 border-r-4 border-b-4 border-slate-900/10" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
