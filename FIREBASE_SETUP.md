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

## 2. Server key for the guest portal — ✅ DONE locally (2026-07-12)

`FIREBASE_SERVICE_ACCOUNT_KEY` is set in `.env.local` (base64 of the service-account
JSON) and **live-verified**: lookup + RSVP ran end-to-end against the real database.

**Remaining:** add the same variable to the HOST's environment when deploying
(Vercel/Netlify → project → Environment Variables). Until it's set there, the
production portal returns a friendly 503.

> Treat this key like a password: it bypasses all security rules. Never commit it,
> and once it's stored in the host env, delete the JSON from the Desktop.

## 3. Enable sign-in

**Authentication → Sign-in method → Google**: enable. Add the production domain
under **Authentication → Settings → Authorized domains**. Used by `/admin` and `/scan`.

## 4. Email (Resend) — ✅ new key installed & live-verified (2026-07-12)

The new `RESEND_API_KEY` is in `.env.local` and delivered a real confirmation email
in testing. **Remaining:** add it (+ `RESEND_FROM_EMAIL`) to the host env at deploy,
and revoke the OLD key in the Resend dashboard if you haven't already (the old one
was committed in the original project zip).

## 5. Day-of gate team

Admin → **Scanners** tab → whitelist each usher's personal Gmail. They open
`/scan` on their phone, sign in, and scan. Check-ins are Firestore
**transactions** — a duplicated/screenshotted QR flashes red with who scanned it
first and when. If the venue network drops, scans queue on-device and sync when
it returns.

## 6. Twilio (WhatsApp/SMS) — ✅ credentials installed, SMS sender configured

`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_SMS_FROM` (+1 218 475 8467,
the number on the account) are in `.env.local`. Passes are texted to the primary
guest automatically after RSVP, and per-guest from Admin → Guests → "Send passes".
WhatsApp attempts first when `TWILIO_WHATSAPP_FROM` is set, falling back to SMS.

**Remaining for WhatsApp:** a WhatsApp sender needs Meta business verification in
the Twilio console (Messaging → Senders → WhatsApp). Until then, delivery is SMS.
Note: a US number texting Nigerian recipients works but costs more per message —
a Termii-style local sender was the cheaper option if volume grows.
**Add all three variables to the host env at deploy.**

## Still to come (needs the Blaze plan)

- **Storage uploads** of generated passes (`qrCodeUrl` / `digitalInviteUrl` on
  each guest) — today passes are generated in the browser on demand and delivered
  by email/SMS, which works without Blaze.
