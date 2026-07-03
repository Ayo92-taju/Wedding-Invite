'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Sprout, TreePine, Plane, Gift, Flower2, ExternalLink, Check } from 'lucide-react'
import { registry } from '../data/content.js'
import { onGifts, reserveGift } from '../lib/gifts.js'

const ICONS = [Plane, Sprout, TreePine, Flower2, Gift]
const CATEGORIES = ['Garden Wandering', 'Sowing Seeds', 'Planting Roots', 'A Blooming Wish', 'Cultivation']

/*
 * Garden of Gifts — reads live gifts from Firestore when the couple manages
 * them there; otherwise falls back to the items in content.js. The concept's
 * fake "contribution portal" is dropped in favour of the couple's real
 * registry links + an honest "I'm gifting this" reservation.
 */
export default function GiftRegistry() {
  const [gifts, setGifts] = useState(null)
  const [reserving, setReserving] = useState({})

  useEffect(() => onGifts((list) => setGifts(list), () => setGifts([])), [])

  const useLive = !!gifts && gifts.length > 0
  const items = useLive
    ? gifts.map((g) => ({
        key: g.id,
        id: g.id,
        name: g.name,
        description: g.description || '',
        url: g.buyUrl || '#',
        isPurchased: !!g.isPurchased,
        live: true,
      }))
    : registry.items.map((it) => ({
        key: it.name,
        name: it.name,
        description: it.description,
        url: it.url,
        isPurchased: false,
        live: false,
      }))

  const reserve = async (item) => {
    setReserving((r) => ({ ...r, [item.id]: true }))
    try {
      await reserveGift(item, 'A guest')
    } catch (err) {
      console.warn('Could not reserve gift.', err)
    }
    setReserving((r) => ({ ...r, [item.id]: false }))
  }

  return (
    <section id="registry" className="relative py-24 px-4 overflow-hidden min-h-screen">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Gift Registry
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Garden of Gifts
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
          <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage max-w-lg mx-auto mt-6 leading-relaxed">
            {registry.note}
          </p>
        </motion.div>

        {/* Registry grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => {
            const Icon = ICONS[idx % ICONS.length]
            const category = CATEGORIES[idx % CATEGORIES.length]
            const isExternal = item.url && item.url.startsWith('http')

            return (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                className="bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 p-6 rounded-3xl shadow-sm flex flex-col justify-between paper-texture h-full relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-bloom-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-cinzel text-[9px] tracking-widest text-bloom-gold uppercase">
                      {category}
                    </span>
                    <div className="w-10 h-10 rounded-full bg-bloom-sage/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-bloom-sage" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl text-bloom-charcoal dark:text-bloom-cream font-medium mb-3">
                    {item.name}
                  </h3>

                  <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed mb-6">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-4 border-t border-dashed border-bloom-gold/10 relative z-10">
                  {item.isPurchased ? (
                    <span className="w-full py-2.5 flex items-center justify-center gap-1.5 font-cinzel text-[10px] tracking-widest uppercase text-bloom-sage-dark dark:text-bloom-sage">
                      <Check className="w-3.5 h-3.5" />
                      Reserved with love
                    </span>
                  ) : (
                    <>
                      <a
                        href={item.url}
                        target={isExternal ? '_blank' : undefined}
                        rel="noreferrer"
                        className="w-full py-2.5 bg-bloom-ivory hover:bg-bloom-rose text-bloom-rose-dark hover:text-bloom-ivory border border-bloom-rose/30 hover:border-bloom-rose font-cinzel text-[10px] tracking-widest uppercase rounded-full transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Visit registry
                      </a>
                      {item.live && (
                        <button
                          type="button"
                          onClick={() => reserve(item)}
                          disabled={reserving[item.id]}
                          className="w-full py-2 text-bloom-sage-dark dark:text-bloom-sage hover:text-bloom-rose font-serif italic text-xs transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {reserving[item.id] ? 'Reserving…' : "I'm gifting this ❀"}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
