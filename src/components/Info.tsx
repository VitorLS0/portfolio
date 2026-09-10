import type { Lang } from '../content'
import { copy } from '../content'

export function Info({ lang }: { lang: Lang }) {
  const t = copy[lang]

  return (
    <section className="info">
      <div>
        <p className="info__label">{t.skillsLabel}</p>
        <div className="skills">
          {t.skills.map((group) => (
            <div key={group.label}>
              <p className="skills__label">{group.label}</p>
              <p className="skills__value">{group.value}</p>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="info__label">{t.aboutLabel}</p>
        {t.about.map((paragraph) => (
          <p className="info__para" key={paragraph}>
            {paragraph}
          </p>
        ))}
      </div>
    </section>
  )
}
