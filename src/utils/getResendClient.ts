import { Resend } from 'resend'

/*
 * Lazily create the Resend client so a missing key never crashes the app —
 * routes fall back to "simulation" mode (log + return success) when there's
 * no RESEND_API_KEY, which is handy in local dev.
 */
let resendClient: Resend | null = null

export default function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || apiKey === 'dummy_key_to_prevent_startup_crash') {
    console.warn('RESEND_API_KEY is not set — email dispatch is in simulation mode.')
    return null
  }
  if (!resendClient) resendClient = new Resend(apiKey)
  return resendClient
}
