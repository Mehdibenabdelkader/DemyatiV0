"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoom, joinRoom, leaveRoom, updatePlayer, getRoom, startGame, onRoomsUpdate } from "../lib/rooms";
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

type Props = {
  nickname: string;
  mode: "host" | "join";
  onStarted: (code: string) => void;
  onBack: () => void;
};

const COLORS = ["#ef4444", "#f59e0b", "#84cc16", "#06b6d4", "#6366f1", "#ec4899"];

type PlayerView = {
  id: string;
  name: string;
  color: string;
  ready: boolean;
  isHost?: boolean;
};

export default function Lobby({ nickname, mode, onStarted, onBack }: Props) {
  const [playerId] = useState(() => genId());
  const [code, setCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [ready, setReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const joinedRef = useRef(false);

  useEffect(() => {
    // on mount: create or join
    const p: PlayerView = { id: playerId, name: nickname, color, ready: false };
    if (mode === "host") {
      const c = createRoom({ ...p, isHost: true });
      setCode(c);
      setIsHost(true);
  joinedRef.current = true;
  console.log("[lobby] created room", c, "hostId", playerId, "nickname", nickname);
    } else {
      // Guard prompt so it only appears once even if React Strict Mode mounts twice in dev
      // Module-level set `__joinedPrompted` is used to remember that this player has already been prompted
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (!globalThis.__joinedPrompted) globalThis.__joinedPrompted = new Set();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const prompted: Set<string> = globalThis.__joinedPrompted;
      if (!prompted.has(playerId)) {
        prompted.add(playerId);
        const entered = window.prompt("Enter room code to join:");
        if (!entered) {
          onBack();
          return;
        }
        const ok = joinRoom(entered, p);
  console.log("[lobby] join attempt", entered, ok, p);
        if (!ok) {
          window.alert("Room not found");
          onBack();
          return;
        }
  setCode(entered);
  joinedRef.current = true;
      }
      // if already prompted in a previous mount, do nothing — the join should have been handled by that mount
    }

    // we only create/join once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // subscribe to room updates once we have a code
  useEffect(() => {
    if (!code) return;

    const handleUpdate = (rooms?: Record<string, any>) => {
      const room = rooms ? rooms[code] : getRoom(code);
      console.log("[lobby] handleUpdate for code", code, room);
      if (!room) {
        console.log("[lobby] room deleted, returning to main menu", code);
        onBack();
        return;
      }
  const playersList: Array<{ id: string; name: string; color: string; ready: boolean; isHost?: boolean }> = room.players;
  setPlayers(playersList.map((p) => ({ id: p.id, name: p.name, color: p.color, ready: p.ready, isHost: p.id === room.hostId })));
      if (room.hostId === playerId) setIsHost(true);
      if (room.started) onStarted(code);
    };

    // initial sync
    handleUpdate();

  const unsub = onRoomsUpdate((rooms) => handleUpdate(rooms));

    // small timeout to cover eventual consistency
    const t = setTimeout(handleUpdate, 50);

    return () => {
      clearTimeout(t);
      unsub && unsub();
      // leave the room on unmount only if we had joined
      if (code && joinedRef.current) leaveRoom(code, playerId);
    };
    // intentionally include these deps so the effect re-runs if code changes
  }, [code, onBack, onStarted, playerId]);

  const otherPlayers = players.filter((p) => p.id !== playerId);

  const canStart = useMemo(() => {
    if (!isHost) return false;
    if (players.length < 2) return false;
    return players.every((p) => p.ready);
  }, [players, isHost]);

  function handleToggleReady() {
    setReady((r) => {
      const nr = !r;
      if (code) updatePlayer(code, { id: playerId, name: nickname, color, ready: nr });
      return nr;
    });
  }

  function handleStart() {
    if (!code) return;
    if (!canStart) {
      window.alert("Can't start: need at least 2 players and everyone must be ready.");
      return;
    }
    startGame(code);
    onStarted(code);
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "transparent", color: "var(--foreground)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button onClick={onBack} style={{ padding: "6px 10px", borderRadius: 6 }}>Back</button>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Lobby</h2>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Room: <strong>{code}</strong></div>
        </div>
        <div style={{ width: 80 }} />
      </header>

      <main style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <section style={{ padding: 12, border: "1px solid var(--accent-100)", borderRadius: 8 }}>
          <h3>Players</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {/* current player first */}
            {players.map((p) => (
              <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 6px", borderBottom: "1px dashed var(--accent-100)" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: p.color }} aria-hidden />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: p.id === playerId ? 700 : 600 }}>{p.name} {p.isHost ? "(host)" : ""}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{p.ready ? "Ready" : "Not ready"}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <aside style={{ padding: 12, border: "1px solid var(--accent-100)", borderRadius: 8 }}>
          <h3>Your settings</h3>
          <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 8 }}>Color</div>
            <div style={{ display: "flex", gap: 8 }}>
              {COLORS.map((c) => (
                <button key={c} onClick={() => setColor(c)} aria-label={c} style={{ width: 40, height: 40, borderRadius: 8, border: color === c ? "3px solid #00000033" : "1px solid #00000011", background: c }} />
              ))}
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={handleToggleReady} style={{ padding: "8px 10px", width: "100%", borderRadius: 8, background: ready ? "#10b981" : "#0a5b41" }}>
                {ready ? "Ready — Cancel" : "Mark as ready"}
              </button>
            </div>

            {isHost && (
              <div style={{ marginTop: 12 }}>
                <button onClick={handleStart} disabled={!canStart} style={{ padding: "8px 10px", width: "100%", borderRadius: 8, background: canStart ? "var(--accent-600)" : "#ddd", color: canStart ? "white" : "#666" }}>
                  Start game
                </button>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
                  Game requires at least 2 players and everyone ready.
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
