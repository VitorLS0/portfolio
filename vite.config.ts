import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { copy } from './src/content'
import { identity, settings } from './src/site.config'

const entities: Record<string, string> = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }
const escapeHtml = (text: string) => text.replace(/[&"<>]/g, (char) => entities[char])

// Link previews (Open Graph and X cards). Crawlers don't run JavaScript, so
// the title and meta tags are written into index.html from the site config,
// in dev and at build. The image itself is public/og-image.png.
function sharePreview(): Plugin {
  const t = copy[settings.defaultLang]
  const siteUrl = identity.siteUrl.replace(/\/+$/, '')
  const title = `${identity.name}`
  const image = `${siteUrl}/og-image.png`

  const meta: [attr: 'name' | 'property', key: string, content: string][] = [
    ['name', 'description', t.bio],
    ['property', 'og:type', 'website'],
    ['property', 'og:site_name', identity.name],
    ['property', 'og:locale', settings.defaultLang === 'pt' ? 'pt_BR' : 'en_US'],
    ['property', 'og:url', `${siteUrl}/`],
    ['property', 'og:title', title],
    ['property', 'og:description', t.bio],
    ['property', 'og:image', image],
    ['property', 'og:image:width', '1200'],
    ['property', 'og:image:height', '630'],
    ['property', 'og:image:alt', title],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', title],
    ['name', 'twitter:description', t.bio],
    ['name', 'twitter:image', image],
  ]

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    `<link rel="canonical" href="${escapeHtml(siteUrl)}/" />`,
    ...meta.map(
      ([attr, key, content]) => `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`,
    ),
  ].join('\n    ')

  return {
    name: 'share-preview',
    // A function replacement, so a "$" in the copy is never read as a pattern.
    transformIndexHtml: (html) => html.replace(/<title>[\s\S]*?<\/title>/, () => head),
  }
}

export default defineConfig({
  plugins: [react(), sharePreview()],
})
