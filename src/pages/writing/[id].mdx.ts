import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export async function getStaticPaths() {
  const posts = await getCollection('writing', ({ data }) => !data.draft)

  return posts.map(post => ({
    params: { id: post.id },
    props: { post },
  }))
}

export const GET: APIRoute<{ post: CollectionEntry<'writing'> }> = ({ props }) => {
  const { post } = props
  const published = post.data.publishDate.toISOString().slice(0, 10)
  const markdown = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.description}`,
    '',
    `Published: ${published}`,
    '',
    post.body ?? '',
  ].join('\n')

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/mdx; charset=utf-8' },
  })
}
