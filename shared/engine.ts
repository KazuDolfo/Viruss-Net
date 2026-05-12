import { 
  GameState, 
  GameAction, 
  ActionRequest, 
  Player, 
  Card, 
  OrganState, 
  CardColor, 
  Target
} from './models';

/**
 * ERROR MESSAGES
 */
export const ERRORS = {
  NOT_YOUR_TURN: 'No es tu turno',
  INVALID_PHASE: 'Fase de juego inválida para esta acción',
  CARD_NOT_IN_HAND: 'La carta no está en tu mano',
  INVALID_TARGET: 'Objetivo inválido',
  ORGAN_ALREADY_EXISTS: 'Ya tienes un órgano de este color',
  BODY_FULL: 'Cuerpo completo (máximo 4 órganos distintos)',
  IMMUNE_TARGET: 'El objetivo está inmunizado',
  COLOR_MISMATCH: 'El color de la carta no coincide con el órgano',
  NOT_ENOUGH_CARDS: 'No tienes suficientes cartas para descartar',
  GAME_OVER: 'El juego ya ha terminado',
};

/**
 * VALIDATION LAYER
 */
export const validateAction = (state: GameState, request: ActionRequest): string | null => {
  const { playerId, action } = request;
  const player = state.players.find(p => p.id === playerId);
  const currentPlayer = state.players[state.currentPlayerIndex];

  if (!player) return ERRORS.INVALID_TARGET;
  if (state.winnerId) return ERRORS.GAME_OVER;
  if (player.id !== currentPlayer.id) return ERRORS.NOT_YOUR_TURN;

  // Basic ownership check for card-based actions
  if ('cardId' in action) {
    const hasCard = player.hand.some(c => c.id === action.cardId);
    if (!hasCard) return ERRORS.CARD_NOT_IN_HAND;
  } else if (action.type === 'DISCARD') {
    if (!action.cardIds || !Array.isArray(action.cardIds)) return ERRORS.NOT_ENOUGH_CARDS;
    const hasAllCards = action.cardIds.every(id => player.hand.some(c => c.id === id));
    if (!hasAllCards) return ERRORS.CARD_NOT_IN_HAND;
  }

  switch (action.type) {
    case 'PLAY_CARD': {
      const card = player.hand.find(c => c.id === action.cardId)!;
      if (card.type === 'organ') {
        return validateAction(state, { ...request, action: { type: 'PLAY_ORGAN', cardId: card.id } });
      }
      if (card.type === 'virus') {
        if (!action.targetPlayerId || !action.targetOrganId) return ERRORS.INVALID_TARGET;
        return validateAction(state, { ...request, action: { type: 'PLAY_VIRUS', cardId: card.id, target: { playerId: action.targetPlayerId, organId: action.targetOrganId } } });
      }
      if (card.type === 'medicine') {
        if (!action.targetPlayerId || !action.targetOrganId) return ERRORS.INVALID_TARGET;
        return validateAction(state, { ...request, action: { type: 'PLAY_MEDICINE', cardId: card.id, target: { playerId: action.targetPlayerId, organId: action.targetOrganId } } });
      }
      if (card.type === 'treatment') {
        const targets: Target[] = [];
        if (action.targetPlayerId) targets.push({ playerId: action.targetPlayerId, organId: action.targetOrganId });
        if (action.targetPlayerId2) targets.push({ playerId: action.targetPlayerId2, organId: action.targetOrganId2 });
        return validateAction(state, { ...request, action: { type: 'PLAY_TREATMENT', cardId: card.id, targets } });
      }
      return ERRORS.INVALID_TARGET;
    }

    case 'PLAY_ORGAN': {
      const card = player.hand.find(c => c.id === action.cardId)!;
      const alreadyHasColor = player.body.some(o => o.organCard.color === card.color);
      if (alreadyHasColor) return ERRORS.ORGAN_ALREADY_EXISTS;
      if (player.body.length >= 5) return ERRORS.BODY_FULL; 
      return null;
    }

    case 'PLAY_VIRUS': {
      const card = player.hand.find(c => c.id === action.cardId)!;
      const targetPlayer = state.players.find(p => p.id === action.target.playerId);
      if (!targetPlayer || targetPlayer.id === player.id) return ERRORS.INVALID_TARGET;
      const targetOrgan = targetPlayer.body.find(o => o.id === action.target.organId);
      if (!targetOrgan) return ERRORS.INVALID_TARGET;
      if (targetOrgan.isImmune) return ERRORS.IMMUNE_TARGET;

      const colorMatch = card.color === 'wildcard' ||
                         targetOrgan.organCard.color === 'wildcard' ||
                         card.color === targetOrgan.organCard.color;
      if (!colorMatch) return ERRORS.COLOR_MISMATCH;
      
      // Can't put a virus of a color if it already has one of THAT color? 
      // Rules: max 2 viruses total. Usually same color as organ.
      if (targetOrgan.viruses.length >= 2) return ERRORS.INVALID_TARGET;

      return null;
    }

    case 'PLAY_MEDICINE': {
      const card = player.hand.find(c => c.id === action.cardId)!;
      const targetPlayer = state.players.find(p => p.id === action.target.playerId);
      if (!targetPlayer || targetPlayer.id !== player.id) return ERRORS.INVALID_TARGET;
      const targetOrgan = targetPlayer.body.find(o => o.id === action.target.organId);
      if (!targetOrgan) return ERRORS.INVALID_TARGET;
      if (targetOrgan.isImmune) return ERRORS.IMMUNE_TARGET;

      const colorMatch = card.color === 'wildcard' ||
                         targetOrgan.organCard.color === 'wildcard' ||
                         card.color === targetOrgan.organCard.color;
      if (!colorMatch) return ERRORS.COLOR_MISMATCH;
      
      if (targetOrgan.medicines.length >= 2) return ERRORS.INVALID_TARGET;

      return null;
    }

    case 'PLAY_TREATMENT': {
      const card = player.hand.find(c => c.id === action.cardId)!;
      return validateTreatment(state, player, card, action.targets);
    }

    case 'DISCARD':
      return null;

    case 'PASS_TURN':
      return null;

    case 'DRAW':
      return null;

    default:
      return 'Acción desconocida';
  }
};

const validateTreatment = (state: GameState, player: Player, card: Card, targets: Target[]): string | null => { 
  switch (card.name) {
    case 'Transplante': {
      if (targets.length !== 2) return ERRORS.INVALID_TARGET;
      const [t1, t2] = targets;
      const p1 = state.players.find(p => p.id === t1.playerId);
      const p2 = state.players.find(p => p.id === t2.playerId);
      if (!p1 || !p2) return ERRORS.INVALID_TARGET;
      const o1 = p1.body.find(o => o.id === t1.organId);
      const o2 = p2.body.find(o => o.id === t2.organId);
      if (!o1 || !o2) return ERRORS.INVALID_TARGET;
      if (o1.isImmune || o2.isImmune) return ERRORS.IMMUNE_TARGET;

      // Rule: Can't have two organs of the same color after transplant
      const p1HasColor = p1.body.some(o => o.id !== o1.id && o.organCard.color === o2.organCard.color);
      const p2HasColor = p2.body.some(o => o.id !== o2.id && o.organCard.color === o1.organCard.color);
      if (p1HasColor || p2HasColor) return ERRORS.ORGAN_ALREADY_EXISTS;

      return null;
    }
    case 'Ladrón de órganos': {
      if (targets.length !== 1) return ERRORS.INVALID_TARGET;
      const [t] = targets;
      const victim = state.players.find(p => p.id === t.playerId);
      if (!victim || victim.id === player.id) return ERRORS.INVALID_TARGET;
      const organ = victim.body.find(o => o.id === t.organId);
      if (!organ) return ERRORS.INVALID_TARGET;
      if (organ.isImmune) return ERRORS.IMMUNE_TARGET;

      const alreadyHasColor = player.body.some(o => o.organCard.color === organ.organCard.color);
      if (alreadyHasColor) return ERRORS.ORGAN_ALREADY_EXISTS;
      return null;
    }
    case 'Contagio': {
      // Must have at least one virus to spread
      const hasVirus = player.body.some(o => o.viruses.length > 0);
      if (!hasVirus) return 'No tienes virus para contagiar';
      return null;
    }
    case 'Guante de látex':
      return null;
    case 'Error médico': {
      if (targets.length !== 1) return ERRORS.INVALID_TARGET;
      const targetPlayer = state.players.find(p => p.id === targets[0].playerId);
      if (!targetPlayer || targetPlayer.id === player.id) return ERRORS.INVALID_TARGET;
      return null;
    }
    default:
      return 'Tratamiento no implementado';
  }
};

/**
 * REDUCER (THE ENGINE)
 * Pure function.
 */
export const reduceGameState = (state: GameState, request: ActionRequest): GameState => {
  const error = validateAction(state, request);
  if (error) {
    console.error(`Acción inválida: ${error}`);
    return state;
  }

  let newState = { ...state };
  let { playerId, action } = request;
  const playerIndex = newState.players.findIndex(p => p.id === playerId);

  // Clone players to ensure immutability
  const players = newState.players.map(p => ({
    ...p,
    hand: [...p.hand],
    body: p.body.map(o => ({ ...o, viruses: [...o.viruses], medicines: [...o.medicines] }))
  }));
  const currentPlayer = players[playerIndex];

  // Map PLAY_CARD to specific actions
  if (action.type === 'PLAY_CARD') {
    const act = action as any; 
    const card = currentPlayer.hand.find(c => c.id === act.cardId)!;
    if (card.type === 'organ') {
      action = { type: 'PLAY_ORGAN', cardId: card.id };
    } else if (card.type === 'virus') {
      action = { type: 'PLAY_VIRUS', cardId: card.id, target: { playerId: act.targetPlayerId!, organId: act.targetOrganId! } };
    } else if (card.type === 'medicine') {
      action = { type: 'PLAY_MEDICINE', cardId: card.id, target: { playerId: act.targetPlayerId!, organId: act.targetOrganId! } };
    } else if (card.type === 'treatment') {
      const targets: Target[] = [];
      if (act.targetPlayerId) targets.push({ playerId: act.targetPlayerId, organId: act.targetOrganId });
      if (act.targetPlayerId2) targets.push({ playerId: act.targetPlayerId2, organId: act.targetOrganId2 });
      action = { type: 'PLAY_TREATMENT', cardId: card.id, targets };
    }
  }

  // Execute action logic
  switch (action.type) {
    case 'PLAY_ORGAN':
    case 'PLAY_VIRUS':
    case 'PLAY_MEDICINE':
    case 'PLAY_TREATMENT': {
      const cardIndex = currentPlayer.hand.findIndex(c => c.id === action.cardId);
      const [card] = currentPlayer.hand.splice(cardIndex, 1);

      if (action.type === 'PLAY_ORGAN') {
        currentPlayer.body = [...currentPlayer.body, {
          id: `organ-${Date.now()}-${Math.random()}`,
          organCard: card,
          viruses: [],
          medicines: [],
          isImmune: false
        }];
      } else if (action.type === 'PLAY_VIRUS') {
        const targetPlayer = players.find(p => p.id === action.target.playerId)!;
        const targetOrgan = targetPlayer.body.find(o => o.id === action.target.organId)!;

        if (targetOrgan.medicines.length > 0) {
          const [neutralizedMed] = targetOrgan.medicines.splice(targetOrgan.medicines.length - 1, 1);
          newState = {
            ...newState,
            discardPile: [...newState.discardPile, card, neutralizedMed]
          };
        } else {
          targetOrgan.viruses = [...targetOrgan.viruses, card];
          if (targetOrgan.viruses.length >= 2) {
            targetPlayer.body = targetPlayer.body.filter(o => o.id !== targetOrgan.id);
            newState = {
              ...newState,
              discardPile: [...newState.discardPile, targetOrgan.organCard, ...targetOrgan.viruses]
            };
          }
        }
      } else if (action.type === 'PLAY_MEDICINE') {
        const targetOrgan = currentPlayer.body.find(o => o.id === action.target.organId)!;

        if (targetOrgan.viruses.length > 0) {
          const [neutralizedVirus] = targetOrgan.viruses.splice(targetOrgan.viruses.length - 1, 1);
          newState = {
            ...newState,
            discardPile: [...newState.discardPile, card, neutralizedVirus]
          };
        } else {
          targetOrgan.medicines = [...targetOrgan.medicines, card];
          if (targetOrgan.medicines.length >= 2) {
            (targetOrgan as any).isImmune = true;
          }
        }
      } else if (action.type === 'PLAY_TREATMENT') {
        newState = resolveTreatment(newState, players, currentPlayer, card, action.targets);
        newState = { ...newState, discardPile: [...newState.discardPile, card] };
      }
      break;
    }

    case 'DISCARD': {
      action.cardIds.forEach(id => {
        const idx = currentPlayer.hand.findIndex(c => c.id === id);
        if (idx !== -1) {
          const [c] = currentPlayer.hand.splice(idx, 1);
          newState = { ...newState, discardPile: [...newState.discardPile, c] };
        }
      });
      break;
    }

    case 'PASS_TURN':
    case 'DRAW':
      break;
  }

  // 2. Draw cards (refill to 3)
  const finalPlayers = drawCards(players, newState.deck, newState.discardPile);

  // 3. Update State
  newState = {
    ...newState,
    players: finalPlayers.players,
    deck: finalPlayers.deck,
    discardPile: finalPlayers.discardPile,
    currentPlayerIndex: (newState.currentPlayerIndex + 1) % newState.players.length,
    turnCount: newState.turnCount + 1,
    lastAction: action
  };

  // 4. Check Victory
  const winner = newState.players.find(p => checkWin(p));
  if (winner) {
    newState = { ...newState, winnerId: winner.id, phase: 'GAME_OVER' };
  }

  return newState;
};

const resolveTreatment = (state: GameState, players: any[], actor: any, card: Card, targets: Target[]): GameState => {
  let newState = { ...state };

  switch (card.name) {
    case 'Transplante': {
      const [t1, t2] = targets;
      const p1 = players.find(p => p.id === t1.playerId);
      const p2 = players.find(p => p.id === t2.playerId);
      const o1Idx = p1.body.findIndex((o: any) => o.id === t1.organId);
      const o2Idx = p2.body.findIndex((o: any) => o.id === t2.organId);
      const o1 = p1.body[o1Idx];
      const o2 = p2.body[o2Idx];
      p1.body[o1Idx] = o2;
      p2.body[o2Idx] = o1;
      break;
    }
    case 'Ladrón de órganos': {
      const victim = players.find(p => p.id === targets[0].playerId);
      const organIdx = victim.body.findIndex((o: any) => o.id === targets[0].organId);
      const [stolen] = victim.body.splice(organIdx, 1);
      actor.body.push(stolen);
      break;
    }
    case 'Contagio': {
      // Logic: Move all viruses from actor's organs to other players' valid organs
      actor.body.forEach((o: any) => {
        while (o.viruses.length > 0) {
          const virus = o.viruses.pop();
          let infected = false;
          for (const p of players) {
            if (p.id === actor.id) continue;
            for (const targetOrgan of p.body) {
              const canInfect = !targetOrgan.isImmune &&
                                targetOrgan.viruses.length === 0 &&
                                targetOrgan.medicines.length === 0 &&
                                (virus.color === 'wildcard' || targetOrgan.organCard.color === 'wildcard' || virus.color === targetOrgan.organCard.color);
              if (canInfect) {
                targetOrgan.viruses.push(virus);
                infected = true;
                break;
              }
            }
            if (infected) break;
          }
          if (!infected) newState = { ...newState, discardPile: [...newState.discardPile, virus] };
        }
      });
      break;
    }
    case 'Guante de látex': {
      players.forEach(p => {
        if (p.id !== actor.id) {
          newState = { ...newState, discardPile: [...newState.discardPile, ...p.hand] };
          p.hand = [];
        }
      });
      break;
    }
    case 'Error médico': {
      const targetPlayer = players.find(p => p.id === targets[0].playerId);
      const tempBody = actor.body;
      actor.body = targetPlayer.body;
      targetPlayer.body = tempBody;
      break;
    }
  }
  return newState;
};

const drawCards = (players: any[], deck: readonly Card[], discard: readonly Card[]) => {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];

  const updatedPlayers = players.map(p => {
    while (p.hand.length < 3) {
      if (currentDeck.length === 0) {
        if (currentDiscard.length === 0) break;
        currentDeck = shuffle(currentDiscard);
        currentDiscard = [];
      }
      p.hand.push(currentDeck.pop()!);
    }
    return p;
  });

  return { players: updatedPlayers, deck: currentDeck, discardPile: currentDiscard };
};

export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const initGame = (players: { id: string, name: string }[]): GameState => {
  const deck = createInitialDeck();
  const shuffledDeck = shuffle(deck);

  const gamePlayers: Player[] = players.map(p => ({
    id: p.id,
    name: p.name,
    hand: [],
    body: []
  }));

  // Distribute 3 cards to each player
  let currentDeck = [...shuffledDeck];
  for (let i = 0; i < 3; i++) {
    for (const p of gamePlayers) {
      const card = currentDeck.pop();
      if (card) (p.hand as any[]).push(card);
    }
  }

  return {
    players: gamePlayers,
    currentPlayerIndex: 0,
    deck: currentDeck,
    discardPile: [],
    phase: 'PLAYING',
    winnerId: null,
    turnCount: 0
  };
};

const createInitialDeck = (): Card[] => {
  const deck: Card[] = [];
  const add = (count: number, type: any, color: any, name: string) => {
    for (let i = 0; i < count; i++) {
      deck.push({ id: `${type}-${color}-${i}-${Date.now()}-${Math.random()}`, type, color, name });
    }
  };

  // Organs
  add(5, 'organ', 'red', 'Corazón');
  add(5, 'organ', 'green', 'Estómago');
  add(5, 'organ', 'blue', 'Cerebro');
  add(5, 'organ', 'yellow', 'Hueso');
  add(1, 'organ', 'wildcard', 'Órgano Multicapa');

  // Viruses
  add(4, 'virus', 'red', 'Virus Rojo');
  add(4, 'virus', 'green', 'Virus Verde');
  add(4, 'virus', 'blue', 'Virus Azul');
  add(4, 'virus', 'yellow', 'Virus Amarillo');
  add(1, 'virus', 'wildcard', 'Virus Triple Mutación');

  // Medicines
  add(4, 'medicine', 'red', 'Medicina Roja');
  add(4, 'medicine', 'green', 'Medicina Verde');
  add(4, 'medicine', 'blue', 'Medicina Azul');
  add(4, 'medicine', 'yellow', 'Medicina Amarilla');
  add(4, 'medicine', 'wildcard', 'Medicina Universal');

  // Treatments
  add(2, 'treatment', 'wildcard', 'Transplante');
  add(2, 'treatment', 'wildcard', 'Ladrón de órganos');
  add(2, 'treatment', 'wildcard', 'Contagio');
  add(2, 'treatment', 'wildcard', 'Guante de látex');
  add(2, 'treatment', 'wildcard', 'Error médico');

  return deck;
};

export const checkWin = (player: Player): boolean => {
  const healthyOrgans = player.body.filter(o => o.viruses.length === 0);
  // Need 4 healthy distinct organs. Wildcard counts as a distinct type.
  const colors = new Set(healthyOrgans.map(o => o.organCard.color));
  return colors.size >= 4;
};
