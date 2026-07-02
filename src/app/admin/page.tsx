'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { onGuests, findGuestByCode, setCheckedIn } from '@/lib/admin'
import { isAdminEmail } from '@/lib/adminConfig'
import { couple, wedding } from '@/data/content'

type Guest = {
  id: string
  name?: string
  email?: string
  attending?: boolean
  guestsCount?: number
  message?: string
  qrCode?: string
  checkedIn?: boolean
  checkinTime?: string | null
}

type Tab = 'overview' | 'guests' | 'checkin' | 'broadcast'

const gold = '#c9a227'
const rose = '#a4615d'
const ink = '#4a3f37'

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestsError, setGuestsError] = useState('')
  const [tab, setTab] = useState<Tab>('overview')

  const authorized = !!user && isAdminEmail(user.email || '')

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u)
    setAuthReady(true)
  }), [])

  useEffect(() => {
    if (!authorized) return
    const unsub = onGuests(
      (list: Guest[]) => {
        setGuests(list)
        setGuestsError('')
      },
      (err: { message?: string }) => setGuestsError(err?.message || 'Could not load guests.'),
    )
    return () => unsub()
  }, [authorized])

  const signIn = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
    } catch (err) {
      console.error('Sign-in failed', err)
    }
  }

  const stats = useMemo(() => {
    const attending = guests.filter((g) => g.attending)
    const heads = attending.reduce((n, g) => n + Math.max(1, Number(g.guestsCount) || 1), 0)
    return {
      rsvps: guests.length,
      attending: attending.length,
      declined: guests.filter((g) => !g.attending).length,
      heads,
      checkedIn: guests.filter((g) => g.checkedIn).length,
    }
  }, [guests])

  // ── Gates ───────────────────────────────────────────────
  if (!authReady) {
    return <Shell><p style={{ color: ink }}>Loading…</p></Shell>
  }

  if (!user) {
    return (
      <Shell>
        <div className="w-full max-w-sm rounded-2xl border border-[#e6d9b8] bg-white/90 p-8 text-center shadow-sm">
          <Monogram />
          <h1 className="mt-4 text-2xl" style={{ fontFamily: 'var(--font-display)', color: ink }}>
            Garden Admin
          </h1>
          <p className="mt-1 text-sm text-[#7c7065]">Sign in to manage {couple.initials} &nbsp;·&nbsp; check-in &amp; updates</p>
          <button
            onClick={signIn}
            className="mt-6 w-full rounded-full px-6 py-3 text-sm font-medium tracking-wide text-white transition hover:opacity-90"
            style={{ background: rose }}
          >
            Continue with Google
          </button>
        </div>
      </Shell>
    )
  }

  if (!authorized) {
    return (
      <Shell>
        <div className="w-full max-w-sm rounded-2xl border border-[#e6d9b8] bg-white/90 p-8 text-center shadow-sm">
          <h1 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: ink }}>Not authorised</h1>
          <p className="mt-2 text-sm text-[#7c7065]">
            <b>{user.email}</b> isn’t on the admin list. Add it to <code>isAdmin()</code> in
            firestore.rules and <code>ADMIN_EMAILS</code>, then sign in again.
          </p>
          <button onClick={() => signOut(auth)} className="mt-6 text-sm underline" style={{ color: rose }}>
            Sign out
          </button>
        </div>
      </Shell>
    )
  }

  // ── Dashboard ───────────────────────────────────────────
  return (
    <Shell wide>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl leading-none" style={{ fontFamily: 'var(--font-display)', color: ink }}>
            {couple.nameOne} &amp; {couple.nameTwo} — Admin
          </h1>
          <p className="text-xs tracking-widest uppercase text-[#7c7065]">{wedding.dayShort}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-[#7c7065]">
          <span className="hidden sm:inline">{user.email}</span>
          <button onClick={() => signOut(auth)} className="rounded-full border border-[#e6d9b8] px-4 py-1.5 hover:bg-white">
            Sign out
          </button>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        {(['overview', 'guests', 'checkin', 'broadcast'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="rounded-full px-4 py-1.5 text-sm capitalize transition"
            style={
              tab === t
                ? { background: ink, color: '#fff' }
                : { background: '#fff', color: ink, border: '1px solid #e6d9b8' }
            }
          >
            {t === 'checkin' ? 'Check-in' : t}
          </button>
        ))}
      </nav>

      {guestsError && (
        <p className="mb-4 rounded-lg bg-[#fbeae6] px-4 py-3 text-sm text-[#a4615d]">
          {guestsError} — make sure the updated Firestore rules are published and you’re an admin.
        </p>
      )}

      {tab === 'overview' && <Overview stats={stats} />}
      {tab === 'guests' && <GuestList guests={guests} />}
      {tab === 'checkin' && <CheckIn />}
      {tab === 'broadcast' && <Broadcast guests={guests} />}
    </Shell>
  )
}

/* ── Layout shell ──────────────────────────────────────── */
function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="min-h-screen bg-[#faf6ec]" style={{ fontFamily: 'var(--font-body)' }}>
      <div
        className={`mx-auto px-4 py-10 ${wide ? 'max-w-6xl' : 'flex min-h-screen max-w-6xl items-center justify-center'}`}
      >
        {children}
      </div>
    </div>
  )
}

function Monogram() {
  return (
    <div
      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg text-white"
      style={{ background: `radial-gradient(circle at 38% 32%, #d98d87, ${rose})`, fontFamily: 'var(--font-display)' }}
    >
      {couple.initials}
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="rounded-xl border border-[#e6d9b8] bg-white p-5">
      <div className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: accent || ink }}>{value}</div>
      <div className="mt-1 text-xs uppercase tracking-widest text-[#7c7065]">{label}</div>
    </div>
  )
}

function Overview({ stats }: { stats: { rsvps: number; attending: number; declined: number; heads: number; checkedIn: number } }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard label="RSVPs" value={stats.rsvps} />
      <StatCard label="Attending" value={stats.attending} accent={rose} />
      <StatCard label="Declined" value={stats.declined} />
      <StatCard label="Total guests" value={stats.heads} accent={gold} />
      <StatCard label="Checked in" value={stats.checkedIn} accent="#6f7f5e" />
    </div>
  )
}

/* ── Guest list ────────────────────────────────────────── */
function GuestList({ guests }: { guests: Guest[] }) {
  const [q, setQ] = useState('')
  const filtered = guests
    .filter((g) => `${g.name} ${g.email}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))

  return (
    <div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name or email…"
        className="mb-4 w-full max-w-sm rounded-full border border-[#e6d9b8] bg-white px-4 py-2 text-sm outline-none focus:border-[#c9a227]"
      />
      <div className="overflow-x-auto rounded-xl border border-[#e6d9b8] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-[#7c7065]">
            <tr className="border-b border-[#efe5d3]">
              <th className="px-4 py-3">Guest</th>
              <th className="px-4 py-3">RSVP</th>
              <th className="px-4 py-3">Party</th>
              <th className="px-4 py-3">Checked in</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g) => (
              <tr key={g.id} className="border-b border-[#f6efe0] last:border-0">
                <td className="px-4 py-3">
                  <div style={{ color: ink }}>{g.name || '—'}</div>
                  <div className="text-xs text-[#a89d90]">{g.email}</div>
                  {g.message ? <div className="mt-1 max-w-xs text-xs italic text-[#7c7065]">“{g.message}”</div> : null}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="rounded-full px-2.5 py-1 text-xs"
                    style={g.attending ? { background: '#e7efe0', color: '#586a49' } : { background: '#fbeae6', color: rose }}
                  >
                    {g.attending ? 'Attending' : 'Declined'}
                  </span>
                </td>
                <td className="px-4 py-3" style={{ color: ink }}>{g.attending ? g.guestsCount || 1 : '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setCheckedIn(g.id, !g.checkedIn)}
                    className="rounded-full border px-3 py-1 text-xs"
                    style={g.checkedIn ? { background: '#6f7f5e', color: '#fff', borderColor: '#6f7f5e' } : { borderColor: '#e6d9b8', color: ink }}
                  >
                    {g.checkedIn ? '✓ In' : 'Mark in'}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-[#a89d90]">No guests yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Check-in (scanner + manual) ───────────────────────── */
function CheckIn() {
  const [scanning, setScanning] = useState(false)
  const [scanErr, setScanErr] = useState('')
  const [manual, setManual] = useState('')
  const [result, setResult] = useState<Guest | 'notfound' | null>(null)
  const [busy, setBusy] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const scannerRef = useRef<any>(null)
  const lastRef = useRef('')

  const lookup = async (code: string) => {
    if (!code || code === lastRef.current) return
    lastRef.current = code
    const g = await findGuestByCode(code)
    setResult(g ? (g as Guest) : 'notfound')
  }

  const startScan = async () => {
    setScanErr('')
    try {
      const mod = await import('html5-qrcode')
      const scanner = new mod.Html5Qrcode('qr-reader')
      scannerRef.current = scanner
      setScanning(true)
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: 240 },
        (decoded: string) => lookup(decoded),
        () => {},
      )
    } catch {
      setScanning(false)
      setScanErr('Could not start the camera. Use manual entry below.')
    }
  }

  const stopScan = async () => {
    try {
      await scannerRef.current?.stop()
    } catch {
      /* already stopped */
    }
    scannerRef.current = null
    setScanning(false)
  }

  useEffect(() => () => { void stopScan() }, [])

  const doCheckIn = async (g: Guest, value: boolean) => {
    setBusy(true)
    try {
      await setCheckedIn(g.id, value)
      setResult({ ...g, checkedIn: value })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-[#e6d9b8] bg-white p-5">
        <h2 className="mb-3 text-lg" style={{ fontFamily: 'var(--font-display)', color: ink }}>Scan a pass</h2>
        <div id="qr-reader" className="overflow-hidden rounded-lg" style={{ minHeight: scanning ? 240 : 0 }} />
        {scanErr && <p className="mt-2 text-sm text-[#a4615d]">{scanErr}</p>}
        <div className="mt-3 flex gap-2">
          {!scanning ? (
            <button onClick={startScan} className="rounded-full px-5 py-2 text-sm text-white" style={{ background: rose }}>
              Start camera
            </button>
          ) : (
            <button onClick={stopScan} className="rounded-full border border-[#e6d9b8] px-5 py-2 text-sm" style={{ color: ink }}>
              Stop
            </button>
          )}
        </div>

        <div className="mt-5 border-t border-[#efe5d3] pt-4">
          <label className="text-xs uppercase tracking-widest text-[#7c7065]">Or enter a code</label>
          <div className="mt-2 flex gap-2">
            <input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="NV-PASS-…"
              className="flex-1 rounded-full border border-[#e6d9b8] bg-white px-4 py-2 text-sm outline-none focus:border-[#c9a227]"
            />
            <button
              onClick={() => { lastRef.current = ''; lookup(manual.trim()) }}
              className="rounded-full px-4 py-2 text-sm text-white"
              style={{ background: ink }}
            >
              Look up
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#e6d9b8] bg-white p-5">
        <h2 className="mb-3 text-lg" style={{ fontFamily: 'var(--font-display)', color: ink }}>Result</h2>
        {result === null && <p className="text-sm text-[#a89d90]">Scan or enter a pass code to look up a guest.</p>}
        {result === 'notfound' && (
          <p className="rounded-lg bg-[#fbeae6] px-4 py-3 text-sm text-[#a4615d]">No guest found for that code.</p>
        )}
        {result && result !== 'notfound' && (
          <div>
            <div className="text-xl" style={{ fontFamily: 'var(--font-display)', color: ink }}>{result.name}</div>
            <div className="text-sm text-[#7c7065]">{result.email}</div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full px-2.5 py-1" style={result.attending ? { background: '#e7efe0', color: '#586a49' } : { background: '#fbeae6', color: rose }}>
                {result.attending ? 'Attending' : 'Declined'}
              </span>
              <span className="rounded-full bg-[#f6efe0] px-2.5 py-1" style={{ color: ink }}>Admits {result.guestsCount || 1}</span>
              {result.checkedIn && <span className="rounded-full px-2.5 py-1 text-white" style={{ background: '#6f7f5e' }}>Already checked in</span>}
            </div>
            <div className="mt-4">
              {result.checkedIn ? (
                <button disabled={busy} onClick={() => doCheckIn(result, false)} className="rounded-full border border-[#e6d9b8] px-5 py-2 text-sm" style={{ color: ink }}>
                  Undo check-in
                </button>
              ) : (
                <button disabled={busy} onClick={() => doCheckIn(result, true)} className="rounded-full px-6 py-2.5 text-sm text-white" style={{ background: '#6f7f5e' }}>
                  {busy ? 'Checking in…' : '✓ Check in'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Broadcast ─────────────────────────────────────────── */
function Broadcast({ guests }: { guests: Guest[] }) {
  const recipients = guests.filter((g) => g.attending && g.email)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('general')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')

  const send = async () => {
    if (!title.trim() || !message.trim()) return
    setSending(true)
    setResult('')
    try {
      const res = await fetch('/api/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          type,
          guests: recipients.map((g) => ({ name: g.name, email: g.email })),
        }),
      })
      const json = await res.json()
      setResult(json.success ? `Sent to ${json.count ?? recipients.length} guest(s)${json.simulated ? ' (simulated — no email key)' : ''}.` : 'Failed to send.')
      if (json.success) { setTitle(''); setMessage('') }
    } catch {
      setResult('Failed to send.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-xl rounded-xl border border-[#e6d9b8] bg-white p-6">
      <h2 className="text-lg" style={{ fontFamily: 'var(--font-display)', color: ink }}>Send an update</h2>
      <p className="mb-4 text-sm text-[#7c7065]">Emails all {recipients.length} attending guest(s) with an email on file.</p>
      <div className="space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Subject / title" className="w-full rounded-lg border border-[#e6d9b8] px-4 py-2.5 text-sm outline-none focus:border-[#c9a227]" />
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Your message to guests…" className="w-full rounded-lg border border-[#e6d9b8] px-4 py-2.5 text-sm outline-none focus:border-[#c9a227]" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-[#e6d9b8] px-4 py-2.5 text-sm">
          <option value="general">General</option>
          <option value="reminder">Reminder</option>
          <option value="urgent">Urgent</option>
        </select>
      </div>
      <button
        onClick={send}
        disabled={sending || recipients.length === 0 || !title.trim() || !message.trim()}
        className="mt-4 rounded-full px-6 py-2.5 text-sm text-white disabled:opacity-50"
        style={{ background: rose }}
      >
        {sending ? 'Sending…' : `Send to ${recipients.length} guest(s)`}
      </button>
      {result && <p className="mt-3 text-sm text-[#586a49]">{result}</p>}
    </div>
  )
}
