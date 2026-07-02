import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import SectionHeading from './ui/SectionHeading.jsx'
import Reveal from './ui/Reveal.jsx'
import Flower from './ui/Flower.jsx'
import { faqs, loveNotes } from '../data/content.js'
import { onWellWishes, submitWellWish } from '../lib/notes.js'
import './LoveNotes.css'

export default function LoveNotes() {
  // null = not loaded yet; then a live array from Firestore.
  const [live, setLive] = useState(null)
  const [form, setForm] = useState({ name: '', message: '', trap: '' })
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => onWellWishes((list) => setLive(list), () => setLive([])), [])

  // Show live notes once any exist, otherwise the gentle seed notes.
  const wall = live && live.length ? live : loveNotes.seeds

  const rotations = useMemo(
    () => wall.map((_, i) => ((i * 37) % 5) - 2 + (i % 2 ? 0.6 : -0.6)),
    [wall],
  )

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.trap) return // honeypot: silently ignore bots
    if (!form.name.trim() || !form.message.trim()) return
    setBusy(true)
    const note = { name: form.name.trim(), message: form.message.trim() }
    try {
      await submitWellWish(note)
      // The live subscription will surface the saved note.
    } catch (err) {
      console.warn('Love note save failed; showing it locally.', err)
      setLive((prev) => [{ ...note, id: `local-${Date.now()}` }, ...(prev || [])])
    }
    setForm({ name: '', message: '', trap: '' })
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
            <form onSubmit={handleSubmit} className="notes__form">
              <p className="notes__hidden" aria-hidden="true">
                <label>
                  Don’t fill this out:
                  <input name="trap" tabIndex={-1} autoComplete="off" value={form.trap} onChange={handleChange} />
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
                  maxLength={100}
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
                  maxLength={1000}
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
              {wall.map((n, i) => (
                <motion.article
                  className="note-card"
                  key={n.id || `${n.name}-${i}`}
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
