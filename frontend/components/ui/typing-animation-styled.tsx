"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TextPart {
  text: string;
  className?: string;
}

interface TypingAnimationStyledProps {
  parts: TextPart[];
  duration?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingAnimationStyled({
  parts,
  duration = 80,
  className,
  onComplete,
}: TypingAnimationStyledProps) {
  const [displayedParts, setDisplayedParts] = useState<TextPart[]>([]);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if (currentPartIndex >= parts.length) {
      onComplete?.();
      return;
    }

    const currentPart = parts[currentPartIndex];
    const timer = setInterval(() => {
      setDisplayedParts(prev => {
        const newParts = [...prev];
        if (newParts.length <= currentPartIndex) {
          newParts.push({ text: "", className: currentPart.className });
        }

        const currentDisplayedPart = newParts[currentPartIndex];
        currentDisplayedPart.text = currentPart.text.substring(0, currentCharIndex + 1);

        return newParts;
      });

      setCurrentCharIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= currentPart.text.length) {
          // Move to next part
          setCurrentPartIndex(prevPartIndex => prevPartIndex + 1);
          return 0;
        }
        return nextIndex;
      });
    }, duration);

    return () => clearInterval(timer);
  }, [currentPartIndex, currentCharIndex, parts, duration, onComplete]);

  return (
    <span className={cn("inline", className)}>
      {displayedParts.map((part, index) => (
        <span key={index} className={part.className}>
          {part.text}
        </span>
      ))}
      {/* Show cursor */}
      {currentPartIndex < parts.length && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

