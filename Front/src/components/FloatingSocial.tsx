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
    <div className="absolute -top-20 md:-top-32 inset-x-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-visible">
      {playerEvents.map((event: SocialEvent) => {
        const reaction = (REACTIONS || []).find(r => r.id === event.reactionId);
        
        return (
          <div 
            key={event.timestamp}
            className="absolute left-1/2 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-8 duration-500 flex flex-col items-center w-full"
          >
            {/* EMOJI BURST */}
            {reaction && (
              <div className="text-6xl md:text-8xl animate-bounce-social drop-shadow-2xl">
                {reaction.value}
              </div>
            )}

            {/* TEXT BUBBLE */}
            {event.text && (
              <div className="bg-white text-slate-900 px-5 py-3 rounded-2xl font-black text-xs md:text-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative animate-in slide-in-from-bottom-2 duration-300 max-w-[80%] text-center border-4 border-slate-900/10">
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
