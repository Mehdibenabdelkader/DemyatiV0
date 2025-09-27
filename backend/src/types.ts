/**
 * BACKEND TYPES AND UTILITIES
 * 
 * This module contains all the types, constants, and utility functions
 * used by the backend server. These are copied from the shared module
 * to ensure the backend has all necessary dependencies without requiring
 * the shared module to be built separately.
 * 
 * In a production environment, this would typically import from the
 * shared module instead of duplicating code.
 */

/**
 * Player Interface
 * 
 * Represents a single player in the game with all their essential properties.
 * This is the core data structure for user information throughout the application.
 * 
 * @property id - Unique identifier for the player (generated client-side)
 * @property name - Display name chosen by the player
 * @property color - Hex color code for the player's game piece/avatar
 * @property ready - Boolean indicating if player is ready to start the game
 * @property tile - Optional current position on the game board (1-200)
 * @property isHost - Optional flag indicating if this player created the room
 */
export interface Player {
  id: string;
  name: string;
  color: string;
  ready: boolean;
  tile?: number;
  isHost?: boolean;
}

/**
 * Room Interface
 * 
 * Represents a game room/room where players gather before and during gameplay.
 * Contains all the information needed to manage a multiplayer game session.
 * 
 * @property code - Unique 4-digit room code for players to join
 * @property players - Array of all players currently in the room
 * @property started - Boolean indicating if the game has begun
 * @property hostId - ID of the player who created the room (has special privileges)
 */
export interface Room {
  code: string;
  players: Player[];
  started: boolean;
  hostId?: string;
}

/**
 * SocketEvents Interface
 * 
 * Defines all the Socket.IO event types used for real-time communication
 * between the frontend and backend. Each event has a specific signature
 * that defines what data is sent and what callback is expected.
 * 
 * This ensures type safety for all socket communications and makes it clear
 * what events are available and how they should be used.
 */
export interface SocketEvents {
  'rooms:list': () => void;
  'rooms:create': (host: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:join': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:leave': (code: string, playerId: string, callback: (error: any, result?: { ok: boolean }) => void) => void;
  'rooms:updatePlayer': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:start': (code: string, callback: (error: any, room?: Room) => void) => void;
  'rooms:update': (rooms: Record<string, Room>) => void;
  'player:joined': (data: { playerName: string; roomCode: string }) => void;
  'player:left': (data: { playerName: string; roomCode: string }) => void;
}

/**
 * Backend Server Configuration
 * 
 * These constants define the default backend server configuration.
 * The port and URL are used by the frontend to connect to the backend API.
 */
export const DEFAULT_BACKEND_PORT = 4000;
export const DEFAULT_BACKEND_URL = `http://localhost:${DEFAULT_BACKEND_PORT}`;

/**
 * Player Color Palette
 * 
 * Array of hex color codes that players can choose from for their game pieces.
 * These colors are used to visually distinguish players on the game board.
 * The colors are carefully selected to be distinct and accessible.
 * 
 * Colors are defined as a const assertion to ensure type safety and prevent
 * accidental modifications to the color palette.
 */
export const PLAYER_COLORS = [
  "#ef4444", // red - vibrant and easily distinguishable
  "#f59e0b", // amber - warm orange-yellow
  "#84cc16", // lime - bright green
  "#06b6d4", // cyan - bright blue-cyan
  "#6366f1", // indigo - deep blue-purple
  "#ec4899"  // pink - vibrant magenta
] as const;

/**
 * Game Configuration Constants
 * 
 * These constants define the core game rules and limitations.
 * They control how the game behaves and what constraints are enforced.
 * 
 * @property MAX_PLAYERS - Maximum number of players allowed in a single room
 * @property MIN_PLAYERS - Minimum number of players required to start a game
 * @property BOARD_SIZE - Total number of tiles on the game board (1-200)
 * @property STARTING_TILE - Tile number where all players begin (tile 1)
 * @property DICE_MIN - Minimum value for dice roll (2, since it's two dice)
 * @property DICE_MAX - Maximum value for dice roll (12, since it's two dice)
 */
export const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MIN_PLAYERS: 2,
  BOARD_SIZE: 200,
  STARTING_TILE: 1,
  DICE_MIN: 2,
  DICE_MAX: 12
} as const;

/**
 * Socket.IO Event Names
 * 
 * These constants define all the Socket.IO event names used for real-time
 * communication between the frontend and backend. Using constants instead
 * of string literals prevents typos and makes refactoring easier.
 * 
 * The events follow a consistent naming pattern: 'rooms:action'
 * where 'rooms' is the namespace and 'action' describes what the event does.
 */
export const SOCKET_EVENTS = {
  ROOMS_LIST: 'rooms:list',           // Request list of all rooms
  ROOMS_CREATE: 'rooms:create',       // Create a new room
  ROOMS_JOIN: 'rooms:join',           // Join an existing room
  ROOMS_LEAVE: 'rooms:leave',         // Leave a room
  ROOMS_UPDATE_PLAYER: 'rooms:updatePlayer', // Update player information
  ROOMS_START: 'rooms:start',         // Start the game in a room
  ROOMS_UPDATE: 'rooms:update',       // Broadcast room updates to all clients
  PLAYER_JOINED: 'player:joined',     // Broadcast when a player joins
  PLAYER_LEFT: 'player:left'          // Broadcast when a player leaves
} as const;

/**
 * HTTP API Endpoints
 * 
 * These constants define the REST API endpoints used for HTTP communication
 * between the frontend and backend. The function for ROOM_BY_CODE allows
 * dynamic generation of room-specific endpoints.
 * 
 * @property ROOMS - Base endpoint for room operations (/rooms)
 * @property ROOM_BY_CODE - Function that generates room-specific endpoints
 */
export const HTTP_ENDPOINTS = {
  ROOMS: '/rooms',
  ROOM_BY_CODE: (code: string) => `/rooms/${code}`
} as const;

/**
 * Generate Room Code
 * 
 * Creates a unique 4-digit room code for players to join.
 * The code is generated as a random number between 1000-9999.
 * 
 * @returns A 4-digit string room code
 * 
 * @example
 * generateRoomCode() // "1234"
 * generateRoomCode() // "7890"
 */
export function generateRoomCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate Player ID
 * 
 * Creates a unique identifier for a player using a random string.
 * The ID is generated using base36 encoding of a random number,
 * resulting in a short but unique identifier.
 * 
 * @returns A random string ID (typically 7 characters)
 * 
 * @example
 * generatePlayerId() // "a1b2c3d"
 * generatePlayerId() // "x9y8z7w"
 */
export function generatePlayerId(): string {
  return Math.random().toString(36).slice(2, 9);
}

/**
 * Get Random Color
 * 
 * Selects a random color from the predefined player color palette.
 * This ensures all players get a valid color from the approved list.
 * 
 * @returns A hex color code from the PLAYER_COLORS array
 * 
 * @example
 * getRandomColor() // "#ef4444"
 * getRandomColor() // "#06b6d4"
 */
export function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}

/**
 * Validate Player Object
 * 
 * Performs comprehensive validation on a player object to ensure
 * it contains all required fields with correct types and values.
 * This is used to validate data before processing or storing.
 * 
 * @param player - The player object to validate
 * @returns True if the player object is valid, false otherwise
 * 
 * @example
 * validatePlayer({ id: "123", name: "John", color: "#ff0000", ready: true }) // true
 * validatePlayer({ id: "", name: "John", color: "#ff0000", ready: true }) // false
 * validatePlayer(null) // false
 */
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

/**
 * Validate Room Object
 * 
 * Performs validation on a room object to ensure it contains
 * all required fields with correct types and structure.
 * This is used to validate room data before processing.
 * 
 * @param room - The room object to validate
 * @returns True if the room object is valid, false otherwise
 * 
 * @example
 * validateRoom({ code: "1234", players: [], started: false }) // true
 * validateRoom({ code: "", players: [], started: false }) // false
 * validateRoom(null) // false
 */
export function validateRoom(room: any): boolean {
  return (
    room &&
    typeof room.code === 'string' &&
    Array.isArray(room.players) &&
    typeof room.started === 'boolean' &&
    room.code.length > 0
  );
}

/**
 * Sanitize Player Object
 * 
 * Cleans and normalizes a player object to ensure all fields
 * have the correct types and default values. This prevents
 * issues with malformed data and provides safe defaults.
 * 
 * @param player - The player object to sanitize
 * @returns A sanitized player object with proper types and defaults
 * 
 * @example
 * sanitizePlayer({ id: 123, name: "  John  ", color: null, ready: "true" })
 * // { id: "123", name: "John", color: "#ef4444", ready: true, tile: 1, isHost: false }
 */
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
