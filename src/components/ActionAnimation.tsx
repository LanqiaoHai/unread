import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Ghost, Zap, Flame } from 'lucide-react';

interface ActionAnimationProps {
  type: 'archive' | 'burn' | null;
  onComplete: () => void;
}

export const ActionAnimation: React.FC<ActionAnimationProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 800);
      }, 3500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [type, onComplete]);

  if (!type) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-2xl overflow-hidden select-none"
        >
          {/* Background Ambient Glow */}
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className={`absolute inset-0 ${type === 'burn' ? 'bg-brand-orange/10' : 'bg-brand-yellow/10'}`}
          />

          <div className="relative z-10 flex flex-col items-center justify-center">
            
            {/* The Ritual Symbol */}
            <motion.div
              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="relative mb-12"
            >
              {type === 'archive' ? (
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute -inset-10 border-2 border-dashed border-brand-yellow/20 rounded-full"
                  />
                  <div className="w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <Zap className="w-16 h-16 text-slate-900" />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -inset-10 bg-brand-orange/20 blur-3xl rounded-full"
                  />
                  <div className="w-32 h-32 rounded-full bg-brand-orange flex items-center justify-center border-4 border-slate-900 shadow-[8px_8px_0_0_rgba(0,0,0,1)]">
                    <Flame className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <h2 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase">
                {type === 'archive' ? 'Archived' : 'Incinerated'}
              </h2>
              <div className="flex items-center justify-center gap-3">
                {type === 'archive' ? (
                  <>
                    <Sparkles className="w-5 h-5 text-brand-yellow" />
                    <p className="text-brand-yellow font-black uppercase tracking-[0.3em] text-sm">Stored in Library</p>
                  </>
                ) : (
                  <>
                    <Ghost className="w-5 h-5 text-brand-orange" />
                    <p className="text-brand-orange font-black uppercase tracking-[0.3em] text-sm">Released as Ash</p>
                  </>
                )}
              </div>
            </motion.div>

          </div>

          {/* Floating Particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-2 h-2 rounded-full ${type === 'burn' ? 'bg-brand-orange' : 'bg-brand-yellow'}`}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: window.innerHeight + 100,
                opacity: 0 
              }}
              animate={{ 
                y: -100,
                opacity: [0, 0.5, 0],
                x: (Math.random() - 0.5) * 200 + (Math.random() * window.innerWidth)
              }}
              transition={{ 
                duration: 2 + Math.random() * 3, 
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
