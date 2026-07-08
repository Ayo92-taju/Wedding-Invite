'use client'

import { motion } from 'motion/react'
import { Heart, Navigation } from 'lucide-react'
import { couple, wedding } from '../data/content.js'

export default function HeroPanel() {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden py-32 px-6">
      {/* soft radial depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(252,249,242,0.45)_90%)] dark:bg-[radial-gradient(circle_at_center,transparent_20%,rgba(17,27,21,0.6)_95%)] pointer-events-none" />

      {/* gold-foil framed panel */}
      <div className="max-w-4xl w-full border border-bloom-gold/15 dark:border-bloom-gold/10 p-8 md:p-16 rounded-[40px] text-center relative z-10 paper-texture">
        <div className="absolute inset-3 border border-bloom-gold/30 rounded-[28px] pointer-events-none opacity-80" />

        <div className="mb-6 flex items-center justify-center gap-2 text-bloom-gold">
          <div className="w-10 h-px bg-bloom-gold/40" />
          <Heart className="w-3.5 h-3.5 fill-current" />
          <div className="w-10 h-px bg-bloom-gold/40" />
        </div>

        <motion.span
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-cinzel text-[10px] md:text-xs tracking-[0.4em] uppercase block mb-4 text-bloom-gold"
        >
          Welcome to the Wedding of
        </motion.span>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          className="space-y-2 md:space-y-4"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-extralight tracking-tight text-bloom-charcoal dark:text-bloom-cream">
            {couple.heroNameOne} &amp; {couple.nameTwo}
          </h1>
          <h2 className="font-script text-4xl md:text-5xl text-bloom-rose mt-2 tracking-wide">{couple.tagline}</h2>
        </motion.div>

        <div className="w-16 h-px bg-bloom-gold/40 mx-auto my-8" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="space-y-3 font-serif text-sm md:text-base text-bloom-sage-dark dark:text-bloom-sage max-w-lg mx-auto"
        >
          <p className="tracking-widest uppercase text-xs text-bloom-gold font-light">{wedding.dayShort}</p>
          <p className="italic font-light">
            {wedding.ceremony.venue} — {wedding.ceremony.address}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 1.5, delay: 0.8 }}
          className="border-t border-dashed border-bloom-gold/15 pt-8 mt-10 max-w-sm mx-auto"
        >
          <p className="font-serif italic text-xs leading-relaxed text-bloom-sage-dark dark:text-bloom-sage/70">
            &ldquo;{couple.intro}&rdquo;
          </p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => document.getElementById('invitation')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-12 px-8 py-3.5 bg-bloom-gold text-bloom-ivory font-cinzel text-[10px] tracking-widest uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto cursor-pointer"
        >
          <Navigation className="w-3 h-3 rotate-45" />
          Unfold Invitation
        </motion.button>
      </div>
    </header>
  )
}
