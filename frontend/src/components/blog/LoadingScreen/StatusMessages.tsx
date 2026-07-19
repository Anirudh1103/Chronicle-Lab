import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MESSAGES = [
  'Initializing Secure Session...',
  'Authenticating User...',
  'Decrypting Historical Archive...',
  'Loading Intelligence Database...',
  'Verifying Digital Signature...',
  'Accessing Chronicle Records...',
  'Establishing Secure Connection...',
  'Preparing Knowledge Archive...',
  'Retrieving Classified Document...',
  'Decoding Historical Intelligence...',
];

interface StatusMessagesProps {
  progress: number;
}

export function StatusMessages({ progress }: StatusMessagesProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-6 flex items-center justify-center overflow-hidden font-mono text-xs select-none">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-cyan-400 font-bold uppercase tracking-widest text-center"
        >
          {MESSAGES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
