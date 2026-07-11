import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { toE164, isValidE164 } from '@/lib/access/phone.js'

export const runtime = 'nodejs'

/*
 * Guest verification: a guest enters the phone number or email their invite
 * was registered with; we return their whole party (household) so the primary
 * can confirm who is attending. "Instant entry" (knowing the invited contact)
 * is the decided verification level — SMS OTP was considered and dropped.
 *
 * Contact details of party members are never echoed back.
 */

// Best-effort per-instance rate limit (serverless instances each get their own).
const hits = new Map()
function throttled(ip) {
  const now = Date.now()
  const windowStart = now - 60_000
  const list = (hits.get(ip) || []).filter((t) => t > windowStart)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 5000) hits.clear() // don't grow unbounded
  return list.length > 12
}

function publicGuest(d, tableNames) {
  return {
    code: d.inviteCode,
    fullName: d.fullName || '',
    isPrimary: !!d.isPrimary,
    rsvpStatus: d.rsvpStatus || 'PENDING',
    isPlaceholder: !d.isPrimary && /^Guest of /i.test(d.fullName || ''),
    checkedIn: !!d.checkedIn,
    tableName: (d.tableId && tableNames[d.tableId]) || null,
  }
}

export async function POST(request) {
  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: 'The RSVP portal is not connected yet. Please try again a little later.' },
      { status: 503 },
    )
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local'
  if (throttled(ip)) {
    return NextResponse.json({ error: 'Too many attempts — please wait a minute.' }, { status: 429 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const contact = String(body?.contact || '').trim()
  if (!contact) {
    return NextResponse.json({ error: 'Enter the phone number or email on your invitation.' }, { status: 400 })
  }

  try {
    const guests = db.collection('guests')
    let snap = null

    if (contact.includes('@')) {
      snap = await guests.where('email', '==', contact.toLowerCase()).limit(1).get()
    } else {
      const phone = toE164(contact)
      if (!isValidE164(phone)) {
        return NextResponse.json({ error: 'That phone number doesn’t look complete — please check it.' }, { status: 400 })
      }
      snap = await guests.where('phone', '==', phone).limit(1).get()
    }

    if (snap.empty) {
      return NextResponse.json(
        { error: 'We couldn’t find an invitation under that contact. Try the number or email your invite was sent to.' },
        { status: 404 },
      )
    }

    const match = snap.docs[0].data()
    const partyId = match.partyId
    const [partyDoc, partySnap, tablesSnap] = await Promise.all([
      db.collection('parties').doc(partyId).get(),
      guests.where('partyId', '==', partyId).get(),
      db.collection('tables').get(),
    ])

    const tableNames = {}
    tablesSnap.forEach((t) => {
      tableNames[t.id] = t.data().tableName
    })

    const members = partySnap.docs
      .map((d) => publicGuest(d.data(), tableNames))
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))

    const party = partyDoc.exists ? partyDoc.data() : {}
    return NextResponse.json({
      party: {
        id: partyId,
        partyName: party.partyName || members[0]?.fullName || 'Your party',
        allowedSeats: party.allowedSeats || members.length,
      },
      guests: members,
    })
  } catch (err) {
    console.error('Invite lookup failed:', err)
    return NextResponse.json({ error: 'Something went wrong looking that up — please try again.' }, { status: 500 })
  }
}
