import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Lang } from '../content'
import { identity } from '../site.config'

type Props = {
  lang: Lang
  onLangChange: (lang: Lang) => void
}

// 'Vítor Lagares Stahlberg' → V|ítor  L|agares  S|tahlberg
// The initials stay put; the rest of each word collapses to nothing.
const words = identity.fullName.split(' ').filter(Boolean)
const parts = words.map((word, i) => ({
  initial: word[0],
  rest: word.slice(1) + (i < words.length - 1 ? ' ' : ''),
}))

function useScrolledPastHero() {
  const [past, setPast] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return

    // Shrink the viewport by everything that sticks to the top, so the swap
    // fires exactly as the hero slides under the stack.
    const stickyH = ['.header'].reduce(
      (total, sel) => total + (document.querySelector(sel)?.getBoundingClientRect().height ?? 0),
      0,
    )
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting),
      { rootMargin: `-${Math.round(stickyH)}px 0px 0px 0px` },
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return past
}

export function Header({ lang, onLangChange }: Props) {
  const expanded = useScrolledPastHero()

  return (
    <header className="header">
      <div className={`header__name${expanded ? ' header__name--full' : ''}`}>
        <span className="header__dot" />
        {/* The full name is always in the DOM, so screen readers get it
            regardless of the collapsed state. */}
        <span className="header__wordmark">
          {parts.map((part, i) => (
            <span className="header__part" key={i}>
              {part.initial}
              <span className="header__reveal" style={{ '--delay': `${i * 70}ms` } as CSSProperties}>
                <span>{part.rest}</span>
              </span>
            </span>
          ))}
        </span>
      </div>
      <div className="lang">
        <button aria-pressed={lang === 'en'} onClick={() => onLangChange('en')}>
          EN
        </button>
        <button aria-pressed={lang === 'pt'} onClick={() => onLangChange('pt')}>
          PT
        </button>
      </div>
    </header>
  )
}
