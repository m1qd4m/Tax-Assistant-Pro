import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene4() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => setPhase(5), 4500),
      setTimeout(() => setPhase(6), 5500),
      setTimeout(() => setPhase(7), 8500), // exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const steps = ["Personal Info", "Family Status", "Profession", "Income", "Results"];

  return (
    <motion.div className="absolute inset-0 flex items-center justify-between p-24"
      {...sceneTransitions.morphExpand}>
      
      <div className="w-2/5 pr-12">
        <motion.h2 
          className="text-[4.5vw] font-bold text-white leading-tight font-display mb-6"
          initial={{ opacity: 0, x: -30 }}
          animate={phase >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
          transition={{ duration: 0.8 }}
        >
          A guided <br/>5-step flow.
        </motion.h2>
        <motion.p 
          className="text-[2vw] text-white/60"
          initial={{ opacity: 0 }}
          animate={phase >= 2 ? { opacity: 1 } : { opacity: 0 }}
        >
          Personal, fast, and simple.
        </motion.p>
      </div>

      <div className="w-3/5 relative h-full flex flex-col justify-center gap-6 pl-12">
        {steps.map((step, i) => {
          const stepPhase = phase >= i + 2;
          return (
            <motion.div
              key={i}
              className="flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/10"
              initial={{ opacity: 0, x: 50 }}
              animate={stepPhase ? { opacity: 1, x: 0, backgroundColor: phase === i + 2 ? 'rgba(224, 242, 233, 0.2)' : 'rgba(255, 255, 255, 0.05)' } : { opacity: 0, x: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl transition-colors duration-500 ${phase === i + 2 ? 'bg-secondary text-primary' : 'bg-primary text-secondary'}`}>
                {i + 1}
              </div>
              <span className="text-[2vw] text-white font-medium">{step}</span>
              {phase === i + 2 && (
                <motion.div 
                  className="ml-auto w-3 h-3 rounded-full bg-secondary"
                  layoutId="activeIndicator"
                />
              )}
            </motion.div>
          );
        })}
      </div>

    </motion.div>
  );
}
