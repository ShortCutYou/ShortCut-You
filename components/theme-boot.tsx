"use client"

import { useEffect } from "react"

import { applyTheme } from "@/lib/client-settings"

export function ThemeBoot() {
  useEffect(() => {
    applyTheme("dark")
  }, [])
  return null
}
