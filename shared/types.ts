/**
 * SHARED TYPES MODULE
 * 
 * This module contains all TypeScript interfaces and types that are shared between
 * the frontend and backend applications. This ensures type consistency across
 * the entire application stack.
 * 
 * The types defined here represent the core data structures used throughout
 * the Demyati game application, including player information, room management,
 * and communication protocols.
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
 * CreateRoomRequest Interface
 * 
 * Request payload for creating a new game room.
 * Contains the host player information who will create the room.
 * 
 * @property host - Player object representing the room creator
 */
export interface CreateRoomRequest {
  host: Player;
}

/**
 * JoinRoomRequest Interface
 * 
 * Request payload for joining an existing game room.
 * Contains both the room code to join and the player information.
 * 
 * @property code - 4-digit room code to join
 * @property player - Player object representing who wants to join
 */
export interface JoinRoomRequest {
  code: string;
  player: Player;
}

/**
 * UpdatePlayerRequest Interface
 * 
 * Request payload for updating a player's information in a room.
 * Used when a player changes their name, color, or ready status.
 * 
 * @property code - Room code where the player is located
 * @property player - Updated player object with new information
 */
export interface UpdatePlayerRequest {
  code: string;
  player: Player;
}

/**
 * LeaveRoomRequest Interface
 * 
 * Request payload for a player leaving a room.
 * Only requires the room code and player ID for identification.
 * 
 * @property code - Room code to leave
 * @property playerId - ID of the player leaving
 */
export interface LeaveRoomRequest {
  code: string;
  playerId: string;
}

/**
 * StartGameRequest Interface
 * 
 * Request payload for starting a game in a room.
 * Only requires the room code as the host can start the game.
 * 
 * @property code - Room code where the game should start
 */
export interface StartGameRequest {
  code: string;
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
}

/**
 * ApiResponse Interface
 * 
 * Generic response wrapper for HTTP API calls.
 * Provides a consistent structure for all API responses with optional data,
 * error messages, and success status.
 * 
 * @property data - Optional response data (type depends on the specific API call)
 * @property error - Optional error message if the request failed
 * @property success - Boolean indicating if the request was successful
 */
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

/**
 * RoomListResponse Interface
 * 
 * Specific response type for the rooms list API endpoint.
 * Returns a record of all available rooms indexed by their room codes.
 * 
 * @property rooms - Object where keys are room codes and values are Room objects
 */
export interface RoomListResponse {
  rooms: Record<string, Room>;
}

/**
 * RoomResponse Interface
 * 
 * Specific response type for single room API endpoints.
 * Returns a single room object wrapped in a response structure.
 * 
 * @property room - The requested Room object
 */
export interface RoomResponse {
  room: Room;
}
