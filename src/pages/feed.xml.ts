import type { APIContext } from 'astro'
import rss from '@astrojs/rss'
import { getCollection, getEntry } from 'astro:content'
import { SITE_URL, WRITING_DESCRIPTION } from '../site'

export async function GET(context: APIContext) {
  const profile = await getEntry('site', 'profile')

  if (!profile)
    throw new Error('Missing required site profile at src/content/site/profile.json')

  const posts = (await getCollection('writing', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  return rss({
    title: `${profile.data.name} — Writing`,
    description: WRITING_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/writing/${post.id}/`,
    })),
  })
}
