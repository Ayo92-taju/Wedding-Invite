import { useEffect, useState } from 'react'
import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { registry } from '../data/content.js'
import { onGifts, reserveGift } from '../lib/gifts.js'
import './Registry.css'

const VARIANTS = ['blush', 'sage', 'gold']

/*
 * Gift Registry — a refined "Garden of Gifts."
 * Reads live gifts from Firestore when the couple manages them there;
 * otherwise falls back to the items in content.js.
 */
export default function Registry() {
  const [gifts, setGifts] = useState(null)

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
    : registry.items.map((it) => ({ key: it.name, name: it.name, description: it.description, url: it.url, live: false }))

  const reserve = async (item) => {
    try {
      await reserveGift(item, 'A guest')
    } catch (err) {
      console.warn('Could not reserve gift.', err)
    }
  }

  return (
    <section id="registry" className="section registry">
      <div className="container">
        <SectionHeading eyebrow="With gratitude" title="A garden" script="of gifts" lede={registry.note} />

        <div className="registry__grid">
          {items.map((item, i) => (
            <Reveal className="registry__card" delay={i * 0.1} key={item.key}>
              <Flower className="registry__icon" size={58} variant={VARIANTS[i % VARIANTS.length]} petals={6} strokeWidth={0.8} />
              <h3 className="registry__name">{item.name}</h3>
              <p className="registry__desc">{item.description}</p>

              {item.isPurchased ? (
                <span className="registry__reserved">Reserved with love ❀</span>
              ) : (
                <>
                  <a
                    href={item.url}
                    className="registry__link"
                    target={item.url.startsWith('http') ? '_blank' : undefined}
                    rel="noreferrer"
                  >
                    Visit registry
                    <span aria-hidden="true" className="registry__arrow">→</span>
                  </a>
                  {item.live && (
                    <button type="button" className="registry__reserve" onClick={() => reserve(item)}>
                      I’m gifting this
                    </button>
                  )}
                </>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
