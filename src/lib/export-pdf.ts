import githubMarkdownCss from "github-markdown-css/github-markdown.css?raw"

import type { MarkdownFlavor } from "@/lib/markdown-flavors"
import { flavorUsesGfm } from "@/lib/markdown-flavors"
import { markdownToHtmlFragment } from "@/lib/markdown-to-html"

const plainPdfCss = `
  .markdown-plain { font-family: system-ui, sans-serif; line-height: 1.6; color: #111; }
  .markdown-plain h1, .markdown-plain h2, .markdown-plain h3 { margin-top: 1.1em; }
  .markdown-plain pre, .markdown-plain code { font-family: ui-monospace, monospace; background: #f4f4f5; }
  .markdown-plain pre { padding: 10px; border-radius: 6px; overflow: hidden; }
`

export async function exportPdfFile(
  markdown: string,
  flavor: MarkdownFlavor,
  baseName: string,
): Promise<void> {
  const { default: html2pdf } = await import("html2pdf.js")
  const inner = await markdownToHtmlFragment(markdown, flavor)
  const host = document.createElement("div")
  const style = document.createElement("style")
  const useGithub = flavorUsesGfm(flavor)
  style.textContent = useGithub ? githubMarkdownCss : plainPdfCss

  host.className = useGithub ? "markdown-body" : "markdown-plain"
  host.style.boxSizing = "border-box"
  host.style.width = "794px"
  host.style.padding = "32px"
  host.style.background = "#fff"
  host.append(style)
  host.insertAdjacentHTML("beforeend", inner)

  host.style.position = "fixed"
  host.style.left = "0"
  host.style.top = "0"
  host.style.zIndex = "-1"
  host.style.opacity = "0"
  host.style.pointerEvents = "none"

  document.body.appendChild(host)

  try {
    await html2pdf()
      .set({
        margin: [12, 12, 12, 12],
        filename: `${baseName}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      })
      .from(host)
      .save()
  } finally {
    document.body.removeChild(host)
  }
}
