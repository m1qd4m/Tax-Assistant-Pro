import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';
import logoPng from '@assets/generated_images/app_icon_for_a_92f2.png';

export function Scene1() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000),
      setTimeout(() => setPhase(3), 3500),
      setTimeout(() => setPhase(4), 5000), // begin exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-20"
      {...sceneTransitions.fadeBlur}>
      
      {/* Midground elements */}
      <motion.div 
        className="absolute w-[80vw] h-[80vw] rounded-full bg-secondary/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0, rotate: -30 }}
        animate={phase >= 1 ? { opacity: 1, scale: 1, rotate: 0 } : { opacity: 0, scale: 0, rotate: -30 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative z-10 mb-12 shadow-2xl shadow-primary/50 rounded-[4rem] overflow-hidden"
      >
        <img src={logoPng} alt="Tax Helper Logo" className="w-48 h-48 object-cover" />
      </motion.div>

      <div className="text-center relative z-10 w-full">
        <motion.h1 
          className="text-[6vw] font-bold tracking-tight text-white leading-[1.1] font-display mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          Pakistan's tax laws,<br />
          <motion.span 
            className="text-secondary"
            initial={{ opacity: 0, filter: "blur(10px)" }}
            animate={phase >= 3 ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            finally made simple.
          </motion.span>
        </motion.h1>
      </div>

    </motion.div>
  );
}
