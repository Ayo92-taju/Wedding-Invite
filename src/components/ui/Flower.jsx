/*
 * A reusable, parametric flower — fine-line petals with a soft bloom fill.
 * Used as timeline nodes, accents and decorative blooms throughout the site.
 */

const PALETTES = {
  blush: { petal: '#f4ddd8', petalEdge: '#e7b6b0', line: '#c9a227', core: '#c9a227' },
  rose: { petal: '#e9b7b2', petalEdge: '#c98b86', line: '#a4615d', core: '#a4615d' },
  sage: { petal: '#d8e0cb', petalEdge: '#aebd9d', line: '#6f7f5e', core: '#9c7c18' },
  gold: { petal: '#ecdcae', petalEdge: '#ddc278', line: '#9c7c18', core: '#9c7c18' },
  ivory: { petal: '#fffdf8', petalEdge: '#efe5d3', line: '#c9a227', core: '#c9a227' },
}

export default function Flower({
  size = 80,
  variant = 'blush',
  petals = 6,
  className = '',
  style,
  strokeWidth = 1,
}) {
  const c = PALETTES[variant] || PALETTES.blush
  const outer = Array.from({ length: petals }, (_, i) => (i * 360) / petals)
  const inner = Array.from({ length: petals }, (_, i) => (i * 360) / petals + 180 / petals)

  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Outer ring of petals */}
      <g>
        {outer.map((deg) => (
          <ellipse
            key={`o-${deg}`}
            cx="50"
            cy="27"
            rx="11"
            ry="22"
            fill={c.petal}
            stroke={c.line}
            strokeWidth={strokeWidth}
            transform={`rotate(${deg} 50 50)`}
            opacity="0.95"
          />
        ))}
      </g>
      {/* Inner ring, offset, slightly deeper tone */}
      <g>
        {inner.map((deg) => (
          <ellipse
            key={`i-${deg}`}
            cx="50"
            cy="34"
            rx="7.5"
            ry="15"
            fill={c.petalEdge}
            stroke={c.line}
            strokeWidth={strokeWidth * 0.8}
            transform={`rotate(${deg} 50 50)`}
            opacity="0.9"
          />
        ))}
      </g>
      {/* Core + stamens */}
      <circle cx="50" cy="50" r="8.5" fill={c.core} />
      <g fill={c.petal} opacity="0.85">
        {outer.map((deg) => (
          <circle key={`s-${deg}`} cx="50" cy="44" r="1.4" transform={`rotate(${deg} 50 50)`} />
        ))}
      </g>
    </svg>
  )
}
