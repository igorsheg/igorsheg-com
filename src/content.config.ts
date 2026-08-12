import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const linkSchema = z.object({
  label: z.string().min(1),
  url: z.url(),
})

const site = defineCollection({
  loader: glob({ base: './src/content/site', pattern: '**/*.json' }),
  schema: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    biography: z.string().min(1),
    email: z.email(),
    socials: z.array(linkSchema),
    homepage: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  }),
})

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '*.{md,mdx}' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    order: z.number().int().nonnegative(),
    links: z.array(linkSchema).default([]),
    status: z.enum(['active', 'archived']).default('active'),
    year: z.number().int().optional(),
  }),
})

const writing = defineCollection({
  loader: glob({
    base: './src/content/writing',
    pattern: ['*.{md,mdx}', '*/index.{md,mdx}'],
    generateId: ({ entry, data }) => {
      if (typeof data.slug === 'string' && data.slug.length > 0)
        return data.slug

      return entry.replace(/\.mdx?$/, '').replace(/\/index$/, '')
    },
  }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
})

export const collections = { projects, site, writing }
