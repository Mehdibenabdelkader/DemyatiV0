/**
 * CREATE ROOM PAGE COMPONENT
 * 
 * This page handles the automatic creation of a new game room.
 * It's accessed when a user clicks "Host a room" from the main menu.
 * 
 * The page performs the following operations:
 * 1. Retrieves the player's nickname from URL params or session storage
 * 2. Generates a unique player ID
 * 3. Creates a new room via the backend API
 * 4. Redirects the user to the game room page
 * 
 * This is a client-side component that handles the room creation flow
 * and provides loading/error states during the process.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createRoom } from "../../../lib/rooms";

/**
 * CreateRoomPage Component
 * 
 * Handles the automatic creation of a new game room and redirects
 * the user to the game room page. This component is designed to
 * be a seamless transition from the main menu to the game room.
 * 
 * @returns JSX element containing loading, error, or redirect logic
 */
export default function CreateRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Effect hook that handles room creation and redirection
   * 
   * This effect runs once when the component mounts and performs
   * the complete room creation flow:
   * 1. Get player nickname from URL params or session storage
   * 2. Generate a unique player ID
   * 3. Create the room via backend API
   * 4. Redirect to the game room page
   */
  useEffect(() => {
    const createRoomAndRedirect = async () => {
      try {
        // Get player nickname from URL params or session storage
        const nickname = searchParams.get('nickname') || sessionStorage.getItem('demyati_nickname') || '';
        const mode = searchParams.get('mode') as 'host' | 'join' || 'host';
        
        // Validate that nickname is provided
        if (!nickname) {
          setError("Nickname is required");
          setLoading(false);
          return;
        }

        // Generate unique player ID and store it in session storage
        const playerId = Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem('demyati_player_id', playerId);

        // Create room with host player data
        const roomCode = await createRoom({
          id: playerId,
          name: nickname,
          color: "#ef4444", // Default red color
          ready: false,
          isHost: true
        });

        // Redirect to the game room page with the room code and player ID
        router.replace(`/game/${roomCode}?playerId=${playerId}`);
      } catch (error) {
        console.error("Failed to create room:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to create room. Please try again.";
        setError(errorMessage);
        setLoading(false);
      }
    };

    createRoomAndRedirect();
  }, [router, searchParams]);

  /**
   * Loading State
   * 
   * Displays a loading message while the room is being created.
   * This provides user feedback during the async room creation process.
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
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>Creating room...</div>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>Please wait</div>
        </div>
      </div>
    );
  }

  /**
   * Error State
   * 
   * Displays an error message if room creation fails.
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

  /**
   * Default State
   * 
   * This should not render as the component redirects immediately
   * after successful room creation. If this renders, it indicates
   * an issue with the room creation flow.
   */
  return null;
}
