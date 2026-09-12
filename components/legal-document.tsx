import type { ReactNode } from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

export function LegalDocument({
  updatedAt,
  children,
}: {
  updatedAt: string
  children: ReactNode
}) {
  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <p className="text-xs text-muted-foreground">最終更新日: {updatedAt}</p>
      <div className="legal-prose flex flex-col gap-8 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </article>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {children}
    </section>
  )
}

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <Card className="border-emerald-500/20 bg-emerald-500/8 ring-1 ring-emerald-500/20">
      <CardContent className="text-sm leading-7 text-foreground">
        {children}
      </CardContent>
    </Card>
  )
}

export function LegalContact() {
  return (
    <LegalSection title="お問い合わせ（運営者情報）">
      <p>
        本サービスに関するお問い合わせやフィードバックは、運営者のX（旧Twitter）アカウント（
        <a
          href="https://x.com/ductape5a0"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-4"
        >
          @ductape5a0
        </a>
        ）のDMまたはリプライまでお願いいたします。
      </p>
    </LegalSection>
  )
}

export function LegalLinks({ className }: { className?: string }) {
  return (
    <nav
      className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}
      aria-label="法務"
    >
      <Link href="/privacy" className="hover:text-foreground">
        プライバシーポリシー
      </Link>
      <span aria-hidden="true" className="text-border">
        /
      </span>
      <Link href="/terms" className="hover:text-foreground">
        利用規約
      </Link>
    </nav>
  )
}
