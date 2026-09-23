import { Fragment, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { Lang, ModelStyle, Project, Screenshot } from "../content";
import { copy, projects } from "../content";
import { settings } from "../site.config";
import { dragEnd, dragFrom, dragTo } from "../swipe";

const RowObject = lazy(() => import("./RowObject"));

const modelOf = (project: Project) => project.model ?? settings.defaultModel;
const styleOf = (project: Project) =>
  project.modelStyle ?? settings.modelStyle;
const scaleOf = (project: Project) => project.modelScale ?? 1;
const models = [...new Set(projects.map(modelOf))];

// Height of the roulette marker, as a fraction of the viewport. The arrow is
// drawn at the same line (see `marker` below), so whichever row sits under it
// owns the object.
const MARKER = 0.45;

type Active = {
  id: number;
  url: string;
  style: ModelStyle;
  scale: number;
  top: number;
  live: boolean;
};

export function Work({ lang }: { lang: Lang }) {
  const t = copy[lang];
  const [open, setOpen] = useState<Record<number, boolean>>({});
  // Hovered or focused row. One shared canvas moves to its centre rather than
  // each row mounting its own, so the model never reloads or re-measures.
  // `live` goes false on leave; the object fades out where it is.
  const [active, setActive] = useState<Active | null>(null);
  // Mount the canvas once the page is idle, so even the first hover is instant.
  const [warm, setWarm] = useState(false);
  // Without hover there is nothing to point at a row, so scrolling drives the
  // object instead: a fixed arrow marks a line, and the row crossing it wins.
  const [roulette, setRoulette] = useState(
    () => !window.matchMedia("(hover: hover)").matches,
  );
  const rows = useRef(new Map<number, HTMLElement>());
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia("(hover: hover)");
    const sync = () => setRoulette(!query.matches);
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (roulette) return;
    if (!("requestIdleCallback" in window)) {
      const timer = setTimeout(() => setWarm(true), 1000);
      return () => clearTimeout(timer);
    }
    const handle = requestIdleCallback(() => setWarm(true), { timeout: 3000 });
    return () => cancelIdleCallback(handle);
  }, [roulette]);

  // On touch the download is not free, so it waits until the list is nearly
  // in view instead of starting on idle.
  useEffect(() => {
    if (!roulette || warm || !list.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setWarm(true),
      { rootMargin: "60% 0px" },
    );
    observer.observe(list.current);
    return () => observer.disconnect();
  }, [roulette, warm]);

  const toggle = (id: number) =>
    setOpen((current) =>
      settings.singleOpen
        ? current[id]
          ? {}
          : { [id]: true }
        : { ...current, [id]: !current[id] },
    );

  // Returns the same object when nothing moved, so the scroll driver can call
  // this every frame without re-rendering.
  const activate = useCallback((project: Project, row: HTMLElement) => {
    const top = row.offsetTop + row.offsetHeight / 2;
    setActive((current) =>
      current?.id === project.id && current.live && current.top === top
        ? current
        : {
            id: project.id,
            url: modelOf(project),
            style: styleOf(project),
            scale: scaleOf(project),
            top,
            live: true,
          },
    );
  }, []);
  const deactivate = (id: number) =>
    setActive((current) =>
      current?.id === id ? { ...current, live: false } : current,
    );

  // `open` is a dependency: opening a panel pushes the rows below it past the
  // marker without a scroll event.
  useEffect(() => {
    if (!roulette) return;
    let frame = 0;
    const pick = () => {
      frame = 0;
      const line = window.innerHeight * MARKER;
      for (const project of projects) {
        const row = rows.current.get(project.id);
        if (!row) continue;
        const box = row.getBoundingClientRect();
        if (box.top <= line && box.bottom > line) return activate(project, row);
      }
      setActive((current) =>
        current?.live ? { ...current, live: false } : current,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };
    pick();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [roulette, activate, open]);

  // Dragging sideways across the list turns the models (see swipe.ts). The
  // list's touch-action keeps vertical panning as scrolling, so only sideways
  // movement reaches here.
  const dragged = useRef(false);
  const drag = {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType !== "touch") return;
      dragged.current = false;
      dragFrom(event.clientX);
    },
    onPointerMove: (event: React.PointerEvent) => {
      if (event.pointerType !== "touch") return;
      dragged.current = true;
      dragTo(event.clientX);
    },
    onPointerUp: dragEnd,
    onPointerCancel: dragEnd,
  };

  const visible = !!active?.live && !open[active.id];

  return (
    <section className="work">
      {roulette && (
        <div
          className={`marker${active?.live ? " is-visible" : ""}`}
          style={{ top: `${MARKER * 100}%` }}
          aria-hidden="true"
        >
          <span className="marker__arrow" />
        </div>
      )}
      <div className="work__head">
        <span>{t.workLabel}</span>
        <span>{String(projects.length).padStart(2, "0")}</span>
      </div>
      <div className="work__list" ref={list} {...drag}>
        {projects.map((project, index) => (
          <Fragment key={project.id}>
            <button
              type="button"
              ref={(node) => {
                if (node) rows.current.set(project.id, node);
                else rows.current.delete(project.id);
              }}
              className={`row${open[project.id] ? " is-open" : ""}`}
              aria-expanded={!!open[project.id]}
              aria-controls={`panel-${project.id}`}
              onClick={(event) => {
                // A sideways drag that ended on this row is not a tap on it.
                if (dragged.current) return;
                toggle(project.id);
                // Rows above may have collapsed since hover, moving this one.
                if (!roulette) activate(project, event.currentTarget);
              }}
              onPointerEnter={(event) => {
                // Touch has no hover, and a tap opens the row, which hides the object.
                if (!roulette && event.pointerType !== "touch")
                  activate(project, event.currentTarget);
              }}
              onPointerLeave={() => !roulette && deactivate(project.id)}
              onFocus={(event) => !roulette && activate(project, event.currentTarget)}
              onBlur={() => !roulette && deactivate(project.id)}
            >
              {settings.showNumbers && (
                <span className="row__index">
                  {String(index + 1).padStart(2, "0")}
                </span>
              )}
              <span className="row__title">{project.title[lang]}</span>
              <span className="row__meta">
                {open[project.id] ? "—" : "+"} {project.year}
              </span>
            </button>
            {open[project.id] && <Panel project={project} lang={lang} />}
          </Fragment>
        ))}
        {(warm || active) && (
          <div
            className={`work__object${roulette ? " work__object--roulette" : ""}${visible ? " is-visible" : ""}`}
            style={active ? { top: active.top } : undefined}
            aria-hidden="true"
          >
            <Suspense fallback={<span className="work__placeholder">3D</span>}>
              <RowObject
                url={active?.url ?? models[0]}
                modelStyle={active?.style ?? settings.modelStyle}
                modelScale={active?.scale ?? 1}
                preload={models}
                live={visible}
              />
            </Suspense>
          </div>
        )}
      </div>
    </section>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

// Screenshots as slices: the active one widens to show the whole image, the
// rest stay as dimmed strips. Hover, focus or tap picks one.
function Gallery({ shots, lang }: { shots: Screenshot[]; lang: Lang }) {
  const [selected, setSelected] = useState(0);
  // Tallest shot's width / height, so the reel fits every image uncropped.
  const [ratio, setRatio] = useState<number>();

  return (
    <figure className="reel">
      <div
        className="reel__slices"
        style={
          ratio
            ? ({ "--shot-ratio": ratio, "--shots": shots.length } as CSSProperties)
            : undefined
        }
      >
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            type="button"
            className={`reel__slice${i === selected ? " is-active" : ""}`}
            aria-pressed={i === selected}
            aria-label={shot.alt[lang]}
            onClick={() => setSelected(i)}
            onFocus={() => setSelected(i)}
            onPointerEnter={(event) => {
              if (event.pointerType !== "touch") setSelected(i);
            }}
          >
            <img
              src={shot.src}
              alt=""
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                const r = naturalWidth / naturalHeight;
                setRatio((prev) => (prev === undefined ? r : Math.min(prev, r)));
              }}
            />
            <span className="reel__index">{pad(i + 1)}</span>
          </button>
        ))}
      </div>
      {/* Repeats the buttons' labels visually, so screen readers skip it. */}
      <figcaption className="reel__caption" aria-hidden="true">
        {settings.showReelCount && (
          <span className="reel__count">
            {pad(selected + 1)} / {pad(shots.length)}
          </span>
        )}
        <span key={selected} className="reel__alt">
          {shots[selected].alt[lang]}
        </span>
      </figcaption>
    </figure>
  );
}

function Panel({ project, lang }: { project: Project; lang: Lang }) {
  const t = copy[lang];
  const shots = project.screenshots ?? [];

  return (
    <div className="panel" id={`panel-${project.id}`}>
      <div
        className={`panel__grid${shots.length ? " panel__grid--media" : ""}`}
      >
        {shots.length ? (
          <Gallery shots={shots} lang={lang} />
        ) : (
          <div className="shots">
            <div className="shots__lead">{t.screenshotLead}</div>
            <div className="shots__pair">
              <div className="shots__thumb">02</div>
              <div className="shots__thumb">03</div>
            </div>
            <span className="shots__caption">{t.screenshotCaption}</span>
          </div>
        )}
        <div className="panel__copy">
          <p
            className={`panel__desc${project.award ? " panel__desc--with-award" : ""}`}
          >
            {project.description[lang]}
          </p>
          {project.award && (
            <p className="panel__award">{project.award[lang]}</p>
          )}
          <div className="tags">
            {project.tags[lang].map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
