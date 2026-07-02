import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { QRCodeCanvas } from 'qrcode.react'
import SectionHeading from './ui/SectionHeading.jsx'
import Flower from './ui/Flower.jsx'
import { couple, wedding } from '../data/content.js'
import { submitRsvp, shortCode } from '../lib/rsvp.js'
import { sendRsvpConfirmation } from '../lib/email.js'
import './Rsvp.css'

/* A tiny flower tucked into the centre of the QR — the "floral" QR. */
const FLOWER_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg transform='translate(20 20)'%3E%3Cg fill='%23e7b6b0' stroke='%23c9a227' stroke-width='1'%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(72)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(144)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(216)'/%3E%3Cellipse cx='0' cy='-8' rx='3.4' ry='6.5' transform='rotate(288)'/%3E%3C/g%3E%3Ccircle r='3' fill='%23c9a227'/%3E%3C/g%3E%3C/svg%3E"

/* A short, stable code derived from the guest's reply — their entry token. */
function codeFor(name, guests) {
  const s = `${name.trim().toLowerCase()}|${guests}|nimi-victor-2026`
  let h = 0
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return `NV-${h.toString(36).toUpperCase().padStart(6, '0').slice(0, 6)}`
}

const empty = { name: '', email: '', attending: 'yes', guests: 1, message: '' }

export default function Rsvp() {
  const reduce = useReducedMotion()
  const [form, setForm] = useState(empty)
  const [step, setStep] = useState('form') // form · sealing · pass · declined
  const [passCode, setPassCode] = useState('')
  const [saveError, setSaveError] = useState(false)
  const passRef = useRef(null)

  const change = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) return

    const attendingYes = form.attending === 'yes'
    // Begin the sealing ritual immediately; the record is written while it plays.
    if (attendingYes) setStep('sealing')

    let record = null
    let failed = false
    try {
      record = await submitRsvp(form)
    } catch (err) {
      failed = true
      console.warn('RSVP save failed; showing the pass anyway.', err)
    }

    setPassCode(record?.qrCode || codeFor(form.name || 'guest', form.guests))
    setSaveError(failed)

    // Send the confirmation + pass by email — only on a fresh, saved RSVP.
    if (attendingYes && !failed && record?.qrCode && !record?.alreadyReplied) {
      sendRsvpConfirmation({
        name: record.name || form.name.trim(),
        email: record.email || form.email.trim(),
        qrCode: record.qrCode,
        guestsCount: record.guestsCount,
        attending: true,
        message: record.message,
      })
    }

    if (!attendingYes) {
      setStep('declined')
      return
    }
    window.setTimeout(() => setStep('pass'), reduce ? 200 : 1200)
  }

  const downloadPass = () => {
    const canvas = passRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `${form.name.trim().replace(/\s+/g, '-') || 'guest'}-wedding-pass.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const reset = () => {
    setForm(empty)
    setPassCode('')
    setSaveError(false)
    setStep('form')
  }

  return (
    <section id="rsvp" className="section rsvp">
      <Flower className="rsvp__accent rsvp__accent--l float-soft" size={120} variant="blush" petals={8} strokeWidth={0.7} />
      <Flower className="rsvp__accent rsvp__accent--r float-soft" size={140} variant="sage" petals={7} strokeWidth={0.7} />

      <div className="container">
        <SectionHeading
          eyebrow="Will you join us?"
          title="Reply"
          script="with joy"
          lede="Tell us you’re coming and we’ll seal your reply with a flower — a little entry pass to carry you into the garden."
        />

        <div className="rsvp__stage">
          <AnimatePresence mode="wait">
            {/* ── The form ── */}
            {step === 'form' && (
              <motion.form
                key="form"
                className="rsvp__card rsvp__form"
                onSubmit={submit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="rsvp__row">
                  <label className="field">
                    <span className="field__label">Full name</span>
                    <input className="field__input" type="text" name="name" value={form.name} onChange={change} placeholder="Your name" required />
                  </label>
                  <label className="field">
                    <span className="field__label">Email</span>
                    <input className="field__input" type="email" name="email" value={form.email} onChange={change} placeholder="you@email.com" required />
                  </label>
                </div>

                <fieldset className="rsvp__attend">
                  <legend className="field__label">Will you be there?</legend>
                  <div className="rsvp__choices">
                    <label className={`rsvp__choice ${form.attending === 'yes' ? 'is-active' : ''}`}>
                      <input type="radio" name="attending" value="yes" checked={form.attending === 'yes'} onChange={change} />
                      <span>Joyfully accepts</span>
                    </label>
                    <label className={`rsvp__choice ${form.attending === 'no' ? 'is-active' : ''}`}>
                      <input type="radio" name="attending" value="no" checked={form.attending === 'no'} onChange={change} />
                      <span>Regretfully declines</span>
                    </label>
                  </div>
                </fieldset>

                {form.attending === 'yes' && (
                  <label className="field rsvp__guests">
                    <span className="field__label">Number in your party</span>
                    <input className="field__input" type="number" name="guests" min="1" max="12" value={form.guests} onChange={change} />
                  </label>
                )}

                <label className="field">
                  <span className="field__label">A note for us (optional)</span>
                  <textarea className="field__input field__textarea" name="message" value={form.message} onChange={change} rows={3} placeholder="Dietary needs, a song request, a little love…" />
                </label>

                <button type="submit" className="btn btn--solid rsvp__submit">
                  Seal my reply
                </button>
              </motion.form>
            )}

            {/* ── Sealing ritual ── */}
            {step === 'sealing' && (
              <motion.div
                key="sealing"
                className="rsvp__sealing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="rsvp__stamp"
                  initial={{ scale: reduce ? 1 : 2.4, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ duration: 0.7, ease: [0.5, 0, 0.2, 1] }}
                >
                  <span className="rsvp__stamp-mono">{couple.initials}</span>
                </motion.div>
                <motion.span
                  className="rsvp__ripple"
                  initial={{ scale: 0.3, opacity: 0.6 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.1, ease: 'easeOut' }}
                />
                <p className="rsvp__sealing-text">Pressing your flower…</p>
              </motion.div>
            )}

            {/* ── The entry pass ── */}
            {step === 'pass' && (
              <motion.div
                key="pass"
                className="rsvp__card rsvp__pass"
                initial={{ opacity: 0, scale: reduce ? 1 : 0.85, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: [0.34, 1.4, 0.5, 1] }}
              >
                <span className="eyebrow">Your entry pass</span>
                <p className="rsvp__pass-name script">{form.name}</p>
                <p className="rsvp__pass-admit">
                  Admits {form.guests} · {couple.tagline}
                </p>

                <div className="rsvp__seal" ref={passRef}>
                  <span className="rsvp__seal-ring" aria-hidden="true" />
                  <Flower className="rsvp__seal-petal rsvp__seal-petal--t" size={26} variant="blush" petals={6} strokeWidth={0.8} />
                  <Flower className="rsvp__seal-petal rsvp__seal-petal--b" size={26} variant="sage" petals={6} strokeWidth={0.8} />
                  <div className="rsvp__qr">
                    <QRCodeCanvas
                      value={passCode}
                      size={150}
                      level="H"
                      fgColor="#4a3f37"
                      bgColor="#fffdf8"
                      includeMargin={false}
                      imageSettings={{ src: FLOWER_URI, height: 30, width: 30, excavate: true }}
                    />
                  </div>
                </div>

                <p className="rsvp__pass-code">{shortCode(passCode)}</p>
                <p className="rsvp__pass-meta">
                  {wedding.dayShort} · {wedding.ceremony.venue}
                </p>

                <div className="rsvp__pass-actions">
                  <button type="button" className="btn btn--solid" onClick={downloadPass}>
                    Save your pass
                  </button>
                  <button type="button" className="rsvp__edit" onClick={reset}>
                    Edit response
                  </button>
                </div>
                <p className="rsvp__pass-hint">
                  {saveError
                    ? 'Keep this floral seal safe — we’ll confirm your reply shortly. ❀'
                    : 'Keep this floral seal — it’s your welcome into the garden. ❀'}
                </p>
              </motion.div>
            )}

            {/* ── Gentle decline ── */}
            {step === 'declined' && (
              <motion.div
                key="declined"
                className="rsvp__card rsvp__declined"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
              >
                <Flower size={70} variant="rose" petals={6} />
                <p className="rsvp__declined-text script">We’ll miss you in the garden</p>
                <p>
                  Thank you for letting us know, {form.name.split(' ')[0] || 'friend'}. You’ll be in
                  our hearts on the day.
                </p>
                <button type="button" className="rsvp__edit" onClick={reset}>
                  Change my response
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
