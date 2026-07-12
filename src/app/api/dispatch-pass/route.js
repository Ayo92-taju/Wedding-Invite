import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { sendGuestMessage, passMessage, twilioStatus } from '@/lib/server/twilio.js'

export const runtime = 'nodejs'

/*
 * (Re)send a party's entry passes by WhatsApp/SMS.
 * Body: { inviteCode } — any member's code; the message covers every
 * CONFIRMED member of that party (PENDING members are included too so a
 * not-yet-replied household still gets usable codes).
 * Goes to the tapped guest's own phone when they have one, else the party's
 * primary contact phone.
 */
export async function POST(request) {
  const db = getAdminDb()
  if (!db) {
    return NextResponse.json({ error: 'Server key not configured yet.' }, { status: 503 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const code = String(body?.inviteCode || '').trim()
  if (!code) return NextResponse.json({ error: 'Missing invite code.' }, { status: 400 })

  try {
    const guestDoc = await db.collection('guests').doc(code).get()
    if (!guestDoc.exists) return NextResponse.json({ error: 'Guest not found.' }, { status: 404 })
    const guest = guestDoc.data()

    const [partyDoc, memberSnap, tablesSnap] = await Promise.all([
      db.collection('parties').doc(guest.partyId).get(),
      db.collection('guests').where('partyId', '==', guest.partyId).get(),
      db.collection('tables').get(),
    ])
    const party = partyDoc.exists ? partyDoc.data() : {}
    const tableNames = {}
    tablesSnap.forEach((t) => { tableNames[t.id] = t.data().tableName })

    const members = memberSnap.docs
      .map((d) => d.data())
      .filter((g) => g.rsvpStatus !== 'DECLINED')
      .map((g) => ({
        fullName: g.fullName,
        inviteCode: g.inviteCode,
        tableName: (g.tableId && tableNames[g.tableId]) || null,
      }))
    if (!members.length) {
      return NextResponse.json({ error: 'Every member of this party has declined.' }, { status: 400 })
    }

    const primary = memberSnap.docs.map((d) => d.data()).find((g) => g.isPrimary)
    const to = guest.phone || primary?.phone || party.primaryContactPhone
    const result = await sendGuestMessage(
      to,
      passMessage({ partyName: party.partyName || guest.fullName, members }),
    )

    return NextResponse.json({ ...result, to: result.sent ? to : undefined, twilio: twilioStatus() })
  } catch (err) {
    console.error('Dispatch failed:', err)
    return NextResponse.json({ error: err?.message || 'Dispatch failed.' }, { status: 500 })
  }
}
