/**
 * VIRUS-NET CORE MODELS
 * Authoritative, serializable, and immutable.
 */

export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'wildcard';
export type CardType = 'organ' | 'virus' | 'medicine' | 'treatment';

export interface Card {
  readonly id: string;
  readonly type: CardType;
  readonly color: CardColor;
  readonly name: string;
  readonly description?: string;
}

export interface OrganState {
  readonly id: string;
  readonly organCard: Card;
  readonly viruses: readonly Card[];     // Max 2
  readonly medicines: readonly Card[];   // Max 2
  readonly isImmune: boolean;           // True if medicines.length == 2
}

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly hand: readonly Card[];
  readonly body: readonly OrganState[]; // Max 4/5 slots? Rules say 4 healthy to win.
}

export type GamePhase = 'WAITING' | 'PLAYING' | 'DISCARDING' | 'DRAWING' | 'GAME_OVER';

export interface GameState {
  readonly players: readonly Player[];
  readonly currentPlayerIndex: number;
  readonly deck: readonly Card[];
  readonly discardPile: readonly Card[];
  readonly phase: GamePhase;
  readonly winnerId: string | null;
  readonly turnCount: number;
  readonly lastAction?: GameAction;
}

/**
 * ACTION SYSTEM
 */

export type Target = {
  playerId: string;
  organId?: string;
};

export type PlayOrganAction = {
  type: 'PLAY_ORGAN';
  cardId: string;
};

export type PlayVirusAction = {
  type: 'PLAY_VIRUS';
  cardId: string;
  target: Target;
};

export type PlayMedicineAction = {
  type: 'PLAY_MEDICINE';
  cardId: string;
  target: Target;
};

export type PlayTreatmentAction = {
  type: 'PLAY_TREATMENT';
  cardId: string;
  targets: Target[]; // Some need 1, some 2
};

export type DiscardAction = {
  type: 'DISCARD';
  cardIds: string[];
};

export type PassTurnAction = {
  type: 'PASS_TURN';
};

export type PlayCardAction = {
  type: 'PLAY_CARD';
  cardId: string;
  targetPlayerId?: string;
  targetOrganId?: string;
  targetPlayerId2?: string;
  targetOrganId2?: string;
};

export type DrawAction = {
  type: 'DRAW';
};

export type GameAction = 
  | PlayOrganAction 
  | PlayVirusAction 
  | PlayMedicineAction 
  | PlayTreatmentAction 
  | PlayCardAction
  | DrawAction
  | DiscardAction 
  | PassTurnAction;

export interface ActionRequest {
  playerId: string;
  action: GameAction;
}

export interface CardImageMap {
  heart: string;
  brain: string;
  stomach: string;
  bone: string;
  wildcard: string;
  virus_red: string;
  virus_green: string;
  virus_blue: string;
  virus_yellow: string;
  virus_wildcard: string;
  med_red: string;
  med_green: string;
  med_blue: string;
  med_yellow: string;
  med_wildcard: string;
  sp_transplant: string;
  sp_thief: string;
  sp_infection: string;
  sp_error: string;
  sp_glove: string;
  default?: string;
}
