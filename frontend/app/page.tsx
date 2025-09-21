"use client";

import React, { useState } from "react";
import MainMenu from "../components/MainMenu";
import Game from "../components/Game";

export default function Home() {
  const [view, setView] = useState<"menu" | "game">("menu");
  const [nickname, setNickname] = useState("");
  const [mode, setMode] = useState<"host" | "join">("host");

  const handleHost = (name: string) => {
    setNickname(name);
    setMode("host");
    setView("game");
  };

  const handleJoin = (name: string) => {
    setNickname(name);
    setMode("join");
    setView("game");
  };

  const handleBack = () => {
    setView("menu");
  };

  return (
    <div>
      {view === "menu" ? (
        <MainMenu onHost={handleHost} onJoin={handleJoin} />
      ) : (
        <Game nickname={nickname} mode={mode} onBack={handleBack} />
      )}
    </div>
  );
}
