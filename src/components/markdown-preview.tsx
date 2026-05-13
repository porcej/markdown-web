"use client"

import remarkGfm from "remark-gfm"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw"
import rehypeSanitize from "rehype-sanitize"
import { cn } from "@/lib/utils"
import type { MarkdownFlavor } from "@/lib/markdown-flavors"
import {
  flavorAllowsRawHtml,
  flavorUsesGfm,
} from "@/lib/markdown-flavors"

type MarkdownPreviewProps = {
  markdown: string
  flavor: MarkdownFlavor
  className?: string
}

export function MarkdownPreview({
  markdown,
  flavor,
  className,
}: MarkdownPreviewProps) {
  const allowRaw = flavorAllowsRawHtml(flavor)
  const rehypePlugins = allowRaw
    ? [rehypeRaw, rehypeSanitize]
    : [rehypeSanitize]

  return (
    <div
      className={cn(
        "h-full min-h-0 overflow-auto rounded-lg border border-border bg-card p-4 text-card-foreground",
        "prose prose-neutral max-w-none dark:prose-invert prose-pre:bg-muted prose-pre:text-foreground",
        flavorUsesGfm(flavor) && "prose-table:text-sm",
        className,
      )}
    >
      {markdown.trim() === "" ? (
        <p className="text-sm text-muted-foreground not-prose">
          Nothing to preview yet.
        </p>
      ) : (
        <ReactMarkdown
          remarkPlugins={flavorUsesGfm(flavor) ? [remarkGfm] : []}
          remarkRehypeOptions={{ allowDangerousHtml: allowRaw }}
          rehypePlugins={rehypePlugins}
          skipHtml={!allowRaw}
        >
          {markdown}
        </ReactMarkdown>
      )}
    </div>
  )
}
