import { Fragment } from 'react'
import type { Lang } from '../content'
import { copy } from '../content'
import { identity } from '../site.config'

const words = identity.name.split(' ').filter(Boolean)

export function Hero({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="hero" id="hero">
      <p className="eyebrow">{t.location}</p>
      <h1 className="hero__title">
        {/* One word per line. The spaces between lines are collapsed on
            screen but keep the name readable as text. */}
        {words.map((word, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="hero__line">
              {word}
              {i === words.length - 1 && <span className="accent">.</span>}
            </span>
          </Fragment>
        ))}
      </h1>
      <p className="hero__role">{t.role}</p>
      <div className="hero__grid">
        <p className="hero__bio">{t.bio}</p>
        <div className="facts">
          {t.facts.map((fact) => (
            <div className="facts__row" key={fact.label}>
              <span>{fact.label}</span>
              <span className={fact.accent ? 'accent' : 'facts__value'}>{fact.value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
