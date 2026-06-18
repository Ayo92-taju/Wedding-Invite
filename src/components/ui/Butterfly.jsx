import './Butterfly.css'

/*
 * A delicate butterfly with gently flapping wings (pure CSS).
 * Used in the ambient field and as a scroll accent in the love story.
 */
export default function Butterfly({ size = 34, variant = 'blush', className = '', style }) {
  const wing =
    variant === 'sage'
      ? { fill: '#cdd9be', edge: '#aebd9d' }
      : variant === 'gold'
        ? { fill: '#ecdcae', edge: '#ddc278' }
        : { fill: '#f4ddd8', edge: '#e7b6b0' }

  return (
    <span
      className={`butterfly ${className}`}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 60 60" width="100%" height="100%">
        <g className="butterfly__wing butterfly__wing--l">
          <path
            d="M30 30C18 8 2 6 6 22c2 9 14 12 24 8z"
            fill={wing.fill}
            stroke={wing.edge}
            strokeWidth="1"
          />
          <path
            d="M30 30C20 38 6 40 9 50c2 6 15 4 21-4z"
            fill={wing.fill}
            stroke={wing.edge}
            strokeWidth="1"
          />
        </g>
        <g className="butterfly__wing butterfly__wing--r">
          <path
            d="M30 30C42 8 58 6 54 22c-2 9-14 12-24 8z"
            fill={wing.fill}
            stroke={wing.edge}
            strokeWidth="1"
          />
          <path
            d="M30 30C40 38 54 40 51 50c-2 6-15 4-21-4z"
            fill={wing.fill}
            stroke={wing.edge}
            strokeWidth="1"
          />
        </g>
        {/* body + antennae */}
        <line x1="30" y1="20" x2="30" y2="44" stroke="#9c7c18" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M30 20c-3-5-6-7-9-7M30 20c3-5 6-7 9-7" stroke="#9c7c18" strokeWidth="1" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  )
}
