/*
 * ─────────────────────────────────────────────────────────────
 *  ❀  ALL EDITABLE CONTENT LIVES HERE  ❀
 *
 *  This is the only file you need to touch to update the wedding
 *  details, love story, registry, FAQs, etc. Everything below is
 *  PLACEHOLDER text — swap in the real details and the whole site
 *  updates automatically.
 * ─────────────────────────────────────────────────────────────
 */

export const couple = {
  // Shown in the bloom intro, hero and invitation.
  nameOne: 'Nimi',
  nameTwo: 'Victor',
  // Used in the small monogram + footer (initials).
  initials: 'N & V',
  tagline: 'Love in Full Bloom',
  // A short, poetic line for the hero.
  intro:
    'A love that has grown gently, intentionally, and beautifully over time — like a garden nurtured with care.',
  // Celebration hashtag.
  hashtag: '#NimiAndVictor26',
}

export const wedding = {
  // ISO date-time of the CEREMONY. Used by the live countdown.
  // Format: YYYY-MM-DDTHH:MM:SS  (24-hour, local time)
  dateTimeISO: '2026-10-10T16:00:00',

  // Human-friendly versions shown around the site.
  dateLong: 'Saturday, the tenth of October',
  year: 'Two Thousand & Twenty-Six',
  dayShort: 'Sat · 10 Oct 2026',

  ceremony: {
    label: 'The Ceremony',
    time: '4:00 in the afternoon',
    venue: 'The Glasshouse Garden',
    address: '12 Rosewood Lane · Lagos, Nigeria',
  },
  reception: {
    label: 'The Celebration',
    time: 'Dinner & dancing to follow',
    venue: 'The Orangery Pavilion',
    address: 'Within the same gardens',
  },

  dressCode: {
    label: 'Dress Code',
    text: 'Garden formal',
    detail: 'Soft florals, blush, ivory, sage & earthen tones',
  },

  // Short note shown on the invitation.
  invitationNote:
    'Together with our families, we joyfully invite you to witness the beginning of our forever.',
}

/* Our Love Story — each entry blooms as a flower along the garden timeline. */
export const loveStory = [
  {
    year: '2019',
    title: 'The First Petal',
    text: 'Two strangers at a friend’s garden party. A spilled glass of wine, an apology, and a conversation that quietly refused to end.',
  },
  {
    year: '2020',
    title: 'Rooted',
    text: 'A season apart taught us patience. Letters, late calls, and a love that learned to grow even without sunlight.',
  },
  {
    year: '2022',
    title: 'In Full Leaf',
    text: 'A little flat, a windowsill of herbs, and the slow, ordinary magic of building a life side by side.',
  },
  {
    year: '2024',
    title: 'The Proposal',
    text: 'Among the roses at golden hour, on one knee, with shaking hands and a question that had only ever had one answer.',
  },
  {
    year: '2026',
    title: 'In Full Bloom',
    text: 'And now, surrounded by everyone we love, we plant the first seed of forever.',
  },
]

/* A note from the couple — a heartfelt letter, in their own voice.
   Keep paragraphs short; they reveal one by one, like ink finding the page. */
export const letter = {
  eyebrow: 'A note from us',
  salutation: 'Dearest friends,',
  paragraphs: [
    'If you are reading this, you are someone who has helped write our story — and we can scarcely believe the day is almost here.',
    'When we pictured this moment, it was never really about the flowers or the music. It was about this: the people we love, gathered in one garden, while we promise each other forever.',
    'Thank you for loving us, for cheering us on, and for travelling near or far to stand beside us. Come ready to laugh, to cry a little, and to dance until the very last petal falls.',
  ],
  closing: 'With all our love,',
  signature: 'Nimi & Victor',
}

/* Garden of Gifts — your registry links. */
export const registry = {
  note:
    'Your presence is the only present we ask for. But should you wish to help our garden grow, a few seeds are gathered here.',
  items: [
    {
      name: 'The Honeymoon Garden',
      description: 'A contribution toward the quiet adventures of our first chapter.',
      url: '#',
    },
    {
      name: 'Our First Home',
      description: 'Small things that will make our home bloom — linens, china, and warmth.',
      url: '#',
    },
    {
      name: 'A Charitable Bloom',
      description: 'Plant a tree, or give in our name to a cause close to our hearts.',
      url: '#',
    },
  ],
}

/* Love Notes — a few seed questions so the section never looks empty.
   Guest-submitted notes are handled by the form (Netlify Forms). */
export const loveNotes = {
  intro:
    'Leave us a wish, a memory, or a question — your words will be pressed gently into the pages of our story.',
  // Pre-filled notes shown as handwritten cards.
  seeds: [
    {
      name: 'Aunty Bisi',
      message:
        'I have watched this love grow from the very first day. May your garden never know a winter. ❤',
    },
    {
      name: 'The Adeyemis',
      message: 'Can’t wait to dance until the flowers wilt. So proud of you both!',
    },
    {
      name: 'Tomi & Kunle',
      message: 'Saving our seats by the roses. This is going to be beautiful.',
    },
  ],
}

/* Frequently asked questions, shown beside the Love Notes. */
export const faqs = [
  {
    q: 'When should I RSVP by?',
    a: 'Kindly let us know by the first of September so we can prepare a seat for you in the garden.',
  },
  {
    q: 'What should I wear?',
    a: 'Garden formal — think soft florals, blush, ivory and sage. Flat or block heels are kind to garden lawns.',
  },
  {
    q: 'Can I bring a guest?',
    a: 'Your invitation will note the number of seats reserved for you. Please add them when you RSVP.',
  },
  {
    q: 'Will it be indoors or outdoors?',
    a: 'The ceremony is in the garden, with the celebration sheltered in the pavilion. We’ll bloom rain or shine.',
  },
]

/* Optional footer credit line. */
export const credit = 'Made with love, in full bloom.'
