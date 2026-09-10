import { Fragment, useState } from 'react'
import type { Lang, Project } from '../content'
import { copy, projects } from '../content'
import { settings } from '../site.config'

export function Work({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const [open, setOpen] = useState<Record<number, boolean>>({})

  const toggle = (id: number) =>
    setOpen((current) =>
      settings.singleOpen
        ? current[id]
          ? {}
          : { [id]: true }
        : { ...current, [id]: !current[id] },
    )

  return (
    <section className="work">
      <div className="work__head">
        <span>{t.workLabel}</span>
        <span>{String(projects.length).padStart(2, '0')}</span>
      </div>
      <div className="work__list">
        {projects.map((project, index) => (
          <Fragment key={project.id}>
            <button
              type="button"
              className={`row${open[project.id] ? ' is-open' : ''}`}
              aria-expanded={!!open[project.id]}
              aria-controls={`panel-${project.id}`}
              onClick={() => toggle(project.id)}
            >
              {settings.showNumbers && (
                <span className="row__index">{String(index + 1).padStart(2, '0')}</span>
              )}
              <span className="row__title">{project.title[lang]}</span>
              <span className="row__meta">
                {open[project.id] ? '—' : '+'} {project.year}
              </span>
              <span className="row__object" aria-hidden="true">
                3D
              </span>
            </button>
            {open[project.id] && <Panel project={project} lang={lang} />}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

function Panel({ project, lang }: { project: Project; lang: Lang }) {
  const t = copy[lang]

  return (
    <div className="panel" id={`panel-${project.id}`}>
      <div className="panel__grid">
        <div className="shots">
          <div className="shots__lead">{t.screenshotLead}</div>
          <div className="shots__pair">
            <div className="shots__thumb">02</div>
            <div className="shots__thumb">03</div>
          </div>
          <span className="shots__caption">{t.screenshotCaption}</span>
        </div>
        <div className="panel__copy">
          <p className={`panel__desc${project.award ? ' panel__desc--with-award' : ''}`}>
            {project.description[lang]}
          </p>
          {project.award && <p className="panel__award">{project.award[lang]}</p>}
          <div className="tags">
            {project.tags[lang].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
