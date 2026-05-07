import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useActions } from './useActions';
import { canPlayCard } from '@shared/engine';
import type { Card } from '@shared/models';

interface Target {
  playerId: string;
  organId: string;
}

export const useTargeting = () => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [pendingTargets, setPendingTargets] = useState<Target[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { gameState, playerId } = useGameStore();
  const { sendAction } = useActions();

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
    setPendingTargets([]);
  }, []);

  const handleCardClick = useCallback((card: Card) => {
    if (gameState?.needsDrawing) return;
    
    const isSelected = selectedCards.some(c => c.id === card.id);
    if (isSelected) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
      setPendingTargets([]);
    } else {
      if (selectedCards.length < 3) {
        setSelectedCards(prev => [...prev, card]);
        setPendingTargets([]);
      }
    }
  }, [gameState, selectedCards]);

  const handleOrganClick = useCallback((targetPlayerId: string, organId: string) => {
    if (!gameState || !playerId || selectedCards.length !== 1 || gameState.needsDrawing) return;
    const selectedCard = selectedCards[0];

    // Transplante Logic
    if (selectedCard.name === 'Transplante') {
      const alreadySelected = pendingTargets.find(t => t.playerId === targetPlayerId && t.organId === organId);
      if (alreadySelected) {
        setPendingTargets(prev => prev.filter(t => t !== alreadySelected));
        return;
      }

      const newTargets = [...pendingTargets, { playerId: targetPlayerId, organId }];
      if (newTargets.length === 2) {
        if (canPlayCard(gameState, selectedCard, playerId, newTargets[0].playerId, newTargets[0].organId, newTargets[1].playerId, newTargets[1].organId)) {
          sendAction('PLAY_CARD', { 
            cardId: selectedCard.id, 
            targetPlayerId: newTargets[0].playerId, 
            targetOrganId: newTargets[0].organId,
            targetPlayerId2: newTargets[1].playerId,
            targetOrganId2: newTargets[1].organId
          });
          clearSelection();
        } else {
          setError("Movimiento de transplante inválido");
          setPendingTargets([]);
          setTimeout(() => setError(null), 2000);
        }
      } else {
        setPendingTargets(newTargets);
      }
      return;
    }

    // Normal play logic
    if (canPlayCard(gameState, selectedCard, playerId, targetPlayerId, organId)) {
      sendAction('PLAY_CARD', { cardId: selectedCard.id, targetPlayerId, targetOrganId: organId });
      clearSelection();
    }
  }, [gameState, playerId, selectedCards, pendingTargets, sendAction, clearSelection]);

  const playSpecialGlobal = useCallback(() => {
    if (!gameState || !playerId || selectedCards.length !== 1 || gameState.needsDrawing) return;
    const selectedCard = selectedCards[0];
    if (selectedCard.name === 'Guante de látex' || selectedCard.name === 'Contagio') {
      if (canPlayCard(gameState, selectedCard, playerId)) {
        sendAction('PLAY_CARD', { cardId: selectedCard.id });
        clearSelection();
      }
    }
  }, [gameState, playerId, selectedCards, sendAction, clearSelection]);

  const handlePlayerTarget = useCallback((targetPlayerId: string) => {
    if (!gameState || !playerId || selectedCards.length !== 1 || gameState.needsDrawing) return;
    const selectedCard = selectedCards[0];
    if (selectedCard.name === 'Error médico') {
      if (canPlayCard(gameState, selectedCard, playerId, targetPlayerId)) {
        sendAction('PLAY_CARD', { cardId: selectedCard.id, targetPlayerId });
        clearSelection();
      }
    }
  }, [gameState, playerId, selectedCards, sendAction, clearSelection]);

  const discardSelection = useCallback(() => {
    if (selectedCards.length === 0) return;
    sendAction('DISCARD', { cardIds: selectedCards.map(c => c.id) });
    clearSelection();
  }, [selectedCards, sendAction, clearSelection]);

  const playOrganSelf = useCallback(() => {
    if (!gameState || selectedCards.length !== 1 || selectedCards[0].type !== 'organ' || gameState.needsDrawing) return;
    const selectedCard = selectedCards[0];
    sendAction('PLAY_CARD', { cardId: selectedCard.id });
    clearSelection();
  }, [gameState, selectedCards, sendAction, clearSelection]);

  return {
    selectedCards,
    setSelectedCards,
    pendingTargets,
    error,
    handleCardClick,
    handleOrganClick,
    handlePlayerTarget,
    playSpecialGlobal,
    playOrganSelf,
    discardSelection,
    clearSelection
  };
};
