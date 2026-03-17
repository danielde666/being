import fs from 'node:fs/promises'
import path from 'node:path'

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

type Params = {
  slug?: string[]
}

const ROOT = process.cwd()

function resolveHtmlPath(slug: string[] | undefined) {
  if (!slug || slug.length === 0) {
    return path.join(ROOT, 'index.html')
  }

  return path.join(ROOT, ...slug, 'index.html')
}

async function readHtml(slug: string[] | undefined) {
  const filePath = resolveHtmlPath(slug)
  const relativePath = path.relative(ROOT, filePath)

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    notFound()
  }

  try {
    return await fs.readFile(filePath, 'utf8')
  } catch {
    notFound()
  }
}

function extractTag(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match?.[1]?.trim() ?? ''
}

function extractAll(html: string, pattern: RegExp) {
  return [...html.matchAll(pattern)].map((match) => match[1]).join('\n')
}

function extractMetaContent(html: string, key: string, attr: 'name' | 'property' = 'name') {
  const pattern = new RegExp(
    `<meta[^>]*${attr}=["']${key}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    'i'
  )
  return html.match(pattern)?.[1]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { slug } = await params
  const html = await readHtml(slug)

  const title = extractTag(html, 'title')
  const description =
    extractMetaContent(html, 'description') ??
    extractMetaContent(html, 'og:description', 'property')
  const images = extractMetaContent(html, 'og:image', 'property')

  return {
    title: title || undefined,
    description: description || undefined,
    openGraph: {
      title: extractMetaContent(html, 'og:title', 'property') ?? title ?? undefined,
      description: extractMetaContent(html, 'og:description', 'property') ?? description ?? undefined,
      images: images ? [images] : undefined,
      url: extractMetaContent(html, 'og:url', 'property') ?? undefined,
    },
  }
}

export default async function StaticHtmlPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { slug } = await params
  const html = await readHtml(slug)
  const styles = extractAll(html, /<style[^>]*>([\s\S]*?)<\/style>/gi)
  const body = extractTag(html, 'body')

  return (
    <>
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      <div dangerouslySetInnerHTML={{ __html: body || html }} />
    </>
  )
}
