import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from 'lucide-react';

interface ActionAnimationProps {
  type: 'archive' | 'burn' | null;
  onComplete: () => void;
}

const CartoonHand = () => (
  <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-2xl">
    <motion.path
      d="M40,180 C40,160 60,150 80,150 C100,150 110,130 110,100 C110,70 120,60 140,60 C160,60 175,75 175,100 L175,150 C175,180 150,200 120,200 L80,200 C60,200 40,180 40,180 Z"
      fill="#fef08a"
      stroke="#0f172a"
      strokeWidth="8"
      initial={{ y: 200, rotate: 10 }}
      animate={{ y: 0, rotate: 0 }}
    />
    <motion.path
      d="M110,100 L110,60 M125,90 L125,50 M145,90 L145,50 M165,100 L165,70"
      stroke="#0f172a"
      strokeWidth="8"
      strokeLinecap="round"
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
              <div className="relative flex flex-col items-center">
                {/* Shelf Background */}
                <div className="absolute top-20 w-80 h-4 bg-slate-900 rounded-full opacity-20" />
                
                <div className="relative">
                  {/* Book Card */}
                  <motion.div
                    initial={{ y: 100, opacity: 0, rotate: -5 }}
                    animate={{ 
                      y: [100, 0, -20],
                      x: [0, 0, 100],
                      rotate: [-5, 0, 5],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2.5, times: [0, 0.3, 0.9] }}
                    className="w-24 h-36 bg-brand-blue border-4 border-slate-900 rounded-xl shadow-2xl flex items-center justify-center z-10"
                  >
                    <Book className="w-10 h-10 text-white" />
                  </motion.div>

                  {/* Hand Animation */}
                  <motion.div
                    initial={{ y: 300, x: -50 }}
                    animate={{ 
                      y: [300, 40, 300],
                      x: [-50, 0, 80]
                    }}
                    transition={{ duration: 2.5, times: [0, 0.3, 0.9] }}
                    className="absolute top-0 left-0 -translate-x-1/2"
                  >
                    <CartoonHand />
                  </motion.div>
                </div>
              </div>
            ) : (
              <div className="relative flex flex-col items-center">
                {/* Book Falling into Fire */}
                <motion.div
                  initial={{ y: -400, rotate: -20, opacity: 0 }}
                  animate={{ 
                    y: [-400, 50, 80],
                    rotate: [-20, 10, 45],
                    opacity: [0, 1, 0],
                    scale: [1, 1, 0.5]
                  }}
                  transition={{ duration: 2.5, times: [0, 0.4, 1] }}
                  className="w-24 h-36 bg-brand-orange border-4 border-slate-900 rounded-xl shadow-2xl flex items-center justify-center z-10 mb-8"
                >
                  <Book className="w-10 h-10 text-white" />
                </motion.div>

                {/* Flames */}
                <div className="mt-[-80px] scale-150">
                  <BouncyFlames />
                </div>

                {/* Ash Particles (More prominent) */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 bg-slate-600 rounded-sm"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ 
                      y: [-100, -300], 
                      x: (Math.random() - 0.5) * 400,
                      opacity: [0, 0.6, 0],
                      scale: [1, 2, 0.5],
                      rotate: [0, 180]
                    }}
                    transition={{ 
                      duration: 2.5, 
                      delay: 1 + Math.random() * 1,
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
