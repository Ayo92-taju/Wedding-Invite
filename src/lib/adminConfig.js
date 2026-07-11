/*
 * Admin allowlist for the /admin dashboard UI.
 * ⚠️ KEEP THIS IN SYNC with isAdmin() in firestore.rules — the rules are what
 * actually enforce access; this list only gates what the UI shows.
 * Confirmed by the couple (2026-07-10) as their real Google accounts.
 */
export const ADMIN_EMAILS = ['momohvictor62@gmail.com', 'ayolat16@gmail.com']

export function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
