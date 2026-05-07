import React from 'react';
import { LogIn, Play, Copy, CheckCircle2, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  localRoomId: string;
  setLocalRoomId: (id: string) => void;
  onJoinRoom: () => void;
  roomPlayers: { id: string, name: string }[];
  playerId: string | null;
  roomCode: string | null;
  copyRoomId: () => void;
  copied: boolean;
  onStartGame: () => void;
  setIsCollectionOpen: (open: boolean) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  playerName,
  setPlayerName,
  localRoomId,
  setLocalRoomId,
  onJoinRoom,
  roomPlayers,
  playerId,
  roomCode,
  copyRoomId,
  copied,
  onStartGame,
}) => {
  return (
    <div className="bg-slate-800 p-6 xs:p-10 rounded-[2rem] xs:rounded-[3rem] shadow-2xl w-full max-w-xl border-4 xs:border-8 border-slate-700">
      {!roomPlayers.length ? (
        <>
          <h2 className="text-2xl xs:text-3xl font-bold mb-6 xs:mb-8 text-center text-slate-300 uppercase tracking-tighter">Entrar al Hospital</h2>
          <div className="space-y-4 xs:space-y-6 mb-8 xs:mb-10">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Tu Nombre de Médico</label>
              <input 
                type="text" 
                placeholder="Dr. House..." 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)} 
                className="w-full bg-slate-700 border-2 xs:border-4 border-slate-600 rounded-2xl px-6 py-3 xs:py-4 text-lg xs:text-xl focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Código de la Sala</label>
              <input 
                type="text" 
                placeholder="HOSPITAL-123" 
                value={localRoomId} 
                onChange={(e) => setLocalRoomId(e.target.value.toUpperCase())} 
                className="w-full bg-slate-700 border-2 xs:border-4 border-slate-600 rounded-2xl px-6 py-3 xs:py-4 text-lg xs:text-xl focus:border-blue-500 outline-none transition-colors" 
              />
            </div>
          </div>
          <button 
            onClick={onJoinRoom} 
            disabled={!localRoomId || !playerName} 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xl xs:text-2xl py-4 xs:py-6 rounded-2xl xs:rounded-3xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-4"
          >
            <LogIn size={24} /> CONECTARSE
          </button>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 xs:mb-8">
            <h2 className="text-xl xs:text-3xl font-bold text-slate-300 flex items-center gap-2 xs:gap-3 uppercase tracking-tighter">
              <Users className="text-blue-500" /> Sala de Espera
            </h2>
            <button 
              onClick={copyRoomId} 
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 xs:px-4 py-1.5 xs:py-2 rounded-xl text-[10px] xs:text-xs font-bold transition-all border border-white/5"
            >
              {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />} {roomCode}
            </button>
          </div>
          
          <div className="space-y-2 xs:space-y-3 mb-8 xs:mb-10 max-h-48 xs:max-h-64 overflow-y-auto pr-2">
            {roomPlayers.map((p) => (
              <div key={p.id} className={cn(
                "flex items-center justify-between p-3 xs:p-4 rounded-xl xs:rounded-2xl border-2 xs:border-4",
                p.id === playerId ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-700 border-slate-600'
              )}>
                <span className="font-bold text-base xs:text-lg uppercase tracking-tight">
                  {p.name} {p.id === playerId && '(Tú)'}
                </span>
                {p.id === playerId && (
                  <div className="w-2 xs:w-3 h-2 xs:h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                )}
              </div>
            ))}
          </div>

          {roomPlayers[0]?.id === playerId ? (
            <button 
              onClick={onStartGame} 
              disabled={roomPlayers.length < 2} 
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 disabled:opacity-50 text-white font-black text-xl xs:text-2xl py-4 xs:py-6 rounded-2xl xs:rounded-3xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-4"
            >
              <Play size={24} /> EMPEZAR PARTIDA
            </button>
          ) : (
            <div className="text-center p-4 xs:p-6 bg-slate-900/50 rounded-2xl xs:rounded-3xl border-2 xs:border-4 border-dashed border-slate-700 text-slate-500 font-bold italic text-sm">
              Esperando a que el jefe de sala inicie...
            </div>
          )}
        </>
      )}
    </div>
  );
};
