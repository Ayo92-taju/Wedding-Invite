import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'

import BloomIntro from './components/BloomIntro.jsx'
import PetalField from './components/PetalField.jsx'
import Butterflies from './components/Butterflies.jsx'
import CursorPetals from './components/CursorPetals.jsx'

import Nav from './components/Nav.jsx'
import Hero from './components/Hero.jsx'
import Invitation from './components/Invitation.jsx'
import LoveStory from './components/LoveStory.jsx'
import WeddingDetails from './components/WeddingDetails.jsx'
import Countdown from './components/Countdown.jsx'
import Registry from './components/Registry.jsx'
import LoveNotes from './components/LoveNotes.jsx'
import Rsvp from './components/Rsvp.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!introDone && <BloomIntro key="intro" onComplete={() => setIntroDone(true)} />}
      </AnimatePresence>

      {/* Ambient layers — petals drift behind the content (z:1),
          butterflies (z:20) and cursor petals (z:60) float above it. */}
      <PetalField count={14} zIndex={1} />
      <Butterflies count={3} zIndex={20} />
      <CursorPetals />

      <Nav />

      <div className="page">
        <main>
          <Hero active={introDone} />
          <Invitation />
          <LoveStory />
          <WeddingDetails />
          <Countdown />
          <Registry />
          <LoveNotes />
          <Rsvp />
        </main>
        <Footer />
      </div>
    </>
  )
}
