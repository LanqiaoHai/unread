import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';

interface ActionAnimationProps {
  type: 'archive' | 'burn' | null;
  onComplete: () => void;
}

const CartoonHand = () => (
  <svg width="200" height="200" viewBox="0 0 200 200" className="drop-shadow-2xl">
    <motion.path
      d="M100,150 C80,150 60,140 50,120 C40,100 50,80 70,75 L80,30 C82,20 95,20 98,30 L105,70 L120,30 C122,20 135,20 138,30 L145,70 L160,40 C162,30 175,30 178,40 L185,120 C185,150 160,170 130,170 L100,170"
      fill="white"
      stroke="#0f172a"
      strokeWidth="8"
      strokeLinejoin="round"
      initial={{ rotate: -20, x: 100 }}
      animate={{ rotate: 0, x: 0 }}
    />
  </svg>
);

const BouncyFlames = () => (
  <div className="relative w-64 h-64 flex items-center justify-center">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          width: 100 + i * 20,
          height: 100 + i * 20,
          backgroundColor: i % 2 === 0 ? '#fb923c' : '#facc15',
          zIndex: 10 - i,
          filter: 'blur(4px)',
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1.1, 1],
          y: [0, -20, 10, -5, 0],
          rotate: [0, 5, -5, 2, 0],
        }}
        transition={{
          duration: 1.5 + i * 0.2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
);

export const ActionAnimation: React.FC<ActionAnimationProps> = ({ type, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 500);
      }, 3000);
      return () => clearTimeout(timer);
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
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl overflow-hidden"
        >
          <div className="relative flex flex-col items-center justify-center scale-150">
            {type === 'archive' ? (
              <div className="relative">
                {/* Book Card */}
                <motion.div
                  initial={{ y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: [-400, 0, 400],
                    rotate: [0, 0, 20],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2.5, times: [0, 0.4, 0.9] }}
                  className="w-24 h-36 bg-white border-4 border-slate-900 rounded-xl shadow-2xl flex items-center justify-center z-10"
                >
                  <Book className="w-10 h-10 text-slate-200" />
                </motion.div>

                {/* Hand Animation */}
                <motion.div
                  initial={{ x: -600, y: 50 }}
                  animate={{ 
                    x: [-600, -80, 600],
                    y: [100, 50, 100]
                  }}
                  transition={{ duration: 2.5, times: [0, 0.4, 0.9] }}
                  className="absolute top-0 left-0"
                >
                  <CartoonHand />
                </motion.div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                {/* Book Falling */}
                <motion.div
                  initial={{ y: -400, rotate: -20, opacity: 0 }}
                  animate={{ 
                    y: [ -400, 50, 80],
                    rotate: [-20, 10, 45],
                    opacity: [0, 1, 0],
                    scale: [1, 1, 0.5]
                  }}
                  transition={{ duration: 2.5, times: [0, 0.5, 1] }}
                  className="w-24 h-36 bg-white border-4 border-slate-900 rounded-xl shadow-2xl flex items-center justify-center z-10 mb-8"
                >
                  <Book className="w-10 h-10 text-slate-200" />
                </motion.div>

                {/* Flames */}
                <div className="mt-[-80px] scale-125">
                  <BouncyFlames />
                </div>

                {/* Ash Particles */}
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-slate-400 rounded-full"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ 
                      y: -200, 
                      x: (Math.random() - 0.5) * 200,
                      opacity: [0, 0.8, 0],
                      scale: [1, 1.5, 0.5]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: 1.2 + Math.random() * 0.5,
                      repeat: Infinity 
                    }}
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
