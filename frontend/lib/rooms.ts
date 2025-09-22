"use client";

// Adapter that talks to the backend server for rooms + uses socket.io-client to subscribe to updates.
// This replaces the previous localStorage/BroadcastChannel based implementation so all room state
// and logic lives in the backend.

import { io } from "socket.io-client";

type Player = {
  id: string;
  name: string;
  color: string;
  ready: boolean;
  tile?: number;
  isHost?: boolean;
};

type Room = {
  code: string;
  players: Player[];
  started: boolean;
  hostId?: string;
};

const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

let socket: ReturnType<typeof io> | null = null;
let lastRooms: Record<string, Room> | null = null;
const listeners = new Set<(rooms?: Record<string, Room>) => void>();

function ensureSocket() {
  if (socket) return socket;
  socket = io(BACKEND_BASE, { autoConnect: true });
  socket.on("connect", () => {
    // initial sync
    socket!.emit("rooms:list");
  });
  socket.on("rooms:update", (rooms: Record<string, Room>) => {
    lastRooms = rooms;
    listeners.forEach((cb) => cb(rooms));
  });
  return socket;
}

export async function listRooms(): Promise<Record<string, Room>> {
  const res = await fetch(`${BACKEND_BASE}/rooms`);
  if (!res.ok) return {};
  return (await res.json()) as Record<string, Room>;
}

export async function getRoom(code: string): Promise<Room | null> {
  const res = await fetch(`${BACKEND_BASE}/rooms/${encodeURIComponent(code)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("fetch failed");
  return (await res.json()) as Room;
}

export async function createRoom(host: Player): Promise<string> {
  const res = await fetch(`${BACKEND_BASE}/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host })
  });
  if (!res.ok) throw new Error("createRoom failed");
  const room = await res.json();
  return room.code;
}

export async function joinRoom(code: string, player: Player): Promise<boolean> {
  // prefer socket path when available
  try {
    const s = ensureSocket();
    return await new Promise((resolve) => {
      s.emit("rooms:join", code, player, (err?: unknown) => {
        if (err) return resolve(false);
        resolve(true);
      });
    });
  } catch (e) {
    // fallback to HTTP: try to fetch the room then update via socket-less endpoint
    const r = await getRoom(code);
    if (!r) return false;
    // call updatePlayer to add the player using the socket if possible
    try {
      const s = ensureSocket();
      s.emit("rooms:updatePlayer", code, player);
    } catch (_) {}
    return true;
  }
}

export function leaveRoom(code: string, playerId: string) {
  try {
    const s = ensureSocket();
    s.emit("rooms:leave", code, playerId);
  } catch (e) {
    // nothing else to do
  }
}

export function updatePlayer(code: string, player: Player) {
  try {
    const s = ensureSocket();
    s.emit("rooms:updatePlayer", code, player);
  } catch (e) {
    // ignore
  }
}

export function startGame(code: string) {
  try {
    const s = ensureSocket();
    s.emit("rooms:start", code);
  } catch (e) {
    // ignore
  }
}

export function onRoomsUpdate(cb: (rooms?: Record<string, Room>) => void) {
  listeners.add(cb);
  // provide the last known state immediately if available
  if (lastRooms) cb(lastRooms);
  ensureSocket();
  return () => {
    listeners.delete(cb);
  };
}

