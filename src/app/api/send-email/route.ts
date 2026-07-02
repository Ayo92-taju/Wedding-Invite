import { NextRequest, NextResponse } from 'next/server'
import getResendClient from '@/utils/getResendClient'
import { confirmationEmail } from '@/utils/emailTemplate'
import { couple } from '@/data/content'

/*
 * Sends a guest their RSVP confirmation + floral QR entry pass.
 * Falls back to "simulation" (logs, returns success) when there's no
 * RESEND_API_KEY, and again if Resend delivery itself fails — so the guest
 * experience is never blocked by email.
 */
export async function POST(request: NextRequest) {
  const { email, name, qrCode, guestsCount, attending, message } = await request.json()

  if (!email || !name || !qrCode) {
    return NextResponse.json({ error: 'Missing guest email, name, or code.' }, { status: 400 })
  }

  const { subject, html } = confirmationEmail({ name, qrCode, guestsCount, attending, message })
  const resend = getResendClient()
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
  const from = `${couple.nameOne} & ${couple.nameTwo} <${fromEmail}>`

  if (!resend) {
    console.log(`[EMAIL SIMULATOR] Confirmation → ${email} (${name}) · code ${qrCode}`)
    return NextResponse.json({ success: true, simulated: true }, { status: 200 })
  }

  try {
    const data = await resend.emails.send({ from, to: [email], subject, html })
    return NextResponse.json({ success: true, simulated: false, data }, { status: 200 })
  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json(
      { success: true, simulated: true, error: (error as Error).message },
      { status: 200 },
    )
  }
}
