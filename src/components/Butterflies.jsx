import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import Butterfly from './ui/Butterfly.jsx'
import './Butterflies.css'

/*
 * A few butterflies that wander slowly across the page, bobbing and tilting as
 * they go, each with its own wingbeat. Subtle by design — a gentle accent.
 */
export default function Butterflies({ count = 3, zIndex = 2 }) {
  const reduce = useReducedMotion()
  // Client-only: positions use Math.random(), so render nothing on the server
  // to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const flutters = useMemo(() => {
    const variants = ['blush', 'sage', 'gold']
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 14 + Math.random() * 62,
      size: 26 + Math.random() * 18,
      duration: 28 + Math.random() * 18,
      delay: -Math.random() * 30,
      drift: 9 + Math.random() * 18,
      flap: 0.42 + Math.random() * 0.22,
      scale: 0.82 + Math.random() * 0.32,
      variant: variants[i % variants.length],
      dir: i % 2 === 0 ? 1 : -1,
    }))
  }, [count])

  if (reduce || !mounted) return null

  return (
    <div className="butterflies" style={{ zIndex }} aria-hidden="true">
      {flutters.map((f) => (
        <span
          key={f.id}
          className={`butterflies__one ${f.dir === 1 ? 'is-ltr' : 'is-rtl'}`}
          style={{
            top: `${f.top}%`,
            '--dur': `${f.duration}s`,
            '--delay': `${f.delay}s`,
            '--drift': `${f.drift}vh`,
            '--scale': f.scale,
          }}
        >
          <span className="butterflies__bob">
            <Butterfly size={f.size} variant={f.variant} flapDuration={f.flap} />
          </span>
        </span>
      ))}
    </div>
  )
}
