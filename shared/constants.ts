// Shared constants between frontend and backend
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
