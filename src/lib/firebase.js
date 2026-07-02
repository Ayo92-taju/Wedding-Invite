import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import firebaseConfig from '../../firebase-applet-config.json'

/*
 * Firebase (reusing the existing project from firebase-applet-config.json).
 * Note: the data lives in a NAMED Firestore database (firestoreDatabaseId),
 * not "(default)" — the previous project set it up that way.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId)
export { firebaseConfig }
