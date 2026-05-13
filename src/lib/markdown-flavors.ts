export type MarkdownFlavor = "github" | "commonmark" | "strict"

export const FLAVOR_OPTIONS: {
  value: MarkdownFlavor
  label: string
  description: string
}[] = [
  {
    value: "github",
    label: "GitHub",
    description: "GFM: tables, task lists, strikethrough, autolinks",
  },
  {
    value: "commonmark",
    label: "CommonMark",
    description: "Standard Markdown without GFM extensions",
  },
  {
    value: "strict",
    label: "Strict",
    description: "CommonMark with raw HTML ignored in preview",
  },
]

export function flavorUsesGfm(flavor: MarkdownFlavor): boolean {
  return flavor === "github"
}

export function flavorAllowsRawHtml(flavor: MarkdownFlavor): boolean {
  return flavor === "github"
}
