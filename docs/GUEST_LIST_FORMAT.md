# Guest list — spreadsheet format

This is the format the **Import** tab at `/admin/guests` expects. Save as **`.csv`** or
**`.xlsx`** — both work. Only the **first sheet** is read.

A ready-to-fill template lives at **`docs/guest-list-template.csv`** (open it in Excel or
Google Sheets, delete the example rows, and add your guests).

---

## Columns

| Column | Required | What it's for |
|---|---|---|
| **Full Name** | ✅ Yes | The main invitee. Rows with no name are skipped. |
| **Phone** | Strongly recommended | How the guest finds their invite, and where their pass is sent (WhatsApp/SMS via Twilio). |
| **Email** | Optional | Alternate way to look up their invite; email fallback for their pass. |
| **Total Seats** | ✅ Yes* | How many people this invitation admits **in total, including the main invitee**. |
| **Plus One Names** | Optional | Names of the companions, if you already know them. Separate with commas or semicolons. |
| **Party Name** | Optional | Overrides the auto-generated household name (e.g. `The Okoro Family`). |
| **Notes** | Optional | Anything for your own reference — dietary needs, relationship, access needs. |

\* If you leave **Total Seats** blank but list **Plus One Names**, seats are worked out for you
(1 + the number of names).

Header names are matched loosely and case-insensitively, so `NAME`, `Phone Number`, `E-mail`,
`No of Seats`, `Plus Ones`, `Remarks` etc. all work. Column order doesn't matter. Extra columns
you add are ignored.

---

## How a row becomes guests

**One row = one party (household).** The import creates a party, plus **one guest record per
seat** — each with their own unique QR code and invite code.

`Victor Momoh · 3 seats · Plus One Names: "Adaeze Balogun, Chidi Balogun"` becomes:

| | Guest | Invite code |
|---|---|---|
| ★ primary | Victor Momoh | `VMO-4Z4M` |
| | Adaeze Balogun | `ABA-63N5` |
| | Chidi Balogun | `CBA-5EAN` |

If you **don't** know the companions, leave **Plus One Names** blank:

`Kunle Adeyemi · 2 seats` becomes:

| | Guest | Invite code |
|---|---|---|
| ★ primary | Kunle Adeyemi | `KAD-UCTZ` |
| | *Guest of Kunle Adeyemi* | `KAD-BRKC` |

The placeholder is filled in by Kunle himself when he RSVPs — he types his companion's name
and the pass is generated for them on the spot.

---

## Phone numbers

Type them however you like — they're standardised to international format automatically
(Nigeria `+234` is assumed when no country code is given):

| You type | Stored as |
|---|---|
| `08031234567` | `+2348031234567` |
| `0803 123 4567` | `+2348031234567` |
| `(0809) 555 1212` | `+2348095551212` |
| `8021112222` | `+2348021112222` |
| `+2348090001111` | `+2348090001111` |
| `+44 7700 900123` | `+447700900123` |

Anything that can't be made into a valid number is **flagged as a warning** in the preview —
the row still imports, so you can fix it afterwards.

> **Leading zeros.** Excel and Google Sheets like to turn `08031234567` into the number
> `8031234567`, dropping the leading `0`. The importer handles this correctly either way — but
> if you want them to *look* right in your sheet, format the **Phone** column as **Text** before
> typing. (The `.xlsx` template already does this.)

---

## Before you import

Nothing is written to the database until you press **Commit**. The preview shows you the
parties, the seat counts, every generated invite code, and a list of warnings — for example:

- `Row 5: missing name — skipped.`
- `Row 7 (Bad Data): phone “12” couldn't be normalised.`
- `Row 6 (Tunde Bello): 3 companion name(s) but only 1 extra seat(s) — extras ignored.`

There's a **"Wipe all existing parties & guests first"** checkbox for a clean re-import.

## Things that are *not* in the spreadsheet

- **Table assignments.** Create your tables in the **Tables** tab first, then seat parties in
  the app. (Seating is Phase F.)
- **QR codes / invite cards.** Generated automatically — never enter these by hand.
- **RSVP status.** Everyone starts as `PENDING`; guests set it themselves.

---

## Example

```csv
Full Name,Phone,Email,Total Seats,Plus One Names,Party Name,Notes
Victor Momoh,08031234567,victor@example.com,3,"Adaeze Balogun, Chidi Balogun",,Groom's family
Aunty Bisi Adeyemi,0802 111 2222,,3,"Uncle Sola Adeyemi; Tomi Adeyemi",,
Kunle Adeyemi,+2348090001111,kunle@example.com,2,,,Bringing a guest — name TBC
Grace Okoro,08055556666,grace@example.com,1,,The Okoro Family,Vegetarian
```

> Note: when a cell contains a comma (like a list of names), wrap it in double quotes — Excel
> and Google Sheets do this for you automatically when you export to CSV.
