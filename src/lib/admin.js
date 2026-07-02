import {
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase.js'

const GUESTS = 'guests'

/* Live guest list (admin/gatekeeper only, per the security rules). */
export function onGuests(next, onError) {
  return onSnapshot(
    collection(db, GUESTS),
    (snap) => next(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

/* Look a guest up by their scanned/entered QR code. */
export async function findGuestByCode(code) {
  const value = String(code || '').trim()
  if (!value) return null
  const snap = await getDocs(query(collection(db, GUESTS), where('qrCode', '==', value)))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

/* Mark a guest checked in / out at the gate. */
export async function setCheckedIn(guestId, value) {
  await updateDoc(doc(db, GUESTS, guestId), {
    checkedIn: value,
    checkinTime: value ? new Date().toISOString() : null,
  })
}
