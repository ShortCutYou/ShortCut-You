"use client"

import { ChevronDown, Download, FileSpreadsheet, FileText } from "lucide-react"

import type { BuzzAnalysis } from "@/lib/ai-analysis"
import { downloadResearchCsv, openPdfReport } from "@/lib/export"
import type { YoutubeVideo } from "@/lib/youtube"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ExportMenu({
  videos,
  analysis,
  csvFilename,
  reportTitle,
}: {
  videos: YoutubeVideo[]
  analysis?: BuzzAnalysis | null
  csvFilename?: string
  reportTitle?: string
}) {
  const disabled = videos.length === 0

  function handleCsv() {
    if (videos.length === 0) return
    downloadResearchCsv(videos, csvFilename)
  }

  function handlePdf() {
    if (videos.length === 0) return
    openPdfReport({
      videos,
      analysis,
      title: reportTitle,
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Download data-icon="inline-start" />
        エクスポート
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 w-auto">
        <DropdownMenuGroup>
          <DropdownMenuLabel>データの書き出し</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCsv}>
            <FileSpreadsheet />
            CSVでダウンロード
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePdf}>
            <FileText />
            PDFレポートを作成
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
