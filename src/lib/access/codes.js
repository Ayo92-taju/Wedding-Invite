/*
 * Human-readable, collision-resistant codes for the access-control system.
 * Alphabet excludes easily-confused characters (0/O, 1/I/L).
 */
const ALNUM = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function rand(n) {
  let s = ''
  for (let i = 0; i < n; i += 1) s += ALNUM[Math.floor(Math.random() * ALNUM.length)]
  return s
}

function initialsOf(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  const ini = parts
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
  return (ini || 'GST').slice(0, 3).padEnd(3, 'X')
}

/*
 * Guest invite code, e.g. "VMO-8K3Q". Doubles as the QR value + the doc id in
 * the `guests` collection. Pass a `taken` Set to guarantee uniqueness within a
 * batch (existing codes can be pre-seeded into it).
 */
export function makeInviteCode(fullName, taken) {
  const prefix = initialsOf(fullName)
  let code
  do {
    code = `${prefix}-${rand(4)}`
  } while (taken && taken.has(code))
  if (taken) taken.add(code)
  return code
}

/* A random document id, e.g. "pty-8K3QMN2P". */
export function randomId(prefix = 'id', n = 10) {
  return `${prefix}-${rand(n)}`
}
