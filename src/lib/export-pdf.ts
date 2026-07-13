import type { MarkdownFlavor } from "@/lib/markdown-flavors"
import { markdownToHtmlFragment } from "@/lib/markdown-to-html"

/**
 * PDF-only stylesheet: system fonts + hex colors.
 * Avoids app theme CSS and the heavy github-markdown bundle, both of which
 * reproduce poorly (or break) when rasterized by canvas.
 */
const PDF_DOCUMENT_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #1f2328;
  }
  #pdf-root {
    width: 794px;
    padding: 40px 48px;
    background: #ffffff;
    color: #1f2328;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  #pdf-root h1, #pdf-root h2, #pdf-root h3, #pdf-root h4 {
    line-height: 1.25;
    margin: 1.4em 0 0.6em;
    font-weight: 650;
    color: #0d1117;
  }
  #pdf-root h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: 0.3em; }
  #pdf-root h2 { font-size: 1.5em; border-bottom: 1px solid #d8dee4; padding-bottom: 0.25em; }
  #pdf-root h3 { font-size: 1.25em; }
  #pdf-root p, #pdf-root ul, #pdf-root ol, #pdf-root pre, #pdf-root blockquote, #pdf-root table {
    margin: 0 0 1em;
  }
  #pdf-root a { color: #0969da; text-decoration: none; }
  #pdf-root ul, #pdf-root ol { padding-left: 1.6em; }
  #pdf-root li + li { margin-top: 0.25em; }
  #pdf-root blockquote {
    margin-left: 0;
    padding: 0.2em 1em;
    color: #656d76;
    border-left: 4px solid #d0d7de;
  }
  #pdf-root code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.9em;
    background: #f6f8fa;
    padding: 0.15em 0.4em;
    border-radius: 4px;
  }
  #pdf-root pre {
    background: #f6f8fa;
    border: 1px solid #d0d7de;
    border-radius: 6px;
    padding: 12px 14px;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }
  #pdf-root pre code {
    background: transparent;
    padding: 0;
    font-size: 0.85em;
  }
  #pdf-root table {
    border-collapse: collapse;
    width: 100%;
    overflow: hidden;
  }
  #pdf-root th, #pdf-root td {
    border: 1px solid #d0d7de;
    padding: 8px 12px;
    text-align: left;
  }
  #pdf-root th { background: #f6f8fa; font-weight: 600; }
  #pdf-root img { max-width: 100%; height: auto; }
  #pdf-root hr {
    border: 0;
    border-top: 1px solid #d0d7de;
    margin: 1.5em 0;
  }
  #pdf-root del { color: #656d76; }
  #pdf-root input[type="checkbox"] { margin-right: 0.4em; }
`

const PAGE_WIDTH_MM = 210
const PAGE_HEIGHT_MM = 297
const MARGIN_MM = 12
const CONTENT_WIDTH_PX = 794

function waitForFrames(count = 2): Promise<void> {
  return new Promise((resolve) => {
    const step = (left: number) => {
      if (left <= 0) {
        resolve()
        return
      }
      requestAnimationFrame(() => step(left - 1))
    }
    step(count)
  })
}

async function mountPdfHost(innerHtml: string): Promise<HTMLElement> {
  const host = document.createElement("div")
  host.setAttribute("data-pdf-export-host", "true")
  host.setAttribute("aria-hidden", "true")
  // Off-screen but fully paintable (avoid opacity:0 / z-index:-1 / iframe capture).
  host.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    `width:${CONTENT_WIDTH_PX}px`,
    "background:#ffffff",
    "color:#1f2328",
    "opacity:1",
    "pointer-events:none",
  ].join(";")

  const style = document.createElement("style")
  style.textContent = PDF_DOCUMENT_CSS

  const root = document.createElement("div")
  root.id = "pdf-root"
  root.innerHTML = innerHtml

  host.append(style, root)
  document.body.appendChild(host)

  if (document.fonts?.ready) {
    await document.fonts.ready.catch(() => undefined)
  }
  await waitForFrames(2)

  return host
}

export async function exportPdfFile(
  markdown: string,
  flavor: MarkdownFlavor,
  baseName: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas-pro"),
    import("jspdf"),
  ])

  const inner = await markdownToHtmlFragment(markdown, flavor)
  const host = await mountPdfHost(inner)
  const target = host.querySelector("#pdf-root")
  if (!(target instanceof HTMLElement)) {
    host.remove()
    throw new Error("PDF content root was not created.")
  }

  try {
    const canvas = await html2canvas(target, {
      scale: Math.min(2, window.devicePixelRatio || 2),
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: CONTENT_WIDTH_PX,
      windowWidth: CONTENT_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
      // Ensure cloned tree still only uses our printable hex stylesheet.
      onclone: (clonedDoc) => {
        // Drop every inherited app stylesheet (oklch theme tokens, etc.).
        clonedDoc
          .querySelectorAll("style, link[rel='stylesheet']")
          .forEach((node) => node.remove())

        const style = clonedDoc.createElement("style")
        style.textContent = PDF_DOCUMENT_CSS
        clonedDoc.head.appendChild(style)

        const clonedRoot = clonedDoc.getElementById("pdf-root")
        if (clonedRoot) {
          clonedRoot.style.background = "#ffffff"
          clonedRoot.style.color = "#1f2328"
        }
      },
    })

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("PDF capture produced an empty canvas.")
    }

    const pdf = new jsPDF({
      unit: "mm",
      format: "a4",
      orientation: "portrait",
      compress: true,
    })

    const usableWidth = PAGE_WIDTH_MM - MARGIN_MM * 2
    const usableHeight = PAGE_HEIGHT_MM - MARGIN_MM * 2
    const imgWidth = usableWidth
    const pxPerMm = canvas.width / imgWidth
    const pageHeightPx = Math.floor(usableHeight * pxPerMm)

    const pageCanvas = document.createElement("canvas")
    const pageCtx = pageCanvas.getContext("2d")
    if (!pageCtx) {
      throw new Error("Could not create a 2D canvas context for PDF paging.")
    }

    let renderedHeightPx = 0
    let pageIndex = 0

    while (renderedHeightPx < canvas.height) {
      const sliceHeightPx = Math.min(
        pageHeightPx,
        canvas.height - renderedHeightPx,
      )
      pageCanvas.width = canvas.width
      pageCanvas.height = sliceHeightPx
      pageCtx.fillStyle = "#ffffff"
      pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
      pageCtx.drawImage(
        canvas,
        0,
        renderedHeightPx,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx,
      )

      // PNG avoids JPEG block artifacts that make text look unreadable.
      const sliceData = pageCanvas.toDataURL("image/png")
      const sliceHeightMm = sliceHeightPx / pxPerMm

      if (pageIndex > 0) {
        pdf.addPage()
      }
      pdf.addImage(
        sliceData,
        "PNG",
        MARGIN_MM,
        MARGIN_MM,
        imgWidth,
        sliceHeightMm,
      )

      renderedHeightPx += sliceHeightPx
      pageIndex += 1
    }

    pdf.save(`${baseName}.pdf`)
  } finally {
    host.remove()
  }
}
