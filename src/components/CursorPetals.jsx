import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import './CursorPetals.css'

const COLORS = ['#e7b6b0', '#f4ddd8', '#ddc278', '#cdd9be', '#f0c9c3']
let uid = 0

/*
 * Petals that trail the cursor — one drifts free from the pointer every so
 * often, floating up and fading. Fine-pointer devices only; off for
 * reduced-motion and touch.
 */
export default function CursorPetals() {
  const reduce = useReducedMotion()
  const [petals, setPetals] = useState([])
  const last = useRef(0)

  useEffect(() => {
    if (reduce) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const onMove = (e) => {
      const now = performance.now()
      if (now - last.current < 115) return
      last.current = now

      const id = uid++
      const petal = {
        id,
        x: e.clientX,
        y: e.clientY,
        color: COLORS[id % COLORS.length],
        size: 8 + Math.random() * 9,
        dx: (Math.random() - 0.5) * 46,
        rot: Math.random() * 360,
      }
      setPetals((prev) => [...prev.slice(-13), petal])
      window.setTimeout(() => {
        setPetals((prev) => prev.filter((p) => p.id !== id))
      }, 1700)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduce])

  if (reduce) return null

  return (
    <div className="cursor-petals" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="cursor-petals__p"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size * 1.2}px`,
            '--dx': `${p.dx}px`,
            '--rot': `${p.rot}deg`,
          }}
        >
          <svg viewBox="0 0 20 24" width="100%" height="100%">
            <path
              d="M10 0C4.5 5.5 0.5 12.5 4 19.5c3 5.5 9 5.5 12 0 3.5-7-0.5-14-6-19.5z"
              fill={p.color}
            />
          </svg>
        </span>
      ))}
    </div>
  )
}
