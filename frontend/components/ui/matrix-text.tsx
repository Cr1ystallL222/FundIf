'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MatrixTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  cursorBlinkSpeed?: number;
}

export const MatrixText: React.FC<MatrixTextProps> = ({
  text,
  className = '',
  typingSpeed = 50,
  cursorBlinkSpeed = 500,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const cursorTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Clear any existing cursor timer
    if (cursorTimerRef.current) {
      clearInterval(cursorTimerRef.current);
    }

    // Start typing animation
    let index = 0;
    const typingTimer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typingTimer);
      }
    }, typingSpeed);

    // Start cursor blinking
    cursorTimerRef.current = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => {
      clearInterval(typingTimer);
      if (cursorTimerRef.current) {
        clearInterval(cursorTimerRef.current);
      }
    };
  }, [text, typingSpeed, cursorBlinkSpeed, isClient]);

  // Don't render anything on server to prevent hydration mismatch
  if (!isClient) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {displayedText}
      {displayedText.length < text.length && showCursor && (
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-[1em] bg-lime-400 ml-0.5"
        />
      )}
    </span>
  );
};