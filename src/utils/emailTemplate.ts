import { couple, wedding } from '@/data/content'

/*
 * Floral, single-event email templates (blush / sage / gold) matching the site.
 * Uses web-safe serif fonts since custom webfonts don't render reliably in email.
 */

const C = {
  cream: '#f7f1e6',
  ivory: '#fffdf8',
  paper: '#fbf6ec',
  gold: '#c9a227',
  goldDeep: '#9c7c18',
  blush: '#e7b6b0',
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
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.ivory};border:1px solid rgba(201,162,39,0.35);border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(74,63,55,0.10);">
          <tr><td style="height:6px;background:linear-gradient(90deg,${C.blush},${C.gold},${C.sage});"></td></tr>
          <tr><td style="padding:34px 40px 10px;text-align:center;">
            <div style="font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${C.sage};">Love in Full Bloom</div>
            <div style="font-size:40px;color:${C.rose};margin:10px 0 4px;font-family:'Palatino Linotype','Book Antiqua',Georgia,serif;font-style:italic;">${couple.nameOne} <span style="color:${C.goldDeep};font-size:24px;">&amp;</span> ${couple.nameTwo}</div>
            <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${C.inkSoft};">${wedding.dayShort}</div>
          </td></tr>
          ${inner}
          <tr><td style="background:${C.paper};padding:22px 40px;text-align:center;border-top:1px solid rgba(201,162,39,0.25);">
            <div style="font-size:12px;color:${C.inkSoft};font-style:italic;">With all our love,</div>
            <div style="font-size:22px;color:${C.rose};font-family:'Palatino Linotype','Book Antiqua',Georgia,serif;font-style:italic;">${couple.nameOne} &amp; ${couple.nameTwo}</div>
          </td></tr>
        </table>
        <div style="font-size:11px;color:${C.inkSoft};margin-top:16px;letter-spacing:1px;">${couple.tagline} · Made with love, in full bloom.</div>
      </td></tr>
    </table>
  </body>
</html>`
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.sage};width:140px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;font-size:15px;color:${C.ink};">${value}</td>
  </tr>`
}

export function confirmationEmail(g: {
  name: string
  qrCode: string
  attending?: boolean
  guestsCount?: number
  message?: string
}): { subject: string; html: string } {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&color=4a3f37&bgcolor=fffdf8&data=${encodeURIComponent(g.qrCode)}`
  const shortCode = `NV-${String(g.qrCode).split('-').pop() || 'GUEST'}`
  const admits = Math.max(1, Number(g.guestsCount) || 1)

  const inner = `
    <tr><td style="padding:14px 40px 0;text-align:center;">
      <p style="font-size:16px;line-height:1.6;color:${C.ink};margin:0 0 6px;">Dearest ${g.name.split(' ')[0] || g.name},</p>
      <p style="font-size:15px;line-height:1.7;color:${C.inkSoft};margin:0 0 8px;font-style:italic;">
        Your seat in the garden is saved. We can hardly wait to celebrate with you, surrounded by flowers and everyone we love.
      </p>
    </td></tr>
    <tr><td style="padding:18px 40px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${detailRow('The Day', `${wedding.dateLong}, ${wedding.year}`)}
        ${detailRow('The Hour', `${wedding.ceremony.time}`)}
        ${detailRow('The Garden', `${wedding.ceremony.venue} — ${wedding.ceremony.address}`)}
        ${detailRow('Dress', `${wedding.dressCode.text} · ${wedding.dressCode.detail}`)}
        ${detailRow('Admits', `${admits}`)}
      </table>
    </td></tr>
    <tr><td style="padding:12px 40px 30px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px auto 0;background:${C.paper};border:1px solid rgba(201,162,39,0.4);border-radius:12px;">
        <tr><td style="padding:22px 30px;text-align:center;">
          <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.sage};margin-bottom:12px;">Your Entry Pass</div>
          <img src="${qrUrl}" width="200" height="200" alt="Your floral entry pass QR code" style="display:block;margin:0 auto;border-radius:8px;background:${C.ivory};" />
          <div style="font-family:'Courier New',monospace;font-size:15px;letter-spacing:3px;color:${C.ink};margin-top:14px;">${shortCode}</div>
          <div style="font-size:11px;color:${C.inkSoft};margin-top:6px;">Keep this seal close — it is your welcome into the garden.</div>
        </td></tr>
      </table>
    </td></tr>`

  return {
    subject: `Your seat in the garden is saved 🌸 — ${couple.nameOne} & ${couple.nameTwo}`,
    html: shell('Your RSVP is confirmed — your floral entry pass is inside.', inner),
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
      <p style="font-size:18px;color:${C.rose};font-weight:bold;margin:6px 0 12px;">${g.title}</p>
      <div style="font-size:15px;line-height:1.7;color:${C.ink};white-space:pre-line;">${g.message}</div>
    </td></tr>
    <tr><td style="padding:6px 40px 28px;"></td></tr>`

  return {
    subject: `${g.title} — ${couple.nameOne} & ${couple.nameTwo}`,
    html: shell(g.title, inner),
  }
}
