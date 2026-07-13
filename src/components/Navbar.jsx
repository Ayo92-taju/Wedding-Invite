'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Sun, Moon, Heart } from 'lucide-react'
import { useTheme } from './theme/ThemeProvider'
import { couple } from '../data/content.js'

const navItems = [
  { label: 'Invitation', id: 'invitation' },
  { label: 'Our Story', id: 'story' },
  { label: 'Details', id: 'details' },
  { label: 'Registry', id: 'registry' },
  { label: 'Love Notes', id: 'notes' },
  { label: 'RSVP', id: 'rsvp' },
]

export default function Navbar() {
  const { dark, toggle } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    setIsOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const initials = [couple.nameOne?.[0], couple.nameTwo?.[0]].filter(Boolean)

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'bg-bloom-ivory/80 dark:bg-dark-garden/80 backdrop-blur-md py-4 shadow-sm border-b border-bloom-gold/10'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
            aria-label="Back to top"
          >
            <span className="font-cinzel text-base tracking-[0.2em] text-bloom-charcoal dark:text-bloom-cream group-hover:text-bloom-rose transition-colors">
              {initials[0]}
            </span>
            <Heart className="w-2.5 h-2.5 text-bloom-rose fill-current opacity-50 group-hover:opacity-100 transition-opacity" />
            <span className="font-cinzel text-base tracking-[0.2em] text-bloom-charcoal dark:text-bloom-cream group-hover:text-bloom-rose transition-colors">
              {initials[1]}
            </span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="font-cinzel text-xs tracking-[0.2em] uppercase text-bloom-charcoal/80 dark:text-bloom-cream/80 hover:text-bloom-rose dark:hover:text-bloom-rose transition-colors relative group py-1 cursor-pointer"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 w-0 h-px bg-bloom-rose transition-all group-hover:w-full group-hover:left-0" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2 rounded-full text-bloom-charcoal/80 dark:text-bloom-cream/80 hover:bg-bloom-sage/10 transition-colors cursor-pointer"
              aria-label="Toggle light/dark theme"
              title="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4 text-bloom-gold-light" /> : <Moon className="w-4 h-4 text-bloom-sage-dark" />}
            </motion.button>

            <button
              onClick={() => setIsOpen((o) => !o)}
              className="md:hidden p-2 text-bloom-charcoal/80 dark:text-bloom-cream/80 hover:bg-bloom-sage/10 transition-colors cursor-pointer"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[60px] z-30 bg-bloom-ivory dark:bg-dark-paper border-b border-bloom-gold/15 p-6 shadow-xl flex flex-col md:hidden items-center text-center space-y-6 select-none paper-texture"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="font-cinzel text-xs tracking-[0.2em] uppercase text-bloom-charcoal dark:text-bloom-cream hover:text-bloom-rose block cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
