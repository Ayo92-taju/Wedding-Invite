import { NextRequest, NextResponse } from 'next/server'
import getResendClient from '@/utils/getResendClient'
import { broadcastEmail } from '@/utils/emailTemplate'
import { couple } from '@/data/content'

/*
 * Sends an update to all (or a list of) guests via Resend's batch API.
 * Expects: { title, message, type?, guests: [{ name, email }] }.
 */
export async function POST(request: NextRequest) {
  const { title, message, type, guests } = await request.json()

  if (!title || !message || !Array.isArray(guests) || guests.length === 0) {
    return NextResponse.json({ error: 'Missing title, message, or guests.' }, { status: 400 })
  }

  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const from = `${couple.nameOne} & ${couple.nameTwo} <${fromEmail}>`

  if (!resend) {
    console.log(`[BROADCAST SIMULATOR] "${title}" → ${guests.length} guests.`)
    return NextResponse.json({ success: true, simulated: true, count: guests.length }, { status: 200 })
  }

  try {
    const batch = guests
      .filter((g: { email?: string }) => g?.email)
      .map((g: { name?: string; email: string }) => {
        const { subject, html } = broadcastEmail({
          name: g.name || 'friend',
          title,
          message,
          type,
        })
        return { from, to: [g.email], subject, html }
      })

    // Resend batch limit is 100 per call.
    for (let i = 0; i < batch.length; i += 100) {
      await resend.batch.send(batch.slice(i, i + 100))
    }

    return NextResponse.json({ success: true, simulated: false, count: batch.length }, { status: 200 })
  } catch (error) {
    console.error('Resend broadcast error:', error)
    return NextResponse.json(
      { success: true, simulated: true, error: (error as Error).message },
      { status: 200 },
    )
  }
}
