/** YouTube Data API の video category ID（日本語リージョンの主要カテゴリ） */
const YOUTUBE_CATEGORY_JA: Record<string, string> = {
  "1": "映画とアニメ",
  "2": "自動車と乗り物",
  "10": "音楽",
  "15": "ペットと動物",
  "17": "スポーツ",
  "18": "短編映画",
  "19": "旅行とイベント",
  "20": "ゲーム",
  "21": "動画ブログ",
  "22": "ブログ",
  "23": "コメディー",
  "24": "エンターテイメント",
  "25": "ニュースと政治",
  "26": "ハウツーとスタイル",
  "27": "教育",
  "28": "科学と技術",
  "29": "非営利団体と社会活動",
  "30": "映画",
  "31": "アニメ",
  "32": "アクション/アドベンチャー",
  "33": "クラシック",
  "34": "コメディ",
  "35": "ドキュメンタリー",
  "36": "ドラマ",
  "37": "ファミリー",
  "38": "海外",
  "39": "ホラー",
  "40": "SF/ファンタジー",
  "41": "スリラー",
  "42": "ショート",
  "43": "番組",
  "44": "予告編",
}

export function youtubeCategoryName(categoryId: string | undefined) {
  const id = categoryId?.trim()
  if (!id) return undefined
  return YOUTUBE_CATEGORY_JA[id]
}

export function formatYoutubeCategory(categoryId: string | undefined) {
  const id = categoryId?.trim()
  if (!id) {
    return { id: "", name: "-", label: "-" }
  }
  const name = YOUTUBE_CATEGORY_JA[id]
  if (!name) {
    return { id, name: "その他", label: `その他 (ID: ${id})` }
  }
  return { id, name, label: `${name} (ID: ${id})` }
}
