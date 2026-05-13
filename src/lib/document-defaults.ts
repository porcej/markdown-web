const DEFAULT_MARKDOWN = `# Welcome to Markdown Web

Use the toolbar to pick a **Markdown format** (GitHub, CommonMark, or Strict), **upload** a \`.md\` file, or **export** your work as Markdown, HTML, or PDF.

## GitHub-flavored examples

| Feature | In GitHub mode |
| --- | --- |
| Tables | Yes |
| ~~Strikethrough~~ | Yes |

- [ ] Try editing this task list
- [x] Live preview updates as you type

\`\`\`ts
const greeting = "CodeMirror + React"
console.log(greeting)
\`\`\`

Inline HTML like <kbd>Ctrl</kbd> + <kbd>S</kbd> is only honored in **GitHub** mode (sanitized for safety).
`

export function sanitizeBaseName(stem: string): string {
  const trimmed = stem.trim() || "document"
  return trimmed.replace(/[/\\\\?%*:|"<>]/g, "-")
}

export function getDefaultMarkdown(): string {
  return DEFAULT_MARKDOWN
}

export function stemFromFilename(filename: string): string {
  return filename.replace(/\.(md|markdown|txt)$/i, "").trim() || filename
}
