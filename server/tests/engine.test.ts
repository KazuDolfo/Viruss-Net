import { describe, it, expect, beforeEach } from 'vitest';
import { initGame, reduceGameState, validateAction, ERRORS, checkWin } from '../../shared/engine.ts';
import { GameState, Card, Player } from '../../shared/models.ts';

describe('Virus Game Engine', () => {
  let state: GameState;
  let p1: Player;
  let p2: Player;

  beforeEach(() => {
    state = initGame([
      { id: 'p1', name: 'Alice' },
      { id: 'p2', name: 'Bob' }
    ]);
    p1 = state.players[0];
    p2 = state.players[1];
  });

  describe('initGame', () => {
    it('should initialize with correct number of players and hands', () => {
      expect(state.players.length).toBe(2);
      expect(state.players[0].hand.length).toBe(3);
      expect(state.players[1].hand.length).toBe(3);
      expect(state.currentPlayerIndex).toBe(0);
      expect(state.phase).toBe('PLAYING');
    });
  });

  describe('Turn Management', () => {
    it('should block action if not players turn', () => {
      const p2Card = p2.hand[0];
      const error = validateAction(state, {
        playerId: p2.id,
        action: { type: 'DISCARD', cardIds: [p2Card.id] }
      });
      expect(error).toBe(ERRORS.NOT_YOUR_TURN);
    });

    it('should advance turn on valid action', () => {
      const p1Card = p1.hand[0];
      const nextState = reduceGameState(state, {
        playerId: p1.id,
        action: { type: 'DISCARD', cardIds: [p1Card.id] }
      });
      expect(nextState.currentPlayerIndex).toBe(1);
      expect(nextState.players[0].hand.length).toBe(3); // Refilled
    });
  });

  describe('PLAY_ORGAN', () => {
    it('should allow playing an organ if color is not in body', () => {
      // Find an organ in deck and force it into hand
      const organ = state.deck.find(c => c.type === 'organ')!;
      state = {
        ...state,
        players: state.players.map((p, i) => i === 0 ? { ...p, hand: [organ] } : p)
      };

      const error = validateAction(state, {
        playerId: p1.id,
        action: { type: 'PLAY_CARD', cardId: organ.id }
      });
      expect(error).toBeNull();

      const nextState = reduceGameState(state, {
        playerId: p1.id,
        action: { type: 'PLAY_CARD', cardId: organ.id }
      });

      expect(nextState.players[0].body.length).toBe(1);
      expect(nextState.players[0].body[0].organCard.id).toBe(organ.id);
    });

    it('should reject playing an organ if color already exists', () => {
      const redOrgan: Card = { id: 'c1', type: 'organ', color: 'red', name: 'Corazón' };
      const redOrgan2: Card = { id: 'c2', type: 'organ', color: 'red', name: 'Corazón 2' };
      
      state = {
        ...state,
        players: state.players.map((p, i) => i === 0 ? { 
          ...p, 
          hand: [redOrgan2],
          body: [{ id: 'o1', organCard: redOrgan, viruses: [], medicines: [], isImmune: false }] 
        } : p)
      };

      const error = validateAction(state, {
        playerId: p1.id,
        action: { type: 'PLAY_CARD', cardId: redOrgan2.id }
      });
      
      expect(error).toBe(ERRORS.ORGAN_ALREADY_EXISTS);
    });
  });

  describe('PLAY_VIRUS', () => {
    it('should allow playing a virus on opponents organ of same color', () => {
      const redOrgan: Card = { id: 'o1', type: 'organ', color: 'red', name: 'Corazón' };
      const redVirus: Card = { id: 'v1', type: 'virus', color: 'red', name: 'Virus rojo' };
      
      state = {
        ...state,
        players: state.players.map((p, i) => {
          if (i === 0) return { ...p, hand: [redVirus] }; // p1 has virus
          if (i === 1) return { ...p, body: [{ id: 'target_org', organCard: redOrgan, viruses: [], medicines: [], isImmune: false }] }; // p2 has organ
          return p;
        })
      };

      const error = validateAction(state, {
        playerId: p1.id,
        action: { type: 'PLAY_VIRUS', cardId: redVirus.id, target: { playerId: p2.id, organId: 'target_org' } }
      });
      expect(error).toBeNull();
    });

    it('should reject playing a virus on immune organ', () => {
      const redOrgan: Card = { id: 'o1', type: 'organ', color: 'red', name: 'Corazón' };
      const redVirus: Card = { id: 'v1', type: 'virus', color: 'red', name: 'Virus rojo' };
      
      state = {
        ...state,
        players: state.players.map((p, i) => {
          if (i === 0) return { ...p, hand: [redVirus] };
          if (i === 1) return { ...p, body: [{ id: 'target_org', organCard: redOrgan, viruses: [], medicines: [{id: 'm1'}, {id: 'm2'}] as any[], isImmune: true }] };
          return p;
        })
      };

      const error = validateAction(state, {
        playerId: p1.id,
        action: { type: 'PLAY_VIRUS', cardId: redVirus.id, target: { playerId: p2.id, organId: 'target_org' } }
      });
      expect(error).toBe(ERRORS.IMMUNE_TARGET);
    });
  });

  describe('PLAY_MEDICINE', () => {
    it('should allow playing medicine on own organ of same color', () => {
      const redOrgan: Card = { id: 'o1', type: 'organ', color: 'red', name: 'Corazón' };
      const redMed: Card = { id: 'm1', type: 'medicine', color: 'red', name: 'Medicina roja' };
      
      state = {
        ...state,
        players: state.players.map((p, i) => {
          if (i === 0) return { 
            ...p, 
            hand: [redMed],
            body: [{ id: 'my_org', organCard: redOrgan, viruses: [], medicines: [], isImmune: false }] 
          };
          return p;
        })
      };

      const error = validateAction(state, {
        playerId: p1.id,
        action: { type: 'PLAY_MEDICINE', cardId: redMed.id, target: { playerId: p1.id, organId: 'my_org' } }
      });
      expect(error).toBeNull();
    });
  });

  describe('Victory Conditions', () => {
    it('should return true if player has 4 distinct healthy organs', () => {
      const healthyBody = [
        { id: 'o1', organCard: { id: 'c1', type: 'organ', color: 'red', name: '' }, viruses: [], medicines: [], isImmune: false },
        { id: 'o2', organCard: { id: 'c2', type: 'organ', color: 'blue', name: '' }, viruses: [], medicines: [], isImmune: false },
        { id: 'o3', organCard: { id: 'c3', type: 'organ', color: 'green', name: '' }, viruses: [], medicines: [], isImmune: false },
        { id: 'o4', organCard: { id: 'c4', type: 'organ', color: 'yellow', name: '' }, viruses: [], medicines: [], isImmune: false },
      ] as any;
      
      expect(checkWin({ ...p1, body: healthyBody })).toBe(true);
    });

    it('should return false if organ has viruses', () => {
      const infectedBody = [
        { id: 'o1', organCard: { id: 'c1', type: 'organ', color: 'red', name: '' }, viruses: [{ id: 'v1', type: 'virus', color: 'red', name: '' }], medicines: [], isImmune: false },
        { id: 'o2', organCard: { id: 'c2', type: 'organ', color: 'blue', name: '' }, viruses: [], medicines: [], isImmune: false },
        { id: 'o3', organCard: { id: 'c3', type: 'organ', color: 'green', name: '' }, viruses: [], medicines: [], isImmune: false },
        { id: 'o4', organCard: { id: 'c4', type: 'organ', color: 'yellow', name: '' }, viruses: [], medicines: [], isImmune: false },
      ] as any;
      
      expect(checkWin({ ...p1, body: infectedBody })).toBe(false);
    });
  });
});
