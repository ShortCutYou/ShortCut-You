import type { ReactNode } from "react"

function toSafeText(value: unknown) {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function splitEmphasis(value: unknown) {
  const text = toSafeText(value)
  if (!text) return "-"

  const pattern =
    /\*\*([\s\S]+?)\*\*|__([\s\S]+?)__|<strong>([\s\S]+?)<\/strong>|<b>([\s\S]+?)<\/b>/gi
  const nodes: ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  try {
    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push(text.slice(lastIndex, match.index))
      }
      const emphasized = match[1] ?? match[2] ?? match[3] ?? match[4] ?? ""
      if (key === 0) {
        nodes.push(
          <strong
            key={`em-${key}`}
            className="rounded-sm bg-orange-500/30 px-[0.2em] font-bold text-zinc-100 box-decoration-clone"
          >
            {emphasized}
          </strong>
        )
      } else {
        nodes.push(emphasized)
      }
      key += 1
      lastIndex = match.index + match[0].length
    }
  } catch {
    return text
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length > 0 ? nodes : text
}

export function AnalysisText({
  text,
  className,
  as: Tag = "span",
}: {
  text?: unknown
  className?: string
  as?: "span" | "p"
}) {
  return <Tag className={className}>{splitEmphasis(text)}</Tag>
}
