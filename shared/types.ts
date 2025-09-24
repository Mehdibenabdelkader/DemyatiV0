// Shared types between frontend and backend
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

export interface CreateRoomRequest {
  host: Player;
}

export interface JoinRoomRequest {
  code: string;
  player: Player;
}

export interface UpdatePlayerRequest {
  code: string;
  player: Player;
}

export interface LeaveRoomRequest {
  code: string;
  playerId: string;
}

export interface StartGameRequest {
  code: string;
}

// Socket event types
export interface SocketEvents {
  'rooms:list': () => void;
  'rooms:create': (host: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:join': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:leave': (code: string, playerId: string, callback: (error: any, result?: { ok: boolean }) => void) => void;
  'rooms:updatePlayer': (code: string, player: Player, callback: (error: any, room?: Room) => void) => void;
  'rooms:start': (code: string, callback: (error: any, room?: Room) => void) => void;
  'rooms:update': (rooms: Record<string, Room>) => void;
}

// HTTP API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface RoomListResponse {
  rooms: Record<string, Room>;
}

export interface RoomResponse {
  room: Room;
}
