/*
 * Server-side Firestore via the Firebase Admin SDK (bypasses security rules —
 * ONLY import from API routes, never from client components).
 *
 * Needs a service-account key in the env:
 *   FIREBASE_SERVICE_ACCOUNT_KEY = the JSON from Firebase Console →
 *   Project settings → Service accounts → "Generate new private key",
 *   pasted raw or base64-encoded.
 *
 * Returns null when unconfigured so callers can respond 503 instead of
 * crashing — the same graceful-degradation pattern as the Resend client.
 */
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import firebaseConfig from '../../../firebase-applet-config.json'

let cached = null

function parseServiceAccount(raw) {
  const s = String(raw || '').trim()
  if (!s) return null
  try {
    // Raw JSON or base64-encoded JSON both work.
    const json = s.startsWith('{') ? s : Buffer.from(s, 'base64').toString('utf8')
    return JSON.parse(json)
  } catch (err) {
    console.error('FIREBASE_SERVICE_ACCOUNT_KEY could not be parsed:', err?.message)
    return null
  }
}

export function getAdminDb() {
  if (cached) return cached

  const sa = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  if (!sa) return null

  const app =
    getApps().find((a) => a.name === 'admin-portal') ||
    initializeApp({ credential: cert(sa), projectId: sa.project_id || firebaseConfig.projectId }, 'admin-portal')

  // The project uses a NAMED Firestore database ("default", not "(default)").
  cached = getFirestore(app, firebaseConfig.firestoreDatabaseId || 'default')
  return cached
}
