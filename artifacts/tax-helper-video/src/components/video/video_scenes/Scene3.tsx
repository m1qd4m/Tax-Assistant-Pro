import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { sceneTransitions } from '@/lib/video/animations';

export function Scene3() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 2000), // Card 1
      setTimeout(() => setPhase(3), 4000), // Card 2
      setTimeout(() => setPhase(4), 6000), // Card 3
      setTimeout(() => setPhase(5), 9000), // Exit
    ];
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  const cards = [
    {
      title: "Widow Relief",
      desc: "50% income tax exemption under ITO Section 53",
      delay: phase >= 2
    },
    {
      title: "IT Freelancers",
      desc: "0.25% final tax on foreign income (SRO 1)",
      delay: phase >= 3,
      image: `${import.meta.env.BASE_URL}images/freelancer.jpg`
    },
    {
      title: "Farmers",
      desc: "Agricultural income federally exempt",
      delay: phase >= 4,
      image: `${import.meta.env.BASE_URL}images/farmer.jpg`
    }
  ];

  return (
    <motion.div className="absolute inset-0 flex flex-col p-24"
      {...sceneTransitions.slideUp}>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={phase >= 1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.8 }}
        className="mb-16"
      >
        <h2 className="text-[4vw] font-bold text-white font-display">Special Reliefs</h2>
        <div className="w-24 h-1 bg-secondary mt-4" />
      </motion.div>

      <div className="flex-1 flex gap-8">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            className="flex-1 relative rounded-3xl overflow-hidden bg-primary/40 border border-secondary/20 flex flex-col justify-end p-8"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={card.delay ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {card.image && (
              <div className="absolute inset-0 z-0">
                <img src={card.image} alt={card.title} className="w-full h-full object-cover opacity-30 mix-blend-luminosity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            )}
            <div className="relative z-10">
              <h3 className="text-[2.5vw] font-bold text-white mb-2 font-display">{card.title}</h3>
              <p className="text-[1.2vw] text-secondary/90">{card.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

    </motion.div>
  );
}
