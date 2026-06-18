import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { useCountdown } from '../hooks/useCountdown.js'
import { wedding } from '../data/content.js'
import './Countdown.css'

const pad = (n) => String(n).padStart(2, '0')

export default function Countdown() {
  const { days, hours, minutes, seconds, done } = useCountdown(wedding.dateTimeISO)

  const units = [
    { label: 'Days', value: days },
    { label: 'Hours', value: pad(hours) },
    { label: 'Minutes', value: pad(minutes) },
    { label: 'Seconds', value: pad(seconds) },
  ]

  return (
    <section id="countdown" className="section countdown">
      <Flower className="countdown__accent countdown__accent--l float-soft" size={120} variant="sage" petals={7} strokeWidth={0.7} />
      <Flower className="countdown__accent countdown__accent--r float-soft" size={150} variant="blush" petals={8} strokeWidth={0.7} />

      <div className="container">
        <SectionHeading
          eyebrow="Until we say I do"
          title="Counting the days"
          script="until forever"
        />

        {done ? (
          <Reveal className="countdown__done">
            <p className="script countdown__done-text">Today, we bloom</p>
            <p>The waiting is over — thank you for being here.</p>
          </Reveal>
        ) : (
          <Reveal className="countdown__timer">
            {units.map((u, i) => (
              <div className="countdown__unit" key={u.label}>
                <span className="countdown__value foil">{u.value}</span>
                <span className="countdown__label">{u.label}</span>
                {i < units.length - 1 && <span className="countdown__sep" aria-hidden="true">·</span>}
              </div>
            ))}
          </Reveal>
        )}

        <Reveal className="countdown__date">
          <span>{wedding.dayShort}</span>
        </Reveal>
      </div>
    </section>
  )
}
