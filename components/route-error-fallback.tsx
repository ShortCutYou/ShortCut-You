"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function RouteErrorFallback({
  title,
  description,
  reset,
  homeHref = "/",
  homeLabel = "リサーチに戻る",
}: {
  title: string
  description?: string
  reset?: () => void
  homeHref?: string
  homeLabel?: string
}) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description ?? "画面の表示中に問題が起きました。もう一度開くか、一覧へ戻ってください。"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {reset ? (
          <Button type="button" onClick={reset}>
            再読み込み
          </Button>
        ) : null}
        <Button variant="outline" asChild>
          <Link href={homeHref}>{homeLabel}</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
