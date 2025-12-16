'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RainingLetters: React.FC = () => {
  const [letters, setLetters] = useState<Array<{ id: number; char: string; x: number; y: number; speed: number; opacity: number }>>([]);

  useEffect(() => {
    const generateLetters = () => {
      const newLetters = [];
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

      for (let i = 0; i < 50; i++) {
        newLetters.push({
          id: i,
          char: chars[Math.floor(Math.random() * chars.length)],
          x: Math.random() * window.innerWidth,
          y: -20,
          speed: Math.random() * 3 + 1,
          opacity: Math.random() * 0.5 + 0.1,
        });
      }
      setLetters(newLetters);
    };

    generateLetters();

    const animateLetters = () => {
      setLetters(prevLetters =>
        prevLetters.map(letter => ({
          ...letter,
          y: letter.y + letter.speed,
        })).filter(letter => letter.y < window.innerHeight + 20)
      );
    };

    const interval = setInterval(animateLetters, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        {letters.map(letter => (
          <motion.div
            key={letter.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: letter.opacity,
              y: letter.y,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute text-lime-400 font-mono text-sm"
            style={{
              left: letter.x,
              top: letter.y,
            }}
          >
            {letter.char}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default RainingLetters;