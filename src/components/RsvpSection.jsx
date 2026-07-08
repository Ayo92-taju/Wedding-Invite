'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { QRCodeCanvas } from 'qrcode.react'
import { Check, Download, RotateCcw } from 'lucide-react'
import { couple, wedding } from '../data/content.js'
import { submitRsvp, shortCode } from '../lib/rsvp.js'
import { sendRsvpConfirmation } from '../lib/email.js'

/* A tiny flower tucked into the centre of the QR — the "floral" QR. */
const FLOWER_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg transform='translate(20 20)'%3E%3Cg fill='%23e7b6b0' stroke='%23c9a227' stroke-width='1'%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(288)'/%3E%3C/g%3E%3Ccircle r='3' fill='%23c9a227'/%3E%3C/g%3E%3C/svg%3E"

/* A stable offline fallback code if the write fails. */
function codeFor(name, guests) {
  const s = `${String(name).trim().toLowerCase()}|${guests}|nimi-victor-2026`
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return `NV-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`
}

const empty = { name: '', email: '', attending: '', guestsCount: 1, dietaryNotes: '', message: '' }

export default function RsvpSection() {
  const reduce = useReducedMotion()
  const [formStep, setFormStep] = useState('form') // form · animating · pass
  const [rsvp, setRsvp] = useState(empty)
  const [isDeclining, setIsDeclining] = useState(false)
  const [passCode, setPassCode] = useState('')
  const [saveError, setSaveError] = useState(false)
  const passRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rsvp.name || !rsvp.email || !rsvp.attending) {
      alert('Please provide your name, email, and RSVP response.')
      return
    }

    const attendingYes = rsvp.attending === 'yes'
    setFormStep('animating')

    // Combine the free note + dietary needs into the single stored message.
    const parts = []
    if (rsvp.message.trim()) parts.push(rsvp.message.trim())
    if (attendingYes && rsvp.dietaryNotes.trim()) parts.push(`Dietary: ${rsvp.dietaryNotes.trim()}`)
    const message = parts.join(' · ')

    let record = null
    let failed = false
    try {
      record = await submitRsvp({
        name: rsvp.name,
        email: rsvp.email,
        attending: rsvp.attending,
        guests: rsvp.guestsCount,
        message,
      })
    } catch (err) {
      failed = true
      console.warn('RSVP save failed; showing the pass anyway.', err)
    }

    setPassCode(record?.qrCode || codeFor(rsvp.name || 'guest', rsvp.guestsCount))
    setSaveError(failed)

    // Confirmation + floral pass by email — only on a fresh, saved, attending RSVP.
    if (attendingYes && !failed && record?.qrCode && !record?.alreadyReplied) {
      sendRsvpConfirmation({
        name: record.name || rsvp.name.trim(),
        email: record.email || rsvp.email.trim(),
        qrCode: record.qrCode,
        guestsCount: record.guestsCount,
        attending: true,
        message: record.message,
      })
    }

    window.setTimeout(() => setFormStep('pass'), reduce ? 300 : 1900)
  }

  const downloadPass = () => {
    const canvas = passRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${rsvp.name.trim().replace(/\s+/g, '-') || 'guest'}-wedding-pass.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleReset = () => {
    setRsvp(empty)
    setIsDeclining(false)
    setPassCode('')
    setSaveError(false)
    setFormStep('form')
  }

  return (
    <section
      id="rsvp"
      className="relative py-24 px-4 bg-bloom-ivory dark:bg-dark-paper paper-texture overflow-hidden min-h-screen flex items-center justify-center"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-bloom-gold/30 to-transparent" />

      <div className="max-w-2xl w-full flex flex-col items-center relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Response Ritual
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            RSVP Confirmation
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
        </motion.div>

        <div className="w-full bg-bloom-cream/50 dark:bg-dark-garden/40 rounded-3xl border border-bloom-gold/20 p-6 md:p-10 shadow-lg min-h-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STEP 1: FORM */}
            {formStep === 'form' && (
              <motion.form
                key="form-step"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <p className="font-serif italic text-bloom-sage-dark dark:text-bloom-sage text-sm text-center max-w-lg mx-auto leading-relaxed">
                  Confirm your presence below — we&apos;ll press your reply with a wax seal and craft your
                  floral entry pass.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                      Guest Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aunty Bisi"
                      value={rsvp.name}
                      onChange={(e) => setRsvp({ ...rsvp, name: e.target.value })}
                      className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold focus:ring-1 focus:ring-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={rsvp.email}
                      onChange={(e) => setRsvp({ ...rsvp, email: e.target.value })}
                      className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold focus:ring-1 focus:ring-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                    />
                  </div>
                </div>

                {/* Attendance */}
                <div className="space-y-2">
                  <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block text-center">
                    RSVP Response
                  </label>
                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setRsvp({ ...rsvp, attending: 'yes' })
                        setIsDeclining(false)
                      }}
                      className={`flex-1 max-w-[200px] py-3.5 border rounded-2xl font-serif text-sm italic transition-all duration-300 cursor-pointer ${
                        rsvp.attending === 'yes'
                          ? 'border-bloom-rose bg-bloom-rose text-bloom-ivory font-medium shadow-md'
                          : 'border-bloom-gold/20 hover:border-bloom-gold/60 text-bloom-charcoal dark:text-bloom-cream hover:bg-bloom-rose/5'
                      }`}
                    >
                      Joyfully Attend
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRsvp({ ...rsvp, attending: 'no' })
                        setIsDeclining(true)
                      }}
                      className={`flex-1 max-w-[200px] py-3.5 border rounded-2xl font-serif text-sm italic transition-all duration-300 cursor-pointer ${
                        rsvp.attending === 'no'
                          ? 'border-bloom-sage bg-bloom-sage text-bloom-ivory font-medium shadow-md'
                          : 'border-bloom-gold/20 hover:border-bloom-gold/60 text-bloom-charcoal dark:text-bloom-cream hover:bg-bloom-sage/5'
                      }`}
                    >
                      Regretfully Decline
                    </button>
                  </div>
                </div>

                {rsvp.attending === 'yes' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-5"
                  >
                    <div className="space-y-1">
                      <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                        Number of Seats
                      </label>
                      <select
                        value={rsvp.guestsCount}
                        onChange={(e) => setRsvp({ ...rsvp, guestsCount: Number(e.target.value) })}
                        className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} {n === 1 ? 'Guest' : 'Guests'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                        Dietary Requirements
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Vegan, Gluten-Free, None"
                        value={rsvp.dietaryNotes}
                        onChange={(e) => setRsvp({ ...rsvp, dietaryNotes: e.target.value })}
                        className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                    {isDeclining ? 'Blessing / Message for the Couple' : 'Love Note or Song Request'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isDeclining ? 'Send your love or warm wishes…' : 'A song to get you dancing, or a warm note of joy…'}
                    value={rsvp.message}
                    onChange={(e) => setRsvp({ ...rsvp, message: e.target.value })}
                    className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                  />
                </div>

                <div className="flex justify-center pt-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full max-w-sm py-4 bg-bloom-gold hover:bg-bloom-gold/90 text-bloom-ivory font-cinzel text-xs tracking-[0.2em] uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    Seal My Reply
                  </motion.button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: ANIMATING WAX SEAL */}
            {formStep === 'animating' && (
              <motion.div
                key="animating-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-10"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.1, opacity: 0 }}
                    animate={{ scale: [0.1, 1.2, 1], opacity: 0.9 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="absolute w-20 h-20 rounded-full bg-bloom-rose blur-xs"
                  />
                  <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: [-80, 0, -5, 0], opacity: [0, 1, 1, 1] }}
                    transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                    className="relative z-10 w-16 h-16 bg-bloom-gold text-bloom-ivory rounded-full flex items-center justify-center shadow-xl border border-bloom-gold-light"
                  >
                    <span className="font-script text-2xl">{couple.initials?.replace(/\s|&/g, '') || 'NV'}</span>
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-cinzel text-xs tracking-[0.25em] uppercase text-bloom-gold">
                    Pressing the wax seal…
                  </h3>
                  <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage">
                    Sealing your reply into the garden.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PASS / BLESSING */}
            {formStep === 'pass' && (
              <motion.div
                key="pass-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', damping: 15 }}
                className="text-center flex flex-col items-center space-y-6"
              >
                <div className="w-12 h-12 rounded-full bg-bloom-sage/10 text-bloom-sage flex items-center justify-center">
                  <Check className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase text-bloom-sage-dark dark:text-bloom-sage">
                    {rsvp.attending === 'yes' ? 'Ritual Complete!' : 'Blessing Received!'}
                  </h3>
                  <p className="font-serif italic text-xs text-bloom-sage">
                    {rsvp.attending === 'yes'
                      ? 'Your personalised entry pass has blossomed.'
                      : 'We are saddened you cannot attend, but thank you for your love.'}
                  </p>
                </div>

                {rsvp.attending === 'yes' ? (
                  /* PERSONALISED SEAL TICKET with a REAL floral QR */
                  <div className="relative w-full max-w-sm bg-bloom-ivory dark:bg-dark-paper border-2 border-bloom-gold/40 rounded-3xl p-6 shadow-xl paper-texture select-none foil-gold overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.05)_0%,transparent_70%)] pointer-events-none" />
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-bloom-rose via-bloom-gold to-bloom-sage" />

                    <div className="border-b border-dashed border-bloom-gold/30 pb-4 flex flex-col items-center">
                      <span className="font-cinzel text-[8px] tracking-[0.3em] uppercase text-bloom-gold block">
                        Official Entry Pass
                      </span>
                      <h4 className="font-script text-3xl text-bloom-rose-dark dark:text-bloom-blush mt-1">
                        {couple.nameOne} &amp; {couple.nameTwo}
                      </h4>
                      <p className="font-serif text-[10px] tracking-widest text-bloom-sage-dark dark:text-bloom-sage uppercase mt-0.5">
                        {wedding.dayShort} &bull; {wedding.ceremony.venue}
                      </p>
                    </div>

                    <div className="py-6 flex flex-col items-center justify-center space-y-4">
                      {/* Wax seal outer ring with the real QR embedded */}
                      <div className="relative w-36 h-36 rounded-full bg-bloom-rose/95 dark:bg-bloom-rose-dark flex items-center justify-center shadow-lg border-2 border-bloom-gold">
                        <div className="absolute inset-1.5 border border-dashed border-bloom-gold-light/30 rounded-full" />
                        <div className="absolute top-0 left-4 w-6 h-6 rounded-full bg-bloom-rose opacity-80 -mt-1" />
                        <div className="absolute bottom-1 right-2 w-8 h-8 rounded-full bg-bloom-rose opacity-80 -mr-1" />

                        <div ref={passRef} className="relative w-24 h-24 bg-white rounded-2xl flex items-center justify-center p-1.5 border border-bloom-gold shadow-inner overflow-hidden">
                          <QRCodeCanvas
                            value={passCode}
                            size={128}
                            level="H"
                            fgColor="#4a3f37"
                            bgColor="#ffffff"
                            includeMargin={false}
                            imageSettings={{ src: FLOWER_URI, height: 26, width: 26, excavate: true }}
                            style={{ width: '100%', height: '100%' }}
                          />
                        </div>
                      </div>

                      <div className="space-y-0.5 text-center">
                        <span className="font-serif text-[10px] uppercase tracking-widest text-bloom-sage-dark dark:text-bloom-sage">
                          Guest of Honour
                        </span>
                        <h5 className="font-serif text-lg text-bloom-charcoal dark:text-bloom-cream font-medium">
                          {rsvp.name}
                        </h5>
                        <p className="font-serif text-[11px] italic text-bloom-rose">
                          {rsvp.guestsCount === 1 ? 'Single Admission' : `Admits ${rsvp.guestsCount}`}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-bloom-gold/30 pt-4 flex justify-between items-center text-[9px] font-mono text-bloom-gold">
                      <span>{shortCode(passCode)}</span>
                      <span>{saveError ? 'PASS PENDING' : 'VERIFIED PASS'}</span>
                    </div>
                  </div>
                ) : (
                  /* DECLINE — a written blessing */
                  <div className="relative w-full max-w-md bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-2xl p-8 shadow-md text-left">
                    <p className="font-serif italic text-sm text-bloom-charcoal/80 dark:text-bloom-cream/80 leading-relaxed mb-4">
                      &ldquo;{rsvp.message || 'Sending you all our love and light as you begin this beautiful garden story together!'}&rdquo;
                    </p>
                    <p className="font-serif text-right text-xs text-bloom-rose-dark dark:text-bloom-rose font-medium">
                      &mdash; {rsvp.name}
                    </p>
                  </div>
                )}

                <p className="font-serif italic text-[11px] text-bloom-sage-dark dark:text-bloom-sage/70 max-w-xs">
                  {rsvp.attending === 'yes'
                    ? saveError
                      ? 'Keep this floral seal safe — we’ll confirm your reply shortly. ❀'
                      : 'A copy is on its way to your inbox. Keep this floral seal — it’s your welcome into the garden. ❀'
                    : ''}
                </p>

                <div className="flex gap-4 pt-2">
                  {rsvp.attending === 'yes' && (
                    <button
                      type="button"
                      onClick={downloadPass}
                      className="px-6 py-2.5 bg-bloom-sage hover:bg-bloom-sage-dark text-bloom-ivory font-cinzel text-[10px] tracking-widest uppercase rounded-full flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save Pass
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-6 py-2.5 border border-bloom-gold/30 hover:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream hover:bg-bloom-gold/5 font-cinzel text-[10px] tracking-widest uppercase rounded-full flex items-center gap-2 cursor-pointer transition-all duration-300"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Edit Response
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
