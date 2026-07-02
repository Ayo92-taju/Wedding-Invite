/*
 * Client helper to trigger the RSVP confirmation email via our API route.
 * Fire-and-forget: never blocks or breaks the RSVP UI if email is down.
 */
export async function sendRsvpConfirmation({ name, email, qrCode, guestsCount, attending, message }) {
  try {
    await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, qrCode, guestsCount, attending, message }),
    })
  } catch (err) {
    console.warn('Confirmation email request failed (non-blocking):', err)
  }
}
