"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Game from "../../../components/Game";
import { getRoom } from "../../../lib/rooms";

export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Get player ID from URL params or sessionStorage
  const playerId = searchParams.get('playerId') || sessionStorage.getItem('demyati_player_id');
  const [nickname, setNickname] = useState<string>('');
  const [mode, setMode] = useState<'host' | 'join'>('join');
  const [started, setStarted] = useState<boolean>(false);

  useEffect(() => {
    const code = params.roomCode as string;
    if (!code) {
      setError("Invalid room code");
      setLoading(false);
      return;
    }

    if (!playerId) {
      setError("Player ID is required");
      setLoading(false);
      return;
    }

    // Validate room exists and get player information
    getRoom(code)
      .then((room) => {
        if (!room) {
          setError("Room not found");
          setLoading(false);
          return;
        }
        
        // Find the player in the room
        const player = room.players.find(p => p.id === playerId);
        
        if (!player) {
          // Player not in room, try to join them
          const nickname = sessionStorage.getItem('demyati_nickname') || '';
          if (!nickname) {
            setError("Nickname is required to join room");
            setLoading(false);
            return;
          }
          
          // Import joinRoom function and join the room
          import('../../../lib/rooms').then(({ joinRoom }) => {
            const playerData = {
              id: playerId,
              name: nickname,
              color: "#ef4444",
              ready: false
            };
            
            joinRoom(code, playerData).then((joined) => {
              if (!joined) {
                setError("Failed to join room");
                setLoading(false);
                return;
              }
              // After joining, reload the room data
              getRoom(code).then((updatedRoom) => {
                if (updatedRoom) {
                  const updatedPlayer = updatedRoom.players.find(p => p.id === playerId);
                  if (updatedPlayer) {
                    setNickname(updatedPlayer.name);
                    setMode(updatedRoom.hostId === playerId ? 'host' : 'join');
                    setStarted(updatedRoom.started);
                    setRoomCode(code);
                    setLoading(false);
                  }
                }
              });
            }).catch((err) => {
              console.error("Error joining room:", err);
              setError("Failed to join room");
              setLoading(false);
            });
          });
          return; // Exit early since we're handling the join asynchronously
        }
        
        // Player is in room, set their information
        setNickname(player.name);
        setMode(room.hostId === playerId ? 'host' : 'join');
        setStarted(room.started);
        setRoomCode(code);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error validating room:", err);
        setError("Failed to load room");
        setLoading(false);
      });
  }, [params.roomCode, playerId]);

  // Set validated to true once we have all the required data
  useEffect(() => {
    if (roomCode && nickname && playerId) {
      setIsValidated(true);
    }
  }, [roomCode, nickname, playerId]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        color: "var(--foreground)"
      }}>
        <div>Loading room...</div>
      </div>
    );
  }

  if (error) {
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
          <h2>Error</h2>
          <p>{error}</p>
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(to bottom, #FCC877 0%, #967747 100%)",
              color: "#15362C",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              marginTop: 16
            }}
          >
            Back to Main Menu
          </button>
        </div>
      </div>
    );
  }

  if (!roomCode) return null;


  if (!isValidated) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        color: "var(--foreground)"
      }}>
        <div>Validating room access...</div>
      </div>
    );
  }

  return (
    <Game 
      roomCode={roomCode}
      nickname={nickname}
      mode={mode}
      started={started}
      onBack={() => router.push("/")}
    />
  );
}
