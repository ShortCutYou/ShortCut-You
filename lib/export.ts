import {
  formatCountJa,
  formatEngagementRate,
  formatIso8601Duration,
  formatLikeRate,
  formatPublishedAt,
} from "@/lib/format-stats"
import type { BuzzAnalysis } from "@/lib/ai-analysis"
import type { YoutubeVideo } from "@/lib/youtube"

export function exportStamp(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

export function youtubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

function csvCell(value: string | number | undefined | null) {
  const text = value == null ? "" : String(value)
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

function channelName(video: YoutubeVideo) {
  return video.channel?.snippet?.title ?? video.snippet?.channelTitle ?? ""
}

function subscriberLabel(video: YoutubeVideo) {
  if (video.channel?.statistics?.hiddenSubscriberCount) return "非公開"
  return video.channel?.statistics?.subscriberCount ?? ""
}

export function buildResearchCsv(videos: YoutubeVideo[]) {
  const header = [
    "タイトル",
    "チャンネル名",
    "再生数",
    "高評価数",
    "コメント数",
    "エンゲージメント率",
    "高評価率",
    "登録者数",
    "動画尺",
    "公開日",
    "動画ID",
    "動画URL",
  ]

  const rows = videos.map((video) => [
    video.snippet?.title ?? "",
    channelName(video),
    video.statistics?.viewCount ?? "",
    video.statistics?.likeCount ?? "",
    video.statistics?.commentCount ?? "",
    formatEngagementRate(
      video.statistics?.likeCount,
      video.statistics?.commentCount,
      video.statistics?.viewCount
    ),
    formatLikeRate(video.statistics?.likeCount, video.statistics?.viewCount),
    subscriberLabel(video),
    formatIso8601Duration(video.contentDetails?.duration),
    formatPublishedAt(video.snippet?.publishedAt),
    video.id,
    youtubeWatchUrl(video.id),
  ])

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")
}

export function downloadResearchCsv(videos: YoutubeVideo[], filename?: string) {
  if (videos.length === 0) return
  const csv = `\uFEFF${buildResearchCsv(videos)}`
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const href = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = href
  link.download = filename ?? `youtube-shorts-research-${exportStamp()}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(href)
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function emphasisHtml(value: string) {
  let used = false
  return escapeHtml(value).replace(/\*\*([\s\S]+?)\*\*/g, (_, inner: string) => {
    if (used) return inner
    used = true
    return `<strong>${inner}</strong>`
  })
}

function listHtml(items: string[]) {
  if (items.length === 0) return "<p class='muted'>なし</p>"
  return `<ol>${items.map((item) => `<li>${emphasisHtml(item)}</li>`).join("")}</ol>`
}

function videoTableHtml(videos: YoutubeVideo[]) {
  const body = videos
    .map((video) => {
      return `<tr>
        <td>${escapeHtml(video.snippet?.title ?? "(無題)")}</td>
        <td>${escapeHtml(channelName(video) || "-")}</td>
        <td>${escapeHtml(formatCountJa(video.statistics?.viewCount))}</td>
        <td>${escapeHtml(formatCountJa(video.statistics?.likeCount))}</td>
        <td>${escapeHtml(formatCountJa(video.statistics?.commentCount))}</td>
        <td>${escapeHtml(
          formatEngagementRate(
            video.statistics?.likeCount,
            video.statistics?.commentCount,
            video.statistics?.viewCount
          )
        )}</td>
        <td>${escapeHtml(youtubeWatchUrl(video.id))}</td>
      </tr>`
    })
    .join("")

  return `<table>
    <thead>
      <tr>
        <th>タイトル</th>
        <th>チャンネル</th>
        <th>再生数</th>
        <th>高評価</th>
        <th>コメント</th>
        <th>EG率</th>
        <th>URL</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function analysisHtml(analysis: BuzzAnalysis) {
  const beats = analysis.structure?.beats ?? []
  const ideas = analysis.ideaTemplates ?? []

  const beatHtml = beats
    .map(
      (beat) =>
        `<div class="beat"><strong>${emphasisHtml(beat.label ?? "")}</strong><p>${emphasisHtml(beat.detail ?? "")}</p></div>`
    )
    .join("")

  const ideaHtml = ideas
    .map(
      (idea) =>
        `<div class="idea"><strong>${emphasisHtml(idea.title ?? "")}</strong><p>${emphasisHtml(idea.outline ?? "")}</p></div>`
    )
    .join("")

  return `
    <section>
      <h2>AIバズ要因分析</h2>
      <p class="muted">Gemini${analysis.model ? ` · ${escapeHtml(analysis.model)}` : ""}</p>
      ${
        analysis.performance
          ? `<h3>パフォーマンス指標</h3>
      <p>バズ・ポテンシャル: ${analysis.performance.buzzPotential}/100</p>
      ${analysis.performance.metrics
        .map(
          (metric) =>
            `<p>${escapeHtml(metric.label)}: ${metric.score}/100 — ${escapeHtml(metric.note ?? "")}</p>`
        )
        .join("")}`
          : ""
      }
      <h3>数値のひとこと評価</h3>
      ${
        analysis.statComments
          ? `<ul>
        <li>再生数: ${escapeHtml(analysis.statComments.views ?? "")}</li>
        <li>高評価: ${escapeHtml(analysis.statComments.likes ?? "")}</li>
        <li>コメント: ${escapeHtml(analysis.statComments.comments ?? "")}</li>
        <li>EG率: ${escapeHtml(analysis.statComments.engagement ?? "")}</li>
        <li>高評価率: ${escapeHtml(analysis.statComments.likeRate ?? "")}</li>
        <li>登録者: ${escapeHtml(analysis.statComments.subscribers ?? "")}</li>
      </ul>`
          : "<p class='muted'>なし</p>"
      }
      <h3>総評</h3>
      <p>${emphasisHtml(analysis.summary ?? "")}</p>
      <h3>冒頭フックの分析</h3>
      <p><strong>${emphasisHtml(analysis.hook?.headline ?? "")}</strong></p>
      <p>${emphasisHtml(analysis.hook?.analysis ?? "")}</p>
      <h3>構成の型</h3>
      <p>${emphasisHtml(analysis.structure?.secret ?? "")}</p>
      ${beatHtml}
      <h3>クリエイターへの示唆</h3>
      ${listHtml(analysis.creatorInsights ?? [])}
      <h3>なぜ伸びたのか</h3>
      ${listHtml(analysis.whyItGrew ?? [])}
      <h3>真似できるポイント</h3>
      ${listHtml(analysis.copyablePoints ?? [])}
      <h3>構成のフレームワーク</h3>
      ${ideaHtml || "<p class='muted'>なし</p>"}
    </section>
  `
}

export function buildPdfReportHtml(options: {
  videos: YoutubeVideo[]
  analysis?: BuzzAnalysis | null
  title?: string
}) {
  const stamp = exportStamp()
  const generatedAt = new Intl.DateTimeFormat("ja-JP", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date())
  const reportTitle = options.title ?? "YouTubeショート リサーチレポート"
  const first = options.videos[0]
  const detail =
    options.videos.length === 1 && first
      ? `<section>
          <h2>動画メタデータ</h2>
          <p><strong>${escapeHtml(first.snippet?.title ?? "(無題)")}</strong></p>
          <p>チャンネル: ${escapeHtml(channelName(first) || "-")} ／ 公開日: ${escapeHtml(
            formatPublishedAt(first.snippet?.publishedAt)
          )} ／ 尺: ${escapeHtml(formatIso8601Duration(first.contentDetails?.duration))}</p>
          <p>登録者数: ${escapeHtml(
            first.channel?.statistics?.hiddenSubscriberCount
              ? "非公開"
              : `${formatCountJa(first.channel?.statistics?.subscriberCount)}人`
          )}</p>
        </section>`
      : ""

  const analysisBlock = options.analysis
    ? analysisHtml(options.analysis)
    : options.videos.length === 1
      ? `<section><h2>AIバズ要因分析</h2><p class="muted">未実行です。詳細画面で AI 分析を実行すると、フック・構成・示唆がこのレポートに含まれます。</p></section>`
      : ""

  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>youtube-shorts-report-${stamp}</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: "Hiragino Kaku Gothic ProN", "Noto Sans JP", Meiryo, sans-serif;
      color: #171717;
      background: #ece8e1;
    }
    .toolbar {
      position: sticky;
      top: 0;
      display: flex;
      justify-content: space-between;
      gap: 12px;
      align-items: center;
      padding: 12px 20px;
      background: #171717;
      color: #f5f5f5;
    }
    .toolbar button, .toolbar .hint {
      font: inherit;
    }
    .toolbar button {
      border: 0;
      border-radius: 8px;
      padding: 8px 14px;
      background: #f5f5f5;
      color: #171717;
      cursor: pointer;
      font-weight: 600;
    }
    .hint { font-size: 12px; opacity: 0.8; }
    .page {
      max-width: 920px;
      margin: 24px auto 48px;
      background: #fffaf3;
      padding: 36px 40px;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgb(0 0 0 / 12%);
    }
    h1 { font-size: 22px; margin: 0 0 6px; }
    h2 { font-size: 16px; margin: 28px 0 10px; border-bottom: 1px solid #e7e0d6; padding-bottom: 6px; }
    h3 { font-size: 13px; margin: 16px 0 6px; color: #525252; }
    p { line-height: 1.7; margin: 0 0 8px; }
    .muted { color: #737373; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { border: 1px solid #e7e0d6; padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f3eee6; }
    ol { margin: 0; padding-left: 1.2rem; }
    li { margin: 0 0 6px; line-height: 1.6; }
    .beat, .idea { background: #f7f3ec; border-radius: 10px; padding: 10px 12px; margin: 8px 0; }
    @media print {
      body { background: #fff; }
      .toolbar { display: none !important; }
      .page {
        margin: 0;
        padding: 0;
        box-shadow: none;
        border-radius: 0;
        max-width: none;
      }
    }
  </style>
</head>
<body>
  <div class="toolbar">
    <div>
      <strong>ShortCutYou</strong>
      <div class="hint">印刷ダイアログで「PDFに保存」を選ぶとファイル出力できます。</div>
    </div>
    <button type="button" onclick="window.print()">PDFとして保存 / 印刷</button>
  </div>
  <article class="page">
    <p class="muted">ShortCutYou · ショート特化リサーチ</p>
    <h1>${escapeHtml(reportTitle)}</h1>
    <p class="muted">出力日 ${escapeHtml(generatedAt)} ／ ${options.videos.length} 件</p>
    ${detail}
    <section>
      <h2>リサーチ結果一覧</h2>
      ${videoTableHtml(options.videos)}
    </section>
    ${analysisBlock}
  </article>
</body>
</html>`
}

export function openPdfReport(options: {
  videos: YoutubeVideo[]
  analysis?: BuzzAnalysis | null
  title?: string
}) {
  if (options.videos.length === 0) return
  const html = buildPdfReportHtml(options)
  const blob = new Blob([html], { type: "text/html;charset=utf-8" })
  const href = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = href
  link.target = "_blank"
  link.rel = "noopener,noreferrer"
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(href), 60_000)
}
