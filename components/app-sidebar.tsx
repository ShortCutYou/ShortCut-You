"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Settings, Timer } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { LegalLinks } from "@/components/legal-document"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const APP_VERSION = "0.1.0"

const navItems = [
  { title: "リサーチ", href: "/", icon: Search },
  { title: "履歴", href: "/history", icon: Timer },
  { title: "設定", href: "/settings", icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-zinc-800 bg-zinc-950 text-zinc-100">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-14 gap-0 px-2 hover:bg-transparent active:bg-transparent"
              render={<Link href="/" />}
            >
              <BrandLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="group-data-[collapsible=icon]:hidden px-3 pb-1">
          <LegalLinks className="text-[11px] text-zinc-400" />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="設定"
              isActive={pathname === "/settings" || pathname.startsWith("/settings/")}
              render={<Link href="/settings" />}
            >
              <Avatar size="sm">
                <AvatarFallback>G</AvatarFallback>
              </Avatar>
              <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-zinc-100">ゲスト</span>
                <span className="truncate text-xs text-zinc-400">
                  v{APP_VERSION} · 設定
                </span>
              </div>
              <Settings className="ml-auto size-4 text-zinc-400" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
