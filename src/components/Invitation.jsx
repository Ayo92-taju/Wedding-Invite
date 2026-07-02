import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import { couple, wedding } from '../data/content.js'
import Flower from './ui/Flower.jsx'
import './Invitation.css'

/*
 * A luxury invitation that opens like a pressed-flower letter. It rests sealed
 * with a wax monogram; when it drifts into view (or on tap) the cover folds
 * back to reveal the details inside.
 */
export default function Invitation() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.55 })
  const [open, setOpen] = useState(false)

  // Auto-open once, a beat after it settles into view.
  useEffect(() => {
    if (!inView) return
    const delay = reduce ? 0 : 750
    const t = window.setTimeout(() => setOpen(true), delay)
    return () => window.clearTimeout(t)
  }, [inView, reduce])

  return (
    <section id="invitation" className="invitation section" ref={ref}>
      <div className="container invitation__container">
        <div className={`inv ${open ? 'is-open' : ''}`}>
          <div className="inv__card">
            {/* The letter that lives underneath the cover */}
            <motion.div
              className="inv__letter"
              initial={false}
              animate={{ opacity: open ? 1 : 0, y: open ? 0 : 14 }}
              transition={{ duration: 0.9, delay: open ? 0.35 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inv__letter-frame">
                <Flower className="inv__corner inv__corner--tl" size={62} variant="blush" petals={6} strokeWidth={0.7} />
                <Flower className="inv__corner inv__corner--br" size={62} variant="sage" petals={6} strokeWidth={0.7} />

                <span className="eyebrow">Together with their families</span>
                <p className="inv__names script">
                  {couple.nameOne} <span className="inv__amp">&amp;</span> {couple.nameTwo}
                </p>
                <p className="inv__note">{wedding.invitationNote}</p>

                <div className="inv__detail-row">
                  <div className="inv__detail">
                    <span className="inv__detail-label">The Day</span>
                    <span className="inv__detail-value foil">{wedding.dateLong}</span>
                    <span className="inv__detail-sub">{wedding.year}</span>
                  </div>
                  <span className="inv__detail-divider" />
                  <div className="inv__detail">
                    <span className="inv__detail-label">The Hour</span>
                    <span className="inv__detail-value foil">{wedding.ceremony.time}</span>
                    <span className="inv__detail-sub">{wedding.ceremony.label}</span>
                  </div>
                </div>

                <div className="inv__place">
                  <span className="inv__detail-label">The Garden</span>
                  <span className="inv__place-venue">{wedding.ceremony.venue}</span>
                  <span className="inv__detail-sub">{wedding.ceremony.address}</span>
                </div>

                <a href="#rsvp" className="btn btn--solid inv__rsvp">
                  Reply with joy
                </a>
              </div>
            </motion.div>

            {/* The folding cover, sealed with wax */}
            <motion.button
              type="button"
              className="inv__cover"
              aria-label={open ? 'Invitation opened' : 'Open the invitation'}
              onClick={() => setOpen(true)}
              initial={false}
              animate={{ rotateX: open ? -168 : 0 }}
              transition={{ duration: reduce ? 0.3 : 1.5, ease: [0.6, 0.02, 0.2, 1] }}
              style={{ pointerEvents: open ? 'none' : 'auto' }}
            >
              <span className="inv__cover-inner">
                <span className="eyebrow eyebrow--cream">You are invited</span>
                <span className="inv__seal">
                  <span className="inv__seal-mono">{couple.initials}</span>
                </span>
                <span className="inv__cover-hint">{open ? '' : 'Tap to unfold'}</span>
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </section>
  )
}
