
"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";

interface HandDrawnButtonProps {
    text: string;
    href?: string;
}

function HandDrawnButton({ text, href = "/create" }: HandDrawnButtonProps) {
    const draw: Variants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                pathLength: { delay: 0.2, duration: 1.5 },
                opacity: { delay: 0.2, duration: 0.01 },
            },
        },
    };

    return (
        <Link href={href}>
            <div className="relative w-[220px] h-[70px] flex items-center justify-center cursor-pointer group">
                {/* The SVG container for the drawing animation */}
                <motion.svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 200 50"
                    preserveAspectRatio="none"
                    initial="hidden"
                    animate="visible"
                    className="absolute inset-0 z-10"
                >
                    {/* The simplified hand-drawn oval path */}
                    <motion.path
                        d="M10,25 C10,10 30,5 100,5 C170,5 190,10 190,25 C190,40 170,45 100,45 C30,45 10,40 10,25 Z"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        variants={draw}
                        className="text-lime-400 group-hover:text-white transition-colors"
                    />
                </motion.svg>

                {/* Button Text */}
                <span className="relative z-20 font-bold text-lg text-white group-hover:text-lime-400 transition-colors duration-300">
                    {text}
                </span>
            </div>
        </Link>
    );
}

export { HandDrawnButton };
