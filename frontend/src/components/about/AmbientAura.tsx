import React from 'react';
import { motion } from 'framer-motion';

export const AmbientAura: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Primary Glow */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]"
      />

      {/* Secondary Glow */}
      <motion.div
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 100, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]"
      />

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-0 w-full h-[30%] bg-gradient-to-t from-background to-transparent opacity-100" />
    </div>
  );
};
