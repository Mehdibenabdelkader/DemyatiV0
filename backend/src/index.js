const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Simple in-memory room store mirroring frontend shape
const rooms = {}; // { [code]: { code, players:[], started, hostId } }

function genCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// HTTP endpoints
app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/rooms/:code', (req, res) => {
  const r = rooms[req.params.code];
  if (!r) return res.status(404).json({ error: 'not found' });
  res.json(r);
});

// Basic room creation via HTTP POST
app.post('/rooms', (req, res) => {
  const host = req.body.host;
  if (!host || !host.id) return res.status(400).json({ error: 'missing host' });
  let code = genCode();
  while (rooms[code]) code = genCode();
  const hostWithTile = Object.assign({ tile: 1 }, host);
  const room = { code, players: [hostWithTile], started: false, hostId: host.id };
  rooms[code] = room;
  io.emit('rooms:update', rooms);
  res.status(201).json(room);
});

// Socket.io handlers
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('rooms:list', () => {
    socket.emit('rooms:update', rooms);
  });

  socket.on('rooms:create', (host, cb) => {
    let code = genCode();
    while (rooms[code]) code = genCode();
    const hostWithTile = Object.assign({ tile: 1 }, host);
    const room = { code, players: [hostWithTile], started: false, hostId: host.id };
    rooms[code] = room;
    io.emit('rooms:update', rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on('rooms:join', (code, player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    // remove existing player with same id
    room.players = room.players.filter((p) => p.id !== player.id);
    room.players.push(Object.assign({ tile: 1 }, player));
    rooms[code] = room;
    io.emit('rooms:update', rooms);
    if (typeof cb === 'function') cb(null, room);
  });

  socket.on('rooms:leave', (code, playerId, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    room.players = room.players.filter((p) => p.id !== playerId);
    if (room.hostId === playerId) {
      delete rooms[code];
    } else {
      rooms[code] = room;
    }
    io.emit('rooms:update', rooms);
    if (typeof cb === 'function') cb && cb(null, { ok: true });
  });

  socket.on('rooms:updatePlayer', (code, player, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    room.players = room.players.map((p) => (p.id === player.id ? player : p));
    rooms[code] = room;
    io.emit('rooms:update', rooms);
    if (typeof cb === 'function') cb && cb(null, room);
  });

  socket.on('rooms:start', (code, cb) => {
    const room = rooms[code];
    if (!room) return cb && cb({ error: 'not found' });
    room.started = true;
    rooms[code] = room;
    io.emit('rooms:update', rooms);
    if (typeof cb === 'function') cb && cb(null, room);
  });

  socket.on('disconnect', () => {
    // no-op for now
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Backend server listening on http://localhost:${PORT}`);
});
