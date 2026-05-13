import { downloadBlob } from "@/lib/download"

export function exportMarkdownFile(markdown: string, baseName: string): void {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" })
  downloadBlob(blob, `${baseName}.md`)
}
