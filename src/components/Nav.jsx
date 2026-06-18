import { useEffect, useState } from 'react'
import { couple } from '../data/content.js'
import './Nav.css'

const LINKS = [
  { href: '#story', label: 'Our Story' },
  { href: '#details', label: 'Details' },
  { href: '#countdown', label: 'Countdown' },
  { href: '#registry', label: 'Registry' },
  { href: '#notes', label: 'Love Notes' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 70)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock scroll while the mobile menu is open.
  useEffect(() => {
    if (open) document.body.classList.add('menu-open')
    else document.body.classList.remove('menu-open')
    return () => document.body.classList.remove('menu-open')
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="nav__inner container">
        <a href="#top" className="nav__brand" onClick={close} aria-label="Back to top">
          <span className="nav__brand-mark">{couple.initials}</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav__link" onClick={close}>
              {l.label}
            </a>
          ))}
        </nav>

        <a href="#rsvp" className="btn nav__cta" onClick={close}>
          RSVP
        </a>

        <button
          className={`nav__toggle ${open ? 'is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`nav__mobile ${open ? 'is-open' : ''}`}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="nav__mobile-link" onClick={close}>
            {l.label}
          </a>
        ))}
        <a href="#rsvp" className="btn btn--solid nav__mobile-cta" onClick={close}>
          RSVP
        </a>
      </div>
    </header>
  )
}
