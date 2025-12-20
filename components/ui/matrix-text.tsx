'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LetterState {
    char: string;
    isMatrix: boolean;
    isSpace: boolean;
}

interface MatrixTextProps {
    text?: string;
    className?: string;
    initialDelay?: number;
    letterAnimationDuration?: number;
    letterInterval?: number;
}

export const MatrixText = ({
    text = "HelloWorld!",
    className,
    initialDelay = 200,
    letterAnimationDuration = 500,
    letterInterval = 100,
}: MatrixTextProps) => {
    const [letters, setLetters] = useState<LetterState[]>(() =>
        text.split("").map((char) => ({
            char,
            isMatrix: false,
            isSpace: char === " ",
        }))
    );

    const getRandomChar = useCallback(
        () => (Math.random() > 0.5 ? "1" : "0"),
        []
    );

    useEffect(() => {
        const timeouts: NodeJS.Timeout[] = [];

        const cleanup = () => {
            timeouts.forEach(clearTimeout);
        };

        const startAnimationCycle = () => {
            let currentIndex = 0;

            const animateLetter = (index: number) => {
                requestAnimationFrame(() => {
                    setLetters((prev) => {
                        const newLetters = [...prev];
                        if (newLetters[index] && !newLetters[index].isSpace) {
                            newLetters[index] = { ...newLetters[index], char: getRandomChar(), isMatrix: true };
                        }
                        return newLetters;
                    });
                });

                const unscrambleTimeout = setTimeout(() => {
                    setLetters((prev) => {
                        const newLetters = [...prev];
                        if (newLetters[index]) {
                            newLetters[index] = { ...newLetters[index], char: text[index], isMatrix: false };
                        }
                        return newLetters;
                    });
                }, letterAnimationDuration);
                timeouts.push(unscrambleTimeout);
            };

            const animate = () => {
                if (currentIndex >= text.length) {
                    const loopTimeout = setTimeout(startAnimationCycle, 3000);
                    timeouts.push(loopTimeout);
                    return;
                }

                animateLetter(currentIndex);
                currentIndex++;

                const nextLetterTimeout = setTimeout(animate, letterInterval);
                timeouts.push(nextLetterTimeout);
            };

            animate();
        };

        const initialStartTimeout = setTimeout(startAnimationCycle, initialDelay);
        timeouts.push(initialStartTimeout);

        return cleanup;
    }, [text, initialDelay, letterAnimationDuration, letterInterval, getRandomChar]);

    const motionVariants = useMemo(
        () => ({
            matrix: {
                color: "#a3e635",
                textShadow: "0 2px 4px rgba(163, 230, 53, 0.5)",
            },
        }),
        []
    );

    return (
        <div
            className={cn("flex flex-wrap justify-center", className)}
            aria-label="Matrix text animation"
        >
            {letters.map((letter, index) => (
                <motion.div
                    key={`${index}-${letter.char}`}
                    className="font-mono w-[1ch] text-center overflow-hidden"
                    initial="initial"
                    animate={letter.isMatrix ? "matrix" : "normal"}
                    variants={motionVariants}
                    transition={{
                        duration: 0.1,
                        ease: "easeInOut",
                    }}
                    style={{
                        display: "inline-block",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {letter.isSpace ? "\u00A0" : letter.char}
                </motion.div>
            ))}
        </div>
    );
};