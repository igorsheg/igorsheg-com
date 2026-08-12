import type { APIRoute } from 'astro'
import { SITE_URL } from '../site'

export const GET: APIRoute = () => {
  const sitemap = new URL('/sitemap-index.xml', SITE_URL)

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
