import FloralDivider from './ui/FloralDivider.jsx'
import Flower from './ui/Flower.jsx'
import { couple, wedding, credit } from '../data/content.js'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <Flower className="footer__accent footer__accent--l float-soft" size={90} variant="sage" petals={7} strokeWidth={0.7} />
      <Flower className="footer__accent footer__accent--r float-soft" size={110} variant="blush" petals={8} strokeWidth={0.7} />

      <div className="container footer__inner">
        <p className="footer__names script">
          {couple.nameOne} <span className="footer__amp">&amp;</span> {couple.nameTwo}
        </p>
        <FloralDivider width={220} style={{ marginBlock: '1.2rem' }} />
        <p className="footer__date">{wedding.dayShort}</p>
        <p className="footer__line">
          We cannot wait to celebrate with you, surrounded by flowers and everyone we love.
        </p>

        <nav className="footer__links" aria-label="Footer">
          <a href="#story">Our Story</a>
          <a href="#details">Details</a>
          <a href="#registry">Registry</a>
          <a href="#rsvp">RSVP</a>
        </nav>

        <p className="footer__credit">
          {couple.tagline} · {credit}
        </p>
      </div>
    </footer>
  )
}
