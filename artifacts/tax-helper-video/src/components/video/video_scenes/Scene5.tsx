import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';
import logoPng from '@assets/generated_images/app_icon_for_a_92f2.png';

export function Scene5() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 7000), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-24"
      {...sceneTransitions.zoomThrough}>
      
      <div className="text-center relative z-10 mb-20">
        <motion.h2 
          className="text-[5vw] font-bold text-white font-display mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Know your rights.
        </motion.h2>
        <motion.h2 
          className="text-[5vw] font-bold text-secondary font-display"
          initial={{ opacity: 0, y: 30 }}
          animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          File with confidence.
        </motion.h2>
      </div>

      <motion.div
        className="flex items-center gap-8"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={phase >= 3 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={logoPng} alt="Tax Helper" className="w-24 h-24 rounded-3xl shadow-xl" />
        <div>
          <div className="text-[3vw] font-bold text-white font-display leading-tight">Tax Helper</div>
          <div className="text-[1.5vw] text-white/60">Tax Year 2024-25</div>
        </div>
      </motion.div>

    </motion.div>
  );
}
