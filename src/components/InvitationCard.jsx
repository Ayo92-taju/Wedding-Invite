'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MailOpen, MapPin, Calendar, Clock } from 'lucide-react'
import { couple, wedding } from '../data/content.js'

const watercolorBg = '/images/watercolor-florals.jpg'

export default function InvitationCard() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section
      id="invitation"
      className="relative py-24 px-4 flex flex-col items-center justify-center overflow-hidden min-h-screen"
    >
      {/* Background floral embellishments */}
      <div className="absolute top-1/4 left-5 opacity-10 dark:opacity-5 max-w-[150px] pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-bloom-rose">
          <path d="M10 80 C 40 70, 60 40, 50 10 C 60 40, 80 70, 90 80 Z" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 right-5 opacity-10 dark:opacity-5 max-w-[150px] pointer-events-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="text-bloom-sage">
          <path d="M90 20 C 60 30, 40 60, 50 90 C 40 60, 20 30, 10 20 Z" />
        </svg>
      </div>

      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="text-center mb-12"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            The Invitation
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Blooming Letter
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
        </motion.div>

        {/* Envelope & card area */}
        <div className="relative w-full max-w-2xl min-h-[500px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* CLOSED ENVELOPE */
              <motion.div
                key="envelope"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20, rotateX: 45 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                whileHover={{ y: -5 }}
                className="relative w-full max-w-md p-8 md:p-12 bg-bloom-ivory dark:bg-dark-paper rounded-2xl shadow-xl border border-bloom-gold/20 paper-texture flex flex-col items-center justify-center text-center cursor-pointer overflow-hidden group select-none"
                onClick={() => setIsOpen(true)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setIsOpen(true)
                  }
                }}
                aria-label="Open the invitation"
              >
                <div className="absolute inset-4 border border-bloom-gold/10 pointer-events-none" />
                <div className="absolute inset-5 border border-bloom-gold/30 rounded-lg pointer-events-none" />

                {/* Floral watermark */}
                <div className="absolute -bottom-10 -right-10 w-44 h-44 opacity-10 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none text-bloom-rose">
                  <svg viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 0 C75 25, 90 60, 50 100 C10 60, 25 25, 50 0" />
                  </svg>
                </div>

                <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-b from-bloom-gold/20 to-transparent" />

                {/* Wax seal */}
                <div className="relative my-8 flex flex-col items-center">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute w-24 h-24 rounded-full bg-bloom-gold/20 blur-md"
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-20 h-20 rounded-full flex items-center justify-center shadow-lg bg-bloom-rose dark:bg-bloom-rose-dark border-2 border-bloom-gold/40 text-bloom-ivory select-none"
                  >
                    <div className="absolute inset-1 border border-dashed border-bloom-gold-light/40 rounded-full pointer-events-none" />
                    <svg viewBox="0 0 100 100" fill="currentColor" className="w-12 h-12 text-bloom-gold-light">
                      <path d="M50 20 C40 30, 30 35, 30 50 C30 65, 45 75, 50 80 C55 75, 70 65, 70 50 C70 35, 60 30, 50 20 M50 35 C45 42, 42 45, 42 53 C42 61, 48 65, 50 67 C52 65, 58 61, 58 53 C58 45, 55 42, 50 35 Z" />
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-full rotate-45" />
                  </motion.div>

                  <span className="font-serif text-sm italic text-bloom-rose-dark dark:text-bloom-blush mt-4 group-hover:text-bloom-rose transition-colors">
                    Click the seal to unfold
                  </span>
                </div>

                <p className="font-cinzel text-bloom-charcoal/80 dark:text-bloom-cream/80 text-sm tracking-[0.2em] uppercase">
                  {couple.nameOne} &amp; {couple.nameTwo}
                </p>
                <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/70 mt-1">
                  A private invitation
                </p>

                <div className="flex items-center gap-1.5 mt-8 text-xs text-bloom-gold font-light tracking-widest uppercase">
                  <MailOpen className="w-3.5 h-3.5" />
                  <span>{wedding.dayShort}</span>
                </div>
              </motion.div>
            ) : (
              /* UNFOLDED INVITATION */
              <motion.div
                key="letter"
                initial={{ opacity: 0, scale: 0.9, rotateX: -45 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20, stiffness: 80 }}
                className="relative w-full bg-bloom-ivory dark:bg-dark-paper rounded-3xl shadow-2xl overflow-hidden border border-bloom-gold/30 paper-texture flex flex-col md:flex-row"
              >
                {/* Watercolor frame side */}
                <div className="relative md:w-5/12 min-h-[250px] md:min-h-[500px] overflow-hidden bg-bloom-cream flex items-center justify-center">
                  <img
                    src={watercolorBg}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover opacity-85 dark:opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-bloom-ivory via-transparent to-transparent md:from-transparent md:to-bloom-ivory dark:md:to-dark-paper pointer-events-none" />

                  <div className="absolute inset-4 border border-bloom-gold/20 flex flex-col items-center justify-center text-center p-4">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="bg-bloom-ivory/80 dark:bg-dark-paper/80 p-4 rounded backdrop-blur-xs border border-bloom-gold/10"
                    >
                      <h3 className="font-script text-3xl text-bloom-rose-dark dark:text-bloom-blush">
                        {couple.nameOne} &amp; {couple.nameTwo}
                      </h3>
                      <p className="font-serif italic text-xs tracking-wider text-bloom-sage-dark dark:text-bloom-sage mt-1">
                        &ldquo;{couple.tagline}&rdquo;
                      </p>
                    </motion.div>
                  </div>
                </div>

                {/* Content side */}
                <div className="relative md:w-7/12 p-8 md:p-12 flex flex-col justify-between">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 text-bloom-rose hover:text-bloom-rose-dark font-serif text-sm tracking-widest uppercase italic border-b border-transparent hover:border-bloom-rose cursor-pointer"
                  >
                    Fold Close
                  </button>

                  <div className="my-auto space-y-6 text-center md:text-left">
                    <div className="space-y-2">
                      <span className="font-cinzel text-bloom-gold text-[10px] tracking-[0.35em] uppercase block">
                        The honour of your presence
                      </span>
                      <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage/80">
                        {wedding.invitationNote}
                      </p>
                    </div>

                    {/* Names */}
                    <div className="space-y-1">
                      <h3 className="font-serif text-4xl md:text-5xl tracking-normal text-bloom-charcoal dark:text-bloom-cream font-light">
                        {couple.nameOne}
                      </h3>
                      <p className="font-script text-3xl text-bloom-rose my-1">&amp;</p>
                      <h3 className="font-serif text-4xl md:text-5xl tracking-normal text-bloom-charcoal dark:text-bloom-cream font-light">
                        {couple.nameTwo}
                      </h3>
                    </div>

                    <div className="w-16 h-px bg-bloom-gold/30 mx-auto md:mx-0" />

                    {/* Ceremony details */}
                    <div className="space-y-4 font-serif text-bloom-charcoal/80 dark:text-bloom-cream/80">
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Calendar className="w-4 h-4 text-bloom-gold shrink-0" />
                        <span className="text-base tracking-wide font-light">{wedding.dateLong}</span>
                      </div>
                      <div className="flex items-center gap-3 justify-center md:justify-start">
                        <Clock className="w-4 h-4 text-bloom-gold shrink-0" />
                        <span className="text-base tracking-wide font-light">{wedding.ceremony.time}</span>
                      </div>
                      <div className="flex items-start gap-3 justify-center md:justify-start text-left">
                        <MapPin className="w-4 h-4 text-bloom-gold mt-1 shrink-0" />
                        <div>
                          <p className="text-base font-light tracking-wide">{wedding.ceremony.venue}</p>
                          <p className="text-xs text-bloom-sage-dark dark:text-bloom-sage/70">
                            {wedding.ceremony.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-bloom-gold/20 pt-6 mt-6">
                      <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed">
                        {wedding.reception.label} — {wedding.reception.time}. <br />
                        {wedding.dressCode.label}: {wedding.dressCode.text}.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed border-bloom-gold/10 text-xs text-bloom-gold">
                    <span className="font-cinzel tracking-widest uppercase">{couple.hashtag}</span>
                    <span className="font-serif italic text-bloom-rose">Kindly RSVP below</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
