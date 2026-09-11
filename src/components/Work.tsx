import { Fragment, Suspense, lazy, useEffect, useState } from 'react'
import type { Lang, Project } from '../content'
import { copy, projects } from '../content'
import { settings } from '../site.config'

const RowObject = lazy(() => import('./RowObject'))

const modelOf = (project: Project) => project.model ?? settings.defaultModel
const models = [...new Set(projects.map(modelOf))]

type Active = { id: number; url: string; top: number; live: boolean }

export function Work({ lang }: { lang: Lang }) {
  const t = copy[lang]
  const [open, setOpen] = useState<Record<number, boolean>>({})
  // Hovered or focused row. One shared canvas moves to its centre rather than
  // each row mounting its own, so the model never reloads or re-measures.
  // `live` goes false on leave; the object fades out where it is.
  const [active, setActive] = useState<Active | null>(null)
  // Mount the canvas once the page is idle, so even the first hover is instant.
  const [warm, setWarm] = useState(false)

  useEffect(() => {
    // Touch screens never hover, so they skip the three.js and model download.
    if (!window.matchMedia('(hover: hover)').matches) return
    if (!('requestIdleCallback' in window)) {
      const timer = setTimeout(() => setWarm(true), 1000)
      return () => clearTimeout(timer)
    }
    const handle = requestIdleCallback(() => setWarm(true), { timeout: 3000 })
    return () => cancelIdleCallback(handle)
  }, [])

  const toggle = (id: number) =>
    setOpen((current) =>
      settings.singleOpen
        ? current[id]
          ? {}
          : { [id]: true }
        : { ...current, [id]: !current[id] },
    )

  const activate = (project: Project, row: HTMLElement) =>
    setActive({
      id: project.id,
      url: modelOf(project),
      top: row.offsetTop + row.offsetHeight / 2,
      live: true,
    })
  const deactivate = (id: number) =>
    setActive((current) => (current?.id === id ? { ...current, live: false } : current))

  const visible = !!active?.live && !open[active.id]

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
              onClick={(event) => {
                toggle(project.id)
                // Rows above may have collapsed since hover, moving this one.
                activate(project, event.currentTarget)
              }}
              onPointerEnter={(event) => {
                // Touch has no hover, and a tap opens the row, which hides the object.
                if (event.pointerType !== 'touch') activate(project, event.currentTarget)
              }}
              onPointerLeave={() => deactivate(project.id)}
              onFocus={(event) => activate(project, event.currentTarget)}
              onBlur={() => deactivate(project.id)}
            >
              {settings.showNumbers && (
                <span className="row__index">{String(index + 1).padStart(2, '0')}</span>
              )}
              <span className="row__title">{project.title[lang]}</span>
              <span className="row__meta">
                {open[project.id] ? '—' : '+'} {project.year}
              </span>
            </button>
            {open[project.id] && <Panel project={project} lang={lang} />}
          </Fragment>
        ))}
        {(warm || active) && (
          <div
            className={`work__object${visible ? ' is-visible' : ''}`}
            style={active ? { top: active.top } : undefined}
            aria-hidden="true"
          >
            <Suspense fallback={<span className="work__placeholder">3D</span>}>
              <RowObject url={active?.url ?? models[0]} preload={models} live={visible} />
            </Suspense>
          </div>
        )}
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
