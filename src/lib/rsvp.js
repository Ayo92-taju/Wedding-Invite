import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

const GUESTS = 'guests'

/* A unique, scannable entry code for a guest's pass. */
export function generateQrCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `NV-PASS-${Date.now()}-${rand}`
}

/* Short, human-friendly token shown under the QR (derived from the full code). */
export function shortCode(qrCode) {
  const suffix = String(qrCode || '').split('-').pop() || 'GUEST'
  return `NV-${suffix}`
}

/*
 * Record a guest RSVP, keyed by lowercased email. RSVPs are create-once (the
 * security rules only let the couple/gatekeepers edit a guest afterwards, e.g.
 * for check-in), so if a guest has already replied we simply return their
 * existing pass. Returns the stored record (with its qrCode).
 */
export async function submitRsvp({ name, email, attending, guests, message }) {
  const emailLower = String(email).trim().toLowerCase()
  const ref = doc(db, GUESTS, emailLower)
  const attendingYes = attending === 'yes' || attending === true

  // Already replied? Return their existing pass rather than a denied re-write.
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    return { ...data, qrCode: data.qrCode, alreadyReplied: true }
  }

  const qrCode = generateQrCode()
  const record = {
    name: String(name).trim(),
    email: emailLower,
    attending: attendingYes,
    guestsCount: attendingYes ? Math.max(1, Number(guests) || 1) : 0,
    message: String(message || '').trim(),
    qrCode,
    checkedIn: false,
    checkinTime: null,
    source: 'website',
    createdAt: serverTimestamp(), // must equal request.time per the rules
  }

  await setDoc(ref, record) // create (matches the `allow create` rule)
  return { ...record, qrCode }
}
