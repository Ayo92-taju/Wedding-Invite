'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'

import OpeningExperience from './components/OpeningExperience.jsx'
import Navbar from './components/Navbar.jsx'
import CursorFlower from './components/CursorFlower.jsx'
import HeroPanel from './components/HeroPanel.jsx'

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <div className="min-h-screen bg-bloom-cream text-bloom-charcoal dark:bg-dark-garden dark:text-bloom-cream transition-colors duration-1000">
      <AnimatePresence>
        {!introDone && <OpeningExperience key="intro" onComplete={() => setIntroDone(true)} />}
      </AnimatePresence>

      {introDone && (
        <>
          <CursorFlower />
          <Navbar />
          <HeroPanel />
          {/* Remaining sections (Invitation → Footer) are being ported next. */}
        </>
      )}
    </div>
  )
}
