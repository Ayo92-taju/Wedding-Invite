import { initializeApp, getApps, getApp } from 'firebase/app'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
} from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import firebaseConfig from '../../firebase-applet-config.json'

/*
 * Firebase (reusing the existing project from firebase-applet-config.json).
 * Note: the data lives in a NAMED Firestore database (firestoreDatabaseId),
 * not "(default)" — the previous project set it up that way.
 *
 * Firestore is initialised with a persistent local cache so the /scan gate
 * app keeps working when the venue network drops: reads serve from cache and
 * writes queue until the connection returns.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

let firestore
try {
  firestore = initializeFirestore(
    app,
    { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) },
    firebaseConfig.firestoreDatabaseId,
  )
} catch {
  // Already initialised (e.g. fast refresh) — reuse it.
  firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId)
}

export const db = firestore
export const auth = getAuth(app)
export { firebaseConfig }
