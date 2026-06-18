/*
 * A fine gold divider with a central botanical sprig — the soft gold
 * dividers the brief asks for. Scales gracefully on any background.
 */
export default function FloralDivider({ width = 240, style, className = '' }) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '0 auto',
        ...style,
      }}
    >
      <svg
        width={width}
        height="28"
        viewBox="0 0 240 28"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="fd-gold" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#c9a227" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c9a227" stopOpacity="0.9" />
            <stop offset="1" stopColor="#c9a227" stopOpacity="0" />
          </linearGradient>
        </defs>

        <line x1="8" y1="14" x2="92" y2="14" stroke="url(#fd-gold)" strokeWidth="1" />
        <line x1="148" y1="14" x2="232" y2="14" stroke="url(#fd-gold)" strokeWidth="1" />

        {/* little leaves along the lines */}
        <path d="M70 14c6-5 13-4 18 0-7 3-13 3-18 0z" fill="#aebd9d" opacity="0.8" />
        <path d="M170 14c-6-5-13-4-18 0 7 3 13 3 18 0z" fill="#aebd9d" opacity="0.8" />

        {/* central bloom */}
        <g transform="translate(120 14)">
          <g fill="#f4ddd8" stroke="#c9a227" strokeWidth="0.8">
            <ellipse cx="0" cy="-6" rx="2.6" ry="6" />
            <ellipse cx="0" cy="-6" rx="2.6" ry="6" transform="rotate(72)" />
            <ellipse cx="0" cy="-6" rx="2.6" ry="6" transform="rotate(144)" />
            <ellipse cx="0" cy="-6" rx="2.6" ry="6" transform="rotate(216)" />
            <ellipse cx="0" cy="-6" rx="2.6" ry="6" transform="rotate(288)" />
          </g>
          <circle r="2.4" fill="#c9a227" />
        </g>
      </svg>
    </div>
  )
}
