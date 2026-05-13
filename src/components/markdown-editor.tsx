"use client"

import { markdown } from "@codemirror/lang-markdown"
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands"
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view"
import { oneDark } from "@codemirror/theme-one-dark"
import CodeMirror from "@uiw/react-codemirror"
import { useTheme } from "next-themes"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function MarkdownEditor({
  value,
  onChange,
  className,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme()

  const extensions = useMemo(() => {
    const base = [
      lineNumbers(),
      highlightActiveLine(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown(),
      EditorView.lineWrapping,
      placeholder("Write Markdown here…"),
      EditorView.theme({
        "&": { height: "100%" },
        ".cm-scroller": {
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        },
      }),
    ]
    if (resolvedTheme === "dark") {
      base.unshift(oneDark)
    }
    return base
  }, [resolvedTheme])

  return (
    <div
      className={cn(
        "h-full min-h-0 overflow-hidden rounded-lg border border-border bg-muted/30",
        className,
      )}
    >
      <CodeMirror
        value={value}
        height="100%"
        theme="none"
        extensions={extensions}
        basicSetup={false}
        onChange={onChange}
        className="h-full min-h-[280px] md:min-h-0 [&_.cm-editor]:h-full [&_.cm-editor]:outline-none [&_.cm-scroller]:min-h-0"
        indentWithTab
      />
    </div>
  )
}
