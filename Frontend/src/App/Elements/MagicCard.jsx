"use client";

import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import React, { useCallback, useRef } from "react";

import { cn } from "../../lib/utils";

export function MagicCard({
  children,
  className,
  gradientSize = 200,
  gradientColor = "#262626",
  gradientOpacity = 0.8,
  gradientFrom = "#9E7AFF",
  gradientTo = "#FE8BBB",
  borderWidth = 2,
}) {
  const cardRef = useRef(null);
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e) => {
      if (cardRef.current) {
        const { left, top } = cardRef.current.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
      }
    },
    [mouseX, mouseY],
  );

  const handleMouseOut = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <div
      ref={cardRef}
      className={cn("group relative rounded-[inherit]", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseOut}
    >
      {/* Gradient border - hidden on small screens */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 duration-300 group-hover:opacity-100 hidden md:block"
        style={{
          background: useMotionTemplate`
          radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px,
          ${gradientFrom}, 
          ${gradientTo}, 
          transparent 100%
          )
          `,
        }}
      />
      
      {/* Inner card background */}
      <div className="absolute inset-0 rounded-[inherit] bg-black/50" />
      
      {/* Actual content container with inner padding to create border effect */}
      <div className="absolute inset-[2px] rounded-[inherit] bg-black/70" />
      
      {/* Hover gradient effect - hidden on small screens */}
      <motion.div
        className="pointer-events-none absolute inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden md:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
          `,
          opacity: gradientOpacity,
        }}
      />
      
      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
}
