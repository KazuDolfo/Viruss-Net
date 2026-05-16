import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lobby } from './components/Lobby';
import { GameTable } from './components/GameTable';
import { GameHeader } from './components/GameHeader';
import { PlayerHand } from './components/PlayerHand';
import { PlayerStatusPanel } from './components/PlayerStatusPanel';
import { ActionOverlay } from './components/ActionOverlay';
import { SocialDock } from './components/SocialDock';
import { CardCollectionModal } from './components/CardCollectionModal';

// Hooks & Store
import { useGameStore } from './store/gameStore';
import { useSocketSync } from './hooks/useSocketSync';
import { useGameActions } from './hooks/useGameActions';
import { useTargeting } from './hooks/useTargeting';
import { useImageManager } from './core/useImageManager';
import { sessionManager } from './core/session';
import { socket } from './core/socket';

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
  const { isConnected } = useSocketSync(); 
  const gameState = useGameStore(state => state.gameState);
  const playerId = useGameStore(state => state.playerId);
  const roomPlayers = useGameStore(state => state.roomPlayers);
  const roomStatus = useGameStore(state => state.roomStatus);
  const roomCode = useGameStore(state => state.roomCode);
  const setPlayerId = useGameStore(state => state.setPlayerId);
  const setRoomCode = useGameStore(state => state.setRoomCode);

  const { joinRoom, startGame, sendAction, leaveRoom } = useGameActions();
  const { 
    selectedCards, 
    pendingTargets, 
    handleCardClick,
    handleOrganClick,
    handlePlayerTarget,
    playSpecialGlobal,
    playOrganSelf,
    discardSelection,
    clearSelection
  } = useTargeting();

  const [localRoomId, setLocalRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  const sendReaction = (reactionId: string) => {
    if (roomCode && playerId) {
      socket.emit('send_social', { roomId: roomCode, playerId, reactionId });
    }
  };

  const sendMessage = (text: string) => {
    if (roomCode && playerId) {
      socket.emit('send_social', { roomId: roomCode, playerId, text });
    }
  };

  useEffect(() => {
    // Initial session setup if none exists
    const session = sessionManager.get();
    let currentPId = session.playerId;
    let currentToken = session.sessionToken;

    if (!currentPId) {
      currentPId = `p_${Math.random().toString(36).substr(2, 9)}`;
    }
    if (!currentToken) {
      currentToken = Math.random().toString(36).substr(2, 16);
    }

    sessionManager.save({ ...session, playerId: currentPId, sessionToken: currentToken });
    setPlayerId(currentPId);

    // Detect iOS for specific UI fixes
    const isIOS = /iPhone|iPad|iPod/.test(window.navigator.userAgent);
    if (isIOS) {
      document.documentElement.classList.add('is-ios');
    }
  }, [setPlayerId]);

  const onJoinRoom = useCallback(() => {
    if (!localRoomId || !playerName) return;
    const session = sessionManager.get();
    setRoomCode(localRoomId);
    joinRoom(localRoomId, playerName, session.sessionToken || '');
  }, [localRoomId, playerName, setRoomCode, joinRoom]);

  const handleDrawCard = useCallback(() => {
    sendAction('DRAW', {});
  }, [sendAction]);


  const getCardHint = useCallback((card: any) => {
    if (card.description) {
        const normalizedName = (card.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        if ((normalizedName.includes('transplante') || normalizedName.includes('trasplante')) && pendingTargets.length === 0) return "Selecciona el PRIMER órgano a intercambiar.";
        if ((normalizedName.includes('transplante') || normalizedName.includes('trasplante')) && pendingTargets.length === 1) return "Selecciona el SEGUNDO órgano.";
        return card.description;
    }
    if (card.type === 'organ') return "¡Bájalo a tu zona!";
    if (card.type === 'virus') return "¡ATACA! Ponlo sobre un órgano rival.";
    if (card.type === 'medicine') return "¡CÚRATE! Úsala en tu órgano.";
    return "Selecciona una carta.";
  }, [pendingTargets.length]);

  const rivals = useMemo(() => {
    if (!gameState) return [];
    const myIndex = gameState.players.findIndex(p => p.id === playerId);
    if (myIndex === -1) return [...gameState.players];
    return [...gameState.players.slice(myIndex + 1), ...gameState.players.slice(0, myIndex)];
  }, [gameState?.players, playerId]);

  if (roomStatus === 'waiting' || !gameState) {
    return (
      <div className="min-h-svh bg-[#0b1120] text-white flex flex-col items-center justify-center p-8 overflow-y-auto">
        <h1 onClick={() => setIsCollectionOpen(true)} className="text-8xl font-black mb-12 text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse cursor-pointer">¡VIRUS!</h1>
        <LoadingBar />
        <Lobby 
          playerName={playerName} setPlayerName={setPlayerName}
          localRoomId={localRoomId} setLocalRoomId={setLocalRoomId}
          onJoinRoom={onJoinRoom} onLeave={leaveRoom}
          roomPlayers={roomPlayers}
          playerId={playerId} roomCode={roomCode}
          copyRoomId={() => { navigator.clipboard.writeText(roomCode || ''); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          copied={copied} onStartGame={() => roomCode && startGame()}
          setIsCollectionOpen={setIsCollectionOpen}
        />
        <CardCollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} />
      </div>
    );
  }

  const myPlayer = gameState.players.find(p => p.id === playerId)!;
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer.id === playerId;
  const isDrawingState = false; // needsDrawing removed from backend

  const canTargetOrgan = (_pid: string, _oid: string) => isMyTurn && selectedCards.length === 1 && !isDrawingState;
  const canTargetPlayer = (_pid: string) => {
    if (!isMyTurn || selectedCards.length !== 1) return false;
    const normalizedName = (selectedCards[0].name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedName.includes('error');
  };

  const winnerPlayer = gameState.winnerId ? gameState.players.find(p => p.id === gameState.winnerId) : null;

  return (
    <div className="fixed inset-0 bg-[#0b1120] text-white overflow-hidden flex flex-col font-sans select-none touch-manipulation">
      
      {/* 1. Background Layer */}
      <div className="layer-bg opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e293b_2px,transparent_2px)] bg-[length:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      {/* 2. Game World Layer */}
      <GameTable 
        gameState={gameState}
        currentPlayer={currentPlayer} myPlayer={myPlayer} rivals={rivals}
        selectedCards={selectedCards} pendingTargets={pendingTargets}
        isMyTurn={isMyTurn} isDrawingState={isDrawingState}
        handleCardClick={handleCardClick} handleOrganClick={handleOrganClick}
        canTargetOrgan={canTargetOrgan} handlePlayerTarget={handlePlayerTarget}
        canTargetPlayer={canTargetPlayer} neverTargetPlayer={() => false}
      />

      {/* 3. HUD Layer */}
      <div className="layer-hud inset-0">
        <GameHeader 
          isMyTurn={isMyTurn} isDrawingState={isDrawingState}
          currentPlayerName={currentPlayer.name} deckCount={gameState.deck.length}
          onDrawCard={handleDrawCard}
          onLeave={leaveRoom}
          isConnected={isConnected}
        />
        <PlayerStatusPanel />
        <PlayerHand 
          hand={myPlayer.hand} selectedCards={selectedCards}
          onCardClick={handleCardClick} isMyTurn={isMyTurn}
          isDrawingState={isDrawingState}
        />
        <SocialDock onSendReaction={sendReaction} onSendMessage={sendMessage} />
      </div>

      {/* 4. Overlay Layer */}
      <div className="layer-overlay">
        <ActionOverlay 
          selectedCards={selectedCards} isMyTurn={isMyTurn}
          isDrawingState={isDrawingState} onPlayOrgan={playOrganSelf}
          onPlaySpecial={playSpecialGlobal} onDiscard={discardSelection}
          onClear={clearSelection} getCardHint={getCardHint}
        />
      </div>

      {winnerPlayer && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl flex items-center justify-center z-[200] p-4">
          <div className="bg-slate-900 border-4 border-yellow-500 p-12 rounded-[4rem] text-center shadow-2xl w-full max-w-lg">
            <h2 className="text-8xl mb-6">🏆</h2>
            <h1 className="text-5xl font-black mb-4 text-yellow-400 uppercase italic">¡VICTORIA!</h1>
            <p className="text-2xl text-white mb-10 font-black uppercase tracking-widest">{winnerPlayer.name}</p>
            <button onClick={leaveRoom} className="w-full bg-yellow-500 text-black font-black text-2xl py-6 rounded-3xl">VOLVER A EMPEZAR</button>
          </div>
        </div>
      )}

      <CardCollectionModal isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} />
    </div>
  );
};

export default App;
