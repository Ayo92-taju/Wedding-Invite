'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

export default function CursorFlower() {
  const reduce = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const smoothX = useSpring(cursorX, { damping: 25, stiffness: 120 })
  const smoothY = useSpring(cursorY, { damping: 25, stiffness: 120 })

  // Client-only (Math.random) so SSR markup matches.
  const petals = useMemo(
    () =>
      Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -20 - Math.random() * 50,
        size: 12 + Math.random() * 24,
        rotation: Math.random() * 360,
        duration: 15 + Math.random() * 20,
        delay: Math.random() * -20,
        opacity: 0.2 + Math.random() * 0.4,
        type: Math.random() > 0.3 ? 'petal' : 'butterfly',
      })),
    [],
  )

  useEffect(() => {
    setMounted(true)
    const onMove = (e) => {
      cursorX.set(e.clientX - 12)
      cursorY.set(e.clientY - 12)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [cursorX, cursorY])

  if (reduce || !mounted) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute"
          style={{ left: `${petal.x}%`, top: `${petal.y}vh`, opacity: petal.opacity, width: petal.size, height: petal.size }}
          animate={{ y: ['0vh', '130vh'], x: ['0vw', `${(Math.sin(petal.id) * 15).toFixed(1)}vw`], rotate: [petal.rotation, petal.rotation + 360] }}
          transition={{ duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' }}
        >
          {petal.type === 'petal' ? (
            <svg viewBox="0 0 100 100" fill="currentColor" className="text-bloom-rose/40 dark:text-bloom-blush/30 blur-[0.5px]">
              <path d="M50 0 C75 25, 90 60, 50 100 C10 60, 25 25, 50 0" />
            </svg>
          ) : (
            <motion.svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-bloom-gold/40 dark:text-bloom-gold-light/40"
              animate={{ scaleX: [1, 0.4, 1] }}
              transition={{ duration: 0.8 + (petal.id % 3) * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M50 50 C20 20, 10 40, 48 55 C10 70, 30 85, 50 60 C70 85, 90 70, 52 55 C90 40, 80 20, 50 50 Z" />
              <path d="M48 45 C45 35, 40 38, 40 38 M52 45 C55 35, 60 38, 60 38" />
            </motion.svg>
          )}
        </motion.div>
      ))}

      <motion.div className="absolute hidden md:block w-6 h-6 z-50 blur-[0.5px]" style={{ x: smoothX, y: smoothY }}>
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-bloom-rose/50">
          <path d="M50 10 C65 30, 80 50, 50 85 C20 50, 35 30, 50 10" />
        </svg>
      </motion.div>
    </div>
  )
}
