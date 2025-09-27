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
const messageListeners = new Set<(message: { type: 'joined' | 'left'; playerName: string; roomCode: string }) => void>();

function ensureSocket() {
  if (socket && socket.connected) return socket;
  
  // Disconnect existing socket if it exists but isn't connected
  if (socket) {
    console.log("[rooms] Disconnecting existing socket");
    socket.disconnect();
  }
  
  console.log("[rooms] Creating new socket connection");
  socket = io(BACKEND_BASE, { autoConnect: true });
  socket.on("connect", () => {
    console.log("[rooms] Socket connected");
    // initial sync
    socket!.emit("rooms:list");
  });
  socket.on("disconnect", () => {
    console.log("[rooms] Socket disconnected");
  });
  socket.on("rooms:update", (rooms: Record<string, Room>) => {
    console.log("[rooms] Received rooms update", Object.keys(rooms).length, "rooms");
    lastRooms = rooms;
    listeners.forEach((cb) => cb(rooms));
  });
  
  // Listen for player join/leave messages
  socket.on("player:joined", (data: { playerName: string; roomCode: string }) => {
    console.log("[rooms] Player joined:", data);
    messageListeners.forEach((cb) => cb({ type: 'joined', ...data }));
  });
  
  socket.on("player:left", (data: { playerName: string; roomCode: string }) => {
    console.log("[rooms] Player left:", data);
    messageListeners.forEach((cb) => cb({ type: 'left', ...data }));
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

// Test backend connection
export async function testBackendConnection(): Promise<boolean> {
  try {
    const res = await fetch(`${BACKEND_BASE}/rooms`);
    return res.ok;
  } catch (error) {
    console.error("[rooms] Backend connection test failed:", error);
    return false;
  }
}

export async function createRoom(host: Player): Promise<string> {
  console.log("[rooms] Creating room for host", host.name);
  console.log("[rooms] Backend URL:", BACKEND_BASE);
  console.log("[rooms] Request payload:", { host });
  
  // Test backend connection first
  const isBackendAvailable = await testBackendConnection();
  if (!isBackendAvailable) {
    throw new Error("Backend server is not available. Please make sure the backend is running on port 4000.");
  }
  
  try {
    const res = await fetch(`${BACKEND_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ host })
    });
    
    console.log("[rooms] Response status:", res.status);
    console.log("[rooms] Response headers:", Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[rooms] createRoom failed", res.status, res.statusText, errorText);
      throw new Error(`createRoom failed: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const room = await res.json();
    console.log("[rooms] Created room", room.code);
    return room.code;
  } catch (error) {
    console.error("[rooms] createRoom error:", error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Cannot connect to backend server. Please make sure the backend is running on port 4000.");
    }
    throw error;
  }
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
  console.log("[rooms] Adding listener, total listeners:", listeners.size + 1);
  listeners.add(cb);
  // provide the last known state immediately if available
  if (lastRooms) {
    console.log("[rooms] Providing last known state to new listener");
    cb(lastRooms);
  }
  ensureSocket();
  return () => {
    console.log("[rooms] Removing listener, remaining listeners:", listeners.size - 1);
    listeners.delete(cb);
  };
}

export function onPlayerMessage(cb: (message: { type: 'joined' | 'left'; playerName: string; roomCode: string }) => void) {
  console.log("[rooms] Adding message listener, total message listeners:", messageListeners.size + 1);
  messageListeners.add(cb);
  ensureSocket();
  return () => {
    console.log("[rooms] Removing message listener, remaining message listeners:", messageListeners.size - 1);
    messageListeners.delete(cb);
  };
}

