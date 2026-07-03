'use client'

import { motion } from 'motion/react'
import { MapPin, Calendar, Clock, Wine, Sparkles, Heart } from 'lucide-react'
import { couple, wedding } from '../data/content.js'

const events = [
  {
    part: 'Part One',
    label: wedding.ceremony.label,
    Icon: Heart,
    time: wedding.ceremony.time,
    venue: wedding.ceremony.venue,
    address: wedding.ceremony.address,
    note: 'We will exchange our vows surrounded by blooms and the people we love most.',
    footL: 'Ceremony',
    footR: 'Garden Formal',
  },
  {
    part: 'Part Two',
    label: wedding.reception.label,
    Icon: Wine,
    time: wedding.reception.time,
    venue: wedding.reception.venue,
    address: wedding.reception.address,
    note: 'Stay for an evening of dining, heartfelt toasts, and dancing among the flowers.',
    footL: 'Reception',
    footR: 'Dinner & Dancing',
  },
]

export default function WeddingDetails() {
  return (
    <section
      id="details"
      className="relative py-24 px-4 bg-bloom-cream/40 dark:bg-dark-garden/20 overflow-hidden"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-bloom-gold/20 to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            The Celebration
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Wedding Details
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
        </motion.div>

        {/* Detail cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev, idx) => (
            <motion.div
              key={ev.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 p-8 rounded-3xl shadow-md paper-texture flex flex-col justify-between h-full group"
            >
              <div>
                <div className="flex justify-between items-center mb-6">
                  <span className="font-cinzel text-[10px] text-bloom-gold tracking-widest uppercase">
                    {ev.part}
                  </span>
                  <ev.Icon className="w-4 h-4 text-bloom-rose opacity-40 group-hover:opacity-100 transition-opacity" />
                </div>

                <h3 className="font-serif text-2xl text-bloom-charcoal dark:text-bloom-cream font-medium mb-4">
                  {ev.label}
                </h3>

                <div className="w-full h-px bg-gradient-to-r from-bloom-gold/30 via-bloom-gold/10 to-transparent my-4" />

                <div className="space-y-3 font-serif text-sm text-bloom-charcoal/80 dark:text-bloom-cream/80 mb-6">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-bloom-sage shrink-0" />
                    <span>{wedding.dateLong}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-bloom-sage shrink-0" />
                    <span>{ev.time}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-start gap-2.5 text-left">
                    <MapPin className="w-4 h-4 text-bloom-rose mt-1 shrink-0" />
                    <div>
                      <h4 className="font-serif text-sm font-medium text-bloom-charcoal dark:text-bloom-cream">
                        {ev.venue}
                      </h4>
                      <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/70">
                        {ev.address}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed">
                  {ev.note}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-dashed border-bloom-gold/20 flex justify-between items-center text-xs text-bloom-gold">
                <span className="font-cinzel">{ev.footL}</span>
                <span className="font-serif italic">{ev.footR}</span>
              </div>
            </motion.div>
          ))}

          {/* Dress code card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 p-8 rounded-3xl shadow-md paper-texture flex flex-col justify-between h-full group"
          >
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="font-cinzel text-[10px] text-bloom-gold tracking-widest uppercase">
                  Part Three
                </span>
                <Sparkles className="w-4 h-4 text-bloom-gold opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>

              <h3 className="font-serif text-2xl text-bloom-charcoal dark:text-bloom-cream font-medium mb-4">
                {wedding.dressCode.label}
              </h3>

              <div className="w-full h-px bg-gradient-to-r from-bloom-gold/30 via-bloom-gold/10 to-transparent my-4" />

              <p className="font-serif text-lg text-bloom-rose-dark dark:text-bloom-rose font-light mb-3">
                {wedding.dressCode.text}
              </p>

              <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed">
                {wedding.dressCode.detail}. Dress to bloom alongside the garden — we cannot wait to
                celebrate with you.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-dashed border-bloom-gold/20 flex justify-between items-center text-xs text-bloom-gold">
              <span className="font-cinzel">Attire</span>
              <span className="font-serif italic">{wedding.dressCode.text}</span>
            </div>
          </motion.div>
        </div>

        {/* Closing strip */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center gap-3 text-center"
        >
          <div className="w-16 h-px bg-bloom-gold/30" />
          <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage/80">
            {wedding.dayShort} · {wedding.ceremony.venue}
          </p>
          <span className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-bloom-gold">
            {couple.hashtag}
          </span>
        </motion.div>
      </div>
    </section>
  )
}
