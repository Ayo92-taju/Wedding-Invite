/*
 * Scan-input parsing. Passes encode the BARE invite code today, but if the QR
 * is ever switched to a verification URL (see qrValueFor in inviteCard.js),
 * the scanner keeps working: it accepts ?c=CODE / ?code=CODE or a trailing
 * path segment too.
 */
export function extractCode(raw) {
  const s = String(raw || '').trim()
  if (!s) return ''
  try {
    const url = new URL(s)
    const q = url.searchParams.get('c') || url.searchParams.get('code')
    if (q) return q.trim().toUpperCase()
    const seg = url.pathname.split('/').filter(Boolean).pop()
    return (seg || '').trim().toUpperCase()
  } catch {
    return s.toUpperCase()
  }
}
