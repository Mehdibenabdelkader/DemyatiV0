/**
 * SHARED CONSTANTS MODULE
 * 
 * This module contains all constant values that are shared between the frontend
 * and backend applications. These constants define configuration values,
 * color schemes, game rules, and API endpoints used throughout the application.
 * 
 * Using constants instead of magic numbers/strings improves maintainability
 * and ensures consistency across the entire codebase.
 */

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
  ROOMS_UPDATE: 'rooms:update'        // Broadcast room updates to all clients
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
