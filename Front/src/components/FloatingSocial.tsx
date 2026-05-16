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
    <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-visible">
      {playerEvents.map((event: SocialEvent) => {
        const reaction = (REACTIONS || []).find(r => r.id === event.reactionId);
        
        const animClass = reaction?.animation === 'spin' ? 'animate-social-spin' :
                         reaction?.animation === 'shake' ? 'animate-social-shake' :
                         reaction?.animation === 'slide' ? 'animate-social-slide' :
                         'animate-social-burst';
        
        return (
          <div 
            key={event.timestamp}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center min-w-max"
          >
            <div className={cn("flex flex-col items-center justify-center", animClass)}>
              {/* EMOJI */}
              {event.reactionId && (
                <div className="text-[clamp(3rem,10vw,8rem)] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] mb-2 leading-none">
                  {reaction?.value || "❓"}
                </div>
              )}

              {/* TEXT */}
              {event.text && (
                <div className="bg-white text-slate-900 px-4 py-2 md:px-6 md:py-3 rounded-2xl font-black text-[clamp(0.75rem,2vw,1.25rem)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative border-4 border-slate-900/10 text-center max-w-[min(80vw,300px)] break-words scale-110">
                  {event.text}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-4 border-b-4 border-slate-900/10" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
