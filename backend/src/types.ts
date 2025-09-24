// Shared types for backend (copied from shared module)
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
  'rooms:create': (host: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:join': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:leave': (code: string, playerId: string, callback: (error: any, result?: { ok: boolean }) => void) => void;
  'rooms:updatePlayer': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:start': (code: string, callback: (error: any, room?: Room) => void) => void;
  'rooms:update': (rooms: Record<string, Room>) => void;
}

export const DEFAULT_BACKEND_PORT = 4000;
export const DEFAULT_BACKEND_URL = `http://localhost:${DEFAULT_BACKEND_PORT}`;

export const PLAYER_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#6366f1", // indigo
  "#ec4899"  // pink
] as const;

export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  BOARD_SIZE: 200,
  STARTING_TILE: 1,
  DICE_MIN: 2,
  DICE_MAX: 12
} as const;

export const SOCKET_EVENTS = {
  ROOMS_LIST: 'rooms:list',
  ROOMS_CREATE: 'rooms:create',
  ROOMS_JOIN: 'rooms:join',
  ROOMS_LEAVE: 'rooms:leave',
  ROOMS_UPDATE_PLAYER: 'rooms:updatePlayer',
  ROOMS_START: 'rooms:start',
  ROOMS_UPDATE: 'rooms:update'
} as const;

export const HTTP_ENDPOINTS = {
  ROOMS: '/rooms',
  ROOM_BY_CODE: (code: string) => `/rooms/${code}`
} as const;

export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

export function validatePlayer(player: any): boolean {
  return (
    player &&
    typeof player.id === 'string' &&
    typeof player.name === 'string' &&
    typeof player.color === 'string' &&
    typeof player.ready === 'boolean' &&
    player.id.length > 0 &&
    player.name.trim().length > 0
  );
}

export function validateRoom(room: any): boolean {
  return (
    room &&
    typeof room.code === 'string' &&
    Array.isArray(room.players) &&
    typeof room.started === 'boolean' &&
    room.code.length > 0
  );
}

export function sanitizePlayer(player: any) {
  return {
    id: String(player.id || ''),
    name: String(player.name || '').trim(),
    color: String(player.color || '#ef4444'),
    ready: Boolean(player.ready),
    tile: typeof player.tile === 'number' ? player.tile : 1,
    isHost: Boolean(player.isHost)
  };
}
