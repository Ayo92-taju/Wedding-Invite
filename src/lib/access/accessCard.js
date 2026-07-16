/*
 * Access card renderer — compact, print-friendly 1050x600 "Ivory Garden" card.
 *
 * Designed to stay visually aligned with the full invite pass while fitting a
 * credit-card style horizontal format for physical printing and quick gate use.
 */
import QRCode from 'qrcode'
import { couple, wedding } from '../../data/content.js'
import { qrValueFor } from './inviteCard.js'

export const ACCESS_CARD_W = 1050
export const ACCESS_CARD_H = 600

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
  '500 20px Cinzel',
  '500 20px "Cormorant Garamond"',
  '500 20px Inter',
]

async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  try {
    await Promise.all(FONTS.map((f) => document.fonts.load(f)))
    await document.fonts.ready
  } catch {
    /* use browser fallbacks if webfonts are unavailable */
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

function drawSpaced(ctx, text, cx, y, spacing, align = 'center') {
  const chars = [...String(text || '')]
  const widths = chars.map((ch) => ctx.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1)
  let x = align === 'center' ? cx - total / 2 : cx
  chars.forEach((ch, i) => {
    ctx.fillText(ch, x, y)
    x += widths[i] + spacing
  })
  return total
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean)
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

function fitNameBlock(ctx, text, maxWidth, { maxLines = 3, startSize = 68, minSize = 42, step = 2 } = {}) {
  for (let size = startSize; size >= minSize; size -= step) {
    ctx.font = `500 ${size}px "Cormorant Garamond", Georgia, serif`
    const lines = wrapText(ctx, text, maxWidth)
    if (lines.length <= maxLines) {
      return { size, lines }
    }
  }

  ctx.font = `500 ${minSize}px "Cormorant Garamond", Georgia, serif`
  return { size: minSize, lines: wrapText(ctx, text, maxWidth).slice(0, maxLines) }
}

function drawTexture(ctx) {
  ctx.save()
  ctx.fillStyle = 'rgba(80, 40, 20, 0.05)'
  for (let y = 0; y < ACCESS_CARD_H; y += 20) {
    for (let x = 0; x < ACCESS_CARD_W; x += 20) {
      ctx.beginPath()
      ctx.arc(x, y, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function drawDivider(ctx, x, top, bottom) {
  const grad = ctx.createLinearGradient(x, top, x, bottom)
  grad.addColorStop(0, 'rgba(169,118,46,0)')
  grad.addColorStop(0.5, 'rgba(169,118,46,0.7)')
  grad.addColorStop(1, 'rgba(169,118,46,0)')

  ctx.save()
  ctx.strokeStyle = grad
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(x, top)
  ctx.lineTo(x, bottom)
  ctx.stroke()
  ctx.fillStyle = C.gold
  ctx.translate(x, (top + bottom) / 2)
  ctx.rotate(Math.PI / 4)
  ctx.fillRect(-5, -5, 10, 10)
  ctx.restore()
}

/*
 * guest: { fullName, inviteCode, tableName? }
 * Returns an HTMLCanvasElement.
 */
export async function renderAccessCardCanvas(guest) {
  await ensureFonts()

  const canvas = document.createElement('canvas')
  canvas.width = ACCESS_CARD_W
  canvas.height = ACCESS_CARD_H
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, 0, ACCESS_CARD_H)
  bg.addColorStop(0, C.ivoryTop)
  bg.addColorStop(1, C.ivoryBottom)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, ACCESS_CARD_W, ACCESS_CARD_H)
  drawTexture(ctx)

  ctx.strokeStyle = C.goldFaint
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(22, 22, ACCESS_CARD_W - 44, ACCESS_CARD_H - 44, 12)
  ctx.stroke()

  ctx.strokeStyle = C.goldHair
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(32, 32, ACCESS_CARD_W - 64, ACCESS_CARD_H - 64, 8)
  ctx.stroke()

  const pad = 56
  const qrSize = 250
  const qrX = ACCESS_CARD_W - pad - qrSize
  const qrY = 152
  const splitX = ACCESS_CARD_W - 350

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = C.gold
  ctx.font = '500 22px Cinzel, serif'
  drawSpaced(ctx, 'WEDDING ACCESS CARD', pad, 79, 5, 'left')

  ctx.fillStyle = C.burgundy
  ctx.font = '700 58px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(couple.heroNameOne, pad, 140)
  ctx.font = 'italic 400 38px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('&', pad + 300, 140)
  ctx.font = '700 58px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(couple.nameTwo, pad + 330, 140)

  ctx.fillStyle = C.ink
  ctx.font = '600 20px Cinzel, serif'
  drawSpaced(ctx, String(couple.tagline || '').toUpperCase(), pad, 180, 3.2, 'left')

  ctx.fillStyle = C.gold
  ctx.font = '600 20px Cinzel, serif'
  drawSpaced(ctx, 'ADMIT ONE', pad, 234, 4.4, 'left')

  ctx.fillStyle = C.burgundy
  const nameBlock = fitNameBlock(ctx, guest.fullName || 'Guest', splitX - pad - 34)
  const lineHeight = Math.round(nameBlock.size * 0.86)
  ctx.font = `700 ${nameBlock.size}px "Cormorant Garamond", Georgia, serif`
  let ny = 294
  for (const line of nameBlock.lines) {
    ctx.fillText(line, pad, ny)
    ny += lineHeight
  }

  ctx.fillStyle = C.ink
  ctx.font = '700 40px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(guest.tableName ? `${guest.tableName} Table` : 'Table to be advised', pad, Math.min(ny, 454))

  ctx.fillStyle = C.ink
  ctx.font = '600 30px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(`${wedding.dayShort} · ${wedding.ceremony.time}`, pad, 482)

  ctx.fillStyle = C.burgundy
  ctx.font = '700 36px "Cormorant Garamond", Georgia, serif'
  const venueShort = wrapText(ctx, wedding.ceremony.venue, splitX - pad - 30).slice(0, 1)
  if (venueShort[0]) ctx.fillText(venueShort[0], pad, 528)

  // ctx.fillStyle = C.muted
  // ctx.font = '500 28px Inter, sans-serif'
  // drawSpaced(ctx, String(guest.inviteCode || ''), pad, 544, 2.8, 'left')

  drawDivider(ctx, splitX, 88, ACCESS_CARD_H - 88)

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

  ctx.textAlign = 'center'
  ctx.fillStyle = C.gold
  ctx.font = '400 16px Cinzel, serif'
  drawSpaced(ctx, 'SCAN AT GATE', qrX + qrSize / 2, 434, 3)

  ctx.fillStyle = C.muted
  ctx.font = '400 18px Inter, sans-serif'
  drawSpaced(ctx, couple.hashtag, qrX + qrSize / 2, 468, 2.2)

  ctx.fillStyle = C.muted
  ctx.font = '600 30px Inter, sans-serif'
  drawSpaced(ctx, String(guest.inviteCode || ''), qrX + qrSize / 2, 510, 3.2)

  return canvas
}

export async function renderAccessCardBlob(guest) {
  const canvas = await renderAccessCardCanvas(guest)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
}

export async function downloadAccessCard(guest) {
  const blob = await renderAccessCardBlob(guest)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${String(guest.fullName || 'guest').trim().replace(/\s+/g, '-')}-${guest.inviteCode}-access.png`
  a.click()
  URL.revokeObjectURL(url)
}
