'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { isAdminEmail } from '@/lib/adminConfig'
import { buildImportPlan } from '@/lib/access/import.js'
import {
  onGuests,
  onTables,
  commitImportPlan,
  deleteGuests,
  updateGuest,
  wipeGuestsAndParties,
  createTable,
  deleteTable,
} from '@/lib/access/store.js'

const TABS = ['Import', 'Guests', 'Tables']

export default function GuestsAdmin() {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState('Import')

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true) }), [])
  const authorized = !!user && isAdminEmail(user.email || '')

  if (!ready) {
    return <Shell><p className="text-bloom-sage-dark">Loading…</p></Shell>
  }

  if (!authorized) {
    return (
      <Shell>
        <div className="max-w-sm mx-auto text-center space-y-5 pt-16">
          <h1 className="font-serif text-3xl text-bloom-charcoal">Guest Management</h1>
          <p className="text-sm text-bloom-sage-dark">
            {user ? `${user.email} is not an admin account.` : 'Sign in with an approved admin Google account.'}
          </p>
          <button
            onClick={() => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => console.error(e))}
            className="px-6 py-3 bg-bloom-gold text-white rounded-full font-cinzel text-xs tracking-widest uppercase"
          >
            Sign in with Google
          </button>
          {user && (
            <button onClick={() => signOut(auth)} className="block mx-auto text-xs text-bloom-rose underline">
              Sign out
            </button>
          )}
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      <header className="flex items-center justify-between border-b border-bloom-gold/20 pb-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl text-bloom-charcoal">Guest Management</h1>
          <p className="text-xs text-bloom-sage-dark">Access-control system · Phase A</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-bloom-sage-dark">{user.email}</p>
          <button onClick={() => signOut(auth)} className="text-xs text-bloom-rose underline">Sign out</button>
        </div>
      </header>

      <nav className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase transition-colors ${
              tab === t ? 'bg-bloom-gold text-white' : 'bg-bloom-ivory text-bloom-sage-dark border border-bloom-gold/20'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {tab === 'Import' && <ImportTab />}
      {tab === 'Guests' && <GuestsTab />}
      {tab === 'Tables' && <TablesTab />}
    </Shell>
  )
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-bloom-cream text-bloom-charcoal">
      <div className="max-w-5xl mx-auto px-5 py-10">{children}</div>
    </div>
  )
}

/* ── Import ─────────────────────────────────────────────────── */
function ImportTab() {
  const [plan, setPlan] = useState(null)
  const [msg, setMsg] = useState('')
  const [parsing, setParsing] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [wipeFirst, setWipeFirst] = useState(false)
  const fileRef = useRef(null)

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setParsing(true); setPlan(null); setMsg('')
    try {
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const p = buildImportPlan(rows)
      setPlan(p)
      if (!p.parties.length) setMsg('No valid rows found. Expected columns: Full Name, Phone, Email, Total Seats.')
    } catch (err) {
      setMsg(`Could not read that file: ${err?.message || err}`)
    }
    setParsing(false)
  }

  const commit = async () => {
    if (!plan) return
    setCommitting(true); setMsg('')
    try {
      if (wipeFirst) await wipeGuestsAndParties()
      const stats = await commitImportPlan(plan)
      setMsg(`✓ Imported ${stats.parties} parties and ${stats.guests} guests.`)
      setPlan(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err) {
      const permission = /permission|insufficient/i.test(String(err?.message || err))
      setMsg(`Import failed: ${err?.message || err}${permission ? ' — deploy the new firestore.rules first.' : ''}`)
    }
    setCommitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-6">
        <h2 className="font-serif text-lg mb-1">Bulk import guest list</h2>
        <p className="text-xs text-bloom-sage-dark mb-4">
          Upload a CSV or Excel file with columns <b>Full Name</b>, <b>Phone</b>, <b>Email</b>, <b>Total Seats</b>.
          Each row becomes a party: one primary guest plus a placeholder for every extra seat. Phone numbers are
          standardised to international (+234…) format. Nothing is written until you press <b>Commit</b>.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFile}
          className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-bloom-gold file:text-white file:text-xs file:uppercase file:tracking-widest file:cursor-pointer"
        />
        {parsing && <p className="text-xs text-bloom-sage-dark mt-3">Reading…</p>}
      </div>

      {plan && (
        <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-6">
            <Stat label="Parties" value={plan.stats.parties} />
            <Stat label="Guests" value={plan.stats.guests} />
            <Stat label="Warnings" value={plan.warnings.length} />
          </div>

          {plan.warnings.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-bloom-rose font-medium">{plan.warnings.length} warning(s)</summary>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-bloom-sage-dark max-h-40 overflow-auto">
                {plan.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </details>
          )}

          <div className="overflow-auto max-h-72 border border-bloom-gold/10 rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-bloom-cream/60 text-bloom-sage-dark sticky top-0">
                <tr>
                  <th className="text-left px-3 py-2">Party</th>
                  <th className="text-left px-3 py-2">Seats</th>
                  <th className="text-left px-3 py-2">Primary guest</th>
                  <th className="text-left px-3 py-2">Phone</th>
                  <th className="text-left px-3 py-2">Codes</th>
                </tr>
              </thead>
              <tbody>
                {plan.parties.slice(0, 200).map((p) => (
                  <tr key={p.partyId} className="border-t border-bloom-gold/10">
                    <td className="px-3 py-2">{p.party.partyName}</td>
                    <td className="px-3 py-2">{p.party.allowedSeats}</td>
                    <td className="px-3 py-2">{p.guests[0].fullName}</td>
                    <td className="px-3 py-2 font-mono">{p.party.primaryContactPhone || '—'}</td>
                    <td className="px-3 py-2 font-mono">{p.guests.map((g) => g.inviteCode).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {plan.parties.length > 200 && (
              <p className="text-[11px] text-bloom-sage-dark px-3 py-2">Showing first 200 of {plan.parties.length} parties.</p>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-bloom-sage-dark">
            <input type="checkbox" checked={wipeFirst} onChange={(e) => setWipeFirst(e.target.checked)} />
            Wipe all existing parties & guests first (fresh re-import)
          </label>

          <button
            onClick={commit}
            disabled={committing}
            className="px-6 py-3 bg-bloom-rose text-white rounded-full font-cinzel text-xs tracking-widest uppercase disabled:opacity-60"
          >
            {committing ? 'Committing…' : `Commit ${plan.stats.guests} guests to Firestore`}
          </button>
        </div>
      )}

      {msg && <p className="text-sm text-bloom-charcoal bg-bloom-gold/10 border border-bloom-gold/20 rounded-xl px-4 py-3">{msg}</p>}
    </div>
  )
}

/* ── Guests ─────────────────────────────────────────────────── */
function GuestsTab() {
  const [guests, setGuests] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(() => new Set())

  useEffect(() => onGuests((list) => { setGuests(list); setErr('') }, (e) => setErr(e?.message || 'Could not load guests.')), [])

  const filtered = useMemo(() => {
    const list = guests || []
    const needle = q.trim().toLowerCase()
    if (!needle) return list
    return list.filter((g) => `${g.fullName} ${g.inviteCode} ${g.phone} ${g.email}`.toLowerCase().includes(needle))
  }, [guests, q])

  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const removeSelected = async () => {
    if (!sel.size) return
    if (!window.confirm(`Delete ${sel.size} guest(s)?`)) return
    try { await deleteGuests([...sel]); setSel(new Set()) } catch (e) { setErr(e?.message || 'Delete failed.') }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, code, phone…"
          className="flex-1 bg-bloom-ivory border border-bloom-gold/20 rounded-full px-4 py-2 text-sm"
        />
        <button
          onClick={removeSelected}
          disabled={!sel.size}
          className="px-4 py-2 rounded-full text-xs font-cinzel tracking-widest uppercase bg-bloom-rose text-white disabled:opacity-40"
        >
          Delete ({sel.size})
        </button>
      </div>

      {err && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          {err} <br />
          <span className="text-xs">This is expected until the new <code>firestore.rules</code> are deployed.</span>
        </p>
      )}

      {guests && guests.length === 0 && !err && (
        <p className="text-sm text-bloom-sage-dark">No guests yet — import a list from the Import tab.</p>
      )}

      {guests && guests.length > 0 && (
        <div className="overflow-auto border border-bloom-gold/10 rounded-xl">
          <table className="w-full text-xs">
            <thead className="bg-bloom-cream/60 text-bloom-sage-dark">
              <tr>
                <th className="px-3 py-2"></th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Code</th>
                <th className="text-left px-3 py-2">RSVP</th>
                <th className="text-left px-3 py-2">Table</th>
                <th className="text-left px-3 py-2">Checked in</th>
                <th className="text-left px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr key={g.id} className="border-t border-bloom-gold/10">
                  <td className="px-3 py-2"><input type="checkbox" checked={sel.has(g.id)} onChange={() => toggle(g.id)} /></td>
                  <td className="px-3 py-2">{g.fullName} {g.isPrimary && <span className="text-[9px] text-bloom-gold uppercase">primary</span>}</td>
                  <td className="px-3 py-2 font-mono">{g.inviteCode}</td>
                  <td className="px-3 py-2">{g.rsvpStatus}</td>
                  <td className="px-3 py-2">{g.tableId || '—'}</td>
                  <td className="px-3 py-2">{g.checkedIn ? '✓' : '—'}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => window.alert('Notification dispatch arrives in Phase E (Twilio).')}
                      className="text-[11px] text-bloom-rose underline"
                    >
                      Re-send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ── Tables ─────────────────────────────────────────────────── */
function TablesTab() {
  const [tables, setTables] = useState(null)
  const [err, setErr] = useState('')
  const [name, setName] = useState('')
  const [cap, setCap] = useState('8')

  useEffect(() => onTables((list) => { setTables(list); setErr('') }, (e) => setErr(e?.message || 'Could not load tables.')), [])

  const add = async () => {
    if (!name.trim()) return
    try { await createTable({ tableName: name.trim(), capacity: Number(cap) }); setName(''); setCap('8') } catch (e) { setErr(e?.message || 'Could not add table.') }
  }

  return (
    <div className="space-y-4">
      <div className="bg-bloom-ivory border border-bloom-gold/20 rounded-2xl p-5 flex items-end gap-3">
        <label className="text-xs flex-1">
          <span className="block text-bloom-sage-dark mb-1">Table name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Table 1 — Family" className="w-full border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm" />
        </label>
        <label className="text-xs w-28">
          <span className="block text-bloom-sage-dark mb-1">Capacity</span>
          <input type="number" min="1" value={cap} onChange={(e) => setCap(e.target.value)} className="w-full border border-bloom-gold/20 rounded-lg px-3 py-2 text-sm" />
        </label>
        <button onClick={add} className="px-5 py-2 bg-bloom-gold text-white rounded-full text-xs font-cinzel tracking-widest uppercase">Add</button>
      </div>

      {err && (
        <p className="text-sm bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3">
          {err} <br /><span className="text-xs">Expected until the new <code>firestore.rules</code> are deployed.</span>
        </p>
      )}

      {tables && tables.length === 0 && !err && <p className="text-sm text-bloom-sage-dark">No tables yet.</p>}

      {tables && tables.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {tables.map((t) => (
            <div key={t.id} className="bg-bloom-ivory border border-bloom-gold/20 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-serif text-sm">{t.tableName}</p>
                <p className={`text-xs ${t.assignedSeatsCount > t.capacity ? 'text-bloom-rose' : 'text-bloom-sage-dark'}`}>
                  {t.assignedSeatsCount || 0} / {t.capacity} seated{t.assignedSeatsCount > t.capacity ? ' — over capacity!' : ''}
                </p>
              </div>
              <button onClick={() => deleteTable(t.id).catch((e) => setErr(e?.message || 'Delete failed.'))} className="text-xs text-bloom-rose underline">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="font-serif text-2xl text-bloom-charcoal">{value}</p>
      <p className="text-[10px] uppercase tracking-widest text-bloom-sage-dark">{label}</p>
    </div>
  )
}
