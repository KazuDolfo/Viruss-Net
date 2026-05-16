import React, { useState } from 'react';
import { Smile, Send, Zap } from 'lucide-react';
import { REACTIONS } from '@shared/reactions';
import { cn } from '../utils/cn';

interface SocialDockProps {
  onSendReaction: (id: string) => void;
  onSendMessage: (text: string) => void;
}

export const SocialDock: React.FC<SocialDockProps> = ({ onSendReaction, onSendMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const startCooldown = () => {
    setCooldown(true);
    setTimeout(() => setCooldown(false), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !cooldown) {
      onSendMessage(text.trim());
      setText('');
      setShowChat(false);
      startCooldown();
    }
  };

  const handleReaction = (id: string) => {
    if (!cooldown) {
      onSendReaction(id);
      setIsOpen(false);
      startCooldown();
    }
  };

  const reactionList = REACTIONS || [];

  return (
    <div className="fixed bottom-[var(--hand-height,140px)] right-4 z-[60] flex flex-col items-end gap-3 pointer-events-auto">
      {/* Reaction Panel */}
      {isOpen && (
        <div className="bg-slate-900/95 backdrop-blur-2xl p-4 rounded-[2rem] border-2 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[60vh] overflow-y-auto no-scrollbar">
          {reactionList.map((r) => (
            <button
              key={r.id}
              disabled={cooldown}
              onClick={() => handleReaction(r.id)}
              className={cn(
                "w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-3xl md:text-4xl transition-all bg-white/5 rounded-2xl border border-white/5",
                cooldown ? "opacity-20 grayscale cursor-not-allowed" : "hover:scale-110 hover:bg-white/10 hover:border-white/20 active:scale-95"
              )}
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
          className="bg-slate-900/95 backdrop-blur-2xl p-2 rounded-2xl border-2 border-blue-500/50 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-right-4 w-64 md:w-80"
        >
          <input 
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={cooldown}
            placeholder={cooldown ? "Espera..." : "Escribe algo..."}
            className="bg-white/5 text-white px-4 py-2 rounded-xl outline-none text-sm md:text-base flex-1 font-medium border border-white/5 focus:border-blue-400/50 transition-colors"
          />
          <button 
            type="submit" 
            disabled={cooldown || !text.trim()}
            className={cn(
              "p-2.5 rounded-xl text-white transition-all active:scale-90",
              cooldown ? "bg-slate-700 opacity-50 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
            )}
          >
            <Send size={18} />
          </button>
        </form>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => { setIsOpen(!isOpen); setShowChat(false); }}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border-2",
            isOpen ? "bg-yellow-500 border-white text-black" : "bg-slate-800/80 border-white/10 text-white/60 hover:bg-slate-700",
            cooldown && !isOpen && "opacity-50"
          )}
          title="Reacciones"
        >
          <Smile size={24} />
        </button>
        
        <button 
          onClick={() => { setShowChat(!showChat); setIsOpen(false); }}
          className={cn(
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all shadow-xl border-2",
            showChat ? "bg-blue-600 border-white text-white" : "bg-slate-800/80 border-white/10 text-white/60 hover:bg-slate-700",
            cooldown && !showChat && "opacity-50"
          )}
          title="Chat"
        >
          <Zap size={24} />
        </button>
      </div>
    </div>
  );
};
