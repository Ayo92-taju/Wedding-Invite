import { motion, useReducedMotion } from 'motion/react'
import Flower from './ui/Flower.jsx'
import { letter } from '../data/content.js'
import './Letter.css'

/*
 * A note from the couple — a handwritten-feeling letter on pressed-flower paper.
 * Each line settles onto the page in turn, as if being written, and the
 * signature arrives last in calligraphy.
 */
export default function Letter() {
  const reduce = useReducedMotion()

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.55, delayChildren: 0.2 } },
  }
  const line = {
    hidden: { opacity: 0, y: reduce ? 0 : 14 },
    show: { opacity: 1, y: 0, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1] } },
  }
  const sign = {
    hidden: { opacity: 0, y: reduce ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section id="letter" className="section letter">
      <div className="container letter__container">
        <motion.article
          className="letter__paper"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.35 }}
        >
          <Flower className="letter__bloom letter__bloom--tr" size={70} variant="blush" petals={7} strokeWidth={0.7} />

          <motion.span className="eyebrow letter__eyebrow" variants={line}>
            {letter.eyebrow}
          </motion.span>

          <motion.p className="letter__salutation script" variants={line}>
            {letter.salutation}
          </motion.p>

          <div className="letter__body">
            {letter.paragraphs.map((p, i) => (
              <motion.p className="letter__line" variants={line} key={i}>
                {p}
              </motion.p>
            ))}
          </div>

          <motion.p className="letter__closing" variants={line}>
            {letter.closing}
          </motion.p>
          <motion.p className="letter__signature script" variants={sign}>
            {letter.signature}
          </motion.p>
        </motion.article>
      </div>
    </section>
  )
}
