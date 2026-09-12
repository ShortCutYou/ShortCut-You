import type { ReactNode } from "react"

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { LegalLinks } from "@/components/legal-document"
import { ShareButton } from "@/components/share-button"
import { GLOBAL_SHARE_TEXT } from "@/lib/share"

export function AppShell({
  heading,
  subheading,
  children,
  contentClassName,
}: {
  heading: string
  subheading?: string
  children: ReactNode
  contentClassName?: string
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className={contentClassName}>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-border/50 bg-background/70 px-4 backdrop-blur-sm md:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-5" />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-semibold text-foreground md:text-base">{heading}</h1>
            {subheading ? (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">{subheading}</p>
            ) : null}
          </div>
          <ShareButton text={GLOBAL_SHARE_TEXT} urlMode="origin" />
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
          {children}
        </main>
        <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground md:px-8">
          <span>© ShortCutYou</span>
          <LegalLinks />
        </footer>
      </SidebarInset>
    </SidebarProvider>
  )
}
