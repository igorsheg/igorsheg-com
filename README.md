# igorsheg.com

A static personal site built with Astro. Profile information lives in JSON; projects and writing live in schema-validated Markdown or MDX collections.

## Requirements

- Node.js 22.12 or newer
- pnpm 10

## Development

```sh
pnpm install
pnpm dev
```

Run the complete production validation before publishing:

```sh
pnpm validate
```

Validation runs Astro diagnostics, ESLint, a production build, and static-output budgets. Generated HTML must stay at or below 30 KiB per page, and `dist/_astro` must contain no client JavaScript bundles.

## Content

Collection schemas are defined in `src/content.config.ts`.

### Profile

Edit `src/content/site/profile.json` to update the name, biography, contact links, and homepage metadata.

### Projects

Add a flat Markdown or MDX file to `src/content/projects/`. Its filename becomes the route ID at `/projects/[id]/`.

```md
---
title: Project name
description: A concise project summary.
order: 5
status: active
year: 2026
links:
  - label: Source
    url: https://example.com/source
---

Project details.
```

`links`, `status`, and `year` are optional. Lower `order` values appear first on the homepage.

### Writing

Copy `src/content/writing/_template.md` to either:

- `src/content/writing/my-post.md`, or
- `src/content/writing/my-post/index.mdx` when the post has colocated diagrams, video, or data.

Both forms publish at `/writing/my-post/`.

```md
---
title: Post title
description: A concise post summary.
publishDate: 2026-08-11
updatedDate: 2026-08-15
tags:
  - agents
draft: false
---

Post content.
```

`slug`, `updatedDate`, and `tags` are optional. `draft` defaults to `false`; draft entries are excluded from the homepage, writing index, feed, sitemap, raw endpoints, and Open Graph output.

MDX posts can import the article components in `src/components/`:

- `Prescii.astro` — responsive ASCII diagrams with required alternative text
- `Demo.astro` — labelled, keyboard-focusable bordered scroll frames
- `VideoPlayer.astro` — opt-in video playback with a no-JavaScript fallback

ANSI-style diagram colors are available as `.fg-red`, `.fg-green`, `.fg-blue`, `.fg-yellow`, and `.fg-gray`.

## Generated routes

- `/` — profile, projects, recent writing, and contact links
- `/projects/[id]/` — project detail page
- `/projects/[id].md` — project source as Markdown
- `/writing/` — writing index
- `/writing/[id]/` — published article
- `/writing/[id].mdx` — article source as MDX
- `/feed.xml` — RSS feed
- `/llms.txt` — machine-readable site index
- `/og/**.png` — terminal-style Open Graph cards
- `/robots.txt`, sitemap, and `/404.html`

The canonical site URL has one owner in `src/site.ts`. Page CSS is inlined, the Latin variable font is preloaded and self-hosted, and ordinary pages ship no executable client JavaScript.
