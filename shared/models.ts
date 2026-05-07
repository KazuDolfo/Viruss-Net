export type CardColor = 'red' | 'blue' | 'green' | 'yellow' | 'multicolor';
export type CardType = 'organ' | 'virus' | 'medicine' | 'special';

export interface Card {
  id: string;
  type: CardType;
  color: CardColor;
  name: string;
  description?: string;
}

export interface OrganState {
  id: string; // Unique ID for this specific organ slot
  organCard: Card;
  virus: Card[];
  medicines: Card[];
  isImmune: boolean;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  organs: OrganState[];
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  deck: Card[];
  discardPile: Card[];
  winner: Player | null;
  logs: string[];
  needsDrawing: boolean;
}

export type CardImageMap = {
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
};
