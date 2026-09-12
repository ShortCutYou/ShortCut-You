"use client"

import { useEffect } from "react"

import { applyTheme, getStoredTheme } from "@/lib/client-settings"

export function ThemeBoot() {
  useEffect(() => {
    applyTheme(getStoredTheme())
  }, [])
  return null
}
