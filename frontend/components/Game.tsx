"use client";

import React, { useEffect, useMemo, useState } from "react";
import Lobby from "./Lobby";
import { getRoom, onRoomsUpdate, updatePlayer } from "../lib/rooms";

type Props = {
  nickname: string;
  mode: "host" | "join";
  onBack: () => void;
};

export default function Game({ nickname, mode, onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; color: string; ready: boolean; tile?: number }>>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);

  // utility: primes up to 200
  const primes = useMemo(() => {
    const max = 200;
    const isPrime = Array(max + 1).fill(true);
    isPrime[0] = false;
    isPrime[1] = false;
    for (let i = 2; i * i <= max; i++) {
      if (!isPrime[i]) continue;
      for (let j = i * i; j <= max; j += i) isPrime[j] = false;
    }
    return isPrime;
  }, []);

  // helper to load players from room
  function syncRoom(code: string | null) {
    if (!code) return;
    (async () => {
      const room = await getRoom(code);
      if (!room) return;
      type RoomPlayer = { id: string; name: string; color: string; ready: boolean; tile?: number };
      const rp = (room.players as RoomPlayer[]);
      setPlayers(rp.map((p) => ({ id: p.id, name: p.name, color: p.color, ready: p.ready, tile: p.tile || 1 })));
    })();
  }

  useEffect(() => {
    if (!roomCode) return;
    syncRoom(roomCode);
    const unsub = onRoomsUpdate(() => syncRoom(roomCode));
    return () => unsub && unsub();
  }, [roomCode]);

  if (!started) {
    return (
      <Lobby nickname={nickname} mode={mode} onBack={onBack} onStarted={(code) => {
        setRoomCode(code);
        setStarted(true);
      }} />
    );
  }
  return (
    <div style={{ padding: 18, minHeight: "100vh", background: "transparent", color: "var(--foreground)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <button onClick={onBack} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-100)" }}>
            Back
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Demyati — Game</h2>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Room: <strong>{roomCode}</strong></div>
        </div>

        <div style={{ width: 80 }} />
      </header>

      <main style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 240px", gap: 18 }}>
        <section style={{ padding: 12, border: "1px solid var(--accent-100)", borderRadius: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
            {Array.from({ length: 200 }).map((_, i) => {
              const n = i + 1;
              const prime = primes[n];
              // collect pawns on this tile
              const pawns = players.filter((p) => (p.tile || 1) === n);
              return (
                <div key={n} style={{ position: "relative", padding: 8, borderRadius: 6, background: prime ? "#fde68a" : "#ffffff11", border: "1px solid #00000010", minHeight: 52 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{n}</div>
                  <div style={{ position: "absolute", right: 6, bottom: 6, display: "flex", gap: 4 }}>
                    {pawns.map((p) => (
                      <div key={p.id} title={p.name} style={{ width: 18, height: 18, borderRadius: 4, background: p.color, border: "2px solid white", boxShadow: "0 1px 0 rgba(0,0,0,0.3)" }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside style={{ padding: 12, border: "1px solid var(--accent-100)", borderRadius: 8 }}>
          <h3 style={{ marginTop: 0 }}>Controls</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => {
                // simulate two dice (2-12)
                const a = 1 + Math.floor(Math.random() * 6);
                const b = 1 + Math.floor(Math.random() * 6);
                const total = a + b;
                setLastRoll(total);
                // move current player's pawn (if present)
                (async () => {
                  try {
                    // prefer sessionStorage (per-tab) then fallback to localStorage
                    const pid = sessionStorage.getItem("demyati_player_id") || localStorage.getItem("demyati_player_id");
                    if (pid && roomCode) {
                      const room = await getRoom(roomCode);
                      if (room) {
                        type RoomPlayer = { id: string; name: string; color: string; ready: boolean; tile?: number };
                        const rp = room.players as RoomPlayer[];
                        const player = rp.find((x) => x.id === pid);
                        if (player) {
                          const newTile = Math.min(200, (player.tile || 1) + total);
                          updatePlayer(roomCode, { ...player, tile: newTile });
                        }
                      }
                    }
                  } catch (_e) {
                    // ignore
                  }
                })();
              }} style={{ padding: "10px 12px", borderRadius: 8 }}>
                Roll dice
              </button>
              <div style={{ fontSize: 14, color: "var(--muted)" }}>Last roll: <strong>{lastRoll ?? "-"}</strong></div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <h4 style={{ margin: "6px 0" }}>Players</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {players.map((p) => (
                <li key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                  <div style={{ width: 28, height: 20, borderRadius: 6, background: p.color }} aria-hidden />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Tile: <strong>{p.tile || 1}</strong></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Note: click &quot;Roll dice&quot; to move your pawn. Dice roll is 2-12.</div>
          </div>
        </aside>
      </main>
    </div>
  );
}
