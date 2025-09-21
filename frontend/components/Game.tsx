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
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, color: "var(--accent-700)" }}>Demyati — Game</h2>
        <div>
          <button onClick={onBack} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--accent-100)" }}>
            Back
          </button>
        </div>
      </header>

      <section style={{ marginTop: 18 }}>
        <p>Nickname: <strong>{nickname}</strong></p>
        <p>Mode: <strong>{mode}</strong></p>

        <div style={{ marginTop: 20, padding: 12, border: "1px dashed var(--accent-300)", borderRadius: 8, background: "var(--accent-50)" }}>
          <p style={{ margin: 0 }}>[Game UI placeholder] Implement board, players, dice and cards here.</p>
        </div>
      </section>
    </div>
  );
}
