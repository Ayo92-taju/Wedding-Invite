import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import Butterfly from './ui/Butterfly.jsx'
import './Butterflies.css'

/*
 * A few butterflies that drift slowly across the page, fluttering as they go.
 * Subtle by design — never more than a gentle accent.
 */
export default function Butterflies({ count = 3, zIndex = 2 }) {
  const reduce = useReducedMotion()

  const flutters = useMemo(() => {
    const variants = ['blush', 'sage', 'gold']
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      top: 15 + Math.random() * 60,
      size: 26 + Math.random() * 16,
      duration: 26 + Math.random() * 16,
      delay: -Math.random() * 30,
      drift: 8 + Math.random() * 16,
      variant: variants[i % variants.length],
      dir: i % 2 === 0 ? 1 : -1,
    }))
  }, [count])

  if (reduce) return null

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
          }}
        >
          <span className="butterflies__bob">
            <Butterfly size={f.size} variant={f.variant} />
          </span>
        </span>
      ))}
    </div>
  )
}
