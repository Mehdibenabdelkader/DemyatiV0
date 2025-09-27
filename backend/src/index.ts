/**
 * DEMYATI BACKEND SERVER
 * 
 * This is the main backend server for the Demyati multiplayer game application.
 * It provides both HTTP REST API endpoints and WebSocket (Socket.IO) real-time
 * communication for room management and game state synchronization.
 * 
 * The server handles:
 * - Room creation and management
 * - Player joining/leaving rooms
 * - Real-time updates via WebSocket
 * - Game state synchronization
 * - CORS for frontend communication
 * 
 * Architecture:
 * - Express.js for HTTP API
 * - Socket.IO for real-time communication
 * - In-memory storage for rooms (no database)
 * - TypeScript for type safety
 */

import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { 
  Player, 
  Room, 
  SocketEvents, 
  DEFAULT_BACKEND_PORT, 
  SOCKET_EVENTS, 
  HTTP_ENDPOINTS,
  generateRoomCode,
  validatePlayer,
  validateRoom,
  sanitizePlayer
} from './types';

// Initialize Express application with middleware
const app = express();
app.use(cors()); // Enable CORS for all routes (allows frontend to connect)
app.use(express.json()); // Parse JSON request bodies

// Create HTTP server and Socket.IO server
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // Allow connections from any origin
});

/**
 * In-Memory Room Storage
 * 
 * Simple in-memory storage for all game rooms. In a production environment,
 * this would typically be replaced with a database like Redis or PostgreSQL.
 * 
 * Structure: { [roomCode]: Room }
 * - Keys are 4-digit room codes (strings)
 * - Values are Room objects containing players and game state
 */
const rooms: Record<string, Room> = {};

/**
 * Player Connection Tracking
 * 
 * Tracks which socket is connected to which room and player.
 * This allows us to handle disconnections and broadcast appropriate messages.
 * 
 * Structure: { [socketId]: { roomCode: string, playerId: string } }
 */
const playerConnections: Record<string, { roomCode: string; playerId: string }> = {};

/**
 * HTTP REST API ENDPOINTS
 * 
 * These endpoints provide a RESTful API for room management.
 * They can be used by the frontend for initial data fetching and
 * as fallbacks when WebSocket connections are not available.
 */

/**
 * GET /rooms
 * 
 * Returns all available rooms as a JSON object.
 * Used by the frontend to get a complete list of rooms.
 * 
 * @returns JSON object with room codes as keys and Room objects as values
 */
app.get(HTTP_ENDPOINTS.ROOMS, (req: Request, res: Response) => {
  res.json(rooms);
});

/**
 * GET /rooms/:code
 * 
 * Returns a specific room by its code.
 * Used by the frontend to get detailed information about a single room.
 * 
 * @param code - The 4-digit room code
 * @returns Room object or 404 error if not found
 */
app.get(HTTP_ENDPOINTS.ROOM_BY_CODE(':code'), (req: Request, res: Response) => {
  const r = rooms[req.params.code];
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

/**
 * POST /rooms
 * 
 * Creates a new game room with the provided host player.
 * This is the primary way to create rooms via HTTP API.
 * 
 * Process:
 * 1. Validate the host player data
 * 2. Generate a unique 4-digit room code
 * 3. Create the room with the host as the first player
 * 4. Set host's starting tile to 1
 * 5. Broadcast the update to all connected clients
 * 6. Return the created room
 * 
 * @param host - Player object representing the room creator
 * @returns Created Room object or error response
 */
app.post(HTTP_ENDPOINTS.ROOMS, (req: Request, res: Response) => {
  const host = req.body.host;
  
  // Validate host player data
  if (!host || !validatePlayer(host)) {
    return res.status(400).json({ error: 'missing or invalid host' });
  }
  
  // Generate unique room code (retry if collision)
  let code = generateRoomCode();
  while (rooms[code]) code = generateRoomCode();
  
  // Sanitize host data and set starting position
  const sanitizedHost = sanitizePlayer(host);
  const hostWithTile = { ...sanitizedHost, tile: 1 };
  
  // Create new room
  const room: Room = { 
    code, 
    players: [hostWithTile], 
    started: false, 
    hostId: host.id 
  };
  
  // Store room and broadcast update
  rooms[code] = room;
  console.log(`[backend] Created room ${code} for host ${host.name} (${host.id})`);
  console.log(`[backend] Total rooms after creation:`, Object.keys(rooms).length);
  io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
  res.status(201).json(room);
});

/**
 * SOCKET.IO REAL-TIME COMMUNICATION
 * 
 * These handlers manage real-time communication between the frontend and backend.
 * Socket.IO provides bidirectional communication with automatic reconnection
 * and fallback mechanisms for better reliability than raw WebSockets.
 */

// Handle new socket connections
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  /**
   * Handle rooms:list event
   * 
   * Sends the current list of all rooms to the requesting client.
   * This is typically called when a client first connects to get
   * the initial state of all available rooms.
   */
  socket.on(SOCKET_EVENTS.ROOMS_LIST, () => {
    socket.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
  });

  /**
   * Handle rooms:create event
   * 
   * Creates a new room via WebSocket connection.
   * This is an alternative to the HTTP POST /rooms endpoint.
   * 
   * Process:
   * 1. Validate host player data
   * 2. Generate unique room code
   * 3. Create room with host as first player
   * 4. Broadcast update to all clients
   * 5. Send confirmation back to creator
   * 
   * @param host - Player object representing the room creator
   * @param cb - Callback function to send response back to client
   */
  socket.on(SOCKET_EVENTS.ROOMS_CREATE, (host: Player, cb) => {
    if (!validatePlayer(host)) {
      return cb && cb({ error: 'invalid host data' });
    }
    
    // Generate unique room code
    let code = generateRoomCode();
    while (rooms[code]) code = generateRoomCode();
    
    // Create room with sanitized host data
    const sanitizedHost = sanitizePlayer(host);
    const hostWithTile = { ...sanitizedHost, tile: 1 };
    const room: Room = { 
      code, 
      players: [hostWithTile], 
      started: false, 
      hostId: host.id 
    };
    
    // Store room and broadcast to all clients
    rooms[code] = room;
    
    // Track host connection
    playerConnections[socket.id] = { roomCode: code, playerId: host.id };
    
    console.log(`[backend] Socket created room ${code} for host ${host.name} (${host.id})`);
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  /**
   * Handle rooms:join event
   * 
   * Adds a player to an existing room.
   * If the player already exists in the room, they are replaced
   * (useful for reconnection scenarios).
   * 
   * Process:
   * 1. Validate room exists
   * 2. Validate player data
   * 3. Remove any existing player with same ID
   * 4. Add new player to room
   * 5. Track player connection
   * 6. Broadcast update to all clients
   * 7. Broadcast join message to room
   * 
   * @param code - 4-digit room code to join
   * @param player - Player object to add to the room
   * @param cb - Callback function to send response back to client
   */
  socket.on(SOCKET_EVENTS.ROOMS_JOIN, (code: string, player: Player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    if (!validatePlayer(player)) {
      return cb && cb({ error: 'invalid player data' });
    }
    
    // Check if this is a reconnection (player already exists in room)
    const existingPlayer = room.players.find((p) => p.id === player.id);
    const isReconnection = !!existingPlayer;
    
    // Remove existing player with same ID (for reconnection)
    room.players = room.players.filter((p) => p.id !== player.id);
    
    // Add new player with starting position
    const sanitizedPlayer = sanitizePlayer(player);
    room.players.push({ ...sanitizedPlayer, tile: 1 });
    rooms[code] = room;
    
    // Track player connection
    playerConnections[socket.id] = { roomCode: code, playerId: player.id };
    
    // Broadcast update to all clients
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    
    // Broadcast join message to all clients in the room
    io.emit(SOCKET_EVENTS.PLAYER_JOINED, { 
      playerName: player.name, 
      roomCode: code 
    });
    
    console.log(`[backend] Player ${player.name} ${isReconnection ? 'rejoined' : 'joined'} room ${code}`);
    
    if (typeof cb === 'function') cb(null, room);
  });

  /**
   * Handle rooms:leave event
   * 
   * Removes a player from a room. If the host leaves and there are
   * no other players, the room is deleted. Otherwise, the room
   * remains active for other players.
   * 
   * Process:
   * 1. Validate room exists
   * 2. Get player name before removal
   * 3. Remove player from room
   * 4. Clean up connection tracking
   * 5. If host left and no players remain, delete room
   * 6. Otherwise, keep room alive
   * 7. Broadcast update to all clients
   * 8. Broadcast leave message to room
   * 
   * @param code - 4-digit room code to leave
   * @param playerId - ID of the player leaving
   * @param cb - Callback function to send response back to client
   */
  socket.on(SOCKET_EVENTS.ROOMS_LEAVE, (code: string, playerId: string, cb) => {
    const room = rooms[code];
    if (!room) {
      console.log(`[backend] Room ${code} not found for player ${playerId} leave request`);
      return cb && cb({ error: 'not found' });
    }
    
    // Get player name before removal for broadcast message
    const leavingPlayer = room.players.find((p) => p.id === playerId);
    const playerName = leavingPlayer?.name || 'Unknown Player';
    
    console.log(`[backend] Player ${playerName} (${playerId}) leaving room ${code}, current players:`, room.players.length);
    console.log(`[backend] Room host: ${room.hostId}, leaving player: ${playerId}`);
    console.log(`[backend] Total rooms before leave:`, Object.keys(rooms).length);
    
    // Remove player from room
    room.players = room.players.filter((p) => p.id !== playerId);
    
    // Clean up connection tracking
    delete playerConnections[socket.id];
    
    // Only delete room if host explicitly leaves AND there are no other players
    // This prevents accidental room deletion during navigation
    if (room.hostId === playerId && room.players.length === 0) {
      console.log(`[backend] Host left and no players remaining, deleting room ${code}`);
      delete rooms[code];
      console.log(`[backend] Total rooms after deletion:`, Object.keys(rooms).length);
    } else {
      console.log(`[backend] Keeping room ${code} alive, remaining players:`, room.players.length);
      rooms[code] = room;
    }
    
    // Broadcast update to all clients
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    
    // Broadcast leave message to all clients in the room
    io.emit(SOCKET_EVENTS.PLAYER_LEFT, { 
      playerName: playerName, 
      roomCode: code 
    });
    
    if (typeof cb === 'function') cb(null, { ok: true });
  });

  /**
   * Handle rooms:updatePlayer event
   * 
   * Updates a player's information in a room (name, color, ready status, etc.).
   * This is used when players change their settings or game state.
   * 
   * Process:
   * 1. Validate room exists
   * 2. Validate player data
   * 3. Update player information in room
   * 4. Broadcast update to all clients
   * 
   * @param code - 4-digit room code
   * @param player - Updated player object
   * @param cb - Callback function to send response back to client
   */
  socket.on(SOCKET_EVENTS.ROOMS_UPDATE_PLAYER, (code: string, player: Player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    if (!validatePlayer(player)) {
      return cb && cb({ error: 'invalid player data' });
    }
    
    // Update player in room
    const sanitizedPlayer = sanitizePlayer(player);
    room.players = room.players.map((p) => (p.id === player.id ? sanitizedPlayer : p));
    rooms[code] = room;
    
    // Broadcast update to all clients
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  /**
   * Handle rooms:start event
   * 
   * Starts the game in a room by setting the started flag to true.
   * This prevents new players from joining and signals that gameplay has begun.
   * 
   * Process:
   * 1. Validate room exists
   * 2. Set room.started to true
   * 3. Broadcast update to all clients
   * 
   * @param code - 4-digit room code to start
   * @param cb - Callback function to send response back to client
   */
  socket.on(SOCKET_EVENTS.ROOMS_START, (code: string, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    room.started = true;
    rooms[code] = room;
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  /**
   * Handle socket disconnect
   * 
   * Handles cleanup when clients disconnect unexpectedly.
   * This includes broadcasting leave messages and cleaning up connection tracking.
   * However, we keep the player in the room so they can rejoin.
   */
  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
    
    // Check if this socket was connected to a room
    const connection = playerConnections[socket.id];
    if (connection) {
      const { roomCode, playerId } = connection;
      const room = rooms[roomCode];
      
      if (room) {
        // Find the player to get their name
        const player = room.players.find((p) => p.id === playerId);
        const playerName = player?.name || 'Unknown Player';
        
        console.log(`[backend] Player ${playerName} (${playerId}) disconnected from room ${roomCode}`);
        
        // Broadcast leave message to all clients in the room
        io.emit(SOCKET_EVENTS.PLAYER_LEFT, { 
          playerName: playerName, 
          roomCode: roomCode 
        });
        
        // Note: We don't remove the player from the room here
        // This allows them to rejoin when they reconnect
        // The player will be replaced when they rejoin via rooms:join
      }
      
      // Clean up connection tracking
      delete playerConnections[socket.id];
    }
  });
});

/**
 * SERVER STARTUP
 * 
 * Starts the HTTP server and begins listening for connections.
 * The server will handle both HTTP requests and WebSocket connections
 * on the same port.
 */
const PORT = process.env.PORT || DEFAULT_BACKEND_PORT;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
