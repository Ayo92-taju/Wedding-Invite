'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { useTheme } from './theme/ThemeProvider'
import { couple } from '../data/content.js'

// Organic staggered timings and angles for each petal layer (concept design).
const outerPetals = [
  { id: 'out-1', initialRotate: 0, delay: 2.1 },
  { id: 'out-2', initialRotate: 72, delay: 2.3 },
  { id: 'out-3', initialRotate: 144, delay: 2.5 },
  { id: 'out-4', initialRotate: 216, delay: 2.2 },
  { id: 'out-5', initialRotate: 288, delay: 2.4 },
]
const midPetals = [
  { id: 'mid-1', initialRotate: 36, delay: 1.6 },
  { id: 'mid-2', initialRotate: 108, delay: 1.8 },
  { id: 'mid-3', initialRotate: 180, delay: 2.0 },
  { id: 'mid-4', initialRotate: 252, delay: 1.7 },
  { id: 'mid-5', initialRotate: 324, delay: 1.9 },
]
const innerPetals = [
  { id: 'inn-1', initialRotate: 0, delay: 1.1 },
  { id: 'inn-2', initialRotate: 90, delay: 1.3 },
  { id: 'inn-3', initialRotate: 180, delay: 1.2 },
  { id: 'inn-4', initialRotate: 270, delay: 1.4 },
]
const corePetals = [
  { id: 'core-1', initialRotate: 45, delay: 0.7 },
  { id: 'core-2', initialRotate: 165, delay: 0.9 },
  { id: 'core-3', initialRotate: 285, delay: 0.8 },
]

const PETAL = {
  outer: { d: 'M100 105 C65 75, 45 45, 100 20 C155 45, 135 75, 100 105', fill: 'url(#rose-outer)', scale: 1.0 },
  mid: { d: 'M100 105 C70 80, 55 55, 100 32 C145 55, 130 80, 100 105', fill: 'url(#rose-mid)', scale: 0.82 },
  inner: { d: 'M100 105 C75 85, 65 65, 100 45 C135 65, 125 85, 100 105', fill: 'url(#rose-inner)', scale: 0.65 },
  core: { d: 'M100 105 C80 90, 75 75, 100 58 C125 75, 120 90, 100 105', fill: 'url(#rose-core)', scale: 0.48 },
}

function PetalLayer({ petals, kind, step, stroke, reduce }) {
  const cfg = PETAL[kind]
  return petals.map((p) => (
    <motion.path
      key={p.id}
      d={cfg.d}
      fill={cfg.fill}
      stroke={stroke}
      strokeWidth="0.5"
      style={{ transformOrigin: '100px 105px' }}
      initial={{ scale: 0.01, opacity: 0, rotate: p.initialRotate - 25, y: 8 }}
      animate={
        step === 0
          ? { scale: 0.01, opacity: 0, rotate: p.initialRotate - 25, y: 8 }
          : step === 1 || reduce
            ? { scale: cfg.scale, opacity: 1, rotate: p.initialRotate, y: 0 }
            : {
                scale: [cfg.scale, cfg.scale * 1.03, cfg.scale],
                rotate: [p.initialRotate, p.initialRotate + 2, p.initialRotate - 2, p.initialRotate],
                opacity: 1,
                y: 0,
              }
      }
      transition={
        step === 2 && !reduce
          ? {
              scale: { duration: 6 + (p.delay % 1) * 4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 6 + (p.delay % 1) * 4, repeat: Infinity, ease: 'easeInOut' },
            }
          : { delay: reduce ? 0 : p.delay, duration: reduce ? 0.5 : 2.8, ease: [0.16, 1, 0.3, 1] }
      }
    />
  ))
}

export default function OpeningExperience({ onComplete }) {
  const { dark } = useTheme()
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0) // 0 grow · 1 bloom · 2 idle

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (reduce) {
      setStep(2)
      return () => {
        document.body.style.overflow = ''
      }
    }
    const t1 = setTimeout(() => setStep(1), 2200)
    const t2 = setTimeout(() => setStep(2), 4500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      document.body.style.overflow = ''
    }
  }, [reduce])

  const enter = () => {
    document.body.style.overflow = ''
    onComplete?.()
  }

  const petalStroke = dark ? 'rgba(234, 216, 177, 0.35)' : 'rgba(94, 3, 17, 0.28)'
  const bloomed = step >= 1

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
      transition={{ duration: 1.5, ease: [0.43, 0.13, 0.23, 0.96] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 bg-bloom-cream dark:bg-dark-garden"
    >
      {/* drifting background petals */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {Array.from({ length: reduce ? 0 : 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ left: `${(i * 37) % 100}%`, top: '-10%', width: 15 + (i % 4) * 6, height: 15 + (i % 4) * 6 }}
            animate={{ y: ['0vh', '110vh'], x: ['0vw', `${(Math.sin(i) * 10).toFixed(1)}vw`], rotate: [0, 360] }}
            transition={{ duration: 12 + (i % 5) * 3, repeat: Infinity, ease: 'linear', delay: i * -1.6 }}
          >
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-bloom-rose/30 dark:text-bloom-blush/20">
              <path d="M50 0 C75 25, 90 60, 50 100 C10 60, 25 25, 50 0" />
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="relative flex flex-col items-center max-w-lg px-6 text-center select-none">
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="font-cinzel tracking-[0.3em] uppercase text-xs mb-6 text-bloom-sage-dark/80 dark:text-bloom-gold-light/60"
        >
          {couple.nameOne} &amp; {couple.nameTwo}
        </motion.p>

        <div className="relative w-64 h-64 md:w-80 md:h-80 my-4 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.05 }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full border-2 border-bloom-sage dark:border-bloom-gold"
          />

          <svg
            viewBox="0 0 200 200"
            className="w-full h-full relative z-10 drop-shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_8px_32px_rgba(0,0,0,0.3)]"
          >
            <defs>
              <linearGradient id="stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#4A6B53" />
                <stop offset="100%" stopColor="#223326" />
              </linearGradient>
              <linearGradient id="leaf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6E9B7B" />
                <stop offset="50%" stopColor="#4A6B53" />
                <stop offset="100%" stopColor="#1E3324" />
              </linearGradient>
              <radialGradient id="rose-outer" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E55562" />
                <stop offset="55%" stopColor="#BA1A2C" />
                <stop offset="100%" stopColor="#730813" />
              </radialGradient>
              <radialGradient id="rose-mid" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F27282" />
                <stop offset="60%" stopColor="#C92035" />
                <stop offset="100%" stopColor="#820B18" />
              </radialGradient>
              <radialGradient id="rose-inner" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF9AA7" />
                <stop offset="65%" stopColor="#E6354D" />
                <stop offset="100%" stopColor="#960E1E" />
              </radialGradient>
              <radialGradient id="rose-core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFC2CD" />
                <stop offset="45%" stopColor="#FF5C77" />
                <stop offset="85%" stopColor="#BA1430" />
                <stop offset="100%" stopColor="#4F010E" />
              </radialGradient>
              <radialGradient id="rose-watercolor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#E24A56" stopOpacity="0.45" />
                <stop offset="60%" stopColor="#D1263B" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="gold-shimmer-grad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFF2D1" />
                <stop offset="50%" stopColor="#E0B863" />
                <stop offset="100%" stopColor="#A88131" stopOpacity="0" />
              </radialGradient>
            </defs>

            <motion.circle
              cx="100"
              cy="105"
              r="75"
              fill="url(#rose-watercolor)"
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{
                scale: step === 0 ? 0.3 : step === 1 || reduce ? 1 : [1, 1.05, 1],
                opacity: step === 0 ? 0 : 0.9,
              }}
              transition={{ scale: { duration: 3.2, ease: 'easeOut' }, opacity: { duration: 2 }, repeat: step === 2 && !reduce ? Infinity : 0, repeatType: 'reverse' }}
              className="pointer-events-none"
            />

            {/* stem grows */}
            <motion.path
              d="M100 195 Q98 150, 100 105"
              fill="none"
              stroke="url(#stem-grad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0.4 : 1.8, ease: 'easeInOut' }}
            />
            {/* leaves */}
            <motion.path
              d="M98 155 C80 155, 65 145, 75 135 C85 132, 92 142, 98 155"
              fill="url(#leaf-grad)"
              stroke="#2E4033"
              strokeWidth="0.75"
              style={{ transformOrigin: '98px 155px' }}
              initial={{ scale: 0, opacity: 0, rotate: 20 }}
              animate={{ scale: bloomed ? 1 : 0, opacity: bloomed ? 1 : 0, rotate: step === 2 && !reduce ? [0, 2, -2, 0] : 0 }}
              transition={{ scale: { delay: reduce ? 0 : 0.8, duration: 1.2, ease: 'easeOut' }, opacity: { delay: reduce ? 0 : 0.8, duration: 1.2 }, rotate: { duration: 6, repeat: Infinity, ease: 'easeInOut' } }}
            />
            <motion.path
              d="M102 140 C120 140, 135 130, 125 120 C115 117, 108 127, 102 140"
              fill="url(#leaf-grad)"
              stroke="#2E4033"
              strokeWidth="0.75"
              style={{ transformOrigin: '102px 140px' }}
              initial={{ scale: 0, opacity: 0, rotate: -20 }}
              animate={{ scale: bloomed ? 1 : 0, opacity: bloomed ? 1 : 0, rotate: step === 2 && !reduce ? [0, -2, 2, 0] : 0 }}
              transition={{ scale: { delay: reduce ? 0 : 1.1, duration: 1.2, ease: 'easeOut' }, opacity: { delay: reduce ? 0 : 1.1, duration: 1.2 }, rotate: { duration: 5.5, repeat: Infinity, ease: 'easeInOut' } }}
            />
            {/* sepals */}
            <motion.path d="M100 105 C85 112, 70 115, 75 130 C82 122, 92 112, 100 105" fill="url(#leaf-grad)" stroke="#1E3324" strokeWidth="0.75" style={{ transformOrigin: '100px 105px' }} initial={{ scale: 0.5, rotate: 25, opacity: 0 }} animate={{ scale: step === 0 ? 0.7 : 1, rotate: step === 0 ? 10 : -15, opacity: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />
            <motion.path d="M100 105 C115 112, 130 115, 125 130 C118 122, 108 112, 100 105" fill="url(#leaf-grad)" stroke="#1E3324" strokeWidth="0.75" style={{ transformOrigin: '100px 105px' }} initial={{ scale: 0.5, rotate: -25, opacity: 0 }} animate={{ scale: step === 0 ? 0.7 : 1, rotate: step === 0 ? -10 : 15, opacity: 1 }} transition={{ duration: 2, ease: 'easeInOut' }} />

            {/* petal layers, inside-out */}
            <PetalLayer petals={outerPetals} kind="outer" step={step} stroke={petalStroke} reduce={reduce} />
            <PetalLayer petals={midPetals} kind="mid" step={step} stroke={petalStroke} reduce={reduce} />
            <PetalLayer petals={innerPetals} kind="inner" step={step} stroke={petalStroke} reduce={reduce} />
            <PetalLayer petals={corePetals} kind="core" step={step} stroke={petalStroke} reduce={reduce} />

            {/* golden pistil */}
            <motion.circle cx="100" cy="102" r="4.5" fill="url(#gold-shimmer-grad)" initial={{ scale: 0, opacity: 0 }} animate={{ scale: bloomed ? 1 : 0, opacity: bloomed ? 0.85 : 0 }} transition={{ delay: reduce ? 0 : 1.2, duration: 1.5, ease: 'easeOut' }} />
            {bloomed && (
              <g className="text-bloom-gold-light" fill="#FFF2D1">
                <circle cx="95" cy="55" r="1" />
                <circle cx="106" cy="51" r="1.5" />
                <circle cx="85" cy="70" r="1" />
                <circle cx="116" cy="72" r="1.2" fill="#EAD8B1" />
                <circle cx="100" cy="65" r="1.5" fill="#EAD8B1" />
              </g>
            )}
          </svg>
        </div>

        {/* title */}
        <div className="h-16 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            {bloomed && (
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="font-script text-4xl md:text-5xl tracking-wide text-bloom-rose-dark dark:text-bloom-gold-light"
              >
                {couple.tagline}
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* enter / loading */}
        <div className="h-16 mt-8 flex items-center justify-center">
          {step === 2 ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={enter}
              className="font-cinzel tracking-[0.2em] uppercase text-xs px-8 py-3.5 border rounded-full transition-all duration-300 shadow-sm cursor-pointer border-bloom-rose/40 hover:border-bloom-rose text-bloom-rose-dark hover:bg-bloom-rose/5 dark:border-bloom-gold/50 dark:hover:border-bloom-gold dark:text-bloom-gold-light dark:hover:bg-bloom-gold/10"
            >
              Enter the Garden
            </motion.button>
          ) : (
            <motion.p
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="font-serif text-sm italic text-bloom-rose/60 dark:text-bloom-gold-light/40"
            >
              The garden is cultivating…
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
