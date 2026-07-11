/*
 * Invite card renderer — the "Ivory Garden" guest pass.
 *
 * Draws a personalised pass (name · table · unique QR) onto a canvas and hands
 * back a canvas / PNG blob / download. Browser-only (uses canvas + document.fonts).
 *
 * The QR encodes the guest's BARE inviteCode (not a URL): the live domain isn't
 * finalised, and a wrong domain baked into a downloaded/printed pass can't be
 * recalled. The scanner reads the code directly. `qrValueFor()` is the single
 * place to change this if we later want a verification URL.
 *
 * The three-strand cord motif is deliberately absent for now (client's call) —
 * a gold hairline + diamond stands in its place. See docs/ mockup.
 */
import QRCode from 'qrcode'
import { couple, wedding } from '../../data/content.js'

export const CARD_W = 1000
export const CARD_H = 1400

const C = {
  ivoryTop: '#fffdf8',
  ivoryBottom: '#f6efe0',
  gold: '#a9762e',
  goldFaint: 'rgba(169, 118, 46, 0.40)',
  goldHair: 'rgba(169, 118, 46, 0.16)',
  burgundy: '#6a1b2c',
  ink: '#4a3b36',
  muted: '#8a6a52',
  qrDark: '#3a1420',
  qrLight: '#fdfaf3',
}

const FONTS = [
  '400 20px Cinzel',
  '600 20px Cinzel',
  '300 40px "Cormorant Garamond"',
  '500 40px "Cormorant Garamond"',
  'italic 400 40px "Cormorant Garamond"',
  '400 20px Inter',
]

/* What the QR actually contains. */
export function qrValueFor(inviteCode) {
  return String(inviteCode || '')
}

async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all(FONTS.map((f) => document.fonts.load(f)))
    await document.fonts.ready
  } catch {
    /* fall back to system serif rather than failing the render */
  }
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/* Letter-spaced text (ctx.letterSpacing isn't universally supported). */
function drawSpaced(ctx, text, cx, y, spacing, align = 'center') {
  const chars = [...String(text)]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1)
  let x = align === 'center' ? cx - total / 2 : cx
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i] + spacing
  })
  return total
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/)
  const lines = []
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = w
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines
}

/* Paper-grain dots, matching the site's .paper-texture. */
function drawTexture(ctx) {
  ctx.save()
  ctx.fillStyle = 'rgba(80, 40, 20, 0.055)'
  for (let y = 0; y < CARD_H; y += 20) {
    for (let x = 0; x < CARD_W; x += 20) {
      ctx.beginPath()
      ctx.arc(x, y, 1.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

/* Gold hairline with a small centred diamond — stands in for the cord. */
function drawDivider(ctx, cx, y, width) {
  const half = width / 2
  const gap = 22
  const grad = ctx.createLinearGradient(cx - half, 0, cx + half, 0)
  grad.addColorStop(0, 'rgba(169,118,46,0)')
  grad.addColorStop(0.5, 'rgba(169,118,46,0.7)')
  grad.addColorStop(1, 'rgba(169,118,46,0)')
  ctx.save()
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(cx - half, y)
  ctx.lineTo(cx - gap, y)
  ctx.moveTo(cx + gap, y)
  ctx.lineTo(cx + half, y)
  ctx.stroke()
  ctx.fillStyle = C.gold
  ctx.translate(cx, y)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-5, -5, 10, 10)
  ctx.restore()
}

/*
 * guest: { fullName, inviteCode, tableName? }
 * Returns an HTMLCanvasElement.
 */
export async function renderInviteCardCanvas(guest) {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = CARD_W
  canvas.height = CARD_H
  const ctx = canvas.getContext('2d')
  const cx = CARD_W / 2

  // Ground
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H)
  bg.addColorStop(0, C.ivoryTop)
  bg.addColorStop(1, C.ivoryBottom)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, CARD_W, CARD_H)
  drawTexture(ctx)

  // Double gold frame
  ctx.strokeStyle = C.goldFaint
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(36, 36, CARD_W - 72, CARD_H - 72, 10)
  ctx.stroke()
  ctx.strokeStyle = C.goldHair
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(46, 46, CARD_W - 92, CARD_H - 92, 6)
  ctx.stroke()

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Eyebrow
  ctx.fillStyle = C.gold
  ctx.font = '400 20px Cinzel, serif'
  drawSpaced(ctx, 'THE WEDDING OF', cx, 150, 6)

  // Names
  ctx.fillStyle = C.burgundy
  ctx.textAlign = 'center'
  ctx.font = '500 78px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(couple.heroNameOne, cx, 250)
  ctx.font = 'italic 400 46px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('&', cx, 315)
  ctx.font = '500 78px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(couple.nameTwo, cx, 388)

  // Theme
  ctx.textAlign = 'left'
  ctx.fillStyle = C.gold
  ctx.font = '400 19px Cinzel, serif'
  drawSpaced(ctx, couple.tagline.toUpperCase(), cx, 440, 5)

  drawDivider(ctx, cx, 492, 520)

  // Facts
  const when = `${wedding.dayShort} · ${wedding.ceremony.time}`
  ctx.fillStyle = C.gold
  ctx.font = '400 16px Cinzel, serif'
  drawSpaced(ctx, 'WHEN', cx, 560, 5)
  ctx.textAlign = 'center'
  ctx.fillStyle = C.ink
  ctx.font = '400 30px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(when, cx, 604)

  ctx.textAlign = 'left'
  ctx.fillStyle = C.gold
  ctx.font = '400 16px Cinzel, serif'
  drawSpaced(ctx, 'WHERE', cx, 668, 5)
  ctx.textAlign = 'center'
  ctx.fillStyle = C.ink
  ctx.font = '400 30px "Cormorant Garamond", Georgia, serif'
  const venueLines = wrapText(ctx, wedding.ceremony.venue, CARD_W - 220)
  let vy = 712
  for (const line of venueLines) {
    ctx.fillText(line, cx, vy)
    vy += 38
  }
  ctx.font = '400 23px "Cormorant Garamond", Georgia, serif'
  ctx.fillStyle = C.muted
  for (const line of wrapText(ctx, wedding.ceremony.address, CARD_W - 220)) {
    ctx.fillText(line, cx, vy)
    vy += 30
  }

  // ── Admit block + QR ──
  const padX = 90
  const qrSize = 250
  const qrX = CARD_W - padX - qrSize
  const qrY = 1000

  const qrUrl = await QRCode.toDataURL(qrValueFor(guest.inviteCode), {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: qrSize * 2,
    color: { dark: C.qrDark, light: C.qrLight },
  })
  const qrImg = await loadImage(qrUrl)

  ctx.save()
  ctx.fillStyle = C.qrLight
  ctx.beginPath()
  ctx.roundRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 12)
  ctx.fill()
  ctx.strokeStyle = C.goldFaint
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.restore()
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)

  ctx.textAlign = 'left'
  ctx.fillStyle = C.gold
  ctx.font = '400 16px Cinzel, serif'
  drawSpaced(ctx, 'ADMIT ONE', padX, 1046, 5, 'left')

  ctx.fillStyle = C.burgundy
  ctx.font = '500 46px "Cormorant Garamond", Georgia, serif'
  const nameLines = wrapText(ctx, guest.fullName || 'Guest', qrX - padX - 40)
  let ny = 1104
  for (const line of nameLines.slice(0, 2)) {
    ctx.fillText(line, padX, ny)
    ny += 50
  }

  ctx.fillStyle = C.ink
  ctx.font = '400 28px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(guest.tableName ? `Table ${guest.tableName}` : 'Table to be advised', padX, ny + 8)

  // Footer: invite code + hashtag
  ctx.fillStyle = C.muted
  ctx.font = '400 20px Inter, sans-serif'
  drawSpaced(ctx, String(guest.inviteCode || ''), padX, 1300, 4, 'left')
  ctx.font = '400 18px Inter, sans-serif'
  drawSpaced(ctx, couple.hashtag, padX, 1338, 3, 'left')

  return canvas
}

export async function renderInviteCardBlob(guest) {
  const canvas = await renderInviteCardCanvas(guest)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export async function downloadInviteCard(guest) {
  const blob = await renderInviteCardBlob(guest)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${String(guest.fullName || 'guest').trim().replace(/\s+/g, '-')}-${guest.inviteCode}.png`
  a.click()
  URL.revokeObjectURL(url)
}
