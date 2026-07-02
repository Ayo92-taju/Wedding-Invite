# Firebase setup (Nimi & Victor)

The site reuses the existing Firebase project **`nimi-and-victor-s-we`**. Its web
config is in [`firebase-applet-config.json`](firebase-applet-config.json) and the
data lives in a Firestore database named **`default`** (a *named* database, not
the `(default)` one — this is how the previous project was set up).

## 1. Deploy the updated security rules ⚠️ (required for RSVP to save)

The RSVP writes a guest record to the `guests` collection. The project's current
rules enforce the **old two-event schema**, so our **single-event** RSVP is
rejected with `permission-denied` until you publish the updated rules in
[`firestore.rules`](firestore.rules).

**Option A — Firebase Console (simplest):**
1. Open the [Firebase Console](https://console.firebase.google.com/) → project
   **nimi-and-victor-s-we** → **Firestore Database**.
2. Use the database picker to select the **`default`** database.
3. Go to the **Rules** tab, paste the contents of `firestore.rules`, and click
   **Publish**.

**Option B — Firebase CLI:**
```bash
npm i -g firebase-tools
firebase login
firebase use nimi-and-victor-s-we
firebase deploy --only firestore:rules   # uses firebase.json (targets the "default" db)
```

## 2. Set the admin account(s)

Open `firestore.rules` and update `isAdmin()` so it lists the **couple/planner's
Google account email(s)** (it currently carries the previous project's:
`momohvictor62@gmail.com`, `ayolat16@gmail.com`). These accounts can manage
content and scan passes at the door (Phase 5). Re-publish the rules after editing.

## 3. Enable sign-in + services (in the Firebase Console)

- **Authentication → Sign-in method → Google**: enable it (used by the admin /
  check-in dashboard). Also add your production domain under **Authentication →
  Settings → Authorized domains** (`localhost` is allowed by default).
- **Firestore** and **Storage** are already in use by the previous project.

## 4. The admin dashboard — `/admin`

The couple/planner manage everything at **`/admin`**:
- **Overview** — RSVP counts, total heads, checked-in.
- **Guests** — searchable list, mark guests in/out.
- **Check-in** — scan a guest's floral QR pass with the camera (or type the
  code) and check them in at the door.
- **Broadcast** — email an update to all attending guests (uses the Phase 4
  Resend route).

Access is gated in **two** places that must list the same admin email(s):
1. `isAdmin()` in [`firestore.rules`](firestore.rules) — enforces write access
   (check-in, deletes) and now the **guest-list read** (we tightened it so guest
   emails aren't publicly enumerable; a guest can still fetch only their own pass
   by email).
2. `ADMIN_EMAILS` in [`src/lib/adminConfig.js`](src/lib/adminConfig.js) — gates
   what the dashboard UI shows.

Update **both** to the couple/planner's real Google account, then re-publish the
rules. (Alternatively, add the admin's Firebase Auth UID to an `admins`
collection — the rules also honour that.)

## What works today

- **RSVP → Firestore**: a guest record (keyed by lowercased email) is created with
  a unique `qrCode`, `attending`, party size, note, and `createdAt`. RSVPs are
  **create-once**; edits are reserved for the couple/gatekeepers (used for
  check-in). The floral QR pass encodes that unique code.
- Until the rules above are published, the RSVP still completes for the guest
  (the pass shows with a fallback code) but the reply won't be saved — you'll see
  a `permission-denied` warning in the browser console. After publishing, saving
  works with no code changes.

> Security note: the previous project's committed `.env.local` likely holds a real
> **Resend** API key — rotate it before launch (used in Phase 4 for emails).
