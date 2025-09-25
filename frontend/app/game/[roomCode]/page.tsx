/**
 * GAME ROOM PAGE COMPONENT
 * 
 * This page handles the main game room functionality where players
 * can join existing rooms and participate in the game. It's accessed
 * via URLs like /game/[roomCode] where roomCode is a 4-digit room code.
 * 
 * The page performs the following operations:
 * 1. Validates the room exists and is accessible
 * 2. Checks if the player is already in the room
 * 3. If not, attempts to join the player to the room
 * 4. Renders the appropriate game interface (lobby or game)
 * 
 * This component handles both host and join scenarios and provides
 * appropriate error handling for invalid rooms or connection issues.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Game from "../../../components/Game";
import { getRoom } from "../../../lib/rooms";

/**
 * GameRoomPage Component
 * 
 * The main game room page that handles room validation, player joining,
 * and rendering the appropriate game interface based on the room state.
 * 
 * @returns JSX element containing the game interface or error states
 */
export default function GameRoomPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State management for the component
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Get player ID from URL params or sessionStorage
  const playerId = searchParams.get('playerId') || sessionStorage.getItem('demyati_player_id');
  const [nickname, setNickname] = useState<string>('');
  const [mode, setMode] = useState<'host' | 'join'>('join');
  const [started, setStarted] = useState<boolean>(false);

  /**
   * Effect hook that handles room validation and player joining
   * 
   * This effect runs when the component mounts and performs the following:
   * 1. Validates the room code from URL parameters
   * 2. Validates the player ID exists
   * 3. Fetches the room data from the backend
   * 4. Checks if the player is already in the room
   * 5. If not, attempts to join the player to the room
   * 6. Sets up the player's game state and interface
   */
  useEffect(() => {
    const code = params.roomCode as string;
    
    // Validate room code exists
    if (!code) {
      setError("Invalid room code");
      setLoading(false);
      return;
    }

    // Validate player ID exists
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
              color: "#ef4444", // Default red color
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

  /**
   * Effect hook that sets validation state
   * 
   * Sets isValidated to true once all required data is available.
   * This ensures the Game component only renders when we have
   * complete player and room information.
   */
  useEffect(() => {
    if (roomCode && nickname && playerId) {
      setIsValidated(true);
    }
  }, [roomCode, nickname, playerId]);

  /**
   * Loading State
   * 
   * Displays a loading message while room data is being fetched
   * and player is being joined to the room.
   */
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

  /**
   * Error State
   * 
   * Displays an error message if room validation or joining fails.
   * Provides a button to return to the main menu.
   */
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

  // Guard clause: ensure room code exists
  if (!roomCode) return null;

  /**
   * Validation State
   * 
   * Displays a validation message while ensuring all required
   * data is available before rendering the game interface.
   */
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

  /**
   * Game Interface
   * 
   * Renders the main Game component with all the validated
   * player and room information. This is the main game interface
   * that handles both lobby and gameplay states.
   */
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
