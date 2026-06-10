/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, Trophy, Star, ShieldAlert } from 'lucide-react';
import { soundSynth } from '../utils/audio';

interface MiniParticle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
}

interface LevelUpOverlayProps {
  level: number;
  onClose: () => void;
}

export function LevelUpOverlay({ level, onClose }: LevelUpOverlayProps) {
  const [particles, setParticles] = useState<MiniParticle[]>([]);

  useEffect(() => {
    // Play retro level up audio chime safely
    soundSynth.playLevelUp();

    // Spawn 40 random sparks for background decoration
    const colors = ['#facc15', '#a855f7', '#60a5fa', '#34d399', '#f43f5e'];
    const temps: MiniParticle[] = [];
    for (let i = 0; i < 40; i++) {
      temps.push({
        id: i,
        x: 0,
        y: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        angle: Math.random() * 2 * Math.PI,
        speed: Math.random() * 8 + 3,
      });
    }
    setParticles(temps);

    // Auto-close overlay after 5 seconds if not closed manually
    const timer = setTimeout(() => {
      onClose();
    }, 5500);

    return () => clearTimeout(timer);
  }, [level, onClose]);

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans overflow-hidden">
      {/* Sparkle particles radiating outwards */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {particles.map((p) => {
          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full"
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: `calc(50vw + ${Math.cos(p.angle) * p.speed * 30}px)`,
                y: `calc(50vh + ${Math.sin(p.angle) * p.speed * 30}px)`,
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 1.8 + Math.random() * 1.2,
                ease: 'easeOut',
              }}
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.3, y: 150, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.5, y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        className="relative max-w-md w-full bg-white border-2 border-indigo-600 rounded-[32px] p-8 text-center shadow-2xl"
      >
        {/* Floating background rays */}
        <div className="absolute inset-x-0 top-0 -translate-y-16 flex justify-center pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
            className="w-48 h-48 rounded-full border border-dashed border-indigo-400/20 flex items-center justify-center"
          >
            <div className="w-40 h-40 rounded-full border border-dashed border-indigo-400/10" />
          </motion.div>
        </div>

        {/* Large Golden Crown */}
        <div className="relative z-10 -mt-16 flex justify-center mb-4">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="p-5 bg-gradient-to-br from-indigo-600 to-violet-600 border-4 border-white rounded-full shadow-lg"
          >
            <Trophy className="w-12 h-12 text-white stroke-[2.5]" />
          </motion.div>
          {/* Decorative Stars */}
          <Star className="absolute top-2 left-6 w-6 h-6 text-indigo-400 animate-ping" />
          <Star className="absolute top-4 right-8 w-5 h-5 text-indigo-505 animate-bounce" />
        </div>

        {/* Main Header */}
        <h2 className="font-display text-3xl font-black text-indigo-600 tracking-wider">
          LEVEL UP!
        </h2>
        <p className="text-slate-600 text-sm font-sans mt-1">
          ตัวละครของคุณแข็งแกร่งยิ่งขึ้นแล้ว!
        </p>

        {/* Level Number Orb */}
        <div className="my-6 inline-flex items-center justify-center bg-slate-50 border border-slate-205 rounded-full py-3 px-8 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mr-2.5">
            LEVEL
          </span>
          <span className="font-mono text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
            {level}
          </span>
        </div>

        {/* Level explanation */}
        <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl mb-6">
          <p className="text-[12px] text-indigo-600 font-bold mb-1 font-sans">
            🎉 รางวัลความอุตสาหะสหกิจ
          </p>
          <p className="text-[11.5px] text-slate-600 font-sans leading-relaxed">
            สเตตัสขีดความสามารถโดยรวมเพิ่มขึ้น ปลดล็อกสัปดาห์งานใหม่ ได้รับเครดิตเหรียญโบนัส และรายงานของคุณพร้อมสรุปที่ชาญฉลาดยิ่งกว่าเดิม!
          </p>
        </div>

        {/* Interactive close button */}
        <button
          onClick={() => {
            soundSynth.playClick();
            onClose();
          }}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-750 text-white font-extrabold font-display rounded-2xl shadow-md hover:shadow-lg transition-all uppercase tracking-wider text-xs cursor-pointer border-0"
        >
          รับทราบและลุยต่อ!
        </button>
      </motion.div>
    </div>
  );
}

// Temporary Mini Sparkling burst component when Quest is completed
export function MiniBurst({ x, y }: { x: number; y: number }) {
  const [active, setActive] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setActive(false), 900);
    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div
      className="absolute pointer-events-none z-50 overflow-visible"
      style={{ left: x, top: y }}
    >
      {[...Array(8)].map((_, i) => {
        const angle = (i * 2 * Math.PI) / 8;
        const speed = 15;
        return (
          <motion.div
            key={i}
            className="absolute"
            initial={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            animate={{
              scale: 0,
              opacity: 0,
              x: Math.cos(angle) * speed * 3,
              y: Math.sin(angle) * speed * 3,
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          </motion.div>
        );
      })}
    </div>
  );
}
