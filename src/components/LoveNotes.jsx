import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { faqs, loveNotes } from '../data/content.js'
import { submitToNetlify } from '../lib/netlify.js'
import './LoveNotes.css'

export default function LoveNotes() {
  const [notes, setNotes] = useState(loveNotes.seeds)
  const [form, setForm] = useState({ name: '', message: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  // Stable gentle rotations so cards feel hand-placed (don't reshuffle on type).
  const rotations = useMemo(
    () => notes.map((_, i) => ((i * 37) % 5) - 2 + (i % 2 ? 0.6 : -0.6)),
    [notes],
  )

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) return
    setBusy(true)
    const note = { name: form.name.trim(), message: form.message.trim() }
    try {
      await submitToNetlify('love-notes', note)
    } catch {
      /* local dev / offline — still show the note optimistically */
    }
    setNotes((prev) => [note, ...prev])
    setForm({ name: '', message: '' })
    setSent(true)
    setBusy(false)
    window.setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="notes" className="section notes">
      <div className="container">
        <SectionHeading
          eyebrow="Wedding updates & wishes"
          title="Love"
          script="notes"
          lede={loveNotes.intro}
        />

        <div className="notes__layout">
          {/* Compose */}
          <Reveal className="notes__compose">
            <form
              name="love-notes"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              onSubmit={handleSubmit}
              className="notes__form"
            >
              <input type="hidden" name="form-name" value="love-notes" />
              <p className="notes__hidden">
                <label>
                  Don’t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" />
                </label>
              </p>

              <h3 className="notes__form-title">Leave us a note</h3>

              <label className="field">
                <span className="field__label">Your name</span>
                <input
                  className="field__input"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Aunty Bisi"
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Your wish or question</span>
                <textarea
                  className="field__input field__textarea"
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Press a little love into our story…"
                  required
                />
              </label>

              <button type="submit" className="btn btn--solid" disabled={busy}>
                {busy ? 'Pressing…' : 'Press into our story'}
              </button>

              <AnimatePresence>
                {sent && (
                  <motion.p
                    className="notes__thanks"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Your note has been pressed between our pages. Thank you. ❀
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </Reveal>

          {/* Wall of notes */}
          <div className="notes__wall">
            <AnimatePresence initial={false}>
              {notes.map((n, i) => (
                <motion.article
                  className="note-card"
                  key={`${n.name}-${n.message.slice(0, 12)}-${i}`}
                  style={{ '--tilt': `${rotations[i] || 0}deg` }}
                  initial={{ opacity: 0, scale: 0.9, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  layout
                >
                  <Flower className="note-card__flower" size={34} variant={i % 2 ? 'sage' : 'blush'} petals={6} strokeWidth={0.8} />
                  <p className="note-card__message">“{n.message}”</p>
                  <p className="note-card__name script">— {n.name}</p>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* FAQ */}
        <Reveal className="notes__faq">
          <h3 className="notes__faq-title">Before you ask…</h3>
          <div className="faq">
            {faqs.map((item) => (
              <details className="faq__item" key={item.q}>
                <summary className="faq__q">
                  {item.q}
                  <span className="faq__mark" aria-hidden="true" />
                </summary>
                <div className="faq__a">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
