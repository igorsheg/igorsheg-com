import type { APIRoute } from 'astro'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { Resvg } from '@resvg/resvg-js'
import { getCollection, getEntry } from 'astro:content'
import satori from 'satori'
import { SITE_URL, WRITING_DESCRIPTION } from '../../site'

interface Card {
  title: string
  description: string
}

const require = createRequire(import.meta.url)

const fonts = Promise.all([
  readFile(require.resolve('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff')),
  readFile(require.resolve('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff')),
])

const background = '#151516'
const foreground = '#d4d4d8'
const muted = '#87878d'

function text(content: string, style: Record<string, unknown>) {
  return { type: 'div', props: { style, children: content } }
}

export async function getStaticPaths() {
  const profile = await getEntry('site', 'profile')

  if (!profile)
    throw new Error('Missing required site profile at src/content/site/profile.json')

  const projects = await getCollection('projects')
  const posts = await getCollection('writing', ({ data }) => !data.draft)

  const home: Card = {
    title: profile.data.name,
    description: profile.data.homepage.description,
  }

  return [
    { params: { slug: 'home' }, props: home },
    { params: { slug: 'writing' }, props: { title: 'Writing', description: WRITING_DESCRIPTION } },
    ...projects.map(project => ({
      params: { slug: `projects/${project.id}` },
      props: { title: project.data.title, description: project.data.description } satisfies Card,
    })),
    ...posts.map(post => ({
      params: { slug: `writing/${post.id}` },
      props: { title: post.data.title, description: post.data.description } satisfies Card,
    })),
  ]
}

export const GET: APIRoute<Card> = async ({ props }) => {
  const [fontRegular, fontBold] = await fonts
  const hostname = new URL(SITE_URL).hostname

  const markup = {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: background,
        color: foreground,
        fontFamily: 'JetBrains Mono',
      },
      children: [
        text(`~*~ ${hostname} ~*~`, { color: muted, fontSize: 28 }),
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 28 },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', fontSize: 58, fontWeight: 700, lineHeight: 1.25 },
                  children: [
                    text('# ', { color: muted }),
                    text(props.title.toUpperCase(), { maxWidth: 940 }),
                  ],
                },
              },
              text(props.description, { color: muted, fontSize: 30, lineHeight: 1.5, maxWidth: 980 }),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', fontSize: 28, textTransform: 'uppercase' },
            children: [
              text(hostname.toUpperCase(), {}),
              {
                type: 'div',
                props: {
                  style: { width: 17, height: 32, marginLeft: 10, backgroundColor: foreground },
                },
              },
            ],
          },
        },
      ],
    },
  }

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'JetBrains Mono', data: fontRegular, weight: 400, style: 'normal' },
      { name: 'JetBrains Mono', data: fontBold, weight: 700, style: 'normal' },
    ],
  })

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng()

  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png' },
  })
}
