/*
 * Phone normalization to E.164. Defaults to Nigeria (+234) for local numbers.
 * Guests may enter numbers as 0803…, 803…, 234803…, +234803…, or with spaces/
 * dashes/parentheses — all resolve to +234XXXXXXXXXX.
 */
const DIAL = { NG: '234' }

export function toE164(raw, defaultCountry = 'NG') {
  if (raw == null) return ''
  let s = String(raw).trim()
  if (!s) return ''
  // "00" international prefix → "+"
  if (s.startsWith('00')) s = `+${s.slice(2)}`
  const hadPlus = s.startsWith('+')
  const digits = s.replace(/\D/g, '')
  if (!digits) return ''
  if (hadPlus) return `+${digits}`

  const cc = DIAL[defaultCountry] || DIAL.NG
  if (digits.startsWith(cc)) return `+${digits}`
  // strip local trunk zero(s), then prepend the country code
  const local = digits.replace(/^0+/, '')
  return `+${cc}${local}`
}

// Basic E.164 shape check: +, leading non-zero, 8–15 digits total.
export function isValidE164(s) {
  return /^\+[1-9]\d{7,14}$/.test(String(s || ''))
}
