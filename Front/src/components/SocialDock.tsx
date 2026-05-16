import React, { useState } from 'react';
import { Smile, Send } from 'lucide-react';
import { REACTIONS } from '@shared/index';
import { cn } from '../utils/cn';

interface SocialDockProps {
  onSendReaction: (id: string) => void;
  onSendMessage: (text: string) => void;
}

export const SocialDock: React.FC<SocialDockProps> = ({ onSendReaction, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [showChat, setShowChat] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text.trim());
      setText('');
      setShowChat(false);
    }
  };

  return (
    <div className="fixed bottom-[var(--hand-height,140px)] right-4 z-50 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Reaction Panel */}
      {isOpen && (
        <div className="bg-slate-900/90 backdrop-blur-2xl p-2 rounded-2xl border border-white/10 shadow-2xl flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {(REACTIONS || []).map((r) => (
            <button
              key={r.id}
              onClick={() => { onSendReaction(r.id); setIsOpen(false); }}
              className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-2xl md:text-3xl hover:scale-125 transition-transform"
            >
              {r.value}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      {showChat && (
        <form 
          onSubmit={handleSubmit}
          className="bg-slate-900/95 backdrop-blur-2xl p-2 rounded-2xl border-2 border-blue-500/50 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-right-4"
        >
          <input 
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe algo..."
            className="bg-transparent text-white px-3 py-1 outline-none text-sm md:text-base w-32 md:w-48 font-medium"
          />
          <button type="submit" className="p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-colors">
            <Send size={16} />
          </button>
        </form>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => { setIsOpen(!isOpen); setShowChat(false); }}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border-2",
            isOpen ? "bg-yellow-500 border-white text-black" : "bg-slate-800/80 border-white/10 text-white/60 hover:bg-slate-700"
          )}
        >
          <Smile size={24} />
        </button>
        
        <button 
          onClick={() => { setShowChat(!showChat); setIsOpen(false); }}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border-2",
            showChat ? "bg-blue-600 border-white text-white" : "bg-slate-800/80 border-white/10 text-white/60 hover:bg-slate-700"
          )}
        >
          <span className="text-xl md:text-2xl">⚡</span>
        </button>
      </div>
    </div>
  );
};
