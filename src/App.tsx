"use client"

import {
  ChevronDown,
  FileDown,
  FileUp,
  Laptop,
  Moon,
  Sun,
} from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { useTheme } from "next-themes"

import { MarkdownEditor } from "@/components/markdown-editor"
import { MarkdownPreview } from "@/components/markdown-preview"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getDefaultMarkdown,
  sanitizeBaseName,
  stemFromFilename,
} from "@/lib/document-defaults"
import { exportHtmlFile } from "@/lib/export-html"
import { exportMarkdownFile } from "@/lib/export-markdown"
import { exportPdfFile } from "@/lib/export-pdf"
import { FLAVOR_OPTIONS, type MarkdownFlavor } from "@/lib/markdown-flavors"

export default function App() {
  const [markdown, setMarkdown] = useState(() => getDefaultMarkdown())
  const [flavor, setFlavor] = useState<MarkdownFlavor>("github")
  const [documentStem, setDocumentStem] = useState("document")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { setTheme, theme } = useTheme()

  const baseName = sanitizeBaseName(documentStem)

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      setMarkdown(text)
      setDocumentStem(stemFromFilename(file.name))
      toast.success(`Loaded ${file.name}`)
    } catch {
      toast.error("Could not read that file.")
    }
  }

  const ensureHasContent = () => {
    if (!markdown.trim()) {
      toast.message("Nothing to export", {
        description: "Add some Markdown first.",
      })
      return false
    }
    return true
  }

  const handleExportMd = () => {
    if (!ensureHasContent()) return
    exportMarkdownFile(markdown, baseName)
    toast.success("Download started", { description: `${baseName}.md` })
  }

  const handleExportHtml = async () => {
    if (!ensureHasContent()) return
    try {
      await exportHtmlFile(markdown, flavor, baseName)
      toast.success("Download started", { description: `${baseName}.html` })
    } catch {
      toast.error("HTML export failed.")
    }
  }

  const handleExportPdf = async () => {
    if (!ensureHasContent()) return
    const id = toast.loading("Building PDF…")
    try {
      await exportPdfFile(markdown, flavor, baseName)
      toast.success("PDF ready", { id, description: `${baseName}.pdf` })
    } catch {
      toast.error("PDF export failed.", { id })
    }
  }

  const desktopPanels = (
    <>
      <ResizablePanel
        defaultSize={52}
        minSize={28}
        className="min-h-0 min-w-0 pr-0 md:pr-1"
      >
        <MarkdownEditor
          value={markdown}
          onChange={setMarkdown}
          className="h-full min-h-[420px]"
        />
      </ResizablePanel>
      <ResizableHandle withHandle className="hidden md:flex" />
      <ResizablePanel
        defaultSize={48}
        minSize={28}
        className="min-h-0 min-w-0 pl-0 md:pl-1"
      >
        <MarkdownPreview markdown={markdown} flavor={flavor} className="h-full" />
      </ResizablePanel>
    </>
  )

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="truncate text-lg font-semibold tracking-tight">
              Markdown Web
            </h1>
            <p className="text-xs text-muted-foreground">
              Edit with live preview, choose a format, export or upload files.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={flavor}
              onValueChange={(value) => setFlavor(value as MarkdownFlavor)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Markdown format" />
              </SelectTrigger>
              <SelectContent>
                {FLAVOR_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown,.txt,text/markdown"
              className="hidden"
              onChange={onFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="size-4" />
              Upload
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <FileDown className="size-4" />
                  Export
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Download as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleExportMd}>
                  Markdown (.md)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExportHtml()}>
                  HTML (.html)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExportPdf()}>
                  PDF (.pdf)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="hidden h-8 sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  Theme
                  <ChevronDown className="size-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                  <DropdownMenuRadioItem value="light" className="gap-2">
                    <Sun className="size-4" />
                    Light
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="dark" className="gap-2">
                    <Moon className="size-4" />
                    Dark
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="system" className="gap-2">
                    <Laptop className="size-4" />
                    System
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0 flex-col gap-4 px-4 pb-6 pt-4">
        <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
          <ResizablePanelGroup
            orientation="horizontal"
            className="min-h-[calc(100svh-9rem)] flex-1 rounded-xl border border-border bg-card/40 p-2"
          >
            {desktopPanels}
          </ResizablePanelGroup>
        </div>

        <Tabs
          defaultValue="edit"
          className="flex min-h-[calc(100svh-9rem)] flex-1 flex-col md:hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent
            value="edit"
            className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <MarkdownEditor
              value={markdown}
              onChange={setMarkdown}
              className="min-h-[55svh] flex-1"
            />
          </TabsContent>
          <TabsContent
            value="preview"
            className="mt-3 flex min-h-0 flex-1 flex-col data-[state=inactive]:hidden"
          >
            <MarkdownPreview
              markdown={markdown}
              flavor={flavor}
              className="min-h-[55svh] flex-1"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
