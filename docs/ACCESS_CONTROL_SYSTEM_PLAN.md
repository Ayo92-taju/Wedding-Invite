# Digital Invitation & Venue Access Control System — Build Plan

**Status: BUILT (2026‑07‑12) — pending user setup to go live.**
Phase A ✅ (model + rules + import + admin) · Phase B ✅ (client‑side QR + Ivory Garden pass;
Storage upload deferred to Blaze) · Phase C ✅ (portal via server API; needs
`FIREBASE_SERVICE_ACCOUNT_KEY`) · Phase D ✅ (/scan: transactional check‑in, offline queue;
camera untestable in dev sandbox — test on a phone) · Phase E ⏳ (Twilio — awaiting credentials;
email broadcast/confirmations already work via Resend) · Phase F ✅ (tables + capacity‑aware
assignment + live metrics in /admin).
**To go live:** deploy `firestore.rules`, set `FIREBASE_SERVICE_ACCOUNT_KEY`, rotate Resend key,
import the guest sheet. See `FIREBASE_SETUP.md`.

**Author:** Prepared from the client TRD (`Website Adjustments.docx`, 2026‑07‑08).
**Decision locked in:** the new party/verification portal **replaces** the current public
wax‑seal RSVP. The old simple `guests` (one‑doc‑per‑email, create‑once) model is retired.

---

## 1. What we're building (plain terms)

A guest visits the site, verifies with their **phone or email**, and sees **their whole
household** ("party"). They tick who's coming and type in any plus‑one names. On submit, the
system mints a **unique QR + personalised invite card for each attendee**, downloadable in the
browser and (optionally) sent by WhatsApp/SMS. You manage everything from a private **admin
dashboard** (bulk import, seating, live metrics), and on the day, **whitelisted ushers** scan
guests in at the gate with **duplicate‑proof, offline‑capable** check‑in.

Three tightly‑sequenced pipelines: **Admin import → Guest RSVP/claim → Gate check‑in.**

---

## 2. Architecture & stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend/API | **Next.js** (existing app) on Vercel | New routes: `/verify`, `/rsvp`, `/scan`, expanded `/admin` |
| Database | **Firestore** (existing named db `default`) | 4 new collections (below) |
| Auth | **Firebase Auth** | Google Sign‑In for admin+ushers; lightweight token/OTP session for guests |
| Server logic | **Cloud Functions** (or Next API routes) | Invite‑card render, messaging dispatch, CSV processing |
| Asset storage | **Firebase Storage** | Generated QR + invite‑card PNGs |
| Messaging | **Termii** (recommended for NG) or Twilio | WhatsApp/SMS — provider decision pending (§8) |

> ⚠️ **Requires the Firebase Blaze (pay‑as‑you‑go) plan.** Cloud Functions, outbound network
> calls (SMS/WhatsApp), and Storage beyond the free quota are not available on the free Spark
> plan. Cost impact is small for a single event (§9), but the account must be upgraded.

---

## 3. Data model (Firestore)

Refined from the TRD. Four collections:

**`parties`** — the household/invitation unit.
`{ partyName, primaryContactPhone (E.164), primaryContactEmail, allowedSeats, confirmedSeats, createdAt, updatedAt }`

**`guests`** — one doc per person (primary + plus‑ones). Doc id = `inviteCode`.
`{ partyId, isPrimary, fullName, phone, email, rsvpStatus (PENDING|CONFIRMED|DECLINED), inviteCode, qrCodeUrl, digitalInviteUrl, tableId, checkedIn, checkedInAt, checkedInBy }`
Unfilled plus‑one placeholder → `fullName: "Guest of <primary>"`, `isPrimary:false`, `rsvpStatus:"PENDING"`.

**`tables`** — seating. `{ tableName, capacity, assignedSeatsCount }`

**`authorized_scanners`** — gate whitelist. Doc id = the usher's Google email.
`{ role:"scanner", assignedGate, addedAt }`

**Migration note:** today's `guests` are keyed by **email** with a different shape. We'll either
wipe and re‑import via the new CSV pipeline (cleanest — the current data is test data) or write a
one‑off migration. Recommended: **re‑import**.

---

## 4. Security rules & concurrency (hardening the TRD draft)

The TRD's sample rules need fixes before use:
- **Two `match /guests/{guestId}` blocks can't coexist** — Firestore merges by path; they must be
  one block with combined conditions.
- **`allow get: if true`** exposes a guest's name/phone/table to anyone who guesses/obtains an id.
  We'll gate reads behind a verified session or an unguessable id + minimise exposed fields.
- **Guest self‑update** must be constrained to *their own* RSVP fields and **must not** touch
  `checkedIn*`, `tableId`, or `inviteCode`.
- **Check‑in is scanner‑only** and wrapped in a **Firestore transaction** so a duplicated/
  screenshotted QR scanned twice (even across two gates at once) flips green exactly once; every
  later scan goes red with the original usher + timestamp.
- **Offline:** use the current SDK API (`initializeFirestore(app, { localCache: persistentLocalCache(...) })`) — the
  TRD's `enableIndexedDbPersistence` is deprecated in modern Firebase.

A full, corrected `firestore.rules` is part of Phase A deliverables.

---

## 5. Phased delivery plan

Each phase is independently shippable and verified before the next.

### Phase A — Data model + Admin foundation
- New collections + corrected `firestore.rules`.
- **Bulk CSV/Excel import**: parse `Full Name, Phone, Email, Total Seats`; **E.164** phone
  normalisation; 1 row w/ N seats → 1 party + 1 primary + (N‑1) placeholder guests; unique
  `inviteCode` per guest.
- Admin: guest/party table, bulk edit/delete, manual re‑dispatch button.
- **Verify:** import a sample sheet; confirm parties/guests/placeholders created correctly.

### Phase B — QR + invite‑card generation
- Generate a unique QR per guest → Storage; render the **personalised invite card** (name +
  table + QR on the wedding template) via a serverless function or canvas.
- Admin can preview/regenerate a card.
- **Verify:** generated cards scan to the right `inviteCode`; assets land in Storage.

### Phase C — Guest verification portal (`/verify` + `/rsvp`) — replaces public RSVP
- Phone/email lookup → session → party view.
- Primary confirms attendees + names plus‑ones (dynamic fields for granted slots).
- On submit: statuses update, cards render, **in‑browser download**.
- Swap the current public wax‑seal RSVP section for an entry point into this flow.
- **Verify:** end‑to‑end RSVP for a multi‑person party; declines handled.

### Phase D — Gate scanner (`/scan`)
- Google‑auth gated to `authorized_scanners`; camera QR decode.
- **Transaction‑locked** check‑in; full‑screen **green** (name + table) / **red** (already used,
  shows who+when) / **yellow** feedback.
- **Offline** persistence + auto‑sync on reconnect.
- **Verify:** valid scan → green; re‑scan → red; airplane‑mode scan → queues → syncs on reconnect.

### Phase E — Messaging dispatch
- WhatsApp/SMS delivery of download links on RSVP; admin **mass notifications** for changes.
- Retry/fallback (WhatsApp → SMS) and delivery logging.
- **Verify:** live send to a test number on the chosen provider.

### Phase F — Seating chart + live command center
- Table CRUD + capacities; assign parties to tables; over‑allocation warnings.
- Dashboard analytics: invited / confirmed / declined / downloaded / **real‑time checked‑in**.
- **Verify:** counts move as RSVPs + check‑ins happen.

> Phases A–D are the critical path to a working system; E and F can trail (download‑only +
> manual seating are viable fallbacks if messaging setup or seating UI slips).

---

## 6. Surfaces (routes)

- `/verify`, `/rsvp` — guest portal (public, session‑gated per party).
- `/admin/*` — import, guests, parties, tables, dispatch, metrics (Google‑auth, admin allowlist).
- `/scan` — usher gate app (Google‑auth, scanner allowlist).

---

## 7. What carries over vs. what's retired

- **Retired:** current `src/lib/rsvp.js` create‑once model + the public `RsvpSection` wax‑seal
  submit path (the *visual* pass/QR component can be reused for the per‑person card).
- **Reused:** Firebase init, Resend email (as a fallback/confirmation channel), the admin shell +
  Google‑auth gate, the QR rendering approach, the design system.
- **Kept as‑is:** the whole public marketing site (hero, story, details, registry, love notes),
  minus the RSVP section which becomes the portal entry point.

---

## 8. Decisions still needed before Phase A

1. **Messaging provider** — Termii (cheapest for Nigerian numbers, local sender IDs) vs Twilio
   (global, pricier for NG) vs **download‑only for v1** (defer messaging to Phase E). Recommended:
   **Termii**, or download‑only first.
2. **Firebase Blaze upgrade** — you'll need to enable it (billing account). No real spend for a
   single event, but required for Functions/Storage/outbound.
3. **Invite‑card template** — do we have the artwork/layout the QR + name + table sit on? Needed
   for Phase B.
4. **Guest data** — the source spreadsheet (names, phones, seat allocations) for import, and
   confirmation to **wipe the current test `guests`** and re‑import.
5. **Table map** — table names + capacities (for seating), or we start with a flat list.

---

## 9. Cost breakdown (rough, single event)

Assumes ~200–500 guests. Rates change — confirm at build time.

| Item | Estimate | Notes |
|---|---|---|
| Firebase Blaze (Firestore + Functions + Storage) | **~$0–5 total** | Well within free quotas at this scale; Blaze required to *enable* Functions/Storage/outbound |
| SMS via **Termii** (NG) | **~₦3–5 / SMS** (~$0.003–0.005) | 500 guests × 2 msgs ≈ **₦3k–5k (~$3–7)** |
| WhatsApp via Termii / Meta Cloud API | **~$0.005–0.02 / conversation** | Utility template pricing; needs a verified sender |
| SMS via **Twilio** (NG, alt) | **~$0.04–0.09 / SMS** | 500 × 2 ≈ **~$40–90** — pricier for NG numbers |
| Hosting (Vercel) | **$0** | Hobby tier fine, or existing plan |
| **Ballpark total for the event** | **~$5–20 (Termii)** / **~$45–95 (Twilio)** | Excluding download‑only, which is ~$0–5 |

**Recommendation:** Termii (or download‑only v1) keeps messaging in the **~$5–20** range.

---

## 10. Risks & open questions

- **Data quality** of the import sheet (malformed phones, missing seats) — the normalizer handles
  most; a dry‑run/preview before commit is planned.
- **WhatsApp onboarding** (Meta Business verification / template approval) can take days — start
  early if WhatsApp is required, else SMS/download first.
- **Venue network** on the day — the offline scanner mitigates, but ushers should install/warm the
  `/scan` page beforehand.
- **Privacy** — guest personal data in Firestore must stay read‑restricted (see §4).
- **Scope creep** — seating UI and analytics (Phase F) are the most open‑ended; we can ship a
  minimal version first.

---

## 11. To start Phase A, I need from you

1. Approval of this plan (and any changes).
2. Messaging decision (§8.1) — or "download‑only for now."
3. Firebase Blaze enabled on the project.
4. The guest spreadsheet + table list (can come just before Phase A's import step).
5. The invite‑card artwork/template (needed by Phase B).

Once approved, I'll begin **Phase A** (data model + corrected rules + bulk import) and verify it
against a sample sheet before moving on.
