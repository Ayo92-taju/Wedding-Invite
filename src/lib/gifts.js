import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from './firebase.js'

const GIFTS = 'gifts'

/* Live registry items, if the couple manages them in Firestore. */
export function onGifts(next, onError) {
  return onSnapshot(
    collection(db, GIFTS),
    (snap) => next(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError,
  )
}

/* Guests may flip a gift to "reserved" (the rules allow only these two keys). */
export async function reserveGift(gift, purchasedBy) {
  await updateDoc(doc(db, GIFTS, gift.id), {
    isPurchased: true,
    purchasedBy: purchasedBy || 'A guest',
  })
}
