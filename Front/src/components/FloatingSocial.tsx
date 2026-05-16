import React, { useEffect, useMemo } from 'react';
import { SocialEvent, REACTIONS } from '@shared/index';
import { useGameStore } from '../store/gameStore';

interface FloatingSocialProps {
  playerId: string;
}

export const FloatingSocial: React.FC<FloatingSocialProps> = ({ playerId }) => {
  const events = useGameStore(state => state.activeSocialEvents);
  const playerEvents = useMemo(() => events.filter(e => e.playerId === playerId), [events, playerId]);
  const removeEvent = useGameStore(state => state.removeSocialEvent);

  useEffect(() => {
    playerEvents.forEach((event: SocialEvent) => {
      const timer = setTimeout(() => {
        removeEvent(event.timestamp);
      }, 4000); // 4 seconds life
      return () => clearTimeout(timer);
    });
  }, [playerEvents, removeEvent]);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-visible">
      {playerEvents.map((event: SocialEvent) => {
        const reaction = (REACTIONS || []).find(r => r.id === event.reactionId);
        
        return (
          <div 
            key={event.timestamp}
            className="absolute animate-in fade-in zoom-in duration-500 flex flex-col items-center"
          >
            {/* EMOJI BURST */}
            {reaction && (
              <div className="text-5xl md:text-7xl animate-bounce-social mb-2 drop-shadow-2xl">
                {reaction.value}
              </div>
            )}

            {/* TEXT BUBBLE */}
            {event.text && (
              <div className="bg-white text-slate-900 px-4 py-2 rounded-2xl font-black text-xs md:text-sm shadow-2xl relative animate-in slide-in-from-bottom-2 duration-300">
                {event.text}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
