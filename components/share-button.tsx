"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Share2 } from "lucide-react"

import {
  canUseWebShare,
  copyToClipboard,
  getShareUrl,
  tweetIntentUrl,
} from "@/lib/share"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ShareButton({
  text,
  urlMode = "origin",
  size = "sm",
}: {
  text: string
  urlMode?: "origin" | "current"
  size?: "sm" | "default"
}) {
  const [nativeShare, setNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setNativeShare(canUseWebShare())
  }, [])

  async function shareNative() {
    const url = getShareUrl(urlMode)
    try {
      await navigator.share({
        title: "ShortCutYou",
        text,
        url,
      })
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return
      await copyLink()
    }
  }

  async function copyLink() {
    const url = getShareUrl(urlMode)
    try {
      await copyToClipboard(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {
      window.alert("リンクのコピーに失敗しました。URLを手動でコピーしてください。")
    }
  }

  function shareOnX() {
    const url = getShareUrl(urlMode)
    window.open(tweetIntentUrl(text, url), "_blank", "noopener,noreferrer")
  }

  const triggerClass = buttonVariants({ variant: "outline", size })

  return (
    <div className="relative">
      {nativeShare ? (
        <Button type="button" variant="outline" size={size} onClick={() => void shareNative()}>
          <Share2 data-icon="inline-start" />
          共有
        </Button>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger className={triggerClass}>
            <Share2 data-icon="inline-start" />
            共有
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52 w-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel>シェアする</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={shareOnX}>
                <span className="flex size-4 items-center justify-center text-[11px] font-semibold">
                  𝕏
                </span>
                X（Twitter）でシェア
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void copyLink()}>
                <Copy />
                リンクをコピー
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {copied ? (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-xs text-background shadow-lg"
        >
          <Check className="size-3.5" />
          リンクをコピーしました
        </div>
      ) : null}
    </div>
  )
}
