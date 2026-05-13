import githubMarkdownCss from "github-markdown-css/github-markdown.css?raw"

import type { MarkdownFlavor } from "@/lib/markdown-flavors"
import { flavorUsesGfm } from "@/lib/markdown-flavors"
import { markdownToHtmlFragment } from "@/lib/markdown-to-html"
import { downloadBlob } from "@/lib/download"

const plainDocCss = `
  body { font-family: system-ui, sans-serif; line-height: 1.6; color: #111; max-width: 880px; margin: 0 auto; padding: 24px; }
  .markdown-plain h1, .markdown-plain h2, .markdown-plain h3 { margin-top: 1.25em; }
  .markdown-plain pre, .markdown-plain code { font-family: ui-monospace, monospace; background: #f4f4f5; padding: 0.2em 0.4em; border-radius: 4px; }
  .markdown-plain pre { padding: 12px; overflow: auto; }
  .markdown-plain blockquote { border-left: 4px solid #d4d4d8; margin-left: 0; padding-left: 1em; color: #52525b; }
`

export async function exportHtmlFile(
  markdown: string,
  flavor: MarkdownFlavor,
  baseName: string,
): Promise<void> {
  const inner = await markdownToHtmlFragment(markdown, flavor)
  const useGithubSkin = flavorUsesGfm(flavor)
  const bodyClass = useGithubSkin ? "markdown-body" : "markdown-plain"
  const embeddedCss = useGithubSkin ? githubMarkdownCss : plainDocCss

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(baseName)}</title>
  <style>${embeddedCss}</style>
</head>
<body>
  <main class="${bodyClass}">${inner}</main>
</body>
</html>`

  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  downloadBlob(blob, `${baseName}.html`)
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}
