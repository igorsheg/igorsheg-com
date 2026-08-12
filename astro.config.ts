import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'
import { SITE_URL } from './src/site'

export default defineConfig({
  site: SITE_URL,
  integrations: [mdx(), sitemap()],
  build: {
    inlineStylesheets: 'always',
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'min-light',
        dark: 'min-dark',
      },
      defaultColor: false,
    },
  },
})
