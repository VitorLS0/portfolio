import type { Lang } from '../content'
import { copy } from '../content'
import { identity } from '../site.config'
import { useClock } from '../useClock'

export function Footer({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const clock = useClock()

  return (
    <footer className="footer">
      <p className="footer__title">
        {t.footerLines[0]}
        {t.footerLines[1] && (
          <>
            <br />
            {t.footerLines[1]}
          </>
        )}
        <span className="accent">.</span>
      </p>
      <div className="footer__links">
        <a href={`mailto:${identity.email}`}>{t.links.email}</a>
        <a href={identity.github}>{t.links.github}</a>
        <a href={identity.linkedin}>{t.links.linkedin}</a>
        <a href={identity.resume} download className="is-primary">
          {t.links.resume}
        </a>
      </div>
      <p className="footer__clock">
        {t.footerLocation} — {clock}
      </p>
    </footer>
  )
}
