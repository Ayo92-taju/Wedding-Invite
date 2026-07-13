import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { notifyParty } from '@/lib/server/notify.js'

export const runtime = 'nodejs'

/*
 * RSVP submission for a whole party. The primary guest declares who is
 * attending and fills in the names of any unnamed plus-ones.
 *
 * Body: {
 *   partyId,
 *   members: [{ code, attending: bool, fullName? }],
 *   message?,        // optional note to the couple (stored on the party)
 *   contactEmail?,   // optional email to send the passes to
 * }
 *
 * Server-validated: only codes that belong to the party are touched; names may
 * only be set on non-primary members; check-in state is never writable here.
 */
export async function POST(request) {
  const db = getAdminDb()
  if (!db) {
    return NextResponse.json(
      { error: 'The RSVP portal is not connected yet. Please try again a little later.' },
      { status: 503 },
    )
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const partyId = String(body?.partyId || '').trim()
  const members = Array.isArray(body?.members) ? body.members : []
  if (!partyId || members.length === 0) {
    return NextResponse.json({ error: 'Missing party or members.' }, { status: 400 })
  }

  try {
    const partyRef = db.collection('parties').doc(partyId)
    const [partyDoc, guestSnap, tablesSnap] = await Promise.all([
      partyRef.get(),
      db.collection('guests').where('partyId', '==', partyId).get(),
      db.collection('tables').get(),
    ])
    if (!partyDoc.exists) {
      return NextResponse.json({ error: 'We couldn’t find that invitation.' }, { status: 404 })
    }

    const tableNames = {}
    tablesSnap.forEach((t) => {
      tableNames[t.id] = t.data().tableName
    })

    const byCode = new Map()
    guestSnap.docs.forEach((d) => byCode.set(d.id, { ref: d.ref, data: d.data() }))

    const batch = db.batch()
    const confirmed = []
    let primaryName = ''
    let primaryEmail = ''
    let primaryPhone = ''

    for (const m of members) {
      const code = String(m?.code || '').trim()
      const entry = byCode.get(code)
      if (!entry) {
        return NextResponse.json({ error: 'One of the guests doesn’t belong to this invitation.' }, { status: 400 })
      }
      const { ref, data } = entry
      const attending = !!m.attending
      const patch = { rsvpStatus: attending ? 'CONFIRMED' : 'DECLINED' }
      if (data.isPrimary) primaryPhone = data.phone || ''

      // Placeholder / companion names may be (re)named by the primary guest.
      const newName = String(m?.fullName || '').trim().slice(0, 120)
      if (!data.isPrimary && newName && newName !== data.fullName) {
        patch.fullName = newName
      }

      batch.update(ref, patch)

      const finalName = patch.fullName || data.fullName
      if (data.isPrimary) {
        primaryName = finalName
        primaryEmail = data.email || ''
      }
      if (attending) {
        confirmed.push({
          fullName: finalName,
          inviteCode: code,
          tableName: (data.tableId && tableNames[data.tableId]) || null,
          isPrimary: !!data.isPrimary,
        })
      }
    }

    const note = String(body?.message || '').trim().slice(0, 1000)
    batch.update(partyRef, {
      confirmedSeats: confirmed.length,
      ...(note ? { note } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await batch.commit()

    // Fan out email (card images) + WhatsApp (card image per member) + SMS.
    const origin = request.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || ''
    const notify = await notifyParty({
      origin,
      partyName: partyDoc.data().partyName || primaryName || 'your party',
      primaryName: primaryName || confirmed[0]?.fullName || 'friend',
      email: String(body?.contactEmail || primaryEmail || '').trim(),
      phone: primaryPhone,
      members: confirmed,
      declined: confirmed.length === 0,
    })

    return NextResponse.json({
      success: true,
      emailed: notify.emailed,
      messaged: !!(notify.sms?.sent || notify.whatsapp.some((w) => w.sent)),
      confirmed: confirmed.map(({ isPrimary, ...rest }) => rest),
      declined: confirmed.length === 0,
    })
  } catch (err) {
    console.error('RSVP submit failed:', err)
    return NextResponse.json({ error: 'Something went wrong saving your reply — please try again.' }, { status: 500 })
  }
}
