# Demyati backend (rooms + socket server)

This folder contains a minimal Express + Socket.IO server to manage rooms and mirror the client-side `frontend/lib/rooms.ts` API.

Quick start

1. cd backend
2. npm install
3. npm start

The server listens on port 4000 by default.

Socket events

- `rooms:list` -> client requests current rooms; server emits `rooms:update` with the rooms map.
- `rooms:create` (host, cb) -> create room; server responds via callback and emits `rooms:update`.
- `rooms:join` (code, player, cb) -> join a room.
- `rooms:leave` (code, playerId, cb) -> leave a room.
- `rooms:updatePlayer` (code, player, cb) -> update a player record.
- `rooms:start` (code, cb) -> mark room started.

HTTP endpoints

- `GET /rooms` -> returns all rooms
- `GET /rooms/:code` -> returns a room or 404
- `POST /rooms` -> body: { host } -> create a room

Notes & next steps

- This is an in-memory store (no persistence). For production, add a DB and authentication.
- Consider adding room TTL and automated cleanup.
