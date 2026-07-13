import { ImageResponse } from 'next/og'
import QRCode from 'qrcode'
import { getAdminDb } from '@/lib/server/adminDb.js'
import { googleFont } from '@/lib/server/fonts.js'
import { couple, wedding } from '@/data/content'

export const runtime = 'nodejs'

/*
 * GET /api/pass-image?c=INVITE-CODE → the guest's Ivory Garden pass as a PNG.
 * This is what gets embedded in emails and attached to WhatsApp messages —
 * media senders need a public URL, and the browser-canvas renderer can't
 * provide one. Knowing a code IS holding the pass, so the code is the key.
 */

const C = {
  gold: '#a9762e',
  goldFaint: 'rgba(169,118,46,0.40)',
  goldHair: 'rgba(169,118,46,0.16)',
  burgundy: '#6a1b2c',
  ink: '#4a3b36',
  muted: '#8a6a52',
}

const label = (size = 24, spacing = 6) => ({
  fontFamily: 'Cinzel',
  fontSize: size,
  letterSpacing: spacing,
  color: C.gold,
  display: 'flex',
})

export async function GET(request) {
  const code = (request.nextUrl.searchParams.get('c') || '').trim().toUpperCase()
  if (!code) return new Response('Missing code', { status: 400 })

  const db = getAdminDb()
  if (!db) return new Response('Pass service not configured', { status: 503 })

  const doc = await db.collection('guests').doc(code).get()
  if (!doc.exists) return new Response('Not found', { status: 404 })
  const g = doc.data()

  let tableName = null
  if (g.tableId) {
    const t = await db.collection('tables').doc(g.tableId).get()
    tableName = t.exists ? t.data().tableName : null
  }

  const [qr, cinzel, cormorant, cormorantItalic] = await Promise.all([
    QRCode.toDataURL(code, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 520,
      color: { dark: '#3a1420', light: '#fdfaf3' },
    }),
    googleFont('Cinzel', 400),
    googleFont('Cormorant Garamond', 500),
    googleFont('Cormorant Garamond', 500, true),
  ])

  const card = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'linear-gradient(180deg, #fffdf8 0%, #f6efe0 100%)',
        fontFamily: '"Cormorant Garamond"',
      }}
    >
      {/* Double gold frame */}
      <div style={{ position: 'absolute', top: 36, left: 36, right: 36, bottom: 36, border: `2px solid ${C.goldFaint}`, borderRadius: 10, display: 'flex' }} />
      <div style={{ position: 'absolute', top: 46, left: 46, right: 46, bottom: 46, border: `1px solid ${C.goldHair}`, borderRadius: 6, display: 'flex' }} />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '104px 90px 0', flexGrow: 1 }}>
        <div style={label(24, 7)}>THE WEDDING OF</div>

        <div style={{ display: 'flex', fontSize: 88, fontWeight: 500, color: C.burgundy, marginTop: 26, lineHeight: 1 }}>{couple.heroNameOne}</div>
        <div style={{ display: 'flex', fontSize: 52, fontStyle: 'italic', color: C.burgundy, lineHeight: 1, marginTop: 6 }}>&</div>
        <div style={{ display: 'flex', fontSize: 88, fontWeight: 500, color: C.burgundy, lineHeight: 1, marginTop: 6 }}>{couple.nameTwo}</div>

        <div style={{ ...label(24, 6), marginTop: 30 }}>{couple.tagline.toUpperCase()}</div>

        {/* Divider: hairline · diamond · hairline */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 34, width: 520 }}>
          <div style={{ display: 'flex', flexGrow: 1, height: 2, background: 'linear-gradient(90deg, rgba(169,118,46,0), rgba(169,118,46,0.7))' }} />
          <div style={{ display: 'flex', width: 12, height: 12, margin: '0 18px', background: C.gold, transform: 'rotate(45deg)' }} />
          <div style={{ display: 'flex', flexGrow: 1, height: 2, background: 'linear-gradient(90deg, rgba(169,118,46,0.7), rgba(169,118,46,0))' }} />
        </div>

        <div style={{ ...label(20, 6), marginTop: 40 }}>WHEN</div>
        <div style={{ display: 'flex', fontSize: 38, color: C.ink, marginTop: 12 }}>{`${wedding.dayShort} · ${wedding.ceremony.time}`}</div>

        <div style={{ ...label(20, 6), marginTop: 30 }}>WHERE</div>
        <div style={{ display: 'flex', fontSize: 36, color: C.ink, marginTop: 12, textAlign: 'center' }}>{wedding.ceremony.venue}</div>
        <div style={{ display: 'flex', fontSize: 28, color: C.muted, marginTop: 8, textAlign: 'center' }}>{wedding.ceremony.address}</div>
      </div>

      {/* Admit row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 90px', marginBottom: 36 }}>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 560 }}>
          <div style={label(20, 6)}>ADMIT ONE</div>
          <div style={{ display: 'flex', fontSize: 54, fontWeight: 500, color: C.burgundy, marginTop: 14, lineHeight: 1.1 }}>
            {g.fullName || 'Guest'}
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: C.ink, marginTop: 12 }}>
            {tableName ? `Table ${tableName}` : 'Table to be advised'}
          </div>
        </div>
        <div style={{ display: 'flex', background: '#fdfaf3', borderRadius: 12, border: `2px solid ${C.goldFaint}`, padding: 10 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={250} height={250} alt="" />
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '0 90px 78px' }}>
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 4, color: C.muted }}>{code}</div>
        <div style={{ display: 'flex', fontSize: 21, letterSpacing: 3, color: C.muted, marginTop: 10 }}>{couple.hashtag}</div>
      </div>
    </div>
  )

  return new ImageResponse(card, {
    width: 1000,
    height: 1400,
    fonts: [
      { name: 'Cinzel', data: cinzel, weight: 400, style: 'normal' },
      { name: 'Cormorant Garamond', data: cormorant, weight: 500, style: 'normal' },
      { name: 'Cormorant Garamond', data: cormorantItalic, weight: 500, style: 'italic' },
    ],
    headers: { 'Cache-Control': 'public, max-age=300' },
  })
}
