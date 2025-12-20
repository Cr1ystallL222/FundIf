import { cn } from "@/lib/utils";
import React from "react";

export const Meteors = ({
  number,
  className,
}: {
  number?: number;
  className?: string;
}) => {
  const meteors = new Array(number || 20).fill(true);
  const backgroundTexts = [
    "Conditional Triggers\nFund a cause ONLY if a specific event happens. Like donating to a legal defense fund only if charges are filed. This isn't about verifying milestones; it's about programmatic contingency.",
    "Identity & Transparency\nPowered by Basenames. You see exactly who you are funding. The contract is verified and open-source, ensuring that once the campaign starts, the creator has zero control over the funds.",
    "Guaranteed Refunds\nThere is no middleman to beg for a refund. If the Polymarket oracle resolves the event to NO, the smart contract automatically unlocks 100% of funds for backers to claim."
  ];

  return (
    <>
      {/* Background Text Elements */}
      {backgroundTexts.map((text, idx) => (
        <div
          key={`bg-text-${idx}`}
          className={cn(
            "absolute text-zinc-800/20 font-mono text-xs leading-relaxed whitespace-pre-line pointer-events-none select-none",
            "animate-pulse opacity-30"
          )}
          style={{
            top: `${20 + idx * 25}%`,
            left: `${10 + (idx % 2) * 50}%`,
            transform: `rotate(${idx * 2 - 1}deg)`,
            animationDelay: `${idx * 0.5}s`,
            animationDuration: "8s",
            zIndex: 0,
          }}
        >
          {text}
        </div>
      ))}

      {/* Meteor Elements */}
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[#64748b] before:to-transparent",
            className
          )}
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
            zIndex: 1,
          }}
        ></span>
      ))}
    </>
  );
};