import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionAnimationProps {
  type: 'archive' | 'burn' | null;
  onComplete: () => void;
}

export const ActionAnimation: React.FC<ActionAnimationProps> = ({ type, onComplete }) => {
  const [phase, setPhase] = useState<'idle' | 'animate' | 'out'>('idle');

  useEffect(() => {
    audio.play().catch(() => {});

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800);
    }, 3500);

    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [type, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-hidden select-none"
        >
          {/* Background Ambient Glow */}
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`absolute inset-0 ${type === 'fire' ? 'bg-neon-pink/10' : 'bg-neon-blue/10'}`}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* The Ritual Symbol */}
            <motion.div
              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative mb-12"
            >
              {type === 'shelf' ? (
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-10 border-2 border-dashed border-neon-blue/20 rounded-full"
                  />
                  <div className="w-40 h-40 glass-card rounded-[3rem] flex items-center justify-center border-neon-blue/30 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
                    <Zap className="w-20 h-20 neon-text-blue" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-10 bg-neon-pink/10 blur-3xl rounded-full"
                  />
                  <div className="w-40 h-40 glass-card rounded-[3rem] flex items-center justify-center border-neon-pink/30 shadow-[0_0_50px_rgba(255,0,255,0.2)]">
                    <Flame className="w-20 h-20 neon-text-pink" />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Narrative Text */}
            <div className="text-center">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl font-black italic tracking-tighter text-white mb-4 uppercase"
              >
                {type === 'shelf' ? "Archived to Soul" : "Released to Ashes"}
              </motion.h2>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-center gap-4 text-white/20"
              >
                <div className="h-px w-10 bg-white/10" />
                <span className="text-xs font-black uppercase tracking-[0.4em]">仪式完成</span>
                <div className="h-px w-10 bg-white/10" />
              </motion.div>
            </div>

            {/* Particle Effects (Fixed) */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{ 
                    x: (Math.random() - 0.5) * 600, 
                    y: (Math.random() - 0.5) * 600,
                    opacity: [0, 1, 0],
                    scale: [0, Math.random() * 2, 0],
                  }}
                  transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
                  className={`absolute w-1 h-1 rounded-full ${type === 'fire' ? 'bg-neon-pink' : 'bg-neon-blue'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Floating Vibe Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 right-20 text-white/5"
          >
            <Ghost className="w-32 h-32" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 left-20 text-white/5"
          >
            <Sparkles className="w-32 h-32" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

