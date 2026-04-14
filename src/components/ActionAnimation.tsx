import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface ActionAnimationProps {
  type: 'shelf' | 'fire';
  bookCover?: string;
  bookTitle: string;
  onComplete: () => void;
}

export const ActionAnimation: React.FC<ActionAnimationProps> = ({ type, bookCover, bookTitle, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Play sound based on type
    const sfxUrl = type === 'shelf' 
      ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' // Wood slide
      : 'https://assets.mixkit.co/active_storage/sfx/697/697-preview.mp3';   // Fire crackle

    const audio = new Audio(sfxUrl);
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Audio play failed:", e));

    // Auto complete after animation duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 500); // Wait for AnimatePresence exit
    }, 3000);

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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md overflow-hidden"
        >
          <div className="relative flex flex-col items-center">
            {/* Shelf Background Element (for 'shelf' type) */}
            {type === 'shelf' && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] border-b-8 border-amber-900/50 bg-amber-900/10 rounded-lg"
              />
            )}

            {/* Fire Base Element (for 'fire' type) */}
            {type === 'fire' && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: [0.3, 0.6, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute bottom-[-50px] w-64 h-64 bg-orange-500/20 blur-[60px] rounded-full"
              />
            )}

            {/* The Book */}
            <motion.div
              layoutId="book-animation"
              initial={{ scale: 0.5, y: 100, rotate: 0 }}
              animate={type === 'shelf' 
                ? { 
                    scale: 1, 
                    y: -20, 
                    rotate: 0,
                    transition: { duration: 1, ease: "easeOut" }
                  } 
                : { 
                    scale: [1, 1.1, 0.8, 0], 
                    y: [0, -20, 50],
                    rotate: [0, -5, 5, -10],
                    filter: ["brightness(1) contrast(1)", "brightness(1.5) contrast(1.2) sepia(1) saturate(5)", "brightness(0) contrast(1)"],
                    transition: { duration: 2.5, times: [0, 0.2, 0.6, 1] }
                  }
              }
              className="relative z-10 shadow-2xl"
            >
              {bookCover ? (
                <img src={bookCover} alt={bookTitle} className="w-48 h-72 object-cover rounded-lg" />
              ) : (
                <div className="w-48 h-72 bg-slate-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-16 h-16 text-slate-300" />
                </div>
              )}
              
              {/* Particle Overlay for Fire */}
              {type === 'fire' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ delay: 0.5, duration: 1.5 }}
                  className="absolute inset-0 bg-gradient-to-t from-orange-600 to-transparent mix-blend-overlay"
                />
              )}
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-2xl font-serif text-white text-center font-light tracking-widest"
            >
              {type === 'shelf' ? "轻放回架，静待重逢" : "焚余为灰，决绝此卷"}
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 1 }}
              className="mt-2 text-slate-400 text-sm font-light uppercase tracking-[0.2em]"
            >
              {bookTitle}
            </motion.p>

            {/* Sparkles/Ash Particles for Fire */}
            {type === 'fire' && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 0 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 300, 
                      y: -Math.random() * 400 - 100,
                      opacity: [0, 1, 0],
                      scale: Math.random() * 1.5
                    }}
                    transition={{ delay: 0.5 + Math.random() * 1.5, duration: 1 + Math.random() }}
                    className="absolute top-1/2 left-1/2 w-1 h-1 bg-orange-400 rounded-full"
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
