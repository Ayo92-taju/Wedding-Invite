/*
 * Firestore access layer for the venue access-control system.
 * Collections: parties · guests (doc id = inviteCode) · tables ·
 * authorized_scanners. All writes here are admin-gated by firestore.rules.
 */
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  writeBatch,
  updateDoc,
  addDoc,
  setDoc,
  getDocs,
} from 'firebase/firestore'
import { db } from '../firebase.js'

const PARTIES = 'parties'
const GUESTS = 'guests'
const TABLES = 'tables'
const SCANNERS = 'authorized_scanners'

const MAX_BATCH = 450 // Firestore hard limit is 500 ops per batch

/* ── Live subscriptions ─────────────────────────────────────── */
export function onGuests(next, onError) {
  return onSnapshot(collection(db, GUESTS), (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}
export function onParties(next, onError) {
  return onSnapshot(collection(db, PARTIES), (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}
export function onTables(next, onError) {
  return onSnapshot(query(collection(db, TABLES), orderBy('tableName')), (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}

/* ── Import commit (batched) ────────────────────────────────── */
export async function commitImportPlan(plan) {
  const ops = []
  for (const p of plan.parties) {
    ops.push({ col: PARTIES, id: p.partyId, data: { ...p.party, createdAt: serverTimestamp(), updatedAt: serverTimestamp() } })
    for (const g of p.guests) {
      const { inviteCode, ...rest } = g
      ops.push({ col: GUESTS, id: inviteCode, data: { ...rest, inviteCode, qrCodeUrl: '', digitalInviteUrl: '', createdAt: serverTimestamp() } })
    }
  }
  for (let i = 0; i < ops.length; i += MAX_BATCH) {
    const batch = writeBatch(db)
    for (const op of ops.slice(i, i + MAX_BATCH)) batch.set(doc(db, op.col, op.id), op.data)
    await batch.commit()
  }
  return plan.stats
}

/* ── Guests ─────────────────────────────────────────────────── */
export async function updateGuest(id, patch) {
  await updateDoc(doc(db, GUESTS, id), patch)
}

/* Admin-side manual check-in/undo (ushers use the transactional /scan flow). */
export async function setGuestCheckedIn(id, value, byEmail) {
  await updateDoc(doc(db, GUESTS, id), {
    checkedIn: !!value,
    checkedInAt: value ? serverTimestamp() : null,
    checkedInBy: value ? String(byEmail || 'admin') : null,
  })
}

export async function deleteGuests(ids) {
  // Note which parties are affected so empties can be swept afterwards.
  const affected = new Set()
  try {
    const snap = await getDocs(collection(db, GUESTS))
    snap.forEach((d) => {
      if (ids.includes(d.id) && d.data().partyId) affected.add(d.data().partyId)
    })
  } catch {
    /* sweep is best-effort */
  }

  for (let i = 0; i < ids.length; i += MAX_BATCH) {
    const batch = writeBatch(db)
    for (const id of ids.slice(i, i + MAX_BATCH)) batch.delete(doc(db, GUESTS, id))
    await batch.commit()
  }

  // Cascade: a party with no remaining guests is an orphan — remove it.
  if (affected.size) {
    try {
      const remaining = await getDocs(collection(db, GUESTS))
      const stillUsed = new Set()
      remaining.forEach((d) => stillUsed.add(d.data().partyId))
      const orphans = [...affected].filter((p) => !stillUsed.has(p))
      if (orphans.length) {
        const batch = writeBatch(db)
        for (const p of orphans) batch.delete(doc(db, PARTIES, p))
        await batch.commit()
      }
    } catch {
      /* best-effort */
    }
  }
}

/* Delete a whole party and every guest doc that belongs to it. */
export async function deleteParty(partyId, guests) {
  const ids = guests.filter((g) => g.partyId === partyId).map((g) => g.id)
  await deleteGuests(ids)
  const batch = writeBatch(db)
  batch.delete(doc(db, PARTIES, partyId))
  await batch.commit()
}

/* Wipe every party + guest (used before a fresh re-import). */
export async function wipeGuestsAndParties() {
  const [g, p] = await Promise.all([getDocs(collection(db, GUESTS)), getDocs(collection(db, PARTIES))])
  const refs = [...g.docs, ...p.docs].map((d) => d.ref)
  for (let i = 0; i < refs.length; i += MAX_BATCH) {
    const batch = writeBatch(db)
    for (const ref of refs.slice(i, i + MAX_BATCH)) batch.delete(ref)
    await batch.commit()
  }
  return refs.length
}

/* ── Gate scanners (whitelisted usher Google accounts) ──────── */
export function onScanners(next, onError) {
  return onSnapshot(collection(db, SCANNERS), (s) => next(s.docs.map((d) => ({ id: d.id, ...d.data() }))), onError)
}

export async function addScanner(email, assignedGate) {
  const id = String(email || '').trim().toLowerCase()
  if (!id.includes('@')) throw new Error('Enter the usher’s Google email address.')
  await setDoc(doc(db, SCANNERS, id), {
    role: 'scanner',
    assignedGate: String(assignedGate || '').trim() || 'Main Entrance',
    addedAt: serverTimestamp(),
  })
}

export async function removeScanner(id) {
  const batch = writeBatch(db)
  batch.delete(doc(db, SCANNERS, id))
  await batch.commit()
}

/* ── Tables ─────────────────────────────────────────────────── */
export async function createTable({ tableName, capacity }) {
  await addDoc(collection(db, TABLES), {
    tableName: String(tableName || '').trim(),
    capacity: Math.max(1, Number(capacity) || 1),
    assignedSeatsCount: 0,
    createdAt: serverTimestamp(),
  })
}
export async function updateTable(id, patch) {
  await updateDoc(doc(db, TABLES, id), patch)
}
export async function deleteTable(id) {
  const batch = writeBatch(db)
  batch.delete(doc(db, TABLES, id))
  await batch.commit()
}
