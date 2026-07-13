'use client'

import { motion } from 'motion/react'
import { loveStory, loveStoryLede } from '../data/content.js'

/* Each milestone blooms one stage further along the garden stem.
   Stages + accent colours are derived by position so content.js stays clean. */
const STAGES = ['sunflower', 'tulip', 'lotus', 'rose', 'blossom']
const COLORS = ['text-bloom-gold', 'text-bloom-sage', 'text-bloom-blush', 'text-bloom-rose', 'text-bloom-rose-dark']

function FlowerGlyph({ stage }) {
  switch (stage) {
    case 'sunflower': // seed / first sprout
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
          <path d="M50 80 Q40 50 50 20 Q60 50 50 80 Z" />
        </svg>
      )
    case 'tulip': // growth
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
          <path d="M50 80 C30 50, 40 30, 50 15 C60 30, 70 50, 50 80 M50 80 C30 70, 20 60, 30 50" />
        </svg>
      )
    case 'lotus': // bud
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
          <path d="M50 15 C35 30, 35 60, 50 85 C65 60, 65 30, 50 15 Z M50 25 C42 40, 42 55, 50 75 C58 55, 58 40, 50 25 Z" />
        </svg>
      )
    case 'rose': // opening bloom
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
          <path d="M50 10 C35 25, 25 45, 45 70 C55 60, 75 50, 50 10 M50 10 C65 25, 75 45, 55 70 M50 65 C40 75, 45 90, 50 90 C55 90, 60 75, 50 65" />
        </svg>
      )
    default: // blossom — full bloom
      return (
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-5 h-5">
          <circle cx="50" cy="50" r="12" />
          <path d="M50 15 C40 25, 30 25, 30 35 C30 45, 40 45, 50 35 M50 15 C60 25, 70 25, 70 35 C70 45, 60 45, 50 35 M15 50 C25 40, 25 30, 35 30 C45 30, 45 40, 35 50 M15 50 C25 60, 25 70, 35 70 C45 70, 45 60, 35 50 M85 50 C75 40, 75 30, 65 30 C55 30, 55 40, 65 50 M85 50 C75 60, 75 70, 65 70 C55 70, 55 60, 65 50 M50 85 C40 75, 30 75, 30 65 C30 55, 40 55, 50 65 M50 85 C60 75, 70 75, 70 65 C70 55, 60 55, 50 65" />
        </svg>
      )
  }
}

export default function LoveStory() {
  return (
    <section id="story" className="relative py-24 px-4 overflow-hidden min-h-screen">
      <div className="max-w-4xl mx-auto relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1 }}
          className="text-center mb-20"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Our Timeline
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Love Story Garden
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
          <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage max-w-md mx-auto mt-6">
            {loveStoryLede}
          </p>
        </motion.div>

        {/* Central vertical stem */}
        <div className="absolute left-4 md:left-1/2 top-48 bottom-12 w-[1.5px] bg-gradient-to-b from-bloom-sage/10 via-bloom-sage/30 to-bloom-gold/10 md:-translate-x-1/2 pointer-events-none">
          <div className="absolute top-1/4 -left-1.5 w-3.5 h-3.5 rounded-full bg-bloom-sage/40" />
          <div className="absolute top-2/4 -right-1.5 w-3.5 h-3.5 rounded-full bg-bloom-rose/30" />
          <div className="absolute top-3/4 -left-1.5 w-3.5 h-3.5 rounded-full bg-bloom-gold/30" />
        </div>

        {/* Timeline events */}
        <div className="space-y-16 md:space-y-24">
          {loveStory.map((event, idx) => {
            const isEven = idx % 2 === 0
            // Progress along the timeline (0 → 1) so the last milestone always
            // reaches full bloom, whatever the number of entries.
            const ratio = loveStory.length > 1 ? idx / (loveStory.length - 1) : 1
            const stage = STAGES[Math.round(ratio * (STAGES.length - 1))]
            const color = COLORS[Math.round(ratio * (COLORS.length - 1))]

            return (
              <div
                key={`${event.year}-${event.title}`}
                className={`flex flex-col md:flex-row items-stretch justify-between relative ${
                  isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Bloom marker on the stem */}
                <div className="absolute left-4 md:left-1/2 w-10 h-10 rounded-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/30 flex items-center justify-center -translate-x-1/2 z-10 shadow-sm">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                    whileInView={{ scale: 1.1, rotate: 0, opacity: 1 }}
                    whileHover={{ scale: 1.3, rotate: 15 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                    className={color}
                  >
                    <FlowerGlyph stage={stage} />
                  </motion.div>
                </div>

                {/* Content card */}
                <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${isEven ? 'md:text-right' : 'md:text-left'}`}>
                  <motion.div
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="space-y-2 bg-bloom-ivory/60 dark:bg-dark-paper/30 p-6 rounded-2xl border border-bloom-gold/5 backdrop-blur-xs shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    <span className="font-cinzel text-xl md:text-2xl text-bloom-gold tracking-widest font-light block">
                      {event.year}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl text-bloom-charcoal dark:text-bloom-cream font-medium">
                      {event.title}
                    </h3>
                    <p className="font-serif italic text-base md:text-lg text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed pt-2">
                      {event.text}
                    </p>
                  </motion.div>
                </div>

                {/* Spacer keeps the alternating grid aligned */}
                <div className="hidden md:block w-[45%]" />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
