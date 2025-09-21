"use client";

import React, { useState } from "react";
import Lobby from "./Lobby";

type Props = {
  nickname: string;
  mode: "host" | "join";
  onBack: () => void;
};

export default function Game({ nickname, mode, onBack }: Props) {
  const [started, setStarted] = useState(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  if (!started) {
    return (
      <Lobby nickname={nickname} mode={mode} onBack={onBack} onStarted={(code) => {
        setRoomCode(code);
        setStarted(true);
      }} />
    );
  }

  return (
    <div style={{ padding: 24, background: "transparent", color: "var(--foreground)", minHeight: "100vh" }}>
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

      <section style={{ marginTop: 18 }}>
        <div style={{ marginTop: 20, padding: 12, border: "1px dashed var(--accent-300)", borderRadius: 8, background: "var(--accent-50)" }}>
          <p style={{ margin: 0 }}>[Game started] Replace with actual game UI.</p>
        </div>
      </section>
    </div>
  );
}
