'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { couple, wedding } from '../data/content.js'

export default function CountdownTimer() {
  const weddingDate = new Date(wedding.dateTimeISO).getTime()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculateTime = () => {
      const difference = weddingDate - Date.now()

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)
    return () => clearInterval(interval)
  }, [weddingDate])

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ]

  return (
    <section className="relative py-20 px-4 overflow-hidden bg-bloom-ivory/60 dark:bg-dark-paper/20">
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <div className="absolute inset-0 rounded-full border border-bloom-gold/10 -m-10 scale-90 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <span className="font-cinzel text-bloom-gold text-[10px] tracking-[0.35em] uppercase block">
            Counting Down the Petals
          </span>

          <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl mx-auto pt-4">
            {timeBlocks.map((block) => (
              <div
                key={block.label}
                className="bg-bloom-ivory dark:bg-dark-paper/60 border border-bloom-gold/15 p-4 md:p-6 rounded-2xl shadow-xs paper-texture flex flex-col items-center justify-center relative overflow-hidden group"
              >
                <div className="absolute inset-1.5 border border-bloom-gold/5 rounded-xl pointer-events-none" />
                <span className="font-serif text-3xl md:text-5xl font-light text-bloom-rose-dark dark:text-bloom-rose tabular-nums">
                  {String(block.value).padStart(2, '0')}
                </span>
                <span className="font-cinzel text-[8px] md:text-[9px] tracking-widest text-bloom-sage-dark dark:text-bloom-sage mt-2 uppercase">
                  {block.label}
                </span>
              </div>
            ))}
          </div>

          <p className="font-serif italic text-xs md:text-sm text-bloom-sage-dark dark:text-bloom-sage/80 pt-4">
            Until {couple.nameOne} &amp; {couple.nameTwo} say &ldquo;I do&rdquo; at {wedding.ceremony.venue}.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
