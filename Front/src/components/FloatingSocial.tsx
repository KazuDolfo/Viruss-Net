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
    const timers = playerEvents.map(event => {
      return setTimeout(() => {
        removeEvent(event.timestamp);
      }, 4000);
    });
    
    return () => timers.forEach(clearTimeout);
  }, [playerEvents, removeEvent]);

  return (
    <div className="absolute -top-12 md:-top-20 inset-x-0 pointer-events-none z-50 flex flex-col items-center justify-center overflow-visible">
      {playerEvents.map((event: SocialEvent) => {
        const reaction = (REACTIONS || []).find(r => r.id === event.reactionId);
        
        return (
          <div 
            key={event.timestamp}
            className="absolute left-1/2 -translate-x-1/2 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 flex flex-col items-center w-full"
          >
            {/* EMOJI BURST */}
            {reaction && (
              <div className="text-5xl md:text-7xl animate-bounce-social drop-shadow-2xl mb-1">
                {reaction.value}
              </div>
            )}

            {/* TEXT BUBBLE */}
            {event.text && (
              <div className="bg-white text-slate-900 px-4 py-2 rounded-2xl font-black text-xs md:text-base shadow-[0_15px_40px_rgba(0,0,0,0.4)] relative animate-in slide-in-from-bottom-2 duration-300 max-w-[90%] text-center border-2 border-slate-900/5">
                {event.text}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-slate-900/5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
