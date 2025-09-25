/**
 * SHARED UTILITIES MODULE
 * 
 * This module contains utility functions that are shared between the frontend
 * and backend applications. These functions provide common functionality
 * for data generation, validation, and sanitization.
 * 
 * All functions are pure functions with no side effects, making them safe
 * to use in both client and server environments.
 */

import { PLAYER_COLORS } from './constants';

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
