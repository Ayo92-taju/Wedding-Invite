import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { notifyParty } from '@/lib/server/notify.js'
import { twilioStatus } from '@/lib/server/twilio.js'

export const runtime = 'nodejs'

/*
 * (Re)send a party's entry passes on every channel we have for them:
 * email (card images), WhatsApp (card image per member), and SMS (codes).
 * Body: { inviteCode } — any member's code; covers every non-declined
 * member of that party.
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

    const all = memberSnap.docs.map((d) => d.data())
    const members = all
      .filter((g) => g.rsvpStatus !== 'DECLINED')
      .map((g) => ({
        fullName: g.fullName,
        inviteCode: g.inviteCode,
        tableName: (g.tableId && tableNames[g.tableId]) || null,
      }))
    if (!members.length) {
      return NextResponse.json({ error: 'Every member of this party has declined.' }, { status: 400 })
    }

    const primary = all.find((g) => g.isPrimary)
    const origin = request.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || ''
    const result = await notifyParty({
      origin,
      partyName: party.partyName || guest.fullName,
      primaryName: primary?.fullName || guest.fullName,
      email: guest.email || primary?.email || party.primaryContactEmail || '',
      phone: guest.phone || primary?.phone || party.primaryContactPhone || '',
      members,
    })

    return NextResponse.json({
      emailed: result.emailed,
      sms: result.sms,
      whatsapp: result.whatsapp,
      sent: !!(result.emailed || result.sms?.sent || result.whatsapp.some((w) => w.sent)),
      twilio: twilioStatus(),
    })
  } catch (err) {
    console.error('Dispatch failed:', err)
    return NextResponse.json({ error: err?.message || 'Dispatch failed.' }, { status: 500 })
  }
}
