'use client'

import { couple, wedding, credit } from '../data/content.js'

export default function SiteFooter() {
  return (
    <footer className="relative py-16 px-6 text-center border-t border-bloom-gold/20 bg-bloom-ivory dark:bg-dark-paper paper-texture select-none">
      <div className="max-w-md mx-auto space-y-6">
        <div className="font-script text-4xl text-bloom-rose">
          {couple.nameOne} &amp; {couple.nameTwo}
        </div>

        <div className="w-12 h-px bg-bloom-gold/40 mx-auto" />

        <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/70 leading-relaxed">
          Thank you for being part of our story. We can&apos;t wait to celebrate our love blooming
          with you, surrounded by flowers and everyone we love.
        </p>

        <nav className="flex items-center justify-center gap-5 font-cinzel text-[10px] tracking-widest uppercase text-bloom-sage-dark dark:text-bloom-sage" aria-label="Footer">
          <a href="#story" className="hover:text-bloom-rose transition-colors">Story</a>
          <a href="#details" className="hover:text-bloom-rose transition-colors">Details</a>
          <a href="#registry" className="hover:text-bloom-rose transition-colors">Registry</a>
          <a href="#rsvp" className="hover:text-bloom-rose transition-colors">RSVP</a>
        </nav>

        <div className="space-y-1 pt-2">
          <p className="font-cinzel text-[9px] tracking-[0.3em] uppercase text-bloom-gold">
            {couple.hashtag}
          </p>
          <p className="font-serif text-[10px] text-bloom-sage-dark dark:text-bloom-sage/50">
            {wedding.dayShort} &bull; {couple.tagline} &bull; {credit}
          </p>
        </div>
      </div>
    </footer>
  )
}
