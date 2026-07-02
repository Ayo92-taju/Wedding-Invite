import { useRef } from 'react'
import { motion, useScroll, useReducedMotion } from 'motion/react'
import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import Butterfly from './ui/Butterfly.jsx'
import { loveStory } from '../data/content.js'
import './LoveStory.css'

const NODE_VARIANTS = ['blush', 'rose', 'sage', 'gold', 'blush']

/*
 * Our Love Story as a growing garden timeline. A vine fills as you scroll,
 * and each milestone blooms into a flower when it enters view.
 */
export default function LoveStory() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start center', 'end 65%'],
  })

  return (
    <section id="story" className="section story">
      <div className="container">
        <SectionHeading
          eyebrow="Our Love Story"
          title="A garden grown"
          script="petal by petal"
          lede="Every love has its seasons. Here is how ours took root, leaf by leaf, into the day we plant our forever."
        />

        <div className="story__timeline" ref={ref}>
          <span className="story__vine" aria-hidden="true" />
          <motion.span
            className="story__vine-grow"
            aria-hidden="true"
            style={{ scaleY: reduce ? 1 : scrollYProgress }}
          />

          {loveStory.map((m, i) => {
            const side = i % 2 === 0 ? 'is-left' : 'is-right'
            const variant = NODE_VARIANTS[i % NODE_VARIANTS.length]
            return (
              <div className={`story__row ${side}`} key={m.year + m.title}>
                <Reveal className="story__card" y={36}>
                  <span className="story__year foil">{m.year}</span>
                  <h3 className="story__title">{m.title}</h3>
                  <p className="story__text">{m.text}</p>
                  {i === loveStory.length - 1 && (
                    <Butterfly className="story__card-butterfly" size={30} variant="gold" />
                  )}
                </Reveal>

                <div className="story__node" aria-hidden="true">
                  <motion.div
                    className="story__bloom"
                    initial={reduce ? false : { scale: 0, rotate: -45, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 1, ease: [0.34, 1.4, 0.5, 1] }}
                  >
                    <Flower size={66} variant={variant} petals={i % 2 ? 6 : 8} strokeWidth={0.8} />
                  </motion.div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
