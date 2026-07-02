import { useEffect, useMemo, useState } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react'
import './LivingGarden.css'

/*
 * The garden "breathes" as you move through it: the light warms from a soft
 * dawn, into golden hour, and settles into a gentle dusk — and fireflies drift
 * in and twinkle as the evening arrives. All driven by scroll position, so the
 * world feels alive and responsive rather than staged.
 */
export default function LivingGarden({ fireflyCount = 16 }) {
  const reduce = useReducedMotion()
  // Fireflies use Math.random(); only render them after mount so SSR matches.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const { scrollYProgress } = useScroll()

  const dawnOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const goldenOpacity = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0, 1, 0.4])
  const duskOpacity = useTransform(scrollYProgress, [0.55, 1], [0, 1])
  const fireflyOpacity = useTransform(scrollYProgress, [0.55, 0.82], [0, 1])

  const fireflies = useMemo(
    () =>
      Array.from({ length: fireflyCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: 25 + Math.random() * 68,
        size: 3 + Math.random() * 4,
        dur: 5 + Math.random() * 7,
        delay: -Math.random() * 10,
        driftX: (Math.random() - 0.5) * 80,
        driftY: -(20 + Math.random() * 50),
      })),
    [fireflyCount],
  )

  return (
    <>
      <div className="living-garden" aria-hidden="true">
        <motion.div className="lg-layer lg-dawn" style={{ opacity: dawnOpacity }} />
        <motion.div className="lg-layer lg-golden" style={{ opacity: goldenOpacity }} />
        <motion.div className="lg-layer lg-dusk" style={{ opacity: duskOpacity }} />
      </div>

      {!reduce && mounted && (
        <motion.div className="lg-fireflies" style={{ opacity: fireflyOpacity }} aria-hidden="true">
          {fireflies.map((f) => (
            <span
              key={f.id}
              className="lg-firefly"
              style={{
                left: `${f.left}%`,
                top: `${f.top}%`,
                width: `${f.size}px`,
                height: `${f.size}px`,
                '--dur': `${f.dur}s`,
                '--delay': `${f.delay}s`,
                '--dx': `${f.driftX}px`,
                '--dy': `${f.driftY}px`,
              }}
            />
          ))}
        </motion.div>
      )}
    </>
  )
}
