'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Sprout, Landmark, User, Hash, Copy, Check } from 'lucide-react'
import { registry } from '../data/content.js'

export default function GiftRegistry() {
  const { note, account } = registry
  const [copied, setCopied] = useState(false)

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(account.number)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard blocked — the number is on screen to copy manually */
    }
  }

  const rows = [
    { Icon: Landmark, label: 'Bank', value: account.bank },
    { Icon: User, label: 'Account Name', value: account.name },
  ]

  return (
    <section id="registry" className="relative py-24 px-4 overflow-hidden min-h-screen flex items-center">
      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Gift Registry
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Garden of Gifts
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
          <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage max-w-lg mx-auto mt-6 leading-relaxed">
            {note}
          </p>
        </motion.div>

        {/* Account card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/25 rounded-3xl p-8 md:p-10 shadow-md paper-texture foil-gold overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-bloom-rose via-bloom-gold to-bloom-sage" />

          {/* Seedling emblem */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-bloom-sage/10 flex items-center justify-center mb-3">
              <Sprout className="w-6 h-6 text-bloom-sage" />
            </div>
            <span className="font-cinzel text-[10px] tracking-[0.3em] uppercase text-bloom-gold">
              A Seed of Love
            </span>
          </div>

          {/* Bank + name rows */}
          <div className="space-y-4">
            {rows.map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-3 border-b border-dashed border-bloom-gold/15 pb-4"
              >
                <Icon className="w-4 h-4 text-bloom-rose shrink-0" />
                <div className="min-w-0">
                  <p className="font-cinzel text-[9px] tracking-widest text-bloom-gold uppercase">{label}</p>
                  <p className="font-serif text-base text-bloom-charcoal dark:text-bloom-cream truncate">{value}</p>
                </div>
              </div>
            ))}

            {/* Account number + copy */}
            <div className="flex items-center gap-3 pt-1">
              <Hash className="w-4 h-4 text-bloom-rose shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-cinzel text-[9px] tracking-widest text-bloom-gold uppercase">Account Number</p>
                <p className="font-serif text-2xl md:text-3xl tracking-wide text-bloom-charcoal dark:text-bloom-cream tabular-nums">
                  {account.number}
                </p>
              </div>
              <button
                type="button"
                onClick={copyNumber}
                className="shrink-0 px-4 py-2.5 bg-bloom-gold hover:bg-bloom-gold/90 text-bloom-ivory font-cinzel text-[10px] tracking-widest uppercase rounded-full shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
