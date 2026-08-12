import type { APIRoute } from 'astro'
import { getCollection, getEntry } from 'astro:content'
import { SITE_URL } from '../site'

export const GET: APIRoute = async () => {
  const profile = await getEntry('site', 'profile')

  if (!profile)
    throw new Error('Missing required site profile at src/content/site/profile.json')

  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order)
  const posts = (await getCollection('writing', ({ data }) => !data.draft))
    .sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime())

  const lines = [
    `# ${profile.data.name}`,
    '',
    `> ${profile.data.biography}`,
    '',
    '## Projects',
    '',
    ...projects.map(project =>
      `- [${project.data.title}](${new URL(`/projects/${project.id}.md`, SITE_URL)}): ${project.data.description}`,
    ),
  ]

  if (posts.length > 0) {
    lines.push(
      '',
      '## Writing',
      '',
      ...posts.map(post =>
        `- [${post.data.title}](${new URL(`/writing/${post.id}.mdx`, SITE_URL)}): ${post.data.description}`,
      ),
    )
  }

  lines.push(
    '',
    '## Contact',
    '',
    `- Email: ${profile.data.email}`,
    ...profile.data.socials.map(social => `- ${social.label}: ${social.url}`),
    '',
  )

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
