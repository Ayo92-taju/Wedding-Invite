import { motion, useReducedMotion } from 'framer-motion'

/*
 * Gentle scroll reveal — content drifts up and fades in as it enters view.
 * Honours prefers-reduced-motion (renders instantly, no transform).
 */
export default function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  as = 'div',
  amount = 0.3,
  once = true,
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as] || motion.div

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
