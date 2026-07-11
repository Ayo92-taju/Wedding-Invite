# Firebase setup (Nimi & Victor — access-control system)

The site reuses the Firebase project **`nimi-and-victor-s-we`**. Its web config is
in [`firebase-applet-config.json`](firebase-applet-config.json) and the data lives
in a Firestore database named **`default`** (a *named* database, not `(default)`).

The guest system has three surfaces:

| Surface | Who | What |
|---|---|---|
| `/` (RSVP section) | Guests | Find invitation by phone/email → confirm household → download per-person QR passes |
| `/admin` | The couple | Overview metrics · Guests (add/edit/passes) · Import · Tables · Scanners · Broadcast |
| `/scan` | Ushers | Google sign-in → camera QR check-in (duplicate-proof, offline-capable) |

## 1. Deploy the security rules ⚠️ (required — also closes a data leak)

The currently deployed rules are from the previous two-event project and include
`allow list: if true` on `guests` — **anyone can download the entire guest list**.
Publishing [`firestore.rules`](firestore.rules) closes that and enables the new
collections (`parties`, `guests`, `tables`, `authorized_scanners`).

**Option A — Firebase Console:** Firestore Database → pick the **`default`**
database → **Rules** → paste `firestore.rules` → **Publish**.

**Option B — CLI:**
```bash
npm i -g firebase-tools
firebase login
firebase use nimi-and-victor-s-we
firebase deploy --only firestore:rules
```

Admin emails are already set (confirmed): `momohvictor62@gmail.com`,
`ayolat16@gmail.com` — in both `isAdmin()` (rules) and
[`src/lib/adminConfig.js`](src/lib/adminConfig.js).

## 2. Add the server key for the guest portal ⚠️ (required for guest RSVP)

Guests look up their invitation by phone/email. That query runs **server-side**
(so the guest list is never exposed to browsers) and needs a service-account key:

1. Firebase Console → ⚙ **Project settings** → **Service accounts** →
   **Generate new private key** (downloads a JSON file).
2. Put it in the env as one line — locally in `.env.local`, and on your host
   (Vercel/Netlify → project → Environment Variables):

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"nimi-and-victor-s-we",...}'
# (base64 of the JSON also works)
```

Until it's set, the APIs return a friendly 503 and the RSVP section shows
"the portal is not connected yet" — nothing crashes.

> Treat this key like a password: it bypasses all security rules. Never commit it.

## 3. Enable sign-in

**Authentication → Sign-in method → Google**: enable. Add the production domain
under **Authentication → Settings → Authorized domains**. Used by `/admin` and `/scan`.

## 4. Email (Resend)

`RESEND_API_KEY` + `RESEND_FROM_EMAIL` in the env power the RSVP confirmation
(per-guest passes emailed to the primary) and the admin Broadcast tab. Without a
key, emails are simulated (logged) and everything else still works.
**Rotate the key from the old committed `.env.local` before launch.**

## 5. Day-of gate team

Admin → **Scanners** tab → whitelist each usher's personal Gmail. They open
`/scan` on their phone, sign in, and scan. Check-ins are Firestore
**transactions** — a duplicated/screenshotted QR flashes red with who scanned it
first and when. If the venue network drops, scans queue on-device and sync when
it returns.

## Still to come (needs the Blaze plan)

- **Storage uploads** of generated passes (`qrCodeUrl` / `digitalInviteUrl` on
  each guest) — today passes are generated in the browser on demand, which works
  without Blaze.
- **Twilio WhatsApp/SMS dispatch** (Phase E) — needs `TWILIO_ACCOUNT_SID`,
  `TWILIO_AUTH_TOKEN`, and sender numbers in the env.
