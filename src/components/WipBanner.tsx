import type { Lang } from "../content";
import { copy } from "../content";

// Each group must be wider than the viewport, or the loop shows a gap on
// large screens. 24 items covers roughly 4000px.
const REPEATS = 24;

export function WipBanner({ lang }: { lang: Lang }) {
  const t = copy[lang];

  // Two identical groups scrolled by exactly half the track width, so the
  // second one lands where the first started — a seamless loop.
  return (
    <div className="wip" role="status">
      <div className="wip__track">
        {[0, 1].map((group) => (
          <div className="wip__group" key={group} aria-hidden={group === 1}>
            {Array.from({ length: REPEATS }, (_, i) => (
              <span className="wip__item" key={i}>
                {t.wip}
                <span className="wip__mark" aria-hidden="true">
                  ◆
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
