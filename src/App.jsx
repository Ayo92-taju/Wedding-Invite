'use client'

import { useState } from 'react'
import { AnimatePresence } from 'motion/react'

import OpeningExperience from './components/OpeningExperience.jsx'
import Navbar from './components/Navbar.jsx'
import CursorFlower from './components/CursorFlower.jsx'
import HeroPanel from './components/HeroPanel.jsx'
import InvitationCard from './components/InvitationCard.jsx'
import CountdownTimer from './components/CountdownTimer.jsx'
import LoveStory from './components/LoveStory.jsx'
import WeddingDetails from './components/WeddingDetails.jsx'
import GiftRegistry from './components/GiftRegistry.jsx'
import LoveNotes from './components/LoveNotes.jsx'
import RsvpSection from './components/RsvpSection.jsx'
import SiteFooter from './components/SiteFooter.jsx'

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
          <main>
            <HeroPanel />
            <InvitationCard />
            <CountdownTimer />
            <LoveStory />
            <WeddingDetails />
            <GiftRegistry />
            <LoveNotes />
            <RsvpSection />
          </main>
          <SiteFooter />
        </>
      )}
    </div>
  )
}
