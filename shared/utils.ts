// Shared utility functions between frontend and backend
import { PLAYER_COLORS } from './constants';

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
