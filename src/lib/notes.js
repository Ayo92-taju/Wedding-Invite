import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

const WISHES = 'wellWishes'

/* Live wall of guest love notes, newest first. */
export function onWellWishes(next, onError) {
  const q = query(collection(db, WISHES), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => next(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

/* Post a love note. Fields obey the wellWishes security-rule limits. */
export async function submitWellWish({ name, message }) {
  const clean = {
    name: String(name || '').trim().slice(0, 100),
    message: String(message || '').trim().slice(0, 1000),
  }
  if (!clean.name || !clean.message) throw new Error('Name and message are required.')
  await addDoc(collection(db, WISHES), { ...clean, createdAt: serverTimestamp() })
  return clean
}
