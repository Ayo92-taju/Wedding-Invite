/*
 * Helpers for posting to Netlify Forms from a React SPA.
 *
 * Netlify detects the hidden static forms in index.html at build time, then
 * accepts url-encoded POSTs to "/" with a matching `form-name`. These calls
 * only succeed on a deployed Netlify site — in local dev the POST will fail
 * harmlessly, so callers should treat a network error as non-fatal.
 */
export function encodeForm(data) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key] ?? '')}`)
    .join('&')
}

export async function submitToNetlify(formName, data) {
  const body = encodeForm({ 'form-name': formName, ...data })
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Netlify form submission failed (${res.status})`)
  return true
}
