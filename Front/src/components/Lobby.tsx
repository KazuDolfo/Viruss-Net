import React, { useState, useEffect } from 'react';
import { LogIn, Play, Copy, CheckCircle2, Users, Zap, PlusCircle, Search, ArrowLeft, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { socket } from '../core/socket';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LobbyProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  localRoomId: string;
  setLocalRoomId: (id: string) => void;
  onJoinRoom: (id?: string) => void;
  onCreateRoom: () => void;
  onCloseRoom: () => void;
  onLeave: () => void;
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
  onCreateRoom,
  onCloseRoom,
  onLeave,
  roomPlayers,
  playerId,
  roomCode,
  copyRoomId,
  copied,
  onStartGame,
}) => {
  const [menu, setMenu] = useState<'main' | 'join'>('main');
  const [publicRooms, setPublicRooms] = useState<{id: string, playerCount: number, host: string}[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleError = (msg: string) => setErrorMsg(msg);
    socket.on('error', handleError);
    return () => {
      socket.off('error', handleError);
    };
  }, []);

  const fetchRooms = () => {
    const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    fetch(`${API_BASE}/api/rooms`)
      .then(r => r.json())
      .then(data => setPublicRooms(data))
      .catch(() => {});
  };

  useEffect(() => {
    if (menu === 'join') {
      fetchRooms();
      const interval = setInterval(fetchRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [menu]);

  const handleJoinCode = () => {
    setErrorMsg('');
    if (localRoomId) onJoinRoom();
  };

  const handleCreate = () => {
    setErrorMsg('');
    onCreateRoom();
  };

  return (
    <div className="bg-slate-800 p-6 xs:p-10 rounded-[2rem] xs:rounded-[3rem] shadow-2xl w-full max-w-xl border-4 xs:border-8 border-slate-700">
      {!roomPlayers.length ? (
        <>
          <h2 className="text-2xl xs:text-3xl font-bold mb-4 text-center text-slate-300 uppercase tracking-tighter">
            {menu === 'main' ? 'Hospital Central' : 'Buscador de Salas'}
          </h2>
          
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-4 text-center font-bold text-sm">
              {errorMsg}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Tu Nombre de Médico</label>
            <input 
              type="text" 
              placeholder="Dr. House..." 
              value={playerName} 
              onChange={(e) => setPlayerName(e.target.value)} 
              className="w-full bg-slate-700 border-2 xs:border-4 border-slate-600 rounded-2xl px-6 py-3 xs:py-4 text-lg xs:text-xl focus:border-blue-500 outline-none transition-colors text-white" 
            />
          </div>

          {menu === 'main' ? (
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => setMenu('join')} 
                disabled={!playerName}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-black text-xl py-4 rounded-2xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-3"
              >
                <Search size={24} /> UNIRSE A SALA
              </button>
              <button 
                onClick={handleCreate} 
                disabled={!playerName}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-black text-xl py-4 rounded-2xl shadow-xl transform transition active:scale-95 flex items-center justify-center gap-3"
              >
                <PlusCircle size={24} /> CREAR SALA
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setMenu('main'); setErrorMsg(''); }}
                  className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition text-white"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="flex-1 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Código (ej. SALA-123)" 
                    value={localRoomId} 
                    onChange={(e) => setLocalRoomId(e.target.value.toUpperCase())} 
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors text-white" 
                  />
                  <button 
                    onClick={handleJoinCode}
                    disabled={!localRoomId}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 rounded-xl font-bold transition"
                  >
                    IR
                  </button>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-700 h-48 flex flex-col">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-black uppercase text-slate-500 ml-1 tracking-widest">Salas Públicas Activas</h3>
                  <button onClick={fetchRooms} className="text-blue-400 hover:text-blue-300 p-1 bg-blue-500/10 rounded-lg transition" title="Actualizar">
                    <Zap size={14} />
                  </button>
                </div>
                <div className="overflow-y-auto flex-1">
                  {publicRooms.length === 0 ? (
                    <p className="text-slate-600 text-sm font-bold text-center mt-6 italic">No hay salas públicas disponibles.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {publicRooms.map(room => (
                        <div key={room.id} className="bg-slate-800 p-3 rounded-xl flex justify-between items-center border border-slate-700">
                          <div>
                            <p className="text-white font-bold text-sm">{room.host}</p>
                            <p className="text-slate-400 text-xs">{room.playerCount}/6 Médicos</p>
                          </div>
                          <button 
                            onClick={() => { setLocalRoomId(room.id); onJoinRoom(room.id); }}
                            className="bg-green-600/20 hover:bg-green-500/40 text-green-400 p-2 rounded-lg transition"
                          >
                            <LogIn size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 xs:mb-8">
            <div className="flex items-center gap-2 xs:gap-4">
              <button 
                onClick={onLeave}
                className="p-2 xs:p-3 rounded-xl bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300 transition-all shadow-lg"
                title="Salir de la sala"
              >
                <ArrowLeft size={18} />
              </button>
              <h2 className="text-xl xs:text-3xl font-bold text-slate-300 flex items-center gap-2 xs:gap-3 uppercase tracking-tighter">
                <Users className="text-blue-500 w-5 xs:w-8" /> Sala
              </h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyRoomId} 
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 xs:px-4 py-1.5 xs:py-2 rounded-xl text-[10px] xs:text-xs font-bold transition-all border border-white/5 text-white"
              >
                {copied ? <CheckCircle2 size={12} className="text-green-400" /> : <Copy size={12} />} {roomCode}
              </button>
              {roomPlayers[0]?.id === playerId && (
                <button 
                  onClick={onCloseRoom}
                  className="bg-red-500/20 hover:bg-red-500/40 text-red-500 px-3 py-1.5 rounded-xl transition flex items-center gap-1 text-[10px] xs:text-xs font-bold"
                  title="Cerrar la sala para todos"
                >
                  <XCircle size={14} /> CERRAR
                </button>
              )}
            </div>
          </div>
          
          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-xl mb-4 text-center font-bold text-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2 xs:space-y-3 mb-8 xs:mb-10 max-h-48 xs:max-h-64 overflow-y-auto pr-2">
            {roomPlayers.map((p) => (
              <div key={p.id} className={cn(
                "flex items-center justify-between p-3 xs:p-4 rounded-xl xs:rounded-2xl border-2 xs:border-4",
                p.id === playerId ? 'bg-blue-500/10 border-blue-500/50 text-white' : 'bg-slate-700 border-slate-600 text-slate-300'
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
