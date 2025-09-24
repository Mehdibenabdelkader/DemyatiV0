// Shared types and utilities for frontend (copied from shared module)
export interface Player {
  id: string;
  name: string;
  color: string;
  ready: boolean;
  tile?: number;
  isHost?: boolean;
}

export interface Room {
  code: string;
  players: Player[];
  started: boolean;
  hostId?: string;
}

export interface SocketEvents {
  'rooms:list': () => void;
  'rooms:create': (host: Player, callback: (error: unknown, room?: Room) => void) => void;
  'rooms:join': (code: string, player: Player, callback: (error: unknown, room?: Room) => void) => void;
  'rooms:leave': (code: string, playerId: string, callback: (error: unknown, result?: { ok: boolean }) => void) => void;
  'rooms:updatePlayer': (code: string, player: Player, callback: (error: unknown, room?: Room) => void) => void;
  'rooms:start': (code: string, callback: (error: unknown, room?: Room) => void) => void;
  'rooms:update': (rooms: Record<string, Room>) => void;
}

export const DEFAULT_BACKEND_URL = "http://localhost:4000";

export const PLAYER_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#ec4899"  // pink
] as const;

export const SOCKET_EVENTS = {
  ROOMS_LIST: 'rooms:list',
  ROOMS_CREATE: 'rooms:create',
  ROOMS_JOIN: 'rooms:join',
  ROOMS_LEAVE: 'rooms:leave',
  ROOMS_UPDATE_PLAYER: 'rooms:updatePlayer',
  ROOMS_START: 'rooms:start',
  ROOMS_UPDATE: 'rooms:update'
} as const;

export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}
