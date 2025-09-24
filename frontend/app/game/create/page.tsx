"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createRoom } from "../../../lib/rooms";

export default function CreateRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createRoomAndRedirect = async () => {
      try {
        const nickname = searchParams.get('nickname') || sessionStorage.getItem('demyati_nickname') || '';
        const mode = searchParams.get('mode') as 'host' | 'join' || 'host';
        
        if (!nickname) {
          setError("Nickname is required");
          setLoading(false);
          return;
        }

        // Generate player ID and store it
        const playerId = Math.random().toString(36).slice(2, 9);
        sessionStorage.setItem('demyati_player_id', playerId);

        // Create room
        const roomCode = await createRoom({
          id: playerId,
          name: nickname,
          color: "#ef4444",
          ready: false,
          isHost: true
        });

        // Redirect to the actual room with simplified URL
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

  return null; // This should not render as we redirect immediately
}
