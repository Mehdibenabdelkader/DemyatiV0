"use client";

import React, { useState } from "react";

type Props = {
  onHost: (nickname: string) => void;
  onJoin: (nickname: string) => void;
};

export default function MainMenu({ onHost, onJoin }: Props) {
  const [nickname, setNickname] = useState("");
  const [touched, setTouched] = useState(false);

  const valid = nickname.trim().length > 0;

  const handleHost = () => {
    setTouched(true);
    if (!valid) return;
    onHost(nickname.trim());
  };

  const handleJoin = () => {
    setTouched(true);
    if (!valid) return;
    onJoin(nickname.trim());
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      boxSizing: "border-box",
      background: "var(--background)",
      color: "var(--foreground)",
    }}>
      <div style={{ width: 480, maxWidth: "100%", textAlign: "center" }}>
        {/* Simple SVG title */}
        <div style={{ marginBottom: 24 }} aria-hidden>
          <svg width="100%" height="120" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Demyati title">
            <rect width="100%" height="100%" fill="transparent" />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontFamily="Segoe UI, Roboto, Arial" fontSize="44" fill="var(--accent-700)">Demyati</text>
            <text x="50%" y="82%" dominantBaseline="middle" textAnchor="middle" fontFamily="Segoe UI, Roboto, Arial" fontSize="14" fill="var(--muted)">Reach tile 200 — prime-powered cards!</text>
          </svg>
        </div>

        <div style={{ marginBottom: 12, textAlign: "left" }}>
          <label htmlFor="nickname" style={{ display: "block", marginBottom: 6, fontWeight: 600 }}>Nickname</label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Enter your nickname"
            style={{
              width: "100%",
              padding: "8px 10px",
              fontSize: 16,
              borderRadius: 6,
              border: touched && !valid ? "2px solid #ef4444" : "1px solid var(--accent-100)",
            }}
          />
          {touched && !valid ? (
            <div style={{ color: "#ef4444", marginTop: 8, fontSize: 13 }}>Nickname can't be empty.</div>
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 18 }}>
          <button
            onClick={handleHost}
            className="accent-btn"
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Host a room
          </button>

          <button
            onClick={handleJoin}
            style={{
              padding: "10px 18px",
              background: "var(--accent-50)",
              color: "var(--accent-900)",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Join a room
          </button>
        </div>
      </div>
    </main>
  );
}
