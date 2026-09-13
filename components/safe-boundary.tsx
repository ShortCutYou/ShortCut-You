"use client"

import { Component, type ReactNode } from "react"

export class SafeBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <p className="text-sm text-zinc-400">
            このブロックの表示に失敗しました。再分析するか、ページを再読み込みしてください。
          </p>
        )
      )
    }
    return this.props.children
  }
}
