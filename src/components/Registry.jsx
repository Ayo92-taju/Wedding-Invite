import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { registry } from '../data/content.js'
import './Registry.css'

const VARIANTS = ['blush', 'sage', 'gold']

/*
 * Gift Registry — a refined "Garden of Gifts."
 */
export default function Registry() {
  return (
    <section id="registry" className="section registry">
      <div className="container">
        <SectionHeading
          eyebrow="With gratitude"
          title="A garden"
          script="of gifts"
          lede={registry.note}
        />

        <div className="registry__grid">
          {registry.items.map((item, i) => (
            <Reveal className="registry__card" delay={i * 0.1} key={item.name}>
              <Flower
                className="registry__icon"
                size={58}
                variant={VARIANTS[i % VARIANTS.length]}
                petals={6}
                strokeWidth={0.8}
              />
              <h3 className="registry__name">{item.name}</h3>
              <p className="registry__desc">{item.description}</p>
              <a
                href={item.url}
                className="registry__link"
                target={item.url.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
              >
                Visit registry
                <span aria-hidden="true" className="registry__arrow">→</span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
