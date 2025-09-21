"use client";

import React from "react";

type Props = {
  nickname: string;
  mode: "host" | "join";
  onBack: () => void;
};

export default function Game({ nickname, mode, onBack }: Props) {
  return (
    <div style={{ padding: 24, background: "var(--background)", color: "var(--foreground)", minHeight: "100vh" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Left: Back button */}
        <div style={{ flex: "0 0 auto" }}>
          <button onClick={onBack} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-100)" }}>
            Back
          </button>
        </div>

        {/* Center: Title with SVG placeholder */}
        <div style={{ flex: "1 1 auto", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* SVG placeholder */}
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <rect x="2" y="2" width="20" height="20" rx="4" stroke="var(--accent-200)" strokeWidth="1.5" fill="var(--accent-50)" />
              <circle cx="12" cy="12" r="4" fill="var(--accent-300)" />
            </svg>
            <h2 style={{ margin: 0, color: "var(--accent-700)", textAlign: "center" }}>Demyati — Game</h2>
          </div>
        </div>

        {/* Right: player info */}
        <div style={{ flex: "0 0 auto", textAlign: "right" }}>
          <div style={{ fontSize: 14 }}>
            <div>Nickname: <strong>{nickname}</strong></div>
            <div>Mode: <strong>{mode}</strong></div>
            <div>Room: <strong>0000</strong></div>
          </div>
        </div>
      </header>

      <section style={{ marginTop: 18 }}>
        {/* <p>Nickname: <strong>{nickname}</strong></p>
        <p>Mode: <strong>{mode}</strong></p> */}

        <div style={{ marginTop: 20, padding: 12, border: "1px dashed var(--accent-300)", borderRadius: 8, background: "var(--accent-50)" }}>
          <p style={{ margin: 0 }}>[Game UI placeholder] Implement board, players, dice and cards here.</p>
        </div>
      </section>
    </div>
  );
}
