/*
 * Twilio dispatch (server-only) — SMS and WhatsApp as PARALLEL channels
 * (the client wants guests to get both, not a fallback chain).
 * Plain REST via fetch; no SDK dependency.
 *
 * Env: TWILIO_ACCOUNT_SID · TWILIO_AUTH_TOKEN, plus senders:
 *   TWILIO_SMS_FROM       e.g. "+12184758467"
 *   TWILIO_WHATSAPP_FROM  e.g. "whatsapp:+14155238886"
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

function validTo(phone) {
  return /^\+\d{8,15}$/.test(String(phone || '').trim())
}

async function sendVia(from, to, body, mediaUrls = []) {
  const c = creds()
  const params = new URLSearchParams({ From: from, To: to, Body: body })
  for (const url of mediaUrls) params.append('MediaUrl', url)
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${c.sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${c.sid}:${c.token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.message || `Twilio ${res.status}`)
  return data.sid
}

export async function sendSms(phoneE164, body) {
  const to = String(phoneE164 || '').trim()
  if (!validTo(to)) return { sent: false, error: 'No valid phone number on file.' }
  if (!creds()) {
    console.log(`[TWILIO SIMULATOR] SMS → ${to}: ${body.slice(0, 80)}…`)
    return { sent: false, simulated: true }
  }
  if (!process.env.TWILIO_SMS_FROM) return { sent: false, simulated: true, error: 'TWILIO_SMS_FROM not set.' }
  try {
    const sid = await sendVia(process.env.TWILIO_SMS_FROM, to, body)
    return { sent: true, channel: 'sms', sid }
  } catch (err) {
    return { sent: false, error: err?.message }
  }
}

/* WhatsApp message, optionally with media (Twilio allows ONE media per WA message). */
export async function sendWhatsApp(phoneE164, body, mediaUrls = []) {
  const to = String(phoneE164 || '').trim()
  if (!validTo(to)) return { sent: false, error: 'No valid phone number on file.' }
  if (!creds()) {
    console.log(`[TWILIO SIMULATOR] WhatsApp → ${to}: ${body.slice(0, 80)}…`)
    return { sent: false, simulated: true }
  }
  if (!process.env.TWILIO_WHATSAPP_FROM) {
    return { sent: false, simulated: true, error: 'TWILIO_WHATSAPP_FROM not set (WhatsApp sender needs Meta verification).' }
  }
  try {
    const sid = await sendVia(process.env.TWILIO_WHATSAPP_FROM, `whatsapp:${to}`, body, mediaUrls.slice(0, 1))
    return { sent: true, channel: 'whatsapp', sid }
  } catch (err) {
    return { sent: false, error: err?.message }
  }
}

/* The SMS text a guest receives (SMS can't carry images — codes + link). */
export function passMessage({ partyName, members, siteUrl }) {
  const lines = members.map((m) => `• ${m.fullName}${m.tableName ? ` — ${m.tableName} Table` : ''}: ${m.inviteCode}`)
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
