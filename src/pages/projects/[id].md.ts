import type { APIRoute } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

const presciiPattern = /<Prescii label="([^"]+)"><span class="[^"]+">\{`([\s\S]*?)`\}<\/span><\/Prescii>/g

function asMarkdown(body: string) {
  return body
    .replace(/^import Prescii from ['"][^'"]+['"]\n+/m, '')
    .replace(presciiPattern, (_match, label: string, art: string) => [
      `*${label}*`,
      '',
      '```text',
      art.replaceAll('\\\\', '\\'),
      '```',
    ].join('\n'))
}

export async function getStaticPaths() {
  const projects = await getCollection('projects')

  return projects.map(project => ({
    params: { id: project.id },
    props: { project },
  }))
}

export const GET: APIRoute<{ project: CollectionEntry<'projects'> }> = ({ props }) => {
  const { project } = props
  const links = project.data.links.map(link => `- ${link.label}: ${link.url}`)
  const markdown = [
    `# ${project.data.title}`,
    '',
    `> ${project.data.description}`,
    '',
    ...(links.length > 0 ? [...links, ''] : []),
    asMarkdown(project.body ?? ''),
  ].join('\n')

  return new Response(markdown, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
