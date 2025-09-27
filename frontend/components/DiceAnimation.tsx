/**
 * DICE ANIMATION COMPONENT
 * 
 * This component handles the visual dice rolling animation and result display.
 * It shows animated dice during the roll and then displays the final result.
 */

"use client";

import React, { useEffect, useState } from "react";

interface DiceAnimationProps {
  isRolling: boolean;
  result: number | null;
  onAnimationComplete: () => void;
}

/**
 * Dice Animation Component
 * 
 * Displays animated dice during rolling and shows the final result.
 * 
 * @param isRolling - Whether the dice is currently rolling
 * @param result - The final dice result (null during animation)
 * @param onAnimationComplete - Callback when animation finishes
 */
export default function DiceAnimation({ isRolling, result, onAnimationComplete }: DiceAnimationProps) {
  const [displayValue, setDisplayValue] = useState<number | null>(null);
  const [animationStep, setAnimationStep] = useState(0);

  // Generate random dice values during animation
  useEffect(() => {
    if (!isRolling) return;

    const interval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 11) + 2); // 2-12
      setAnimationStep(prev => prev + 1);
    }, 100);

    // Stop animation after 1 second
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValue(result);
      setAnimationStep(0);
      onAnimationComplete();
    }, 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling, result, onAnimationComplete]);

  // Reset when not rolling
  useEffect(() => {
    if (!isRolling) {
      setDisplayValue(null);
      setAnimationStep(0);
    }
  }, [isRolling]);

  if (!isRolling && !result) return null;

  return (
    <div style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 20,
      background: "rgba(0, 0, 0, 0.8)",
      padding: "40px",
      borderRadius: "20px",
      backdropFilter: "blur(10px)",
      border: "2px solid #FCC877"
    }}>
      {/* Dice Container */}
      <div style={{
        display: "flex",
        gap: 20,
        alignItems: "center"
      }}>
        {/* First Die */}
        <div style={{
          width: 80,
          height: 80,
          background: "white",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
          border: "3px solid #FCC877",
          transform: isRolling ? `rotate(${animationStep * 45}deg) scale(${1 + Math.sin(animationStep * 0.5) * 0.1})` : "rotate(0deg) scale(1)",
          transition: isRolling ? "none" : "transform 0.5s ease-out"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#15362C",
            textAlign: "center"
          }}>
            {displayValue ? Math.ceil(displayValue / 2) : "?"}
          </div>
        </div>

        {/* Second Die */}
        <div style={{
          width: 80,
          height: 80,
          background: "white",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.3)",
          border: "3px solid #FCC877",
          transform: isRolling ? `rotate(${-animationStep * 30}deg) scale(${1 + Math.cos(animationStep * 0.3) * 0.1})` : "rotate(0deg) scale(1)",
          transition: isRolling ? "none" : "transform 0.5s ease-out"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#15362C",
            textAlign: "center"
          }}>
            {displayValue ? Math.floor(displayValue / 2) + (displayValue % 2) : "?"}
          </div>
        </div>
      </div>

      {/* Result Display */}
      <div style={{
        fontSize: 32,
        fontWeight: "bold",
        color: "#FCC877",
        textAlign: "center",
        textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)"
      }}>
        {isRolling ? "Rolling..." : `Result: ${result}`}
      </div>

      {/* Rolling indicator */}
      {isRolling && (
        <div style={{
          display: "flex",
          gap: 4,
          alignItems: "center"
        }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "#FCC877",
                animation: `bounce 0.6s infinite ${i * 0.2}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
