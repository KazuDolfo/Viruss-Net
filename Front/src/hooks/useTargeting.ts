import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useGameActions } from './useGameActions';
import type { Card } from '@shared/models';

interface Target {
  playerId: string;
  organId: string;
}

export const useTargeting = () => {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [pendingTargets, setPendingTargets] = useState<Target[]>([]);
  const { gameState, playerId } = useGameStore();
  const { sendAction } = useGameActions();

  const clearSelection = useCallback(() => {
    setSelectedCards([]);
    setPendingTargets([]);
  }, []);

  const handleCardClick = useCallback((card: Card) => {
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
  }, [selectedCards]);

  const handleOrganClick = useCallback((targetPlayerId: string, organId: string) => {
    if (!gameState || !playerId || selectedCards.length !== 1) return;
    const selectedCard = selectedCards[0];
    const normalizedName = (selectedCard.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Transplante Logic
    if (normalizedName.includes('transplante') || normalizedName.includes('trasplante')) {
      const alreadySelected = pendingTargets.find(t => t.playerId === targetPlayerId && t.organId === organId);
      if (alreadySelected) {
        setPendingTargets(prev => prev.filter(t => t !== alreadySelected));
        return;
      }

      const newTargets = [...pendingTargets, { playerId: targetPlayerId, organId }];
      if (newTargets.length === 2) {
        sendAction('PLAY_CARD', { 
          cardId: selectedCard.id, 
          targetPlayerId: newTargets[0].playerId, 
          targetOrganId: newTargets[0].organId,
          targetPlayerId2: newTargets[1].playerId,
          targetOrganId2: newTargets[1].organId
        });
        clearSelection();
      } else {
        setPendingTargets(newTargets);
      }
      return;
    }

    // Normal play logic
    sendAction('PLAY_CARD', { cardId: selectedCard.id, targetPlayerId, targetOrganId: organId });
    clearSelection();
  }, [gameState, playerId, selectedCards, pendingTargets, sendAction, clearSelection]);

  const playSpecialGlobal = useCallback(() => {
    if (!gameState || !playerId || selectedCards.length !== 1) return;
    const selectedCard = selectedCards[0];
    const normalizedName = (selectedCard.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedName.includes('guante') || normalizedName.includes('contagio')) {
      sendAction('PLAY_CARD', { cardId: selectedCard.id });
      clearSelection();
    }
  }, [gameState, playerId, selectedCards, sendAction, clearSelection]);

  const handlePlayerTarget = useCallback((targetPlayerId: string) => {
    if (!gameState || !playerId || selectedCards.length !== 1) return;
    const selectedCard = selectedCards[0];
    const normalizedName = (selectedCard.name || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedName.includes('error')) {
      sendAction('PLAY_CARD', { cardId: selectedCard.id, targetPlayerId });
      clearSelection();
    }
  }, [gameState, playerId, selectedCards, sendAction, clearSelection]);

  const discardSelection = useCallback(() => {
    if (selectedCards.length === 0) return;
    sendAction('DISCARD', { cardIds: selectedCards.map(c => c.id) });
    clearSelection();
  }, [selectedCards, sendAction, clearSelection]);

  const playOrganSelf = useCallback(() => {
    if (!gameState || selectedCards.length !== 1 || selectedCards[0].type !== 'organ' as any) return;
    const selectedCard = selectedCards[0];
    sendAction('PLAY_CARD', { cardId: selectedCard.id });
    clearSelection();
  }, [gameState, selectedCards, sendAction, clearSelection]);

  return {
    selectedCards,
    setSelectedCards,
    pendingTargets,
    handleCardClick,
    handleOrganClick,
    handlePlayerTarget,
    playSpecialGlobal,
    playOrganSelf,
    discardSelection,
    clearSelection
  };
};
