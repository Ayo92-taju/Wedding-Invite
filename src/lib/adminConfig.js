/*
 * Admin allowlist for the /admin dashboard UI.
 * ⚠️ KEEP THIS IN SYNC with isAdmin() in firestore.rules — the rules are what
 * actually enforce write access; this list only gates what the UI shows.
 * Update both to the couple/planner's real Google account email(s).
 */
export const ADMIN_EMAILS = ['momohvictor62@gmail.com', 'ayolat16@gmail.com']

export function isAdminEmail(email) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
