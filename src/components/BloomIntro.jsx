import { useCallback, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Flower from './ui/Flower.jsx'
import PetalField from './PetalField.jsx'
import { couple } from '../data/content.js'
import './BloomIntro.css'

/*
 * The opening experience. Petals drift, a flower blooms open from a single
 * point, and the couple's names rise into view — then the whole scene lifts
 * away to reveal the welcome. Tap anywhere (or "Enter the garden") to skip.
 */
export default function BloomIntro({ onComplete }) {
  const reduce = useReducedMotion()
  const [done, setDone] = useState(false)

  const finish = useCallback(() => {
    setDone((already) => {
      if (already) return true
      onComplete?.()
      return true
    })
  }, [onComplete])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const total = reduce ? 1300 : 4600
    const timer = window.setTimeout(finish, total)
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [reduce, finish])

  const bloomEase = [0.34, 1.4, 0.5, 1]
  const softEase = [0.22, 1, 0.36, 1]

  return (
    <motion.div
      className="bloom-intro"
      role="button"
      tabIndex={0}
      aria-label="Skip the opening animation and enter the site"
      onClick={finish}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.08,
        filter: 'blur(8px)',
        transition: { duration: 1.15, ease: softEase },
      }}
    >
      <PetalField count={reduce ? 0 : 11} zIndex={1} />

      <div className="bloom-intro__stage">
        <motion.div
          className="bloom-intro__glow"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: reduce ? 0.7 : [0, 0.95, 0.72], scale: 1 }}
          transition={{ duration: reduce ? 0.5 : 2.8, delay: reduce ? 0 : 0.4, ease: 'easeOut' }}
        />
        <motion.div
          className="bloom-intro__flower"
          initial={{ scale: reduce ? 1 : 0.04, rotate: reduce ? 0 : -65, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0.5 : 2.5, delay: reduce ? 0 : 0.3, ease: bloomEase }}
        >
          <Flower size={270} variant="blush" petals={8} strokeWidth={0.8} />
        </motion.div>
        <motion.div
          className="bloom-intro__flower bloom-intro__flower--inner"
          initial={{ scale: reduce ? 1 : 0, rotate: reduce ? 0 : 55, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ duration: reduce ? 0.4 : 1.9, delay: reduce ? 0.05 : 1.15, ease: bloomEase }}
        >
          <Flower size={150} variant="rose" petals={6} strokeWidth={0.8} />
        </motion.div>
      </div>

      <motion.div
        className="bloom-intro__words"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: reduce ? 0.2 : 2.5, ease: softEase }}
      >
        <span className="eyebrow">You are warmly invited</span>
        <p className="script bloom-intro__names">
          {couple.nameOne}
          <span className="bloom-intro__amp">&amp;</span>
          {couple.nameTwo}
        </p>
        <p className="bloom-intro__tag foil">{couple.tagline}</p>
      </motion.div>

      <motion.span
        className="bloom-intro__skip"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduce ? 0.4 : 3.6, duration: 1 }}
      >
        Enter the garden <span className="bloom-intro__skip-arrow">→</span>
      </motion.span>
    </motion.div>
  )
}
