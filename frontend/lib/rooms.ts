"use client";

// Lightweight room manager using BroadcastChannel + localStorage for demo multiplayer
// Room shape stored under key `demyati_rooms` in localStorage

type Player = {
  id: string;
  name: string;
  color: string;
  ready: boolean;
  isHost?: boolean;
};

type Room = {
  code: string;
  players: Player[];
  started: boolean;
  hostId?: string;
};

const STORAGE_KEY = "demyati_rooms";

function readAll(): Record<string, Room> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeAll(data: Record<string, Room>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function genCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const bc = typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("demyati_rooms") : null;
let __lastSeenSerialized: string | null = null;

function broadcast() {
  const rooms = readAll();
  console.log("[rooms] broadcast", rooms);
  if (bc) bc.postMessage({ type: "rooms:update", rooms });
  try {
    // write a small ping to localStorage so environments without BroadcastChannel still get updates
    localStorage.setItem("demyati_rooms_ping", String(Date.now()));
  } catch (e) {}
  // update lastSeen so listeners in this context don't process the same payload again
  try {
    __lastSeenSerialized = JSON.stringify(rooms);
  } catch (e) {
    __lastSeenSerialized = null;
  }
}

function cleanRooms() {
  const rooms = readAll();
  let changed = false;
  for (const code of Object.keys(rooms)) {
    const room = rooms[code];
    // remove rooms with no players or no host
    if (!room || !Array.isArray(room.players) || room.players.length === 0 || !room.hostId) {
      console.log("[rooms] cleaning invalid room", code, room);
      delete rooms[code];
      changed = true;
    }
  }
  if (changed) {
    writeAll(rooms);
    broadcast();
  }
}

// run a clean on module load to remove stale rooms
try {
  cleanRooms();
} catch (e) {
  console.warn("[rooms] cleanRooms failed", e);
}

export function createRoom(host: Player): string {
  const rooms = readAll();
  let code = genCode();
  while (rooms[code]) code = genCode();
  const room: Room = { code, players: [host], started: false, hostId: host.id };
  rooms[code] = room;
  writeAll(rooms);
  console.log("[rooms] created", code, room);
  broadcast();
  return code;
}

export function joinRoom(code: string, player: Player): boolean {
  const rooms = readAll();
  const room = rooms[code];
  if (!room) return false;
  // replace existing player with same id
  room.players = room.players.filter((p) => p.id !== player.id);
  room.players.push(player);
  rooms[code] = room;
  writeAll(rooms);
  console.log("[rooms] join", code, player);
  broadcast();
  return true;
}

export function leaveRoom(code: string, playerId: string) {
  const rooms = readAll();
  const room = rooms[code];
  if (!room) return;
  room.players = room.players.filter((p) => p.id !== playerId);
  if (room.hostId === playerId) {
    // host is leaving -> delete the room entirely
    console.log("[rooms] host left, deleting room", code);
    delete rooms[code];
    writeAll(rooms);
    broadcast();
    return;
  }
  rooms[code] = room;
  writeAll(rooms);
  console.log("[rooms] leave", code, playerId);
  broadcast();
}

export function updatePlayer(code: string, player: Player) {
  const rooms = readAll();
  const room = rooms[code];
  if (!room) return;
  room.players = room.players.map((p) => (p.id === player.id ? player : p));
  rooms[code] = room;
  writeAll(rooms);
  console.log("[rooms] updatePlayer", code, player);
  broadcast();
}

export function getRoom(code: string): Room | null {
  const rooms = readAll();
  return rooms[code] || null;
}

export function startGame(code: string): boolean {
  const rooms = readAll();
  const room = rooms[code];
  if (!room) return false;
  room.started = true;
  rooms[code] = room;
  writeAll(rooms);
  broadcast();
  return true;
}

export function onRoomsUpdate(cb: (rooms?: Record<string, Room>) => void) {
  // deduplicates rapid duplicate notifications by serializing the rooms state
  const handleRooms = (roomsObj?: Record<string, Room>) => {
    try {
      const serialized = roomsObj ? JSON.stringify(roomsObj) : JSON.stringify(readAll());
      if (serialized === __lastSeenSerialized) return;
      __lastSeenSerialized = serialized;
    } catch (e) {
      // ignore serialization errors
    }
    cb(roomsObj);
  };

  if (bc) {
    const handler = (ev: MessageEvent) => {
      try {
        const data = ev.data;
        if (data && data.type === "rooms:update") {
          handleRooms(data.rooms);
        } else {
          handleRooms();
        }
      } catch (e) {
        handleRooms();
      }
    };
    bc.addEventListener("message", handler);

    // when BroadcastChannel is available, don't also listen to storage in this context
    // other contexts without BC will still react to the storage ping
    return () => bc.removeEventListener("message", handler);
  }

  // no BroadcastChannel available -> rely on storage events
  const storageHandler = (ev: StorageEvent) => {
    if (!ev.key) return;
    if (ev.key === "demyati_rooms_ping" || ev.key === STORAGE_KEY) {
      handleRooms();
    }
  };
  window.addEventListener("storage", storageHandler);
  return () => window.removeEventListener("storage", storageHandler);
}
