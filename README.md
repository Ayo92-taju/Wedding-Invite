# Nimi & Victor — *Love in Full Bloom* 🌸

A luxury, interactive wedding website: a cinematic grow‑and‑bloom intro, an
invitation that unfolds like a pressed‑flower letter, a garden‑timeline love
story, live countdown, gift registry, a wall of guest "love notes," and an RSVP
that seals into a personalised **floral QR entry pass** — with a full backend for
guest management, check‑in, and emails.

**Stack:** Next.js 16 (App Router) · Firebase (Firestore + Auth) · Resend (email)
· Motion · qrcode.react / html5‑qrcode · Tailwind (admin only). The public site
keeps its own hand‑built design system; components are `.jsx`, the backend bits
are `.ts`.

---

## 🌿 Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # run the production build
```

Requires Node 18+ (developed on Node 24).

Environment variables live in **`.env.local`** (gitignored):

```
RESEND_API_KEY=…          # Resend key — ⚠️ rotate the one from the old zip
RESEND_FROM_EMAIL=…       # a verified Resend sender address
NEXT_PUBLIC_SITE_URL=…    # live URL (used for OG/social image resolution)
```

The Firebase **web config** is in `firebase-applet-config.json` (public client
config — safe to commit).

---

## ✏️ Editing content

Static copy lives in one file: **[`src/data/content.js`](src/data/content.js)**
— names, date/time/venue (the `dateTimeISO` drives the countdown), love‑story
milestones, the couple's letter, registry items, FAQ, and the seed love notes.

Some content is also **live from Firestore** (couple can change it without a
deploy):
- **Love notes** (`wellWishes`) — guests post; the wall shows them live. Falls
  back to the seed notes in `content.js` until real ones exist.
- **Registry** (`gifts`) — if the couple adds gift docs in Firestore they show
  live (with a "reserve" action); otherwise the `content.js` items are used.

---

## 🔥 Backend (Firebase) — one required setup step

See **[`FIREBASE_SETUP.md`](FIREBASE_SETUP.md)** for the details. In short:

1. **Publish the Firestore rules** in [`firestore.rules`](firestore.rules) to the
   project's **`default`** named database (Console or `firebase deploy`). The
   project's *current* rules enforce the previous two‑event schema, so **RSVPs
   won't save until you publish these single‑event rules.**
2. Set the **admin email(s)** in both `isAdmin()` (rules) and
   [`src/lib/adminConfig.js`](src/lib/adminConfig.js).
3. Enable **Google sign‑in** (Auth) for the admin dashboard.

### What the backend does
- **RSVP → Firestore** — a guest record (keyed by email) with a unique `qrCode`;
  the floral pass encodes it. Create‑once; the couple/gatekeepers edit it for
  check‑in.
- **Emails (Resend)** — an automatic confirmation + pass on RSVP
  (`/api/send-email`) and broadcast updates to all guests
  (`/api/send-broadcast`). Both degrade gracefully if email is unavailable.
- **Admin dashboard — `/admin`** — Google‑gated: RSVP overview, searchable guest
  list, **QR check‑in scanner** (camera + manual entry), and a broadcast
  composer.

---

## 🚀 Deploy

**Netlify** (config in [`netlify.toml`](netlify.toml)): connect the repo; Netlify
auto‑detects Next.js. Set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
`NEXT_PUBLIC_SITE_URL` in the Netlify UI. Add your domain to Firebase Auth →
Authorized domains.

**Vercel** (Next‑native, also great): import the repo, add the same env vars.

---

## 🗂 Structure

```
src/
  app/
    layout.tsx · page.tsx        ← site shell + renders the App
    admin/page.tsx               ← admin dashboard + QR check-in
    api/send-email · send-broadcast ← Resend routes
  App.jsx                        ← the public one-page site
  components/                    ← BloomIntro, LivingGarden, Hero, Invitation,
                                   LoveStory, Letter, Countdown, Registry,
                                   LoveNotes, Rsvp, Footer, ambient + ui/
  data/content.js                ← editable content
  lib/     firebase · rsvp · email · admin · notes · gifts · adminConfig
  utils/   getResendClient · emailTemplate
  styles/global.css              ← design system (tokens, base, forms)
firestore.rules · firebase.json  ← DB security rules + deploy target
FIREBASE_SETUP.md                ← backend setup guide
```

---

## ✅ Go‑live checklist

- [ ] Real names, date/time, venue, story, registry links, letter in `content.js`
- [ ] Publish `firestore.rules`; set admin email(s) in rules + `adminConfig.js`
- [ ] Enable Google sign‑in; add the live domain to Firebase authorized domains
- [ ] **Rotate the Resend API key** and set env vars on the host
- [ ] Replace `public/og-image.svg` with a 1200×630 PNG for social previews
- [ ] Delete any test data (a "Site Test" love note, test RSVPs) from Firestore

Made with love, in full bloom. ❀
