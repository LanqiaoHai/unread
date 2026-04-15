import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, Flame } from 'lucide-react';

interface ActionAnimationProps {
  type: 'shelf' | 'fire';
  bookCover?: string;
  bookTitle: string;
  onComplete: () => void;
}

export const ActionAnimation: React.FC<ActionAnimationProps> = ({ type, bookCover, bookTitle, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Cinematic SFX logic
    const sfxUrl = type === 'shelf' 
      ? 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3' 
      : 'https://assets.mixkit.co/active_storage/sfx/697/697-preview.mp3';

    const audio = new Audio(sfxUrl);
    audio.volume = 0.6;
    audio.play().catch(e => console.warn("Audio context restricted:", e));

    const mainTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 800); 
    }, 4000); // Slightly longer for cinematic impact

    return () => {
      clearTimeout(mainTimer);
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/98 backdrop-blur-xl overflow-hidden select-none"
        >
          {/* Ambian Lighting */}
          <motion.div 
            animate={type === 'fire' 
              ? { opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] } 
              : { opacity: [0.1, 0.15, 0.1] }
            }
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`absolute inset-0 ${type === 'fire' ? 'bg-orange-950/40' : 'bg-blue-950/20'}`}
          />

          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
            
            {/* CINEMATIC SHELF (Full Screen Impact) */}
            {type === 'shelf' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="w-full h-[20vh] bg-gradient-to-b from-amber-900/40 to-amber-950/60 border-t-4 border-amber-500/30 relative"
                >
                  <div className="absolute -top-12 left-0 right-0 h-1 bg-amber-400/10 blur-md" />
                  <motion.div 
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                    className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-4"
                  >
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-12 h-40 bg-amber-900/30 rounded-t-lg backdrop-blur-md border-x border-amber-800/20" />
                    ))}
                  </motion.div>
                </motion.div>
              </div>
            )}

            {/* CINEMATIC FIRE (Full Screen Impact) */}
            {type === 'fire' && (
              <div className="absolute inset-x-0 bottom-0 h-[60vh] pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-600/20 to-transparent" />
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: "50vw", y: "60vh", opacity: 0, scale: 0 }}
                    animate={{ 
                      x: `${Math.random() * 100}vw`, 
                      y: `${-20 - Math.random() * 80}vh`,
                      opacity: [0, 0.8, 0],
                      scale: Math.random() * 3 + 1,
                      rotate: Math.random() * 360
                    }}
                    transition={{ 
                      duration: 2 + Math.random() * 2, 
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                    className="absolute w-1 h-1 bg-orange-400 rounded-full blur-[1px]"
                  />
                ))}
              </div>
            )}

            {/* THE HERO BOOK */}
            <motion.div
              layoutId="hero-book"
              initial={{ scale: 0.3, y: 300, rotateY: 45, opacity: 0 }}
              animate={type === 'shelf' 
                ? { 
                    scale: 1, y: -120, rotateY: 0, opacity: 1,
                    transition: { type: "spring", damping: 15, stiffness: 80 }
                  } 
                : { 
                    scale: [1, 1.2, 0.8, 0.4], 
                    y: [-50, -100, 100],
                    rotateY: [0, 10, -10, 0],
                    rotateZ: [0, -5, 5, 0],
                    opacity: [1, 1, 0.6, 0],
                    filter: ["brightness(1)", "brightness(2) contrast(1.5) sepia(1)", "brightness(0) grayScale(1)"],
                    transition: { duration: 3.5, times: [0, 0.3, 0.7, 1] }
                  }
              }
              className="relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] preserve-3d"
            >
              <div className="relative group">
                {bookCover ? (
                  <img 
                    src={bookCover} 
                    alt={bookTitle} 
                    className="w-[30vh] aspect-[2/3] object-cover rounded-xl border border-white/10" 
                  />
                ) : (
                  <div className="w-[30vh] aspect-[2/3] bg-slate-800 rounded-xl flex items-center justify-center border border-white/10">
                    <BookOpen className="w-20 h-20 text-slate-600" />
                  </div>
                )}
                
                {type === 'fire' && (
                  <motion.div 
                    animate={{ 
                      boxShadow: ["0 0 20px #f97316", "0 0 60px #ea580c", "0 0 20px #f97316"],
                      opacity: [0.3, 0.8, 0.3]
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute inset-0 rounded-xl"
                  />
                )}
              </div>

              {/* DISSOLVED ASHES PARTICLES (Only for Fire) */}
              {type === 'fire' && (
                <div className="absolute inset-0 flex items-center justify-center over">
                  {[...Array(40)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        x: (Math.random() - 0.5) * 400, 
                        y: -Math.random() * 500 - 100,
                        opacity: [0, 1, 0],
                        scale: Math.random() * 2,
                        rotate: Math.random() * 720
                      }}
                      transition={{ delay: 1 + Math.random() * 1.5, duration: 2.5 }}
                      className="absolute w-2 h-2 bg-neutral-600 rounded-sm"
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* TEXT NARRATIVE */}
            <div className="mt-16 text-center px-6">
              <motion.h2 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="text-4xl md:text-5xl font-serif text-white mb-4 tracking-tighter"
              >
                {type === 'shelf' ? "轻放归处，静待重温" : "此卷灰尽，再无牵绊"}
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex items-center justify-center gap-3 text-slate-400"
              >
                <div className="h-px w-8 bg-slate-700" />
                <span className="text-sm font-light uppercase tracking-[0.3em] font-serif italic">{bookTitle}</span>
                <div className="h-px w-8 bg-slate-700" />
              </motion.div>
            </div>

            {/* Subtle Overlay Badge */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              className="absolute bottom-12 text-[10vw] font-black pointer-events-none text-white overflow-hidden whitespace-nowrap opacity-10 select-none"
            >
              {type === 'shelf' ? "SHELVING ARCHIVE" : "ASHING RELEASE"}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
