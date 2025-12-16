'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, typingSpeed);

    return () => clearInterval(timer);
  }, [text, typingSpeed]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, cursorBlinkSpeed);

    return () => clearInterval(cursorTimer);
  }, [cursorBlinkSpeed]);

  return (
    <span className={className}>
      {displayedText}
      <AnimatePresence>
        {displayedText.length < text.length && showCursor && (
          <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block w-0.5 h-[1em] bg-lime-400 ml-0.5"
          />
        )}
      </AnimatePresence>
    </span>
  );
};