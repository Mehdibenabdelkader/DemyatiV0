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
      /* let the global body background show through */
      background: "transparent",
      color: "var(--foreground)",
    }}>
      <div style={{ width: 480, maxWidth: "100%", textAlign: "center" }}>
        {/* Title image from public folder */}
        <div style={{ marginBottom: 24 }} aria-hidden>
          <img src="/GameTitleImg.svg" alt="Demyati" style={{ width: "100%", height: 220, objectFit: "contain" }} />
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
            <div style={{ color: "#ef4444", marginTop: 8, fontSize: 13 }}>Nickname can&apos;t be empty.</div>
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
              color: "#15362C",
              background: "linear-gradient(to bottom, #FCC877 0%, #967747 100%)",
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(0.98)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
            onFocus={(e) => (e.currentTarget.style.outline = "3px solid rgba(150,119,71,0.25)")}
            onBlur={(e) => (e.currentTarget.style.outline = "none")}
          >
            Host a room
          </button>

          <button
            onClick={handleJoin}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(to bottom, #FCC877 0%, #967747 100%)",
              color: "#15362C",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = "brightness(0.98)")}
            onMouseOut={(e) => (e.currentTarget.style.filter = "none")}
            onFocus={(e) => (e.currentTarget.style.outline = "3px solid rgba(150,119,71,0.25)")}
            onBlur={(e) => (e.currentTarget.style.outline = "none")}
          >
            Join a room
          </button>
        </div>
      </div>
    </main>
  );
}
