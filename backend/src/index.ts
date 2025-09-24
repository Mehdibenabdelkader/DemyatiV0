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

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Simple in-memory room store mirroring frontend shape
const rooms: Record<string, Room> = {}; // { [code]: { code, players:[], started, hostId } }

// HTTP endpoints
app.get(HTTP_ENDPOINTS.ROOMS, (req: Request, res: Response) => {
  res.json(rooms);
});

app.get(HTTP_ENDPOINTS.ROOM_BY_CODE(':code'), (req: Request, res: Response) => {
  const r = rooms[req.params.code];
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

// Basic room creation via HTTP POST
app.post(HTTP_ENDPOINTS.ROOMS, (req: Request, res: Response) => {
  const host = req.body.host;
  if (!host || !validatePlayer(host)) {
    return res.status(400).json({ error: 'missing or invalid host' });
  }
  
  let code = generateRoomCode();
  while (rooms[code]) code = generateRoomCode();
  
  const sanitizedHost = sanitizePlayer(host);
  const hostWithTile = { ...sanitizedHost, tile: 1 };
  const room: Room = { 
    code, 
    players: [hostWithTile], 
    started: false, 
    hostId: host.id 
  };
  
  rooms[code] = room;
  console.log(`[backend] Created room ${code} for host ${host.name} (${host.id})`);
  console.log(`[backend] Total rooms after creation:`, Object.keys(rooms).length);
  io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
  res.status(201).json(room);
});

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on(SOCKET_EVENTS.ROOMS_LIST, () => {
    socket.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
  });

  socket.on(SOCKET_EVENTS.ROOMS_CREATE, (host: Player, cb) => {
    if (!validatePlayer(host)) {
      return cb && cb({ error: 'invalid host data' });
    }
    
    let code = generateRoomCode();
    while (rooms[code]) code = generateRoomCode();
    
    const sanitizedHost = sanitizePlayer(host);
    const hostWithTile = { ...sanitizedHost, tile: 1 };
    const room: Room = { 
      code, 
      players: [hostWithTile], 
      started: false, 
      hostId: host.id 
    };
    
    rooms[code] = room;
    console.log(`[backend] Socket created room ${code} for host ${host.name} (${host.id})`);
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on(SOCKET_EVENTS.ROOMS_JOIN, (code: string, player: Player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    if (!validatePlayer(player)) {
      return cb && cb({ error: 'invalid player data' });
    }
    
    // remove existing player with same id
    room.players = room.players.filter((p) => p.id !== player.id);
    const sanitizedPlayer = sanitizePlayer(player);
    room.players.push({ ...sanitizedPlayer, tile: 1 });
    rooms[code] = room;
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on(SOCKET_EVENTS.ROOMS_LEAVE, (code: string, playerId: string, cb) => {
    const room = rooms[code];
    if (!room) {
      console.log(`[backend] Room ${code} not found for player ${playerId} leave request`);
      return cb && cb({ error: 'not found' });
    }
    
    console.log(`[backend] Player ${playerId} leaving room ${code}, current players:`, room.players.length);
    console.log(`[backend] Room host: ${room.hostId}, leaving player: ${playerId}`);
    console.log(`[backend] Total rooms before leave:`, Object.keys(rooms).length);
    
    room.players = room.players.filter((p) => p.id !== playerId);
    
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
    
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, { ok: true });
  });

  socket.on(SOCKET_EVENTS.ROOMS_UPDATE_PLAYER, (code: string, player: Player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    if (!validatePlayer(player)) {
      return cb && cb({ error: 'invalid player data' });
    }
    
    const sanitizedPlayer = sanitizePlayer(player);
    room.players = room.players.map((p) => (p.id === player.id ? sanitizedPlayer : p));
    rooms[code] = room;
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on(SOCKET_EVENTS.ROOMS_START, (code: string, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    
    room.started = true;
    rooms[code] = room;
    io.emit(SOCKET_EVENTS.ROOMS_UPDATE, rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on('disconnect', () => {
    // no-op for now
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || DEFAULT_BACKEND_PORT;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
