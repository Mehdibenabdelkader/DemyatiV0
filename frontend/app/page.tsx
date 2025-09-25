/**
 * HOME PAGE COMPONENT
 * 
 * This is the main entry point for the Demyati game application.
 * It renders the MainMenu component which provides the initial
 * user interface for creating or joining game rooms.
 * 
 * The page is marked as a client component since it needs to handle
 * user interactions and state management.
 */

"use client";

import React from "react";
import MainMenu from "../components/MainMenu";

/**
 * Home Component
 * 
 * The main page component that renders the game's main menu.
 * This is the first screen users see when they visit the application.
 * 
 * @returns JSX element containing the MainMenu component
 */
export default function Home() {
  return <MainMenu />;
}
