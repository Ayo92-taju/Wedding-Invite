# Nimi & Victor — *Love in Full Bloom* 🌸

A luxury, interactive wedding website built as a romantic garden in full bloom: a
cinematic petal-and-bloom intro, an invitation that unfolds like a pressed-flower
letter, a growing garden timeline, a live countdown, a gift registry, a wall of
handwritten "love notes," and an RSVP that seals into a personalised **floral QR
entry pass**.

Built with **React + Vite**, animated with **Framer Motion**, and deployed to
**Netlify** (RSVP & Love Notes use free Netlify Forms; QR codes are generated in
the browser).

---

## 🌿 Quick start

```bash
npm install      # install dependencies
npm run dev      # start the dev server → http://localhost:5173
npm run build    # build the production site into /dist
npm run preview  # preview the production build locally
```

Requires Node 18+ (developed on Node 24).

---

## ✏️ Editing the content (the important bit)

**Almost everything you'll want to change lives in one file:**

### [`src/data/content.js`](src/data/content.js)

| Section | What you can edit |
| --- | --- |
| `couple` | Names, initials/monogram, tagline, intro line |
| `wedding` | **Date & time** (`dateTimeISO` drives the countdown), venue, address, reception, dress code, invitation note |
| `loveStory` | The milestones on the garden timeline (year, title, text) |
| `registry` | Your "Garden of Gifts" — name, description and **link** per registry |
| `loveNotes` | The intro line + a few starter notes shown on the wall |
| `faqs` | The "Before you ask…" questions & answers |

The placeholder text, date (`2026-10-10`), and venue ("The Glasshouse Garden") are
**samples** — swap in the real details. The countdown, hero, invitation and footer
all update automatically.

> **Tip:** `dateTimeISO` must stay in the format `YYYY-MM-DDTHH:MM:SS` (24-hour,
> local time), e.g. a 4 pm ceremony on 10 Oct 2026 → `2026-10-10T16:00:00`.

### Photos

This build is type- and illustration-led (no photography required). To add photos,
drop images in `public/` and reference them as `/your-image.jpg`.

---

## 🎨 Changing the look

- **Colours & fonts** are CSS variables at the top of
  [`src/styles/global.css`](src/styles/global.css) (`--cream`, `--blush`, `--sage`,
  `--gold`, `--font-display`, etc.). Change them in one place and the whole site
  follows.
- **Fonts** are loaded in [`index.html`](index.html): *Fraunces* (display),
  *EB Garamond* (body), *Pinyon Script* (the names). Swap the Google Fonts link and
  the `--font-*` variables to restyle.
- Each section has its own CSS file next to its component in `src/components/`.

---

## 💌 How RSVP + the floral QR pass works

- The **RSVP** and **Love Notes** forms post to **Netlify Forms**. Netlify detects
  them via the hidden static forms in [`index.html`](index.html) — *don't remove those.*
- On a successful RSVP, the guest's reply is "sealed" and a **personalised QR pass**
  is generated **in the browser** (no backend). It encodes their name, party size
  and a short code, and can be downloaded as a PNG ("Save your pass").
- Submissions appear in your Netlify dashboard under **Forms** once deployed. Add
  email/Slack notifications there if you'd like to be pinged on each RSVP.

> Forms only work on the **deployed Netlify site** — in local dev the POST fails
> silently and the ritual/pass still play so you can preview them.

---

## 🚀 Deploying to Netlify

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Netlify reads [`netlify.toml`](netlify.toml) automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Your RSVP & Love Notes submissions will show under **Forms**.

(Drag-and-drop the `dist/` folder onto Netlify also works for a quick deploy, but a
connected repo gives you auto-deploys and form detection.)

---

## ♿ Accessibility & performance notes

- All animations honour `prefers-reduced-motion` (the intro shortens, petals,
  butterflies and cursor petals switch off).
- Decorative florals/butterflies are `aria-hidden`; the bloom intro is skippable
  (tap, Enter or Esc).
- Cursor-trailing petals are fine-pointer only (no battery drain on touch devices).

---

## 🗂 Project structure

```
src/
  data/content.js        ← all editable content
  styles/global.css      ← design tokens, base styles, form fields
  lib/netlify.js         ← Netlify Forms helper
  hooks/useCountdown.js  ← live countdown logic
  components/
    BloomIntro · PetalField · Butterflies · CursorPetals   (intro + ambience)
    Nav · Hero · Invitation · LoveStory · WeddingDetails
    Countdown · Registry · LoveNotes · Rsvp · Footer
    ui/  Flower · Butterfly · FloralDivider · Reveal · SectionHeading
```

---

## ✅ To replace before going live

- [ ] Real names spelling, date/time, venue & address in `content.js`
- [ ] Real love-story milestones and registry links
- [ ] Replace `public/og-image.svg` with a 1200×630 **PNG** for best social previews
- [ ] (Optional) set up Netlify form notifications

Made with love, in full bloom. ❀
