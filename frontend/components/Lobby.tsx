"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRoom, joinRoom, leaveRoom, updatePlayer, getRoom, startGame, onRoomsUpdate, onPlayerMessage } from "../lib/rooms";
function genId() {
  return Math.random().toString(36).slice(2, 9);
}

type Props = {
  nickname: string;
  mode: "host" | "join";
  roomCode?: string | null;
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

export default function Lobby({ nickname, mode, roomCode: propRoomCode, onStarted, onBack }: Props) {
  const [playerId] = useState(() => {
    try {
      const key = "demyati_player_id";
      // use sessionStorage so each tab gets a unique id
      const existing = sessionStorage.getItem(key);
      if (existing) return existing;
      const id = genId();
      sessionStorage.setItem(key, id);
      return id;
    } catch (_err) {
      return genId();
    }
  });
  const [code, setCode] = useState<string | null>(propRoomCode || null);
  const [players, setPlayers] = useState<PlayerView[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const [ready, setReady] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; type: 'joined' | 'left'; playerName: string; timestamp: number }>>([]);
  const joinedRef = useRef(false);
  const gameStartedRef = useRef(false);

  useEffect(() => {
    // on mount: create or join
    const p: PlayerView = { id: playerId, name: nickname, color, ready: false };
    
    console.log("[lobby] useEffect triggered - mode:", mode, "code:", code, "propRoomCode:", propRoomCode, "playerId:", playerId);
    
    // Check if we have a propRoomCode but local code state is not set yet
    // This can happen during initial render when props are passed but state hasn't updated
    if (propRoomCode && !code) {
      console.log("[lobby] Setting code from props:", propRoomCode);
      setCode(propRoomCode);
      return; // Exit early, let the next effect run handle the room setup
    }
    
    if (mode === "host" && !code) {
      // In the new flow, hosts should always have a room code passed as props
      // If we don't have a code, something went wrong
      console.error("[lobby] ERROR: Host mode but no room code provided!");
      console.log("[lobby] mode:", mode, "code:", code, "propRoomCode:", propRoomCode);
      onBack();
      return;
    } else if (mode === "host" && code) {
      // If we already have a code, just set up the host state
      setIsHost(true);
      joinedRef.current = true;
    } else if (code) {
      // If we have a room code, join it
      (async () => {
        try {
          const ok = await joinRoom(code, p);
          if (ok) {
            joinedRef.current = true;
            console.log("[lobby] joined room", code, "playerId", playerId, "nickname", nickname);
          } else {
            console.error("joinRoom failed for code", code);
            onBack();
          }
        } catch (_err) {
          console.error("joinRoom failed", _err);
          onBack();
        }
      })();
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
        (async () => {
          try {
            const entered = window.prompt("Enter room code to join:");
            if (!entered) {
              onBack();
              return;
            }
            const ok = await joinRoom(entered, p);
            console.log("[lobby] join attempt", entered, ok, p);
            if (!ok) {
              window.alert("Room not found");
              onBack();
              return;
            }
            setCode(entered);
            joinedRef.current = true;
          } catch (_err) {
            console.error("joinRoom failed", _err);
            onBack();
          }
        })();
      }
      // if already prompted in a previous mount, do nothing — the join should have been handled by that mount
    }

    // we only create/join once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // subscribe to room updates once we have a code
  useEffect(() => {
    if (!code) return;

    type Room = { code: string; players: Array<{ id: string; name: string; color: string; ready: boolean }>; started: boolean; hostId?: string };
    const handleUpdate = async (rooms?: Record<string, Room>) => {
      const room = rooms ? rooms[code] : await getRoom(code);
      console.log("[lobby] handleUpdate for code", code, room);
      if (!room) {
        console.log("[lobby] room deleted, returning to main menu", code);
        onBack();
        return;
      }
      const playersList: Array<{ id: string; name: string; color: string; ready: boolean; isHost?: boolean }> = room.players;
      setPlayers(playersList.map((p) => ({ id: p.id, name: p.name, color: p.color, ready: p.ready, isHost: p.id === room.hostId })));
      
      // Update local ready state to match server state
      const currentPlayer = playersList.find(p => p.id === playerId);
      if (currentPlayer) {
        console.log("[lobby] Syncing ready state:", currentPlayer.ready, "for player", currentPlayer.name);
        setReady(currentPlayer.ready);
      }
      
      // Validate that the user's mode matches their actual role
      const isActuallyHost = room.hostId === playerId;
      if (mode === 'host' && !isActuallyHost) {
        console.warn("[lobby] User tried to access host mode but is not the host");
        onBack();
        return;
      }
      
      setIsHost(isActuallyHost);
      if (room.started) {
        gameStartedRef.current = true;
        onStarted(code);
      }
    };

    // initial sync
    handleUpdate();

    const unsub = onRoomsUpdate((rooms) => handleUpdate(rooms));

    return () => {
      unsub && unsub();
      // leave the room on unmount only if we had joined AND the game hasn't started
      // This prevents the host from leaving when transitioning to game state
      if (code && joinedRef.current && !gameStartedRef.current) {
        leaveRoom(code, playerId);
      }
    };
    // Only depend on code, playerId, and propRoomCode, not onBack/onStarted to prevent re-subscriptions
  }, [code, playerId, propRoomCode]);

  // Subscribe to player join/leave messages
  useEffect(() => {
    if (!code) return;
    
    const unsub = onPlayerMessage((message) => {
      // Only show messages for the current room
      if (message.roomCode === code) {
        const newMessage = {
          id: `${message.type}-${message.playerName}-${Date.now()}`,
          type: message.type,
          playerName: message.playerName,
          timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Auto-remove message after 5 seconds
        setTimeout(() => {
          setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
        }, 5000);
      }
    });
    
    return () => unsub && unsub();
  }, [code]);

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
    gameStartedRef.current = true;
    startGame(code);
    // Update URL to reflect game has started
    window.history.replaceState(null, '', `/game/${code}?playerId=${playerId}`);
    onStarted(code);
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "transparent", color: "var(--foreground)" }}>
      {/* Player Connection Messages */}
      {messages.length > 0 && (
        <div style={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8
        }}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                padding: "8px 12px",
                borderRadius: 6,
                background: message.type === 'joined' ? "#10b981" : "#ef4444",
                color: "white",
                fontSize: 14,
                fontWeight: 500,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                animation: "slideIn 0.3s ease-out"
              }}
            >
              {message.type === 'joined' ? '🎉' : '👋'} {message.playerName} {message.type === 'joined' ? 'joined' : 'left'} the game
            </div>
          ))}
        </div>
      )}

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <button onClick={onBack} style={{ padding: "6px 10px", borderRadius: 6 }}>Back</button>
        </div>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ margin: 0 }}>Lobby</h2>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>Room Code:</div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 700, 
            color: "var(--foreground)",
            background: "var(--accent-100)",
            padding: "8px 16px",
            borderRadius: 8,
            display: "inline-block",
            marginBottom: 8
          }}>
            {code}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            Share this code with other players
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(code || '');
              // Show feedback
              const btn = document.querySelector('[data-copy-btn]') as HTMLButtonElement;
              if (btn) {
                const originalText = btn.textContent;
                btn.textContent = 'Copied!';
                btn.style.background = '#10b981';
                setTimeout(() => {
                  btn.textContent = originalText;
                  btn.style.background = '';
                }, 2000);
              }
            }}
            data-copy-btn
            style={{
              padding: "4px 8px",
              fontSize: 12,
              background: "var(--accent-200)",
              color: "var(--foreground)",
              border: "1px solid var(--accent-300)",
              borderRadius: 4,
              cursor: "pointer"
            }}
          >
            Copy Code
          </button>
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
              <button 
                onClick={handleToggleReady} 
                disabled={!code}
                style={{ 
                  padding: "8px 10px", 
                  width: "100%", 
                  borderRadius: 8, 
                  background: ready ? "#10b981" : "#0a5b41",
                  opacity: !code ? 0.5 : 1,
                  cursor: !code ? "not-allowed" : "pointer"
                }}
              >
                {ready ? "Ready — Cancel" : "Mark as ready"}
              </button>
              {!code && (
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, textAlign: "center" }}>
                  Joining room...
                </div>
              )}
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
