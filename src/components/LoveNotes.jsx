'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, MessageSquare, Feather, Bookmark } from 'lucide-react'
import { faqs, loveNotes } from '../data/content.js'
import { onWellWishes, submitWellWish } from '../lib/notes.js'

const NOTE_STYLES = [
  'rotate-1 bg-bloom-ivory border-bloom-rose/20',
  '-rotate-1 bg-bloom-cream border-bloom-sage/20',
  'rotate-2 bg-bloom-ivory/95 border-bloom-gold/20',
  '-rotate-2 bg-bloom-cream border-bloom-rose/20',
  'rotate-0 bg-bloom-ivory border-bloom-sage/20',
]

export default function LoveNotes() {
  const [live, setLive] = useState(null) // null = loading; then live array
  const [form, setForm] = useState({ name: '', message: '', trap: '' })
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => onWellWishes((list) => setLive(list), () => setLive([])), [])

  // Live notes once any exist, otherwise the gentle seed notes.
  const wall = live && live.length ? live : loveNotes.seeds
  const styles = useMemo(() => wall.map((_, i) => NOTE_STYLES[i % NOTE_STYLES.length]), [wall])

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
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
    setBusy(false)
    setSent(true)
    window.setTimeout(() => setSent(false), 4000)
  }

  return (
    <section
      id="notes"
      className="relative py-24 px-4 bg-bloom-cream/20 dark:bg-dark-garden/10 overflow-hidden min-h-screen"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-bloom-gold/20 to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Wishes &amp; Q&amp;A
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            Love Notes
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
          <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage max-w-lg mx-auto mt-6 leading-relaxed">
            {loveNotes.intro}
          </p>
        </motion.div>

        {/* Form + wall */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Compose */}
          <div className="lg:col-span-4 bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 p-6 md:p-8 rounded-3xl shadow-sm paper-texture">
            <div className="flex items-center gap-2 mb-6">
              <Feather className="w-4 h-4 text-bloom-rose" />
              <h3 className="font-cinzel text-xs tracking-wider uppercase text-bloom-charcoal dark:text-bloom-cream">
                Pen a Note
              </h3>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {/* Honeypot */}
              <p className="hidden" aria-hidden="true">
                <label>
                  Don&apos;t fill this out:
                  <input name="trap" tabIndex={-1} autoComplete="off" value={form.trap} onChange={change} />
                </label>
              </p>

              <div className="space-y-1">
                <label className="font-cinzel text-[9px] tracking-widest text-bloom-gold uppercase block">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  maxLength={100}
                  placeholder="e.g. Aunty Bisi"
                  value={form.name}
                  onChange={change}
                  className="w-full bg-bloom-cream/40 dark:bg-dark-garden/20 border border-bloom-gold/20 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                />
              </div>

              <div className="space-y-1">
                <label className="font-cinzel text-[9px] tracking-widest text-bloom-gold uppercase block">
                  Blessing or Question
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Press a little love into our story…"
                  value={form.message}
                  onChange={change}
                  className="w-full bg-bloom-cream/40 dark:bg-dark-garden/20 border border-bloom-gold/20 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full py-3 bg-bloom-gold hover:bg-bloom-gold/90 text-bloom-ivory font-cinzel text-[10px] tracking-widest uppercase rounded-full shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                {busy ? 'Pressing…' : 'Pin Love Note'}
              </button>

              <AnimatePresence>
                {sent && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage text-center pt-1"
                  >
                    Your note has been pressed between our pages. Thank you. ❀
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* Notes wall */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 mb-2 text-bloom-sage-dark dark:text-bloom-sage">
              <MessageSquare className="w-4 h-4" />
              <span className="font-cinzel text-xs tracking-wider uppercase">
                Notes Wall ({wall.length} pinned)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              <AnimatePresence initial={false}>
                {wall.map((note, idx) => (
                  <motion.div
                    key={note.id || `${note.name}-${idx}`}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -15 }}
                    transition={{ type: 'spring', damping: 15 }}
                    layout
                    className={`p-6 border rounded-2xl shadow-xs paper-texture flex flex-col justify-between min-h-[160px] transition-transform duration-300 hover:scale-[1.01] hover:shadow-md relative group ${styles[idx]}`}
                  >
                    <Bookmark className="absolute top-0 right-4 w-4 h-6 text-bloom-rose opacity-20 group-hover:opacity-100 transition-opacity" />

                    <p className="font-serif italic text-xs md:text-sm text-bloom-charcoal/90 dark:text-bloom-cream/90 leading-relaxed mb-4">
                      &ldquo;{note.message}&rdquo;
                    </p>

                    <div className="flex justify-between items-end border-t border-dashed border-bloom-gold/15 pt-3">
                      <span className="font-serif text-xs font-semibold text-bloom-charcoal dark:text-bloom-cream">
                        &mdash; {note.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <h3 className="font-serif text-xl md:text-2xl text-bloom-charcoal dark:text-bloom-cream italic font-light text-center mb-8">
            Before you ask…
          </h3>
          <div className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/15 rounded-2xl px-6 py-4 paper-texture"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none font-serif text-sm text-bloom-charcoal dark:text-bloom-cream">
                  {item.q}
                  <span className="text-bloom-gold text-lg leading-none transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage/80 leading-relaxed pt-3">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
