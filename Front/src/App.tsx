import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CardUI, colorMap } from './components/CardUI';
import { Trash2, ScrollText, Layers, Hand, CheckCircle2 } from 'lucide-react';
import { CardCollectionModal } from './components/CardCollectionModal';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';

// Hooks & Store
import { useGameStore } from './store/gameStore';
import { useSocket } from './hooks/useSocket';
import { useActions } from './hooks/useActions';
import { useTargeting } from './hooks/useTargeting';
import { useImageManager } from './core/useImageManager';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LoadingBar = () => {
  const progress = useImageManager(state => state.loadProgress);
  const isLoaded = useImageManager(state => state.isLoaded);

  if (isLoaded) return null;

  return (
    <div className="w-full max-w-md bg-slate-800 h-2 rounded-full overflow-hidden mb-8">
      <div 
        className="h-full bg-blue-500 transition-all duration-300" 
        style={{ width: `${progress}%` }} 
      />
    </div>
  );
};

const App: React.FC = () => {
  // 1. New Architecture Hooks
  useSocket(); 
  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);
  const roomPlayers = useGameStore(state => state.roomPlayers);
  const roomStatus = useGameStore(state => state.roomStatus);
  const roomCode = useGameStore(state => state.roomCode);
  const setPlayerId = useGameStore(state => state.setPlayerId);
  const setRoomCode = useGameStore(state => state.setRoomCode);

  const { joinRoom, startGame, sendAction, resetGame } = useActions();
  const { 
    selectedCards, 
    pendingTargets, 
    error: targetingError,
    handleCardClick,
    handleOrganClick,
    handlePlayerTarget,
    playSpecialGlobal,
    playOrganSelf,
    discardSelection,
    clearSelection
  } = useTargeting();

  // 2. Local UI State
  const [localRoomId, setLocalRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [copied, setCopied] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  // 3. Initialization
  useEffect(() => {
    const savedPId = localStorage.getItem('virus_player_id') || `p_${Math.random().toString(36).substr(2, 9)}`;
    const savedToken = localStorage.getItem('virus_session_token') || Math.random().toString(36).substr(2, 16);
    
    localStorage.setItem('virus_player_id', savedPId);
    localStorage.setItem('virus_session_token', savedToken);
    
    setPlayerId(savedPId);
  }, [setPlayerId]);

  // 4. Action Wrappers
  const onJoinRoom = useCallback(() => {
    if (!localRoomId || !playerName) return;
    const sessionToken = localStorage.getItem('virus_session_token') || '';
    localStorage.setItem('virus_player_name', playerName);
    localStorage.setItem('virus_room_code', localRoomId);
    setRoomCode(localRoomId);
    joinRoom(localRoomId, playerName, sessionToken);
  }, [localRoomId, playerName, setRoomCode, joinRoom]);

  const onStartGame = useCallback(() => {
    if (roomCode) startGame(roomCode);
  }, [roomCode, startGame]);

  const handleDrawCard = useCallback(() => {
    if (!gameState || !gameState.needsDrawing) return;
    sendAction('DRAW', {});
  }, [gameState, sendAction]);

  const copyRoomId = useCallback(() => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [roomCode]);

  const getCardHint = useCallback((card: any) => {
    if (card.description) {
        if (card.name === 'Transplante' && pendingTargets.length === 0) return "Selecciona el PRIMER órgano a intercambiar.";
        if (card.name === 'Transplante' && pendingTargets.length === 1) return "Selecciona el SEGUNDO órgano para completar el intercambio.";
        if (card.name === 'Error médico') return "Selecciona a un rival para intercambiar todo tu cuerpo con el suyo.";
        return card.description;
    }
    if (card.type === 'organ') return "¡Bájalo a tu zona! Necesitas 4 órganos de distintos colores para ganar.";
    if (card.type === 'virus') return "¡ATACA! Ponlo sobre un órgano del mismo color de un rival para infectarlo.";
    if (card.type === 'medicine') return "¡CÚRATE! Úsala en tu órgano para quitar un virus o protegerlo.";
    return "Selecciona una carta para ver cómo usarla.";
  }, [pendingTargets.length]);

  const currentPlayer = gameState ? gameState.players[gameState.currentPlayerIndex] : undefined;
  const isMyTurn = currentPlayer?.id === playerId;
  const isDrawingState = !!gameState?.needsDrawing;

  const canTargetOrgan = useCallback((_pid: string, _oidx: string) => {
    return isMyTurn && selectedCards.length === 1 && !isDrawingState;
  }, [isMyTurn, selectedCards.length, isDrawingState]);

  const canTargetPlayer = useCallback((_pid: string) => {
    return isMyTurn && selectedCards.length === 1 && selectedCards[0].name === 'Error médico';
  }, [isMyTurn, selectedCards]);

  const neverTargetPlayer = useCallback(() => false, []);

  // 5. Conditional Rendering: Lobby
  if (roomStatus === 'waiting' || !gameState || !currentPlayer) {
    return (
      <div className="min-h-svh bg-slate-900 text-white flex flex-col items-center justify-center p-4 xs:p-8">
        <h1 
          onClick={() => setIsCollectionOpen(true)}
          className="text-6xl xs:text-8xl font-black mb-8 xs:mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse text-center cursor-pointer active:scale-95 transition-transform"
        >
          ¡VIRUS!
        </h1>
        
        <LoadingBar />
        
        {targetingError && (
          <div className="fixed top-8 bg-red-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce z-[100] text-sm">
            ⚠️ {targetingError}
          </div>
        )}

        <Lobby 
          playerName={playerName}
          setPlayerName={setPlayerName}
          localRoomId={localRoomId}
          setLocalRoomId={setLocalRoomId}
          onJoinRoom={onJoinRoom}
          roomPlayers={roomPlayers}
          playerId={playerId}
          roomCode={roomCode}
          copyRoomId={copyRoomId}
          copied={copied}
          onStartGame={onStartGame}
          setIsCollectionOpen={setIsCollectionOpen}
        />
        <CardCollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} />
      </div>
    );
  }

  // 6. Game State Derived Info
  const myPlayer = gameState.players.find(p => p.id === playerId)!;

  // Reorder rivals starting from the player after me
  const rivals = useMemo(() => {
    const myIndex = gameState.players.findIndex(p => p.id === playerId);
    return [
      ...gameState.players.slice(myIndex + 1),
      ...gameState.players.slice(0, myIndex)
    ];
  }, [gameState.players, playerId]);

  return (
    <div className="fixed inset-0 bg-[#0b1120] text-white overflow-hidden flex flex-col font-sans select-none touch-manipulation">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_2px,transparent_2px)] bg-[length:clamp(40px,8vw,80px)_clamp(40px,8vw,80px)]" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/10 via-slate-900/40 to-red-900/10" />
        
        {/* Table Center Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Header: Global Status */}
      <header className="relative z-50 flex items-center justify-between p-4 md:p-6 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-4 min-w-0">
          <div 
            onClick={() => setIsCollectionOpen(true)}
            className={cn(
              "px-4 md:px-6 py-2 md:py-3 rounded-2xl border-2 transition-all shadow-lg min-w-0 cursor-pointer active:scale-95",
              isMyTurn ? "bg-yellow-500/10 border-yellow-500/50 shadow-yellow-500/10" : "bg-slate-800/50 border-white/5 opacity-80"
            )}
          >
            <span className="text-[9px] md:text-[10px] block font-black uppercase tracking-[0.3em] text-yellow-500 leading-none mb-1 truncate">
              {isMyTurn ? (isDrawingState ? "FASE DE ROBO" : "TU TURNO") : "ESPERANDO JUGADA"}
            </span>
            <span className={cn(
              "text-lg md:text-2xl font-black uppercase italic tracking-tighter block truncate",
              isMyTurn ? "text-white" : "text-slate-400"
            )}>
              {currentPlayer.name} {isMyTurn && "(TÚ)"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setShowLogs(!showLogs)} 
            className="p-3 rounded-2xl bg-slate-800/50 border border-white/10 hover:bg-slate-700 active:scale-90 transition-all shadow-lg"
          >
            <ScrollText size={20} className={showLogs ? "text-blue-400" : "text-white/60"} />
          </button>
          
          <div 
            onClick={handleDrawCard} 
            className={cn(
              "relative group flex items-center gap-3 px-5 py-2 md:py-3 rounded-2xl border-2 transition-all cursor-pointer shadow-lg",
              isMyTurn && isDrawingState ? "bg-yellow-500 border-black text-black scale-105" : "bg-slate-800/50 border-white/10 text-white/40"
            )}
          >
             <Layers size={20} className={isMyTurn && isDrawingState ? "animate-bounce" : ""} />
             <span className="text-xl md:text-2xl font-black tracking-tighter">{gameState.deck.length}</span>
             {isMyTurn && isDrawingState && (
               <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-[10px] font-black px-3 py-1.5 rounded-full whitespace-nowrap shadow-2xl border-2 border-black/10 animate-pulse">
                 ¡ROBA AQUÍ!
               </div>
             )}
          </div>
        </div>
      </header>

      {/* Main Table Stage */}
      <GameTable 
        gameState={gameState}
        playerId={playerId || ''}
        currentPlayer={currentPlayer}
        myPlayer={myPlayer}
        rivals={rivals}
        selectedCards={selectedCards}
        pendingTargets={pendingTargets}
        isMyTurn={isMyTurn}
        isDrawingState={isDrawingState}
        handleCardClick={handleCardClick}
        handleOrganClick={handleOrganClick}
        canTargetOrgan={canTargetOrgan}
        handlePlayerTarget={handlePlayerTarget}
        canTargetPlayer={canTargetPlayer}
        neverTargetPlayer={neverTargetPlayer}
      />


      {/* Bottom Controls */}
      <aside className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] p-[clamp(0.5rem,2vw,2rem)] pb-[clamp(1.5rem,4vw,4rem)] transition-all duration-700 ease-out",
        isMyTurn ? "translate-y-0" : "translate-y-[85%] opacity-40 hover:translate-y-0 hover:opacity-100"
      )}>
        <div className="max-w-4xl mx-auto flex flex-col gap-[clamp(0.5rem,1.5vw,1.5rem)]">
          
          {selectedCards.length === 1 && isMyTurn && !isDrawingState && (
            <div className="bg-slate-900/95 backdrop-blur-3xl p-[clamp(1rem,2.5vw,2.5rem)] rounded-[clamp(1.5rem,3vw,3rem)] border-[3px] border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-500">
               <div className="flex gap-[clamp(1rem,3vw,3rem)] items-center">
                  <div className="shrink-0 drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"><CardUI card={selectedCards[0]} /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                       <div className={cn("w-3 h-3 rounded-full", colorMap[selectedCards[0].color])} />
                       <span className="text-[clamp(8px,1.2vw,11px)] font-black text-slate-500 uppercase tracking-[0.2em]">{selectedCards[0].type}</span>
                    </div>
                    <h3 className="text-[clamp(18px,4vw,36px)] font-black uppercase italic text-yellow-400 tracking-tighter mb-2 leading-none truncate">{selectedCards[0].name}</h3>
                    <p className="text-[clamp(11px,1.8vw,16px)] text-slate-300 font-medium italic leading-snug mb-[clamp(1rem,2vw,2rem)] max-w-2xl">{getCardHint(selectedCards[0])}</p>
                    
                    <div className="flex flex-wrap gap-[clamp(0.5rem,1vw,1.2rem)]">
                      {selectedCards[0].type === 'organ' && (
                        <button 
                          onClick={playOrganSelf} 
                          className="bg-green-600 hover:bg-green-500 text-white px-[clamp(1.2rem,2.5vw,2.5rem)] py-[clamp(0.8rem,1.5vw,1.5rem)] rounded-[clamp(0.8rem,1.2vw,1.5rem)] font-black text-[clamp(10px,1.5vw,14px)] uppercase tracking-widest transition-all transform active:scale-90 flex items-center gap-3 shadow-xl shadow-green-900/40 border-b-4 border-green-800"
                        >
                          📥 BAJAR ÓRGANO
                        </button>
                      )}
                      {(selectedCards[0].name === 'Guante de látex' || selectedCards[0].name === 'Contagio') && (
                        <button 
                          onClick={playSpecialGlobal} 
                          className="bg-blue-600 hover:bg-blue-500 text-white px-[clamp(1.2rem,2.5vw,2.5rem)] py-[clamp(0.8rem,1.5vw,1.5rem)] rounded-[clamp(0.8rem,1.2vw,1.5rem)] font-black text-[clamp(10px,1.5vw,14px)] uppercase tracking-widest transition-all transform active:scale-90 flex items-center gap-3 shadow-xl shadow-blue-900/40 border-b-4 border-blue-800"
                        >
                          🚀 USAR PODER
                        </button>
                      )}
                      <button 
                        onClick={discardSelection} 
                        className="bg-red-600 hover:bg-red-500 text-white px-[clamp(1.2rem,2.5vw,2.5rem)] py-[clamp(0.8rem,1.5vw,1.5rem)] rounded-[clamp(0.8rem,1.2vw,1.5rem)] font-black text-[clamp(10px,1.5vw,14px)] uppercase tracking-widest transition-all transform active:scale-90 flex items-center gap-3 shadow-xl shadow-red-900/40 border-b-4 border-red-800"
                      >
                        <Trash2 size="clamp(16px,1.5vw,20px)" /> DESCARTAR
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={clearSelection} 
                    className="p-[clamp(0.8rem,1.5vw,1.5rem)] bg-white/5 hover:bg-white/10 rounded-full text-white/30 hover:text-white transition-all self-start border border-white/5"
                  >
                    <CheckCircle2 size="clamp(20px,2.5vw,32px)" />
                  </button>
               </div>
            </div>
          )}

          {selectedCards.length > 1 && (
             <div className="flex justify-center">
                <div className="bg-slate-900/90 backdrop-blur-3xl p-[clamp(0.5rem,1.5vw,1.5rem)] rounded-[clamp(1.5rem,3vw,3rem)] border-[3px] border-white/10 shadow-2xl flex items-center gap-[clamp(0.5rem,1vw,1.5rem)]">
                   <button 
                      onClick={discardSelection} 
                      className="bg-red-600 hover:bg-red-500 text-white px-[clamp(1.5rem,4vw,6rem)] py-[clamp(1rem,2vw,2.5rem)] rounded-[clamp(1.2rem,2vw,2.5rem)] font-black text-[clamp(12px,2vw,18px)] uppercase tracking-[0.2em] transition-all transform active:scale-90 flex items-center gap-4 shadow-2xl border-b-4 border-red-800"
                    >
                      <Trash2 size="clamp(20px,2.5vw,30px)" /> DESCARTAR {selectedCards.length} CARTAS
                   </button>
                </div>
             </div>
          )}

          {isMyTurn && isDrawingState && (
            <div className="flex justify-center">
              <div className="bg-yellow-500 text-black px-[clamp(1.5rem,4vw,6rem)] py-[clamp(1rem,2vw,2.5rem)] rounded-full font-black text-[clamp(12px,2vw,18px)] uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-bounce flex items-center gap-4 border-4 border-black/10">
                 <Hand size="clamp(20px,2.5vw,30px)" className="animate-pulse" /> ¡ROBA PARA TERMINAR!
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Logs */}
      {showLogs && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4" onClick={() => setShowLogs(false)}>
          <div className="bg-slate-900 w-full max-w-md rounded-[2rem] border-2 border-white/10 p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2"><ScrollText className="text-blue-500" /> Historial de Jugadas</h3>
              <button onClick={() => setShowLogs(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><CheckCircle2 /></button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
              {gameState.logs.map((log: string, i: number) => (
                <div key={i} className={cn(
                  "p-3 rounded-xl border flex gap-3 items-start",
                  i === 0 ? "bg-blue-500/10 border-blue-500/30" : "bg-white/5 border-white/5 opacity-60"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", i === 0 ? "bg-blue-400" : "bg-white/20")} />
                  <p className="text-sm font-medium leading-snug">{log}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {gameState.winner && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4 animate-in fade-in zoom-in duration-500">
          <div className="bg-slate-900 border-4 border-yellow-500 p-8 md:p-16 rounded-[3rem] md:rounded-[4rem] text-center shadow-[0_0_100px_rgba(234,179,8,0.3)] w-full max-w-lg">
            <h2 className="text-6xl md:text-8xl mb-6 animate-bounce">🏆</h2>
            <h1 className="text-4xl md:text-6xl font-black mb-4 text-yellow-400 uppercase italic tracking-tighter">¡VICTORIA!</h1>
            <p className="text-xl md:text-2xl text-white mb-10 font-black uppercase tracking-widest">{gameState.winner.name}</p>
            <button onClick={resetGame} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg md:text-2xl py-5 xs:py-6 rounded-2xl md:rounded-3xl transition transform hover:scale-105 active:scale-90 shadow-2xl">VOLVER A EMPEZAR</button>
          </div>
        </div>
      )}

      <CardCollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} />

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
