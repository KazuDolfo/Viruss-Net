import React, { useEffect, useMemo } from 'react';
import { SocialEvent, REACTIONS } from '@shared/reactions';
import { useGameStore } from '../store/gameStore';

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
        
        return (
          <div 
            key={event.timestamp}
            className="absolute left-1/2 -translate-x-1/2 animate-social-burst flex flex-col items-center w-full"
          >
            {/* EMOJI */}
            {event.reactionId && (
              <div className="text-6xl md:text-8xl drop-shadow-2xl mb-2">
                {reaction?.value || "❓"}
              </div>
            )}

            {/* TEXT */}
            {event.text && (
              <div className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm md:text-xl shadow-2xl relative border-2 border-slate-200 text-center whitespace-nowrap">
                {event.text}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-slate-200" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
