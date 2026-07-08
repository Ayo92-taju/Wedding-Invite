/*
 * Guest-list import: turns raw spreadsheet rows into an import "plan" of
 * parties + per-person guest docs. Pure logic (no Firestore, no xlsx) so it can
 * be unit-tested and previewed before anything is written.
 *
 * Expected columns (header names are matched loosely, case-insensitive):
 *   Full Name · Phone · Email · Total Seats
 * One row with Total Seats = 3 → 1 party + 1 primary guest + 2 placeholder
 * plus-one guests, all sharing a partyId.
 */
import { toE164, isValidE164 } from './phone.js'
import { makeInviteCode, randomId } from './codes.js'

const HEADER_ALIASES = {
  fullname: 'fullName',
  name: 'fullName',
  'full name': 'fullName',
  guest: 'fullName',
  'guest name': 'fullName',
  phone: 'phone',
  'phone number': 'phone',
  mobile: 'phone',
  tel: 'phone',
  telephone: 'phone',
  whatsapp: 'phone',
  email: 'email',
  'email address': 'email',
  'e mail': 'email',
  mail: 'email',
  seats: 'seats',
  'total seats': 'seats',
  'allowed seats': 'seats',
  'seat count': 'seats',
  'number of seats': 'seats',
  'no of seats': 'seats',
}

export function normalizeHeader(h) {
  const key = String(h || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
  return HEADER_ALIASES[key] || null
}

/*
 * rows: array of plain objects keyed by the sheet's original headers.
 * Returns { parties: [{ partyId, party, guests[] }], warnings[], stats }.
 */
export function buildImportPlan(rows, opts = {}) {
  const defaultCountry = opts.defaultCountry || 'NG'
  const taken = new Set(opts.existingCodes || [])
  const parties = []
  const warnings = []
  let totalGuests = 0

  ;(rows || []).forEach((row, idx) => {
    const rec = {}
    for (const k of Object.keys(row)) {
      const nk = normalizeHeader(k)
      if (nk && rec[nk] == null) rec[nk] = row[k]
    }

    const rowNo = idx + 2 // +1 for the header row, +1 for 1-based
    const fullName = String(rec.fullName ?? '').trim()
    if (!fullName) {
      warnings.push(`Row ${rowNo}: missing name — skipped.`)
      return
    }

    const rawPhone = String(rec.phone ?? '').trim()
    const phone = rawPhone ? toE164(rawPhone, defaultCountry) : ''
    if (rawPhone && !isValidE164(phone)) {
      warnings.push(`Row ${rowNo} (${fullName}): phone “${rawPhone}” couldn’t be normalised.`)
    }
    const email = String(rec.email ?? '').trim().toLowerCase()

    const seatsRaw = String(rec.seats ?? '').trim()
    let seats = Math.floor(Number(rec.seats))
    if (!Number.isFinite(seats) || seats < 1) {
      if (seatsRaw) warnings.push(`Row ${rowNo} (${fullName}): seats “${seatsRaw}” invalid — defaulted to 1.`)
      seats = 1
    } else if (seats > 20) {
      warnings.push(`Row ${rowNo} (${fullName}): ${seats} seats — unusually large, please confirm.`)
    }

    const partyId = randomId('pty')
    const guests = [
      {
        inviteCode: makeInviteCode(fullName, taken),
        partyId,
        isPrimary: true,
        fullName,
        phone,
        email,
        rsvpStatus: 'PENDING',
        tableId: null,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      },
    ]
    for (let i = 1; i < seats; i += 1) {
      guests.push({
        inviteCode: makeInviteCode(fullName, taken),
        partyId,
        isPrimary: false,
        fullName: `Guest of ${fullName}`,
        phone: '',
        email: '',
        rsvpStatus: 'PENDING',
        tableId: null,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
      })
    }

    totalGuests += guests.length
    parties.push({
      partyId,
      party: {
        partyName: seats > 1 ? `${fullName} & Party` : fullName,
        primaryContactPhone: phone,
        primaryContactEmail: email,
        allowedSeats: seats,
        confirmedSeats: 0,
      },
      guests,
    })
  })

  return { parties, warnings, stats: { parties: parties.length, guests: totalGuests } }
}
