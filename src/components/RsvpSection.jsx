'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'
import { Check, Download, RotateCcw, Search, Users } from 'lucide-react'
import { couple } from '../data/content.js'
import { renderInviteCardCanvas, downloadInviteCard } from '../lib/access/inviteCard.js'

/*
 * RSVP portal — the guest-facing side of the access-control system.
 * find (phone/email) → party (confirm household + name plus-ones) →
 * sealing (wax animation while saving) → passes (per-person Ivory Garden pass)
 * or a gentle declined note.
 */
export default function RsvpSection() {
  const reduce = useReducedMotion()
  const [step, setStep] = useState('find') // find · party · sealing · passes · declined
  const [contact, setContact] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [party, setParty] = useState(null)
  const [members, setMembers] = useState([])
  const [message, setMessage] = useState('')
  const [result, setResult] = useState({ confirmed: [], emailed: false })

  const lookup = async (e) => {
    e.preventDefault()
    if (!contact.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/invite/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: contact.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'We couldn’t look that up — please try again.')
      } else {
        setParty(data.party)
        setMembers(
          (data.guests || []).map((g) => ({
            ...g,
            attending: g.rsvpStatus !== 'DECLINED',
            editedName: g.isPlaceholder ? '' : g.fullName,
          })),
        )
        setStep('party')
      }
    } catch {
      setError('We couldn’t reach the garden — check your connection and try again.')
    }
    setBusy(false)
  }

  const submit = async (declineAll = false) => {
    if (busy || !party) return
    setBusy(true)
    setError('')
    setStep('sealing')

    const payload = {
      partyId: party.id,
      message,
      contactEmail: contact.includes('@') ? contact.trim() : undefined,
      members: members.map((m) => ({
        code: m.code,
        attending: declineAll ? false : m.attending,
        fullName: !m.isPrimary && m.editedName.trim() ? m.editedName.trim() : undefined,
      })),
    }

    try {
      const res = await fetch('/api/invite/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error || 'Something went wrong — please try again.')
        setStep('party')
      } else {
        setResult({ confirmed: data.confirmed || [], emailed: !!data.emailed })
        window.setTimeout(
          () => setStep(data.declined ? 'declined' : 'passes'),
          reduce ? 200 : 1400,
        )
        setBusy(false)
        return
      }
    } catch {
      setError('We couldn’t reach the garden — please try again.')
      setStep('party')
    }
    setBusy(false)
  }

  const reset = () => {
    setStep('find')
    setParty(null)
    setMembers([])
    setMessage('')
    setResult({ confirmed: [], emailed: false })
    setError('')
  }

  const attendingCount = members.filter((m) => m.attending).length

  return (
    <section
      id="rsvp"
      className="relative py-24 px-4 bg-bloom-ivory dark:bg-dark-paper paper-texture overflow-hidden min-h-screen flex items-center justify-center"
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-bloom-gold/30 to-transparent" />

      <div className="max-w-2xl w-full flex flex-col items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="font-cinzel text-bloom-gold text-xs tracking-[0.3em] uppercase block mb-3">
            Find Your Invitation
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-bloom-charcoal dark:text-bloom-cream italic font-light">
            RSVP
          </h2>
          <div className="w-12 h-px bg-bloom-gold/40 mx-auto mt-4" />
        </motion.div>

        <div className="w-full bg-bloom-cream/50 dark:bg-dark-garden/40 rounded-3xl border border-bloom-gold/20 p-6 md:p-10 shadow-lg min-h-[420px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* STEP 1: FIND */}
            {step === 'find' && (
              <motion.form
                key="find"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                onSubmit={lookup}
                className="space-y-6 text-center"
              >
                <p className="font-serif italic text-bloom-sage-dark dark:text-bloom-sage text-base max-w-lg mx-auto leading-relaxed">
                  Enter the phone number or email your invitation was sent to, and we&apos;ll
                  bring up your household&apos;s seats in the garden.
                </p>

                <div className="max-w-md mx-auto space-y-1 text-left">
                  <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                    Phone number or email
                  </label>
                  <input
                    type="text"
                    required
                    inputMode="email"
                    placeholder="e.g. 0803 123 4567 or you@email.com"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3.5 text-sm focus:outline-hidden focus:border-bloom-gold focus:ring-1 focus:ring-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                  />
                </div>

                {error && (
                  <p className="font-serif italic text-sm text-bloom-rose max-w-md mx-auto">{error}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={busy}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full max-w-sm py-4 bg-bloom-gold hover:bg-bloom-gold/90 text-bloom-ivory font-cinzel text-xs tracking-[0.2em] uppercase rounded-full shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer disabled:opacity-60 inline-flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  {busy ? 'Searching…' : 'Find my invitation'}
                </motion.button>
              </motion.form>
            )}

            {/* STEP 2: PARTY */}
            {step === 'party' && party && (
              <motion.div
                key="party"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={reset}
                  className="font-serif text-xs italic text-bloom-sage-dark hover:text-bloom-rose cursor-pointer"
                >
                  &larr; Not you? Search again
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-bloom-gold mb-1">
                    <Users className="w-4 h-4" />
                    <span className="font-cinzel text-[10px] tracking-[0.25em] uppercase">Your invitation</span>
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-bloom-charcoal dark:text-bloom-cream">
                    {party.partyName}
                  </h3>
                  <p className="font-serif italic text-xs text-bloom-sage-dark dark:text-bloom-sage mt-1">
                    {party.allowedSeats} seat{party.allowedSeats === 1 ? '' : 's'} reserved · tick everyone attending
                  </p>
                </div>

                <div className="space-y-3">
                  {members.map((m, i) => (
                    <div
                      key={m.code}
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${
                        m.attending
                          ? 'bg-bloom-ivory dark:bg-dark-paper border-bloom-gold/40'
                          : 'bg-bloom-ivory/50 dark:bg-dark-paper/50 border-bloom-gold/15 opacity-70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={m.attending}
                        onChange={(e) =>
                          setMembers((prev) =>
                            prev.map((x, j) => (j === i ? { ...x, attending: e.target.checked } : x)),
                          )
                        }
                        className="w-4 h-4 accent-[#a9762e] shrink-0 cursor-pointer"
                        aria-label={`${m.fullName || 'Guest'} attending`}
                      />
                      {m.isPrimary || !m.isPlaceholder ? (
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-base text-bloom-charcoal dark:text-bloom-cream truncate">
                            {m.fullName}
                          </p>
                          <p className="font-cinzel text-[9px] tracking-widest uppercase text-bloom-gold">
                            {m.isPrimary ? 'Invited guest' : 'Companion'}
                          </p>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <input
                            type="text"
                            placeholder="Companion’s full name"
                            value={m.editedName}
                            disabled={!m.attending}
                            onChange={(e) =>
                              setMembers((prev) =>
                                prev.map((x, j) => (j === i ? { ...x, editedName: e.target.value } : x)),
                              )
                            }
                            className="w-full bg-transparent border-b border-bloom-gold/30 focus:border-bloom-gold px-0.5 py-1 text-base font-serif text-bloom-charcoal dark:text-bloom-cream focus:outline-hidden disabled:opacity-50"
                          />
                          <p className="font-cinzel text-[9px] tracking-widest uppercase text-bloom-gold mt-1">
                            Plus one — add their name
                          </p>
                        </div>
                      )}
                      {m.checkedIn && (
                        <span className="font-cinzel text-[9px] tracking-widest uppercase text-bloom-sage shrink-0">
                          Checked in
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <label className="font-cinzel text-[10px] tracking-widest text-bloom-gold uppercase block">
                    A note for the couple (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="A blessing, a song request, a little love…"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-bloom-ivory dark:bg-dark-paper border border-bloom-gold/20 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream"
                  />
                </div>

                {error && <p className="font-serif italic text-sm text-bloom-rose text-center">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
                  <motion.button
                    type="button"
                    onClick={() => submit(false)}
                    disabled={busy || attendingCount === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-8 py-4 bg-bloom-gold hover:bg-bloom-gold/90 text-bloom-ivory font-cinzel text-xs tracking-[0.2em] uppercase rounded-full shadow-md transition-all duration-300 cursor-pointer disabled:opacity-50"
                  >
                    Seal our reply · {attendingCount} attending
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => submit(true)}
                    disabled={busy}
                    className="px-8 py-4 border border-bloom-gold/30 hover:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream font-cinzel text-[10px] tracking-widest uppercase rounded-full cursor-pointer transition-colors"
                  >
                    Regretfully decline
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SEALING */}
            {step === 'sealing' && (
              <motion.div
                key="sealing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center space-y-6 py-10"
              >
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.1, opacity: 0 }}
                    animate={{ scale: [0.1, 1.2, 1], opacity: 0.9 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute w-20 h-20 rounded-full bg-bloom-rose blur-xs"
                  />
                  <motion.div
                    initial={{ y: -80, opacity: 0 }}
                    animate={{ y: [-80, 0, -5, 0], opacity: [0, 1, 1, 1] }}
                    transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
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

            {/* STEP 4a: PASSES */}
            {step === 'passes' && (
              <motion.div
                key="passes"
                initial={{ opacity: 0, scale: 0.92 }}
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
                    Your seats are saved!
                  </h3>
                  <p className="font-serif italic text-xs text-bloom-sage max-w-sm">
                    Each guest has their own entry pass — save them below
                    {result.emailed ? ', and a copy is on its way to your inbox' : ''}. ❀
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {result.confirmed.map((g) => (
                    <PassPreview key={g.inviteCode} guest={g} />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-2.5 border border-bloom-gold/30 hover:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream font-cinzel text-[10px] tracking-widest uppercase rounded-full flex items-center gap-2 cursor-pointer transition-all duration-300"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Edit response
                </button>
              </motion.div>
            )}

            {/* STEP 4b: DECLINED */}
            {step === 'declined' && (
              <motion.div
                key="declined"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                className="text-center space-y-4 py-6"
              >
                <p className="font-script text-4xl text-bloom-rose">We&apos;ll miss you</p>
                <p className="font-serif italic text-sm text-bloom-sage-dark dark:text-bloom-sage max-w-sm mx-auto">
                  Thank you for letting us know. You&apos;ll be in our hearts on the day, woven
                  into our threefold cord all the same.
                </p>
                <button
                  type="button"
                  onClick={reset}
                  className="px-6 py-2.5 border border-bloom-gold/30 hover:border-bloom-gold text-bloom-charcoal dark:text-bloom-cream font-cinzel text-[10px] tracking-widest uppercase rounded-full cursor-pointer transition-all duration-300"
                >
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

/* A confirmed guest's pass: live Ivory Garden preview + PNG download. */
function PassPreview({ guest }) {
  const hostRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const card = { fullName: guest.fullName, inviteCode: guest.inviteCode, tableName: guest.tableName }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const canvas = await renderInviteCardCanvas(card)
        if (cancelled || !hostRef.current) return
        canvas.style.width = '100%'
        canvas.style.height = 'auto'
        canvas.style.borderRadius = '12px'
        hostRef.current.replaceChildren(canvas)
      } catch (err) {
        console.warn('Pass preview failed:', err)
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guest.inviteCode, guest.fullName, guest.tableName])

  const save = async () => {
    setSaving(true)
    try {
      await downloadInviteCard(card)
    } catch (err) {
      console.warn('Pass download failed:', err)
    }
    setSaving(false)
  }

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div ref={hostRef} className="w-full shadow-lg rounded-xl overflow-hidden" />
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="px-5 py-2 bg-bloom-sage hover:bg-bloom-sage-dark text-bloom-ivory font-cinzel text-[10px] tracking-widest uppercase rounded-full flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-300 disabled:opacity-60"
      >
        <Download className="w-3 h-3" />
        {saving ? 'Saving…' : `Save ${guest.fullName.split(' ')[0]}’s pass`}
      </button>
    </div>
  )
}
