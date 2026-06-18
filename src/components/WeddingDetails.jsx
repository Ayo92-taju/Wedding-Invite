import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { wedding } from '../data/content.js'
import './WeddingDetails.css'

/*
 * Wedding Details as an elegant floral card suite — fine-line florals,
 * soft gold dividers, an airy layout.
 */
export default function WeddingDetails() {
  const cards = [
    {
      variant: 'blush',
      label: 'When',
      title: wedding.dateLong,
      lines: [wedding.year, wedding.ceremony.time],
    },
    {
      variant: 'sage',
      label: 'Where',
      title: wedding.ceremony.venue,
      lines: [wedding.ceremony.address, `${wedding.reception.label} — ${wedding.reception.venue}`],
    },
    {
      variant: 'gold',
      label: wedding.dressCode.label,
      title: wedding.dressCode.text,
      lines: [wedding.dressCode.detail],
    },
  ]

  return (
    <section id="details" className="section details">
      <div className="container">
        <SectionHeading
          eyebrow="The Celebration"
          title="Wedding"
          script="details"
          lede="Everything you need to join us in the garden, gathered into a little suite of cards."
        />

        <div className="details__grid">
          {cards.map((c, i) => (
            <Reveal className="details__card" delay={i * 0.12} key={c.label}>
              <Flower className="details__icon" size={56} variant={c.variant} petals={6} strokeWidth={0.8} />
              <span className="eyebrow details__label">{c.label}</span>
              <h3 className="details__title">{c.title}</h3>
              <span className="details__rule" />
              {c.lines.map((line) => (
                <p className="details__line" key={line}>
                  {line}
                </p>
              ))}
            </Reveal>
          ))}
        </div>

        <Reveal className="details__map-note" delay={0.1}>
          <p>
            A note on travel & where to stay will bloom here soon. For now — bring soft shoes for the
            lawn, and a heart ready to dance.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
