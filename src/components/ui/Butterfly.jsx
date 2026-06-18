import { useId } from 'react'
import './Butterfly.css'

/*
 * A lifelike butterfly. Each wing has two membranes (fore + hind), radiating
 * veins, a darker patterned border, an eyespot and a soft sheen — drawn once
 * for the right side and mirrored for the left so both halves match exactly.
 * The two wing groups hinge at the body and flap with a quick down / dwell-open
 * cadence, like a butterfly resting on a flower.
 *
 * `variant` picks a species-like palette; `flapDuration` lets callers vary the
 * wingbeat so a group of butterflies never beats in unison.
 */
const SPECIES = {
  blush: { foreA: '#f7e0db', foreB: '#e7b6b0', hindA: '#fbeae6', hindB: '#efc9c3', border: '#a4615d', vein: '#8a4a47', spot: '#fffaf8', eye: '#c9a227', body: '#5f4440' },
  rose: { foreA: '#eebfb9', foreB: '#cf8782', hindA: '#f2d1cc', hindB: '#dd9d97', border: '#8f4f4b', vein: '#723e3b', spot: '#fff4f1', eye: '#c9a227', body: '#553b38' },
  sage: { foreA: '#d6e0c8', foreB: '#aebd9d', hindA: '#e0e7d6', hindB: '#bccaa9', border: '#677a55', vein: '#4d5c3d', spot: '#fdfcf5', eye: '#c9a227', body: '#4c5839' },
  gold: { foreA: '#f3e7bd', foreB: '#ddc278', hindA: '#f7efcc', hindB: '#e6d091', border: '#9c7c18', vein: '#79600f', spot: '#fffdf2', eye: '#a4615d', body: '#6d5826' },
}

export default function Butterfly({
  size = 34,
  variant = 'blush',
  flapDuration,
  className = '',
  style,
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const s = SPECIES[variant] || SPECIES.blush

  // The right-hand wing — mirrored on the left. Body sits at x = 50.
  const Wing = (
    <>
      {/* forewing + hindwing membranes */}
      <path
        d="M50 41 C52 29 60 16 73 12 C84 9 92 18 88 30 C85 40 69 46 56 45 C52 44 50 44 50 41 Z"
        fill={`url(#bf-fore-${uid})`}
        stroke={s.border}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M50 47 C61 47 79 50 82 60 C85 71 73 80 63 76 C55 73 52 60 50 53 C50 51 50 49 50 47 Z"
        fill={`url(#bf-hind-${uid})`}
        stroke={s.border}
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      {/* radiating veins */}
      <g stroke={s.vein} strokeWidth="0.55" opacity="0.45" fill="none" strokeLinecap="round">
        <path d="M52 41 L79 17" />
        <path d="M52 42 L87 28" />
        <path d="M52 43 L75 41" />
        <path d="M52 49 L80 60" />
        <path d="M52 50 L70 74" />
        <path d="M52 51 L62 75" />
      </g>
      {/* iridescent sheen near the wing root */}
      <ellipse cx="63" cy="29" rx="8" ry="4.5" fill="#ffffff" opacity="0.2" />
      {/* patterned border spots + a hindwing eyespot */}
      <circle cx="79" cy="22" r="2" fill={s.spot} />
      <circle cx="84" cy="29" r="1.3" fill={s.spot} />
      <circle cx="74" cy="16" r="1" fill={s.border} />
      <circle cx="70" cy="64" r="3.1" fill={s.border} />
      <circle cx="70" cy="64" r="1.5" fill={s.eye} />
      <circle cx="65" cy="73" r="1.1" fill={s.spot} />
    </>
  )

  return (
    <span
      className={`butterfly ${className}`}
      style={{ width: size, height: size, '--flap': flapDuration ? `${flapDuration}s` : undefined, ...style }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <linearGradient id={`bf-fore-${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={s.foreA} />
            <stop offset="1" stopColor={s.foreB} />
          </linearGradient>
          <linearGradient id={`bf-hind-${uid}`} x1="0" y1="0.1" x2="0.9" y2="1">
            <stop offset="0" stopColor={s.hindA} />
            <stop offset="1" stopColor={s.hindB} />
          </linearGradient>
          <linearGradient id={`bf-body-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={s.body} />
            <stop offset="0.45" stopColor={s.vein} />
            <stop offset="1" stopColor={s.body} />
          </linearGradient>
        </defs>

        {/* wings (mirrored), drawn behind the body */}
        <g className="butterfly__wing butterfly__wing--r">{Wing}</g>
        <g transform="translate(100 0) scale(-1 1)">
          <g className="butterfly__wing butterfly__wing--l">{Wing}</g>
        </g>

        {/* body: head · thorax · segmented abdomen */}
        <g>
          <ellipse cx="50" cy="57" rx="2.4" ry="15.5" fill={`url(#bf-body-${uid})`} />
          <g stroke={s.body} strokeWidth="0.5" opacity="0.55">
            <line x1="48" y1="50" x2="52" y2="50" />
            <line x1="48" y1="55" x2="52" y2="55" />
            <line x1="48" y1="60" x2="52" y2="60" />
            <line x1="48.4" y1="65" x2="51.6" y2="65" />
          </g>
          <ellipse cx="50" cy="41" rx="3.3" ry="6" fill={s.body} />
          <circle cx="50" cy="31" r="2.8" fill={s.body} />
          {/* antennae with clubbed tips */}
          <path
            d="M50 30 C45 24 41 20 38 13 M50 30 C55 24 59 20 62 13"
            stroke={s.body}
            strokeWidth="0.9"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx="38" cy="12.5" r="1.7" fill={s.body} />
          <circle cx="62" cy="12.5" r="1.7" fill={s.body} />
        </g>
      </svg>
    </span>
  )
}
