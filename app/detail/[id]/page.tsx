import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AppShell } from "@/components/app-shell"
import { VideoDetailLoader } from "@/components/video-detail-loader"
import { isYoutubeVideoId } from "@/lib/youtube"

type DetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: isYoutubeVideoId(id) ? "動画詳細" : "見つかりません",
  }
}

export default async function VideoDetailPage({ params }: DetailPageProps) {
  const { id } = await params
  if (!isYoutubeVideoId(id)) {
    notFound()
  }

  return (
    <AppShell heading="動画詳細" subheading="メタデータと AI バズ要因アナライザー">
      <VideoDetailLoader videoId={id} />
    </AppShell>
  )
}
