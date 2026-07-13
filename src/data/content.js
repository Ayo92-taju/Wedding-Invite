/*
 * ─────────────────────────────────────────────────────────────
 *  ❀  ALL EDITABLE CONTENT LIVES HERE  ❀
 *
 *  This is the only file you need to touch to update the wedding
 *  details, love story, registry, FAQs, etc. Swap in the real
 *  details and the whole site updates automatically.
 * ─────────────────────────────────────────────────────────────
 */

export const couple = {
  // Shown in the invitation, footer, etc.
  nameOne: 'Nimi',
  nameTwo: 'Victor',
  // The bride's full name — shown in the HERO only.
  heroNameOne: 'Tioluwanimi',
  // Used in the small monogram (initials).
  initials: 'N & V',
  // The wedding theme.
  tagline: 'The Three-Strand Cord',
  // A short, poetic line for the hero.
  intro:
    'A love that has grown gently, intentionally, and beautifully over time — like a garden nurtured with care.',
  // Celebration hashtag.
  hashtag: '#the3strandcord',
  // Colours of the day (what guests are asked to wear).
  coloursOfDay: 'Burgundy & Gold',
}

export const wedding = {
  // ISO date-time of the event. Used by the live countdown.
  // Format: YYYY-MM-DDTHH:MM:SS  (24-hour, local time)
  dateTimeISO: '2026-08-12T12:00:00',

  // Human-friendly versions shown around the site.
  dateLong: 'Wednesday, the twelfth of August',
  year: 'Two Thousand & Twenty-Six',
  dayShort: 'Wed · 12 Aug 2026',

  // Part One — the traditional wedding / engagement.
  ceremony: {
    label: 'The Engagement',
    time: '12:00 noon',
    venue: 'Beverly International Event Center',
    address: 'Jagun Molu St, Abule Okuta, Lagos 102216',
    note: 'We’d be traditionally married in the presence of our friends and family.',
    footLeft: 'Ceremony',
    footRight: 'Traditional Wedding',
  },
  // Part Two — the reception.
  reception: {
    label: 'The Celebration',
    time: '3:00 in the afternoon',
    venue: 'Beverly International Event Center',
    address: 'Jagun Molu St, Abule Okuta, Lagos 102216',
    note: 'Stay for an afternoon of good food, laughter, and dancing.',
    footLeft: 'Reception',
    footRight: 'Lunch & Dancing',
  },

  dressCode: {
    label: 'Dress Code',
    text: 'Traditional Wear',
    detail:
      'Please dress comfortably in our colours of the day, Burgundy and Gold — we cannot wait to celebrate with you.',
    footRight: 'Trad Wear',
  },

  // Short note shown on the invitation.
  invitationNote:
    'Together with our families, we joyfully invite you to witness the beginning of our forever.',

  // Line shown beneath the live countdown.
  countdownNote: 'Until Nimi & Victor say “I do” to forever.',
}

/* Love Story Garden — each entry blooms one stage further along the timeline. */
export const loveStoryLede = 'Our love story will always be our favourite.'

export const loveStory = [
  {
    year: 'Jul 2025',
    title: 'Kairos',
    text: 'We had crossed paths a few times before, but it wasn’t until Kairos that everything changed.',
  },
  {
    year: 'Aug 2025',
    title: 'Drawn Closer',
    text: 'In what felt like perfect timing, God brought us closer, and we began to talk more than ever before. In those simple conversations, we found something special — love, peace, and a beautiful sense of certainty about our future together.',
  },
  {
    year: 'Sep 2025',
    title: 'The Beginning',
    text: 'Not long after, we started dating.',
  },
  {
    year: 'Dec 2025',
    title: 'A Full “Yes”',
    text: 'Just three months in, a very smitten Victor asked me to be his wife. With a full heart, I said yes.',
  },
  {
    year: 'Apr 2026',
    title: 'Made One',
    text: 'We got legally married.',
  },
  {
    year: 'Aug 2026',
    title: 'A Threefold Cord',
    text: 'And now, we get to spend the rest of our lives together as a threefold cord — God, him, me. And that is the part we’re most excited about.',
  },
]

/* Garden of Gifts — the couple’s gift account. */
export const registry = {
  note:
    'Your presence is all we ask for, but if you wish to help our garden grow, a few seeds are gathered here.',
  account: {
    number: '8064876534',
    bank: 'Palmpay',
    name: 'Olatunbosun Ayomikun Victoria',
  },
}

/* Love Notes — a few seed notes so the section never looks empty.
   Guest-submitted notes are saved live to Firestore (wellWishes). */
export const loveNotes = {
  intro:
    'Leave us a wish, a memory, or a question — your words will be pressed gently into the pages of our story.',
  seeds: [
    {
      name: 'Aunty Bisi',
      message:
        'I have watched this love grow from the very first day. May your cord of three never be broken. ❤',
    },
    {
      name: 'The Adeyemis',
      message: 'Can’t wait to celebrate with you both. So proud of you!',
    },
    {
      name: 'Tomi & Kunle',
      message: 'Saving our seats already. This is going to be beautiful.',
    },
  ],
}

/* Frequently asked questions — kept as simple one-liners. */
export const faqs = [
  {
    q: 'When should I RSVP by?',
    a: 'Before the end of July 2026.',
  },
  {
    q: 'What should I wear?',
    a: 'Traditional wear, in our colours of the day — burgundy and gold.',
  },
  {
    q: 'Can I bring a guest?',
    a: 'Strictly by invitation.',
  },
  {
    q: 'Will it be indoors or outdoors?',
    a: 'Indoors, at an event hall.',
  },
]
