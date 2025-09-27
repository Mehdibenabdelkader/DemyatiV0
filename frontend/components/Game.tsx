/**
 * GAME COMPONENT
 * 
 * This is the main game component that handles both the lobby and gameplay states.
 * It manages the game state, player synchronization, and renders the appropriate
 * interface based on whether the game has started or not.
 * 
 * The component handles:
 * - Room state synchronization via WebSocket
 * - Player list management and updates
 * - Game board rendering with player positions
 * - Dice rolling and player movement
 * - Transition between lobby and game states
 * 
 * The game uses a 200-tile board where players move based on dice rolls.
 * Prime-numbered tiles are highlighted to add visual interest.
 */

"use client";

import React, { useEffect, useMemo, useState } from "react";
import Lobby from "./Lobby";
import { getRoom, onRoomsUpdate, updatePlayer, onPlayerMessage, rollDice } from "../lib/rooms";

/**
 * Props interface for the Game component
 * 
 * @property roomCode - The 4-digit room code for the game
 * @property nickname - The player's nickname
 * @property mode - Whether the player is hosting or joining
 * @property started - Whether the game has started
 * @property onBack - Callback function to return to main menu
 */
type Props = {
  roomCode?: string;
  nickname?: string;
  mode?: "host" | "join";
  started?: boolean;
  onBack: () => void;
};

/**
 * Game Component
 * 
 * The main game component that manages the game state and renders
 * either the lobby interface or the game board based on the game state.
 * 
 * @param propRoomCode - The room code from props
 * @param nickname - The player's nickname
 * @param mode - Whether the player is hosting or joining
 * @param propStarted - Whether the game has started
 * @param onBack - Callback to return to main menu
 * @returns JSX element containing the game interface
 */
export default function Game({ roomCode: propRoomCode, nickname, mode, started: propStarted, onBack }: Props) {
  // Game state management
  const [started, setStarted] = useState(propStarted || false);
  const [roomCode, setRoomCode] = useState<string | null>(propRoomCode || null);
  const [players, setPlayers] = useState<Array<{ id: string; name: string; color: string; ready: boolean; tile?: number }>>([]);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const [messages, setMessages] = useState<Array<{ id: string; type: 'joined' | 'left'; playerName: string; timestamp: number }>>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isMyTurn, setIsMyTurn] = useState<boolean>(false);

  /**
   * Prime Numbers Calculation
   * 
   * Pre-calculates prime numbers up to 200 for highlighting special tiles.
   * This is memoized to avoid recalculating on every render.
   * Prime tiles are highlighted with a different background color.
   */
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

  /**
   * Calculate optimal number of columns for the game board
   * 
   * Determines the best number of columns based on screen width to ensure
   * the board fits well on different screen sizes while maintaining readability.
   */
  const calculateColumns = useMemo(() => {
    if (screenWidth === 0) return 10; // Default fallback
    
    // Calculate available width for the board (accounting for padding, sidebar, etc.)
    const availableWidth = Math.min(screenWidth - 100, window.innerWidth - 300); // Account for sidebar and padding
    const minTileWidth = 60; // Minimum tile width for readability
    const maxColumns = Math.floor(availableWidth / minTileWidth);
    
    // Ensure we have at least 5 columns and at most 20 columns
    const columns = Math.max(5, Math.min(20, maxColumns));
    
    // Make sure 200 tiles can be evenly distributed
    const rows = Math.ceil(200 / columns);
    return columns;
  }, [screenWidth]);

  /**
   * Sync Room Data
   * 
   * Fetches the current room data from the backend and updates
   * the local players state. This is used to keep the game
   * synchronized with the server state.
   * 
   * @param code - The room code to sync
   */
  function syncRoom(code: string | null) {
    if (!code) return;
    (async () => {
      const room = await getRoom(code);
      if (!room) return;
      type RoomPlayer = { id: string; name: string; color: string; ready: boolean; tile?: number };
      const rp = (room.players as RoomPlayer[]);
      setPlayers(rp.map((p) => ({ id: p.id, name: p.name, color: p.color, ready: p.ready, tile: p.tile || 1 })));
      
      // Update turn information
      if (room.turnOrder && room.currentPlayerIndex !== undefined) {
        const currentId = room.turnOrder[room.currentPlayerIndex];
        setCurrentPlayerId(currentId);
        
        // Check if it's the current player's turn
        const myPlayerId = sessionStorage.getItem("demyati_player_id") || localStorage.getItem("demyati_player_id");
        setIsMyTurn(currentId === myPlayerId);
      }
    })();
  }

  /**
   * Effect hook for room synchronization
   * 
   * Sets up real-time synchronization with the room data.
   * Subscribes to room updates via WebSocket and syncs the local state.
   */
  useEffect(() => {
    if (!roomCode) return;
    syncRoom(roomCode);
    const unsub = onRoomsUpdate(() => syncRoom(roomCode));
    return () => unsub && unsub();
  }, [roomCode]);

  /**
   * Effect hook for player message handling
   * 
   * Listens for player join/leave messages and displays them to the user.
   * Messages are filtered to only show messages for the current room.
   */
  useEffect(() => {
    if (!roomCode) return;
    
    const unsub = onPlayerMessage((message) => {
      // Only show messages for the current room
      if (message.roomCode === roomCode) {
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
  }, [roomCode]);

  /**
   * Effect hook for screen width tracking
   * 
   * Tracks window resize events to recalculate the optimal number of columns
   * for the game board layout.
   */
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!started) {
    // If we have a roomCode from URL but no nickname/mode, we need to get player info
    if (roomCode && (!nickname || !mode)) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          color: "var(--foreground)"
        }}>
          <div style={{ textAlign: "center" }}>
            <h2>Join Room {roomCode}</h2>
            <p>Please enter your nickname to join this room</p>
            <div style={{ marginTop: 20 }}>
              <input
                type="text"
                placeholder="Enter your nickname"
                style={{
                  padding: "8px 12px",
                  fontSize: 16,
                  borderRadius: 6,
                  border: "1px solid var(--accent-100)",
                  marginRight: 8
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const name = (e.target as HTMLInputElement).value.trim();
                    if (name) {
                      // Store nickname and redirect to lobby
                      sessionStorage.setItem('demyati_nickname', name);
                      const playerId = Math.random().toString(36).slice(2, 9);
                      sessionStorage.setItem('demyati_player_id', playerId);
                      window.location.href = `/game/${roomCode}?playerId=${playerId}`;
                    }
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  const name = input?.value.trim();
                  if (name) {
                    sessionStorage.setItem('demyati_nickname', name);
                    const playerId = Math.random().toString(36).slice(2, 9);
                    sessionStorage.setItem('demyati_player_id', playerId);
                    window.location.href = `/game/${roomCode}?playerId=${playerId}`;
                  }
                }}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(to bottom, #FCC877 0%, #967747 100%)",
                  color: "#15362C",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600
                }}
              >
                Join
              </button>
            </div>
            <button
              onClick={onBack}
              style={{
                padding: "6px 12px",
                marginTop: 16,
                background: "transparent",
                color: "var(--muted)",
                border: "1px solid var(--accent-100)",
                borderRadius: 6,
                cursor: "pointer"
              }}
            >
              Back to Main Menu
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <Lobby 
        nickname={nickname || ""} 
        mode={mode || "join"} 
        roomCode={roomCode}
        onBack={onBack} 
        onStarted={(code) => {
          setRoomCode(code);
          setStarted(true);
        }} 
      />
    );
  }
  return (
    <div style={{ padding: 18, minHeight: "100vh", background: "transparent", color: "var(--foreground)" }}>
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

      <main style={{ 
        marginTop: 18, 
        display: "grid", 
        gridTemplateColumns: screenWidth < 768 ? "1fr" : "1fr 240px", 
        gap: 18 
      }}>
        <section style={{ padding: 12, border: "1px solid var(--accent-100)", borderRadius: 8, overflow: "auto" }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: `repeat(${calculateColumns}, 1fr)`, 
            gap: 6,
            minWidth: "100%"
          }}>
            {Array.from({ length: 200 }).map((_, i) => {
              const n = i + 1;
              const prime = primes[n];
              // collect pawns on this tile
              const pawns = players.filter((p) => (p.tile || 1) === n);
              return (
                <div key={n} style={{ 
                  position: "relative", 
                  padding: 6, 
                  borderRadius: 6, 
                  background: prime ? "#fde68a" : "#ffffff11", 
                  border: "1px solid #00000010", 
                  minHeight: 48,
                  aspectRatio: "1",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1 }}>{n}</div>
                  <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {pawns.map((p) => (
                      <div key={p.id} title={p.name} style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: 3, 
                        background: p.color, 
                        border: "1px solid white", 
                        boxShadow: "0 1px 0 rgba(0,0,0,0.3)",
                        flexShrink: 0
                      }} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside style={{ 
          padding: 12, 
          border: "1px solid var(--accent-100)", 
          borderRadius: 8,
          order: screenWidth < 768 ? 2 : 1
        }}>
          <h3 style={{ marginTop: 0 }}>Controls</h3>
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button 
                onClick={async () => {
                  if (!isMyTurn || !roomCode) return;
                  
                  try {
                    const myPlayerId = sessionStorage.getItem("demyati_player_id") || localStorage.getItem("demyati_player_id");
                    if (!myPlayerId) return;
                    
                    const result = await rollDice(roomCode, myPlayerId);
                    setLastRoll(result.diceRoll);
                  } catch (error) {
                    console.error("Failed to roll dice:", error);
                    alert(error instanceof Error ? error.message : "Failed to roll dice");
                  }
                }} 
                disabled={!isMyTurn}
                style={{ 
                  padding: "10px 12px", 
                  borderRadius: 8,
                  background: isMyTurn ? "linear-gradient(to bottom, #FCC877 0%, #967747 100%)" : "#666",
                  color: isMyTurn ? "#15362C" : "#999",
                  cursor: isMyTurn ? "pointer" : "not-allowed",
                  border: "none",
                  fontWeight: 600
                }}
              >
                {isMyTurn ? "Roll dice" : `Waiting for ${players.find(p => p.id === currentPlayerId)?.name || "player"}...`}
              </button>
              <div style={{ fontSize: 14, color: "var(--muted)" }}>Last roll: <strong>{lastRoll ?? "-"}</strong></div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <h4 style={{ margin: "6px 0" }}>Players</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {players.map((p) => {
                const isCurrentPlayer = currentPlayerId === p.id;
                return (
                  <li key={p.id} style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 8, 
                    padding: "6px 0",
                    background: isCurrentPlayer ? "rgba(252, 200, 119, 0.2)" : "transparent",
                    borderRadius: 6,
                    border: isCurrentPlayer ? "1px solid #FCC877" : "1px solid transparent"
                  }}>
                    <div style={{ width: 28, height: 20, borderRadius: 6, background: p.color }} aria-hidden />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                        {p.name}
                        {isCurrentPlayer && <span style={{ fontSize: 12, color: "#FCC877", fontWeight: 600 }}>🎯 TURN</span>}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Tile: <strong>{p.tile || 1}</strong></div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              {isMyTurn ? "It's your turn! Click 'Roll dice' to move your pawn." : "Wait for your turn to roll the dice."}
              <br />
              Dice roll is 2-12.
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
