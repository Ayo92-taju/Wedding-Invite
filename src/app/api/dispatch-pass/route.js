import { NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { notifyParty } from '@/lib/server/notify.js'
import { twilioStatus } from '@/lib/server/twilio.js'

export const runtime = 'nodejs'

/*
 * (Re)send a party's entry passes on every channel we have for them:
 * email (card images), WhatsApp (card image per member), and SMS (codes).
 * Body: { inviteCode } or { inviteCodes } — any member code(s); covers every
 * non-declined member of each selected party.
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

  const requestedCodes = [
    ...(Array.isArray(body?.inviteCodes) ? body.inviteCodes : [body?.inviteCode]),
  ]
    .map((code) => String(code || '').trim())
    .filter(Boolean)
  const codes = [...new Set(requestedCodes)]
  if (!codes.length) return NextResponse.json({ error: 'Missing invite code.' }, { status: 400 })

  try {
    const guestDocs = await Promise.all(codes.map((code) => db.collection('guests').doc(code).get()))
    const roots = guestDocs
      .map((doc, index) => (doc.exists ? { code: codes[index], guest: doc.data() } : null))
      .filter(Boolean)

    if (!roots.length) return NextResponse.json({ error: 'Guest not found.' }, { status: 404 })

    const partiesById = new Map()
    for (const root of roots) {
      const partyId = String(root.guest?.partyId || '')
      if (partyId && !partiesById.has(partyId)) partiesById.set(partyId, root)
    }

    const tablesSnap = await db.collection('tables').get()
    const tableNames = {}
    tablesSnap.forEach((t) => { tableNames[t.id] = t.data().tableName })
    const origin = request.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || ''

    const results = []
    for (const [, root] of partiesById) {
      const guest = root.guest
      const [partyDoc, memberSnap] = await Promise.all([
        db.collection('parties').doc(guest.partyId).get(),
        db.collection('guests').where('partyId', '==', guest.partyId).get(),
      ])

      const party = partyDoc.exists ? partyDoc.data() : {}
      const all = memberSnap.docs.map((d) => d.data())
      const members = all
        .filter((g) => g.rsvpStatus !== 'DECLINED')
        .map((g) => ({
          fullName: g.fullName,
          inviteCode: g.inviteCode,
          tableName: (g.tableId && tableNames[g.tableId]) || null,
        }))

      if (!members.length) {
        results.push({ partyId: guest.partyId, code: root.code, error: 'Every member of this party has declined.' })
        continue
      }

      const primary = all.find((g) => g.isPrimary)
      const result = await notifyParty({
        origin,
        partyName: party.partyName || guest.fullName,
        primaryName: primary?.fullName || guest.fullName,
        email: guest.email || primary?.email || party.primaryContactEmail || '',
        phone: guest.phone || primary?.phone || party.primaryContactPhone || '',
        members,
      })

      results.push({
        partyId: guest.partyId,
        code: root.code,
        emailed: result.emailed,
        sms: result.sms,
        whatsapp: result.whatsapp,
        sent: !!(result.emailed || result.sms?.sent || result.whatsapp.some((w) => w.sent)),
      })
    }

    const sentCount = results.filter((r) => r.sent).length
    const failed = results.filter((r) => !r.sent)
    const summary = {
      emailed: results.some((r) => r.emailed),
      sms: results.find((r) => r.sms)?.sms || null,
      whatsapp: results.flatMap((r) => r.whatsapp || []),
      sent: sentCount > 0,
      sentCount,
      partyCount: results.length,
      results,
      twilio: twilioStatus(),
    }

    if (sentCount === 0) {
      return NextResponse.json({
        ...summary,
        error: failed[0]?.error || 'No channel delivered.',
      }, { status: 400 })
    }

    return NextResponse.json(summary)
  } catch (err) {
    console.error('Dispatch failed:', err)
    return NextResponse.json({ error: err?.message || 'Dispatch failed.' }, { status: 500 })
  }
}
