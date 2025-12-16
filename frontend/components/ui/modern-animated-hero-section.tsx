'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const RainingLetters: React.FC = () => {
  const [letters, setLetters] = useState<Array<{ id: number; char: string; x: number; y: number; speed: number; opacity: number }>>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (typeof window === 'undefined') return;

    let animationId: number;
    let lastTime = 0;
    let letterId = 0;

    const generateNewLetter = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      return {
        id: letterId++,
        char: chars[Math.floor(Math.random() * chars.length)],
        x: Math.random() * window.innerWidth,
        y: -20,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
      };
    };

    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= 50) { // Update every 50ms
        setLetters(prevLetters => {
          let newLetters = prevLetters
            .map(letter => ({
              ...letter,
              y: letter.y + letter.speed,
            }))
            .filter(letter => letter.y < window.innerHeight + 50);

          // Always maintain at least 20 letters on screen
          while (newLetters.length < 20) {
            newLetters.push(generateNewLetter());
          }

          // Occasionally add new letters for continuous effect
          if (Math.random() < 0.1 && newLetters.length < 30) {
            newLetters.push(generateNewLetter());
          }

          return newLetters;
        });
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    // Start with initial letters
    const initialLetters = [];
    for (let i = 0; i < 20; i++) {
      initialLetters.push(generateNewLetter());
    }
    setLetters(initialLetters);

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  // Don't render anything on server to prevent hydration mismatch
  if (!isClient) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      suppressHydrationWarning
    >
      {letters.map(letter => (
        <motion.div
          key={letter.id}
          className="absolute text-lime-400 font-mono text-sm select-none"
          style={{
            left: letter.x,
            top: letter.y,
            opacity: letter.opacity,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: letter.opacity }}
          transition={{ duration: 0.1 }}
          suppressHydrationWarning
        >
          {letter.char}
        </motion.div>
      ))}
    </div>
  );
};

export default RainingLetters;