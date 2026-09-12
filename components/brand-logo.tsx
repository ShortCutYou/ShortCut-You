import { Clapperboard } from "lucide-react"

import { cn } from "@/lib/utils"

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-3 [&_svg]:size-[18px]!", className)}>
      <div
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-neutral-950 text-white shadow-[0_8px_16px_-10px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-white/12"
      >
        <Clapperboard className="size-[18px] stroke-[2.25]" />
      </div>
      <div className="grid min-w-0 flex-1 text-left leading-none">
        <span className="truncate font-brand text-[15px] tracking-tight text-sidebar-foreground">
          <span className="font-bold">Short</span>
          <span className="font-light">CutYou</span>
        </span>
        <span className="mt-1.5 truncate text-xs tracking-widest text-muted-foreground">
          ショート特化リサーチ
        </span>
      </div>
    </div>
  )
}
