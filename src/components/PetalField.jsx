import { useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import './PetalField.css'

const PETAL_COLORS = ['#f4ddd8', '#e7b6b0', '#ecdcae', '#d8e0cb', '#fce9e6', '#f0c9c3']

function PetalShape({ color }) {
  return (
    <svg viewBox="0 0 20 24" width="100%" height="100%" aria-hidden="true">
      <defs>
        <radialGradient id={`pg-${color.slice(1)}`} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#fffdf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <path
        d="M10 0C4.5 5.5 0.5 12.5 4 19.5c3 5.5 9 5.5 12 0 3.5-7-0.5-14-6-19.5z"
        fill={`url(#pg-${color.slice(1)})`}
      />
      <path d="M10 1.5C9 8 9 15 10 22" stroke={color} strokeOpacity="0.4" strokeWidth="0.6" fill="none" />
    </svg>
  )
}

/*
 * Slow-drifting petal field — petals fall, sway and rotate continuously.
 * Fixed behind the content; ignores pointer events; disabled for
 * reduced-motion users.
 */
export default function PetalField({ count = 16, zIndex = 1 }) {
  const reduce = useReducedMotion()

  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 9 + Math.random() * 17,
        duration: 17 + Math.random() * 20,
        delay: -Math.random() * 34,
        sway: 24 + Math.random() * 70,
        rotate: Math.random() * 360,
        color: PETAL_COLORS[i % PETAL_COLORS.length],
        opacity: 0.55 + Math.random() * 0.4,
      })),
    [count],
  )

  if (reduce) return null

  return (
    <div className="petal-field" style={{ zIndex }} aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal-field__petal"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            opacity: p.opacity,
            '--dur': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            '--sway': `${p.sway}px`,
            '--rot': `${p.rotate}deg`,
          }}
        >
          <PetalShape color={p.color} />
        </span>
      ))}
    </div>
  )
}
