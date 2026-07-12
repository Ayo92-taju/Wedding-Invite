/*
 * Twilio dispatch (server-only) — WhatsApp first, SMS fallback.
 * Uses the plain REST API via fetch; no SDK dependency.
 *
 * Env: TWILIO_ACCOUNT_SID · TWILIO_AUTH_TOKEN, plus at least one sender:
 *   TWILIO_WHATSAPP_FROM  e.g. "whatsapp:+14155238886"
 *   TWILIO_SMS_FROM       e.g. "+13345551234"
 * Missing pieces degrade to {sent:false, simulated:true} — nothing crashes.
 */

function creds() {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) return null
  return { sid, token }
}

export function twilioStatus() {
  return {
    configured: !!creds(),
    whatsappFrom: !!process.env.TWILIO_WHATSAPP_FROM,
    smsFrom: !!process.env.TWILIO_SMS_FROM,
  }
}

async function sendVia(from, to, body) {
  const c = creds()
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${c.sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.sid}:${c.token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ From: from, To: to, Body: body }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || `Twilio ${res.status}`)
  return data.sid
}

/*
 * Send a message to an E.164 phone. Tries WhatsApp when a WhatsApp sender is
 * configured, falls back to SMS. Returns { sent, channel?, sid?, simulated?, error? }.
 */
export async function sendGuestMessage(phoneE164, body) {
  const to = String(phoneE164 || '').trim()
  if (!/^\+\d{8,15}$/.test(to)) return { sent: false, error: 'No valid phone number on file.' }

  if (!creds()) {
    console.log(`[TWILIO SIMULATOR] → ${to}: ${body.slice(0, 80)}…`)
    return { sent: false, simulated: true }
  }

  const waFrom = process.env.TWILIO_WHATSAPP_FROM
  const smsFrom = process.env.TWILIO_SMS_FROM

  if (waFrom) {
    try {
      const sid = await sendVia(waFrom, `whatsapp:${to}`, body)
      return { sent: true, channel: 'whatsapp', sid }
    } catch (err) {
      console.warn('WhatsApp send failed, falling back to SMS:', err?.message)
    }
  }
  if (smsFrom) {
    try {
      const sid = await sendVia(smsFrom, to, body)
      return { sent: true, channel: 'sms', sid }
    } catch (err) {
      return { sent: false, error: err?.message }
    }
  }
  console.log(`[TWILIO] No sender configured (TWILIO_WHATSAPP_FROM / TWILIO_SMS_FROM) → ${to}`)
  return { sent: false, simulated: true, error: 'No Twilio sender number configured yet.' }
}

/* The pass message a guest receives after RSVP (or an admin re-send). */
export function passMessage({ partyName, members, siteUrl }) {
  const lines = members.map((m) => `• ${m.fullName}${m.tableName ? ` — Table ${m.tableName}` : ''}: ${m.inviteCode}`)
  const url = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || ''
  return [
    `Nimi & Victor — The Three-Strand Cord 💍`,
    `Wed 12 Aug 2026 · 12 noon · Beverly International Event Center, Lagos.`,
    ``,
    `Entry pass${members.length > 1 ? 'es' : ''} for ${partyName}:`,
    ...lines,
    ``,
    `Each code admits one person — show your QR pass (or the code above) at the gate.`,
    url ? `Download your passes: ${url}/#rsvp` : '',
    `#the3strandcord`,
  ]
    .filter(Boolean)
    .join('\n')
}
