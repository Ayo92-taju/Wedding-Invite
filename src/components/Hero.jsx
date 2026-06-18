import { motion, useReducedMotion } from 'framer-motion'
import { couple, wedding } from '../data/content.js'
import Flower from './ui/Flower.jsx'
import FloralDivider from './ui/FloralDivider.jsx'
import './Hero.css'

/*
 * The welcome. The bloom intro lifts away to reveal this; its contents rise
 * into view in a gentle stagger once `active` is true.
 */
export default function Hero({ active }) {
  const reduce = useReducedMotion()
  const show = active || reduce

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.18, delayChildren: 0.1 },
    },
  }
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 26 },
    show: { opacity: 1, y: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section id="top" className="hero">
      {/* corner floral accents */}
      <Flower className="hero__accent hero__accent--tl float-soft" size={130} variant="sage" petals={7} strokeWidth={0.7} />
      <Flower className="hero__accent hero__accent--br float-soft" size={170} variant="blush" petals={8} strokeWidth={0.7} />
      <Flower className="hero__accent hero__accent--tr float-soft" size={90} variant="gold" petals={6} strokeWidth={0.7} />

      <motion.div
        className="hero__inner container"
        variants={container}
        initial="hidden"
        animate={show ? 'show' : 'hidden'}
      >
        <motion.span className="eyebrow" variants={item}>
          Together with their families
        </motion.span>

        <motion.h1 className="hero__names" variants={item}>
          <span className="script hero__name">{couple.nameOne}</span>
          <span className="hero__amp">and</span>
          <span className="script hero__name">{couple.nameTwo}</span>
        </motion.h1>

        <motion.div variants={item}>
          <FloralDivider width={260} style={{ marginBlock: '0.4rem 1.4rem' }} />
        </motion.div>

        <motion.p className="hero__sub" variants={item}>
          are getting married
        </motion.p>

        <motion.p className="hero__date" variants={item}>
          {wedding.dateLong}
          <span className="hero__dot">·</span>
          {wedding.year}
        </motion.p>

        <motion.p className="hero__venue" variants={item}>
          {wedding.ceremony.venue} — {wedding.ceremony.address}
        </motion.p>

        <motion.div className="hero__cta-row" variants={item}>
          <a href="#invitation" className="btn">
            Open our invitation
          </a>
          <a href="#rsvp" className="btn btn--solid">
            RSVP
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#invitation"
        className="hero__scroll"
        aria-label="Scroll to the invitation"
        initial={{ opacity: 0 }}
        animate={{ opacity: show ? 1 : 0 }}
        transition={{ delay: reduce ? 0.2 : 1.6, duration: 1 }}
      >
        <span className="hero__scroll-label">Scroll</span>
        <span className="hero__scroll-line" />
      </motion.a>
    </section>
  )
}
