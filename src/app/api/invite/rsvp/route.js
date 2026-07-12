import { NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from '@/lib/server/adminDb.js'
import getResendClient from '@/utils/getResendClient'
import { partyConfirmationEmail } from '@/utils/emailTemplate'
import { sendGuestMessage, passMessage } from '@/lib/server/twilio.js'
import { couple } from '@/data/content'

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

    // Confirmation email (fire-and-forget; never blocks the RSVP).
    const to = String(body?.contactEmail || primaryEmail || '').trim().toLowerCase()
    let emailed = false
    if (to && to.includes('@')) {
      try {
        const resend = getResendClient()
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        const { subject, html } = partyConfirmationEmail({
          primaryName: primaryName || confirmed[0]?.fullName || 'friend',
          members: confirmed,
          declined: confirmed.length === 0,
        })
        if (resend) {
          await resend.emails.send({ from: `${couple.nameOne} & ${couple.nameTwo} <${fromEmail}>`, to: [to], subject, html })
          emailed = true
        } else {
          console.log(`[EMAIL SIMULATOR] Party confirmation → ${to} (${confirmed.length} passes)`)
        }
      } catch (err) {
        console.warn('Confirmation email failed (non-blocking):', err?.message)
      }
    }

    // WhatsApp/SMS the passes to the primary's phone (fire-and-forget).
    let messaged = false
    if (confirmed.length > 0 && primaryPhone) {
      try {
        const partyName = partyDoc.data().partyName || primaryName || 'your party'
        const r = await sendGuestMessage(primaryPhone, passMessage({ partyName, members: confirmed }))
        messaged = !!r.sent
      } catch (err) {
        console.warn('Pass message failed (non-blocking):', err?.message)
      }
    }

    return NextResponse.json({
      success: true,
      emailed,
      messaged,
      confirmed: confirmed.map(({ isPrimary, ...rest }) => rest),
      declined: confirmed.length === 0,
    })
  } catch (err) {
    console.error('RSVP submit failed:', err)
    return NextResponse.json({ error: 'Something went wrong saving your reply — please try again.' }, { status: 500 })
  }
}
