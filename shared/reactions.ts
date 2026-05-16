export interface Reaction {
  id: string;
  type: 'emoji' | 'text';
  value: string;
}

export const REACTIONS: Reaction[] = [
  { id: 'laugh', type: 'emoji', value: '😂' },
  { id: 'angry', type: 'emoji', value: '😠' },
  { id: 'surprised', type: 'emoji', value: '😮' },
  { id: 'love', type: 'emoji', value: '❤️' },
  { id: 'sick', type: 'emoji', value: '🤮' },
  { id: 'cool', type: 'emoji', value: '😎' }
];

export interface SocialEvent {
  playerId: string;
  reactionId?: string;
  text?: string;
  timestamp: number;
}
