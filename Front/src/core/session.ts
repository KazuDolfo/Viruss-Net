const STORAGE_KEYS = {
  SESSION_TOKEN: 'virus_session_token',
  PLAYER_ID: 'virus_player_id',
  PLAYER_NAME: 'virus_player_name',
  ROOM_CODE: 'virus_room_code',
} as const;

export interface SessionData {
  sessionToken: string | null;
  playerId: string | null;
  playerName: string | null;
  roomCode: string | null;
}

export const sessionManager = {
  save(data: Partial<SessionData>) {
    if (data.sessionToken) localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, data.sessionToken);
    if (data.playerId) localStorage.setItem(STORAGE_KEYS.PLAYER_ID, data.playerId);
    if (data.playerName) localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, data.playerName);
    if (data.roomCode) localStorage.setItem(STORAGE_KEYS.ROOM_CODE, data.roomCode);
  },

  get(): SessionData {
    return {
      sessionToken: localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN),
      playerId: localStorage.getItem(STORAGE_KEYS.PLAYER_ID),
      playerName: localStorage.getItem(STORAGE_KEYS.PLAYER_NAME),
      roomCode: localStorage.getItem(STORAGE_KEYS.ROOM_CODE),
    };
  },

  clear() {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  },

  hasSession(): boolean {
    const { sessionToken, playerId, roomCode } = this.get();
    return !!(sessionToken && playerId && roomCode);
  },
};
