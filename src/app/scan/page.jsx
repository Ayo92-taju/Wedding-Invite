'use client'

/*
 * Gate scanner — the ushers' check-in app.
 *
 * · Google sign-in, gated by the authorized_scanners whitelist (admins also pass).
 * · Camera QR scanning (html5-qrcode) + manual code entry fallback.
 * · Check-in is a Firestore TRANSACTION: a pass flips to used exactly once —
 *   a duplicated/screenshotted QR scanned again goes RED with who/when.
 * · Offline: reads serve from the persistent cache and check-ins queue
 *   (YELLOW feedback) until the network returns, with a local double-scan guard.
 */
import { useEffect, useRef, useState } from 'react'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import {
  doc,
  getDoc,
  getDocFromCache,
  runTransaction,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db, auth } from '@/lib/firebase'
import { isAdminEmail } from '@/lib/adminConfig'
import { onTables } from '@/lib/access/store.js'
import { extractCode } from '@/lib/access/scan.js'

const SEEN_KEY = 'nv-scan-seen'
const seenLocal = () => {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) } catch { return new Set() }
}
const rememberLocal = (code) => {
  try {
    const s = seenLocal()
    s.add(code)
    localStorage.setItem(SEEN_KEY, JSON.stringify([...s].slice(-2000)))
  } catch { /* storage full/blocked — non-fatal */ }
}

export default function ScanPage() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [allowed, setAllowed] = useState(null) // null = checking
  const [gate, setGate] = useState('')
  const [tables, setTables] = useState([])
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [manual, setManual] = useState('')
  const [flash, setFlash] = useState(null) // {tone, title, name, detail}
  const [history, setHistory] = useState([])
  const [online, setOnline] = useState(true)
  const scannerRef = useRef(null)
  const busyRef = useRef(false)

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true) }), [])

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine)
    sync()
    window.addEventListener('online', sync)
    window.addEventListener('offline', sync)
    return () => { window.removeEventListener('online', sync); window.removeEventListener('offline', sync) }
  }, [])

  // Authorization: admin allowlist OR own doc in authorized_scanners.
  useEffect(() => {
    if (!user) { setAllowed(null); return }
    const email = (user.email || '').toLowerCase()
    if (isAdminEmail(email)) { setAllowed(true); setGate('All gates (admin)'); return }
    let cancelled = false
    getDoc(doc(db, 'authorized_scanners', email))
      .then((snap) => {
        if (cancelled) return
        setAllowed(snap.exists())
        if (snap.exists()) setGate(snap.data().assignedGate || 'Main Entrance')
      })
      .catch(() => !cancelled && setAllowed(false))
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!allowed) return undefined
    return onTables((l) => setTables(l), () => {})
  }, [allowed])

  const tableName = (id) => tables.find((t) => t.id === id)?.tableName || null

  const showFlash = (payload) => {
    setFlash(payload)
    setHistory((h) => [{ ...payload, at: new Date().toLocaleTimeString() }, ...h].slice(0, 12))
    window.setTimeout(() => setFlash((f) => (f === payload ? null : f)), 4000)
  }

  /* The core: transactional check-in with an offline queue fallback. */
  const checkIn = async (rawValue) => {
    const code = extractCode(rawValue)
    if (!code || busyRef.current) return
    busyRef.current = true
    const email = (user?.email || 'usher').toLowerCase()
    const ref = doc(db, 'guests', code)

    try {
      const result = await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref)
        if (!snap.exists()) return { tone: 'red', title: 'INVALID PASS', name: code, detail: 'No guest found for this code.' }
        const g = snap.data()
        if (g.checkedIn) {
          const when = g.checkedInAt?.toDate ? g.checkedInAt.toDate().toLocaleTimeString() : 'earlier'
          return { tone: 'red', title: 'ALREADY USED', name: g.fullName, detail: `Checked in ${when}${g.checkedInBy ? ` by ${g.checkedInBy}` : ''}.` }
        }
        tx.update(ref, { checkedIn: true, checkedInAt: serverTimestamp(), checkedInBy: email })
        return {
          tone: 'green',
          title: 'ACCESS GRANTED',
          name: g.fullName,
          detail: g.tableId ? `Table ${tableName(g.tableId) || '—'}` : 'Table to be advised',
        }
      })
      if (result.tone === 'green') rememberLocal(code)
      showFlash(result)
    } catch (err) {
      const offline = !navigator.onLine || err?.code === 'unavailable' || /offline|unavailable/i.test(String(err?.message))
      if (offline) {
        // Offline path: validate from cache, guard against local double-scan, queue the write.
        if (seenLocal().has(code)) {
          showFlash({ tone: 'red', title: 'ALREADY SCANNED (OFFLINE)', name: code, detail: 'This pass was already scanned on this device.' })
        } else {
          let name = code
          let tableDetail = 'Will sync when back online.'
          try {
            const cached = await getDocFromCache(ref)
            if (cached.exists()) {
              const g = cached.data()
              name = g.fullName || code
              if (g.checkedIn) {
                showFlash({ tone: 'red', title: 'ALREADY USED', name, detail: 'Marked used before the network dropped.' })
                busyRef.current = false
                return
              }
              tableDetail = `${g.tableId ? `Table ${tableName(g.tableId) || '—'} · ` : ''}Will sync when back online.`
            }
          } catch { /* not in cache — trust the code, flag for review */ }
          updateDoc(ref, { checkedIn: true, checkedInAt: serverTimestamp(), checkedInBy: email }).catch(() => {})
          rememberLocal(code)
          showFlash({ tone: 'yellow', title: 'QUEUED (OFFLINE)', name, detail: tableDetail })
        }
      } else {
        showFlash({ tone: 'red', title: 'SCAN FAILED', name: code, detail: err?.message || 'Please try again.' })
      }
    }
    window.setTimeout(() => { busyRef.current = false }, 1200)
  }

  /* Camera lifecycle. */
  useEffect(() => {
    if (!cameraOn || !allowed) return undefined
    let stopped = false
    let scanner = null
    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (stopped) return
        scanner = new Html5Qrcode('scan-camera')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decoded) => checkIn(decoded),
          () => {},
        )
      } catch (err) {
        setCameraError(err?.message || 'Camera could not start — check permissions.')
        setCameraOn(false)
      }
    })()
    return () => {
      stopped = true
      const s = scannerRef.current
      scannerRef.current = null
      if (s) s.stop().then(() => s.clear()).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn, allowed])

  /* ── Render ── */
  if (!ready) return <Frame><p className="text-sm opacity-70">Loading…</p></Frame>

  if (!user) {
    return (
      <Frame>
        <div className="text-center space-y-5 pt-10">
          <h1 className="font-serif text-3xl">Gate Scanner</h1>
          <p className="text-sm opacity-80 max-w-xs mx-auto">Sign in with the Google account the couple whitelisted for you.</p>
          <button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => console.error(e))}
            className="px-6 py-3 bg-bloom-gold text-white rounded-full font-cinzel text-xs tracking-widest uppercase cursor-pointer"
          >
            Sign in with Google
          </button>
        </div>
      </Frame>
    )
  }

  if (allowed === null) return <Frame><p className="text-sm opacity-70 pt-10 text-center">Checking your access…</p></Frame>

  if (!allowed) {
    return (
      <Frame>
        <div className="text-center space-y-4 pt-10">
          <h1 className="font-serif text-2xl">Not on the gate list</h1>
          <p className="text-sm opacity-80 max-w-xs mx-auto">
            {user.email} isn&apos;t whitelisted. Ask the couple to add you in Admin → Scanners.
          </p>
          <button onClick={() => signOut(auth)} className="text-xs text-bloom-rose underline cursor-pointer">Use a different account</button>
        </div>
      </Frame>
    )
  }

  return (
    <Frame>
      {/* Full-screen scan feedback */}
      {flash && (
        <button
          type="button"
          onClick={() => setFlash(null)}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center text-center p-8 cursor-pointer ${
            flash.tone === 'green' ? 'bg-emerald-600' : flash.tone === 'yellow' ? 'bg-amber-500' : 'bg-red-700'
          } text-white`}
        >
          <span className="font-cinzel text-sm tracking-[0.3em] uppercase opacity-90">{flash.title}</span>
          <span className="font-serif text-4xl md:text-6xl font-medium mt-4 leading-tight">{flash.name}</span>
          <span className="font-serif text-xl md:text-3xl mt-3 opacity-95">{flash.detail}</span>
          <span className="text-[11px] uppercase tracking-widest mt-8 opacity-70">tap anywhere to continue</span>
        </button>
      )}

      <header className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-serif text-2xl">Gate Scanner</h1>
          <p className="text-xs opacity-70">{gate} · {user.email}</p>
        </div>
        <div className="text-right space-y-1">
          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] uppercase tracking-widest ${online ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {online ? 'Online' : 'Offline — queueing'}
          </span>
          <button onClick={() => signOut(auth)} className="block ml-auto text-xs text-bloom-rose underline cursor-pointer">Sign out</button>
        </div>
      </header>

      <div className="space-y-4">
        <div className="bg-white/70 border border-bloom-gold/25 rounded-2xl p-4">
          {!cameraOn ? (
            <button
              onClick={() => { setCameraError(''); setCameraOn(true) }}
              className="w-full py-4 bg-bloom-gold text-white rounded-xl font-cinzel text-xs tracking-[0.2em] uppercase cursor-pointer"
            >
              Start camera scanning
            </button>
          ) : (
            <button
              onClick={() => setCameraOn(false)}
              className="w-full py-2.5 border border-bloom-gold/40 rounded-xl font-cinzel text-[10px] tracking-widest uppercase text-bloom-sage-dark cursor-pointer"
            >
              Stop camera
            </button>
          )}
          <div id="scan-camera" className={`mt-3 rounded-xl overflow-hidden ${cameraOn ? '' : 'hidden'}`} />
          {cameraError && <p className="text-xs text-red-600 mt-2">{cameraError}</p>}
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); checkIn(manual); setManual('') }}
          className="bg-white/70 border border-bloom-gold/25 rounded-2xl p-4 flex gap-2"
        >
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Or type a code, e.g. ABA-6QN2"
            className="flex-1 bg-white border border-bloom-gold/25 rounded-xl px-4 py-3 text-sm font-mono uppercase"
          />
          <button type="submit" className="px-5 bg-bloom-charcoal text-white rounded-xl font-cinzel text-[10px] tracking-widest uppercase cursor-pointer">
            Check in
          </button>
        </form>

        {history.length > 0 && (
          <div className="bg-white/70 border border-bloom-gold/25 rounded-2xl p-4">
            <p className="font-cinzel text-[10px] tracking-widest uppercase text-bloom-sage-dark mb-2">This session</p>
            <ul className="space-y-1.5 text-sm">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${h.tone === 'green' ? 'bg-emerald-500' : h.tone === 'yellow' ? 'bg-amber-500' : 'bg-red-600'}`} />
                  <span className="truncate">{h.name}</span>
                  <span className="ml-auto text-xs opacity-60 shrink-0">{h.at}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Frame>
  )
}

function Frame({ children }) {
  return (
    <div className="min-h-screen bg-bloom-cream text-bloom-charcoal">
      <div className="max-w-md mx-auto px-4 py-8">{children}</div>
    </div>
  )
}
