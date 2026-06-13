import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene2() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4500),
      setTimeout(() => setPhase(4), 7000), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex items-center p-24"
      {...sceneTransitions.clipPolygon}>
      
      <div className="w-1/2 relative z-10 pr-12">
        <motion.div 
          className="w-16 h-1 bg-error mb-8 rounded-full"
          initial={{ scaleX: 0, originX: 0 }}
          animate={phase >= 1 ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.h2 
          className="text-[5vw] font-bold tracking-tight text-white leading-[1.1] font-display mb-8"
          initial={{ opacity: 0, x: -40 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Millions overpay...
        </motion.h2>

        <motion.p 
          className="text-[2.5vw] text-white/70 font-light"
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          ...or don't know their rights.
        </motion.p>
      </div>

      <div className="w-1/2 relative h-full flex items-center justify-center">
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="text-[12vw] font-black text-white/5 tracking-tighter leading-none text-center">
            ITO 2001
            <br />
            COMPLEX
            <br />
            LAWS
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
}
