import { couple, wedding } from '@/data/content'

/*
 * Email templates matching the site (ivory / burgundy / gold).
 * Web-safe serif fonts only — custom webfonts don't render reliably in email.
 */

const C = {
  cream: '#f7f1e6',
  ivory: '#fffdf8',
  paper: '#fbf6ec',
  gold: '#a9762e',
  goldDeep: '#8a5f22',
  burgundy: '#6a1b2c',
  rose: '#a4615d',
  sage: '#6f7f5e',
  ink: '#4a3f37',
  inkSoft: '#7c7065',
}

function shell(preheader: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${couple.nameOne} &amp; ${couple.nameTwo}</title>
  </head>
  <body style="margin:0;padding:0;background:${C.cream};font-family:Georgia,'Times New Roman',serif;color:${C.ink};">
    <span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:28px 12px;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.ivory};border:1px solid rgba(169,118,46,0.35);border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(74,63,55,0.10);">
          <tr><td style="height:6px;background:linear-gradient(90deg,${C.burgundy},${C.gold},${C.sage});"></td></tr>
          <tr><td style="padding:34px 40px 10px;text-align:center;">
            <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.gold};">${couple.tagline}</div>
            <div style="font-size:40px;color:${C.burgundy};margin:10px 0 4px;font-family:'Palatino Linotype','Book Antiqua',Georgia,serif;font-style:italic;">${couple.nameOne} <span style="color:${C.goldDeep};font-size:24px;">&amp;</span> ${couple.nameTwo}</div>
            <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${C.inkSoft};">${wedding.dayShort}</div>
          </td></tr>
          ${inner}
          <tr><td style="background:${C.paper};padding:22px 40px;text-align:center;border-top:1px solid rgba(169,118,46,0.25);">
            <div style="font-size:12px;color:${C.inkSoft};font-style:italic;">With all our love,</div>
            <div style="font-size:22px;color:${C.burgundy};font-family:'Palatino Linotype','Book Antiqua',Georgia,serif;font-style:italic;">${couple.nameOne} &amp; ${couple.nameTwo}</div>
          </td></tr>
        </table>
        <div style="font-size:11px;color:${C.inkSoft};margin-top:16px;letter-spacing:1px;">${wedding.dayShort} · ${couple.hashtag}</div>
      </td></tr>
    </table>
  </body>
</html>`
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.gold};width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:15px;color:${C.ink};">${value}</td>
  </tr>`
}

function qrImg(code: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&color=3a1420&bgcolor=fdfaf3&data=${encodeURIComponent(code)}`
}

export type ConfirmedMember = { fullName: string; inviteCode: string; tableName?: string | null }

/*
 * Party RSVP confirmation — sent to the primary guest. Lists every confirmed
 * member with their personal QR pass; each person is scanned in individually.
 */
export function partyConfirmationEmail(p: {
  primaryName: string
  members: ConfirmedMember[]
  declined?: boolean
}): { subject: string; html: string } {
  const first = p.primaryName.split(' ')[0] || p.primaryName

  if (p.declined || p.members.length === 0) {
    const inner = `
      <tr><td style="padding:16px 40px 30px;text-align:center;">
        <p style="font-size:16px;line-height:1.6;margin:0 0 6px;">Dearest ${first},</p>
        <p style="font-size:15px;line-height:1.7;color:${C.inkSoft};font-style:italic;margin:0;">
          Thank you for letting us know you can’t join us. You’ll be in our hearts on the day —
          and in our prayers as we tie our threefold cord.
        </p>
      </td></tr>`
    return {
      subject: `We’ll miss you — ${couple.nameOne} & ${couple.nameTwo}`,
      html: shell('Thank you for your reply.', inner),
    }
  }

  const passes = p.members
    .map(
      (m) => `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:12px auto 0;background:${C.paper};border:1px solid rgba(169,118,46,0.4);border-radius:12px;">
        <tr><td style="padding:20px 26px;text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.gold};margin-bottom:4px;">Entry Pass</div>
          <div style="font-size:19px;color:${C.burgundy};font-family:'Palatino Linotype','Book Antiqua',Georgia,serif;">${m.fullName}</div>
          <div style="font-size:12px;color:${C.inkSoft};margin:2px 0 12px;">${m.tableName ? `Table ${m.tableName}` : 'Table to be advised'}</div>
          <img src="${qrImg(m.inviteCode)}" width="180" height="180" alt="Entry pass QR for ${m.fullName}" style="display:block;margin:0 auto;border-radius:8px;background:${C.ivory};" />
          <div style="font-family:'Courier New',monospace;font-size:14px;letter-spacing:3px;color:${C.ink};margin-top:12px;">${m.inviteCode}</div>
        </td></tr>
      </table>`,
    )
    .join('')

  const inner = `
    <tr><td style="padding:14px 40px 0;text-align:center;">
      <p style="font-size:16px;line-height:1.6;margin:0 0 6px;">Dearest ${first},</p>
      <p style="font-size:15px;line-height:1.7;color:${C.inkSoft};font-style:italic;margin:0 0 8px;">
        Your ${p.members.length > 1 ? 'seats are' : 'seat is'} saved. Each guest below has their own
        entry pass — please have it ready (on a phone or printed) at the gate.
      </p>
    </td></tr>
    <tr><td style="padding:14px 40px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRow('The Day', `${wedding.dateLong}, ${wedding.year}`)}
        ${detailRow('The Hour', wedding.ceremony.time)}
        ${detailRow('The Venue', `${wedding.ceremony.venue} — ${wedding.ceremony.address}`)}
        ${detailRow('Attire', `${wedding.dressCode.text} · Colours of the day: ${couple.coloursOfDay}`)}
      </table>
    </td></tr>
    <tr><td style="padding:8px 40px 30px;">${passes}</td></tr>`

  return {
    subject: `Your ${p.members.length > 1 ? 'passes' : 'pass'} for the garden 🌿 — ${couple.nameOne} & ${couple.nameTwo}`,
    html: shell('Your RSVP is confirmed — your entry passes are inside.', inner),
  }
}

export function broadcastEmail(g: {
  name: string
  title: string
  message: string
  type?: string
}): { subject: string; html: string } {
  const inner = `
    <tr><td style="padding:16px 40px 8px;">
      <p style="font-size:16px;color:${C.ink};margin:0 0 4px;">Dear ${g.name.split(' ')[0] || g.name},</p>
      <p style="font-size:18px;color:${C.burgundy};font-weight:bold;margin:6px 0 12px;">${g.title}</p>
      <div style="font-size:15px;line-height:1.7;color:${C.ink};white-space:pre-line;">${g.message}</div>
    </td></tr>
    <tr><td style="padding:6px 40px 28px;"></td></tr>`

  return {
    subject: `${g.title} — ${couple.nameOne} & ${couple.nameTwo}`,
    html: shell(g.title, inner),
  }
}
