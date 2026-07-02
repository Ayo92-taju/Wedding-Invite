import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import PetalField from './PetalField.jsx'
import { couple } from '../data/content.js'
import './BloomIntro.css'

/*
 * The opening experience — a garden rose that GROWS, then BLOOMS.
 *
 *  step 0 · grow   — a stem draws upward, leaves sprout, sepals cradle a bud
 *  step 1 · bloom  — petals unfurl from the core outward, a golden heart lights,
 *                    the couple's names and tagline rise
 *  step 2 · idle   — the bloom breathes gently; "Enter the garden" appears
 *
 * Designed from the grow-and-bloom concept but entirely in our own petal
 * geometry and blush/sage/gold palette. Tap anywhere, press Enter, or wait —
 * it transitions on its own.
 */

const CENTER = '100px 112px'

// Our own broad, softly-cupped rose petal (points up from the flower centre).
const PETAL_D =
  'M100 112 C66 98 54 62 82 36 C90 28 110 28 118 36 C146 62 134 98 100 112 Z'

// Petal layers, unfurling core → outer.
const LAYERS = [
  { id: 'core', grad: 'nv-core', count: 4, scale: 0.46, offset: 45, base: 0.0 },
  { id: 'inner', grad: 'nv-inner', count: 5, scale: 0.63, offset: 12, base: 0.3 },
  { id: 'mid', grad: 'nv-mid', count: 6, scale: 0.82, offset: 30, base: 0.62 },
  { id: 'outer', grad: 'nv-outer', count: 6, scale: 1.0, offset: 0, base: 0.98 },
]

const POLLEN = [
  { x: 96, y: 62, r: 1.1 },
  { x: 107, y: 57, r: 1.5 },
  { x: 87, y: 76, r: 1.0 },
  { x: 115, y: 76, r: 1.2 },
  { x: 100, y: 68, r: 1.4 },
]

export default function BloomIntro({ onComplete }) {
  const reduce = useReducedMotion()
  const [step, setStep] = useState(0)
  const doneRef = useRef(false)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    onComplete?.()
  }, [onComplete])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const timers = []
    if (reduce) {
      setStep(2)
      timers.push(window.setTimeout(finish, 1500))
    } else {
      timers.push(window.setTimeout(() => setStep(1), 2200))
      timers.push(window.setTimeout(() => setStep(2), 4700))
      timers.push(window.setTimeout(finish, 7600))
    }
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [reduce, finish])

  const bloomEase = [0.16, 1, 0.3, 1]
  const softEase = [0.22, 1, 0.36, 1]
  const bloomed = step >= 1

  const petals = LAYERS.flatMap((layer) =>
    Array.from({ length: layer.count }, (_, i) => ({
      key: `${layer.id}-${i}`,
      grad: layer.grad,
      angle: layer.offset + (i * 360) / layer.count,
      scale: layer.scale,
      delay: reduce ? 0 : layer.base + i * 0.05,
    })),
  )

  return (
    <motion.div
      className="bloom-intro"
      role="button"
      tabIndex={0}
      aria-label="Skip the opening animation and enter the site"
      onClick={finish}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06, filter: 'blur(8px)', transition: { duration: 1.15, ease: softEase } }}
    >
      <PetalField count={reduce ? 0 : 12} zIndex={1} />

      <div className="bloom-intro__stage">
        <div className={`bloom-intro__flower-wrap${step === 2 && !reduce ? ' is-breathing' : ''}`}>
          <svg viewBox="0 0 200 200" className="bloom-intro__svg" aria-hidden="true">
            <defs>
              <radialGradient id="nv-outer" cx="50%" cy="70%" r="62%">
                <stop offset="0%" stopColor="#fbeae6" />
                <stop offset="55%" stopColor="#e7b6b0" />
                <stop offset="100%" stopColor="#b97a78" />
              </radialGradient>
              <radialGradient id="nv-mid" cx="50%" cy="70%" r="62%">
                <stop offset="0%" stopColor="#fdeef0" />
                <stop offset="60%" stopColor="#eec2bd" />
                <stop offset="100%" stopColor="#c98b86" />
              </radialGradient>
              <radialGradient id="nv-inner" cx="50%" cy="72%" r="60%">
                <stop offset="0%" stopColor="#fff3ef" />
                <stop offset="65%" stopColor="#f0c9c3" />
                <stop offset="100%" stopColor="#d89a94" />
              </radialGradient>
              <radialGradient id="nv-core" cx="50%" cy="74%" r="58%">
                <stop offset="0%" stopColor="#fff7f3" />
                <stop offset="45%" stopColor="#f6d9d4" />
                <stop offset="85%" stopColor="#ecbdb6" />
                <stop offset="100%" stopColor="#c98b86" />
              </radialGradient>
              <linearGradient id="nv-stem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b9d7e" />
                <stop offset="100%" stopColor="#586a49" />
              </linearGradient>
              <linearGradient id="nv-leaf" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#aebd9d" />
                <stop offset="55%" stopColor="#6f7f5e" />
                <stop offset="100%" stopColor="#4d5c3d" />
              </linearGradient>
              <radialGradient id="nv-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f4ddd8" stopOpacity="0.5" />
                <stop offset="55%" stopColor="#e7b6b0" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#e7b6b0" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="nv-gold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fff4d1" />
                <stop offset="50%" stopColor="#ddc278" />
                <stop offset="100%" stopColor="#c9a227" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* ambient watercolour glow */}
            <motion.circle
              cx="100"
              cy="80"
              r="80"
              fill="url(#nv-glow)"
              style={{ transformBox: 'view-box', transformOrigin: '100px 80px' }}
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: bloomed ? 1 : 0.4, opacity: bloomed ? 1 : 0 }}
              transition={{ duration: 2.6, ease: 'easeOut' }}
            />

            {/* stem grows upward */}
            <motion.path
              d="M100 198 Q97 156 100 112"
              fill="none"
              stroke="url(#nv-stem)"
              strokeWidth="3.2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0.4 : 1.8, ease: 'easeInOut' }}
            />

            {/* leaves */}
            <motion.path
              d="M99 160 C80 160 66 150 76 139 C88 136 95 147 99 160 Z"
              fill="url(#nv-leaf)"
              stroke="#4d5c3d"
              strokeWidth="0.6"
              style={{ transformBox: 'view-box', transformOrigin: '99px 160px' }}
              initial={{ scale: 0, opacity: 0, rotate: 18 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: reduce ? 0 : 0.7, duration: 1.2, ease: bloomEase }}
            />
            <motion.path
              d="M101 147 C120 147 134 137 124 126 C112 123 105 134 101 147 Z"
              fill="url(#nv-leaf)"
              stroke="#4d5c3d"
              strokeWidth="0.6"
              style={{ transformBox: 'view-box', transformOrigin: '101px 147px' }}
              initial={{ scale: 0, opacity: 0, rotate: -18 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: reduce ? 0 : 1, duration: 1.2, ease: bloomEase }}
            />

            {/* sepals cradle the bud, then peel back */}
            {[-20, 0, 20].map((r, idx) => (
              <motion.path
                key={idx}
                d="M100 112 C93 122 90 128 100 139 C110 128 107 122 100 112 Z"
                fill="url(#nv-leaf)"
                stroke="#3f4d31"
                strokeWidth="0.5"
                style={{ transformBox: 'view-box', transformOrigin: CENTER }}
                initial={{ scale: 0.4, opacity: 0, rotate: r }}
                animate={{ scale: bloomed ? 1 : 0.72, opacity: 1, rotate: bloomed ? r * 1.7 : r }}
                transition={{ duration: 2, ease: 'easeInOut' }}
              />
            ))}

            {/* petals unfurl core → outer */}
            {petals.map((p) => (
              <motion.path
                key={p.key}
                d={PETAL_D}
                fill={`url(#${p.grad})`}
                stroke="rgba(150,78,74,0.33)"
                strokeWidth="0.65"
                style={{ transformBox: 'view-box', transformOrigin: CENTER }}
                initial={{ scale: 0.02, opacity: 0, rotate: p.angle - 16 }}
                animate={
                  bloomed
                    ? { scale: p.scale, opacity: 1, rotate: p.angle }
                    : { scale: 0.02, opacity: 0, rotate: p.angle - 16 }
                }
                transition={{ delay: p.delay, duration: reduce ? 0.5 : 2.2, ease: bloomEase }}
              />
            ))}

            {/* golden heart + pollen */}
            <motion.circle
              cx="100"
              cy="108"
              r="5.5"
              fill="url(#nv-gold)"
              style={{ transformBox: 'view-box', transformOrigin: '100px 108px' }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: bloomed ? 1 : 0, opacity: bloomed ? 0.95 : 0 }}
              transition={{ delay: reduce ? 0 : 0.6, duration: 1.4, ease: 'easeOut' }}
            />
            {bloomed &&
              POLLEN.map((s, i) => (
                <motion.circle
                  key={i}
                  cx={s.x}
                  cy={s.y}
                  r={s.r}
                  fill="#fff2d1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.55] }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 1.6 }}
                />
              ))}
          </svg>

          {/* golden floating particles (CSS-driven, compositor-friendly) */}
          {bloomed && !reduce && (
            <div className="bloom-intro__particles">
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="bloom-intro__particle"
                  style={{
                    left: `${42 + ((i * 7) % 20)}%`,
                    top: `${44 + ((i * 5) % 16)}%`,
                    '--px': `${(i % 2 ? 1 : -1) * (18 + i * 4)}px`,
                    '--py': `${-(38 + i * 6)}px`,
                    '--pdur': `${2.4 + (i % 3) * 0.6}s`,
                    '--pdelay': `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <motion.div
        className="bloom-intro__words"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: bloomed ? 1 : 0, y: bloomed ? 0 : 18 }}
        transition={{ duration: 1.3, delay: reduce ? 0.1 : 0.35, ease: softEase }}
      >
        <span className="eyebrow">You are warmly invited</span>
        <p className="script bloom-intro__names">
          {couple.nameOne}
          <span className="bloom-intro__amp">&amp;</span>
          {couple.nameTwo}
        </p>
        <p className="bloom-intro__tag foil">{couple.tagline}</p>
      </motion.div>

      <div className="bloom-intro__enter-slot">
        {step >= 2 ? (
          <motion.button
            type="button"
            className="bloom-intro__enter"
            onClick={finish}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
          >
            Enter the garden <span className="bloom-intro__enter-arrow">→</span>
          </motion.button>
        ) : (
          <span className="bloom-intro__cultivating">the garden is blooming…</span>
        )}
      </div>
    </motion.div>
  )
}
