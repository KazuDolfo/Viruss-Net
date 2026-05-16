export interface Reaction {
  id: string;
  type: 'emoji' | 'text';
  value: string;
  animation?: 'burst' | 'spin' | 'shake' | 'slide';
}

export const REACTIONS: Reaction[] = [
  { id: 'laugh', type: 'emoji', value: '😂', animation: 'burst' },
  { id: 'angry', type: 'emoji', value: '😠', animation: 'shake' },
  { id: 'surprised', type: 'emoji', value: '😮', animation: 'burst' },
  { id: 'love', type: 'emoji', value: '❤️', animation: 'burst' },
  { id: 'sick', type: 'emoji', value: '🤮', animation: 'slide' },
  { id: 'cool', type: 'emoji', value: '😎', animation: 'spin' },
  { id: 'thinking', type: 'emoji', value: '🤔', animation: 'slide' },
  { id: 'mindblown', type: 'emoji', value: '🤯', animation: 'burst' },
  { id: 'cry', type: 'emoji', value: '😭', animation: 'shake' },
  { id: 'fire', type: 'emoji', value: '🔥', animation: 'burst' }
];

export interface SocialEvent {
  playerId: string;
  reactionId?: string;
  text?: string;
  timestamp: number;
}
