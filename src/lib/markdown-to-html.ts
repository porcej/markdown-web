import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import rehypeStringify from "rehype-stringify"
import { unified } from "unified"

import type { MarkdownFlavor } from "@/lib/markdown-flavors"
import { flavorAllowsRawHtml, flavorUsesGfm } from "@/lib/markdown-flavors"

export async function markdownToHtmlFragment(
  markdown: string,
  flavor: MarkdownFlavor,
): Promise<string> {
  const allowHtml = flavorAllowsRawHtml(flavor)
  const useGfm = flavorUsesGfm(flavor)

  if (useGfm && allowHtml) {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeSanitize)
      .use(rehypeStringify)
      .process(markdown)
    return String(file)
  }

  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown)
  return String(file)
}
