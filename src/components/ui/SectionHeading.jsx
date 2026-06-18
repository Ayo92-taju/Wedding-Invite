import Reveal from './Reveal.jsx'
import FloralDivider from './FloralDivider.jsx'
import './SectionHeading.css'

/*
 * Eyebrow label · large display title · optional italic lede,
 * with a gold floral divider. Centred by default.
 */
export default function SectionHeading({ eyebrow, title, script, lede, align = 'center' }) {
  return (
    <Reveal className={`section-heading section-heading--${align}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      {title && (
        <h2 className="section-title">
          {title}
          {script && (
            <>
              {' '}
              <span className="script section-heading__script">{script}</span>
            </>
          )}
        </h2>
      )}
      <FloralDivider style={{ marginTop: '1.4rem' }} />
      {lede && <p className="lede section-heading__lede">{lede}</p>}
    </Reveal>
  )
}
