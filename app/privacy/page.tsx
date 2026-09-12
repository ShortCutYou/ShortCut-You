import type { Metadata } from "next"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { LegalCallout, LegalContact, LegalDocument, LegalSection } from "@/components/legal-document"

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description: "ShortCutYou の個人情報とAPIキーの取り扱いについて",
}

export default function PrivacyPage() {
  return (
    <AppShell heading="プライバシーポリシー" subheading="データの保存場所と第三者サービスについて">
      <LegalDocument updatedAt="2026年9月12日">
        <p>
          ShortCutYou（以下「本サービス」）は、YouTubeショート特化のリサーチ補助ツールです。本ポリシーは、本サービスの利用に伴う情報の取り扱いを説明します。
        </p>

        <LegalCallout>
          <p className="font-medium text-emerald-800 dark:text-emerald-200">
            最重要: APIキーと履歴はブラウザ内のみに保存します
          </p>
          <p className="mt-2">
            ユーザーが設定画面で入力した YouTube Data API キーおよび Google Gemini API
            キー、ならびにリサーチ・分析の履歴は、すべてユーザー自身のブラウザ内（localStorage）にのみ保存されます。運営者がこれらの情報を収集・保管・販売することはありません。
          </p>
          <p className="mt-2 text-muted-foreground">
            リサーチやAI分析の実行時に限り、入力されたキーは本サービスの処理を仲介するAPIルートを経由し、YouTube
            Data API および Google Gemini API
            へリクエストするために使用されます。サーバー上のデータベース等へキーや履歴を保存することはありません。
          </p>
        </LegalCallout>

        <LegalSection title="1. 取得する情報">
          <p>本サービスがブラウザに保存しうる情報は、次のとおりです。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>ユーザーが任意で入力した API キー（YouTube Data API / Google Gemini）</li>
            <li>ユーザーが実行したリサーチ結果の履歴（動画メタデータのコピー）</li>
            <li>表示テーマ（ダーク / ライト）などのUI設定</li>
          </ul>
          <p>
            アカウント登録やログインは提供していません。氏名・メールアドレス・決済情報などの個人情報の提出は求めていません。
          </p>
        </LegalSection>

        <LegalSection title="2. 保存場所と送信の範囲">
          <p>
            上記の情報はユーザーの端末内に留まります。運営者の管理するサーバーへ、分析履歴やAPIキーを恒常的に送信・収集する仕組みはありません。
          </p>
          <p>
            機能を実行するために、動画IDやメタデータは YouTube Data API
            へ、分析用のメタデータは Google Gemini API
            へ送信されます。これらは各サービスの提供に必要な範囲に限られます。
          </p>
        </LegalSection>

        <LegalSection title="3. YouTube Data API の利用">
          <p>
            本サービスは Google の YouTube Data API
            を利用して、公開されている動画・チャンネルのメタデータを取得します。YouTube
            から取得したデータの利用は、YouTube の規約および Google のポリシーに従います。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                YouTube利用規約
              </a>
            </li>
            <li>
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-foreground underline underline-offset-4"
              >
                Googleプライバシーポリシー
              </a>
            </li>
          </ul>
          <p>
            YouTube API
            から取得した情報を、ユーザーの端末以外へ転売・再配布する目的では利用しません。
          </p>
        </LegalSection>

        <LegalSection title="4. アクセス解析・Cookie（導入時の扱い）">
          <p>
            本サービスは現時点で Google Analytics
            等のアクセス解析を必須機能としては組み込んでいません。今後、利用状況の把握のためにアクセス解析ツールを導入する場合があります。
          </p>
          <p>
            導入した場合、Cookie
            等により閲覧ページ、端末・ブラウザの種別、おおよその地域、参照元などが当該事業者（例:
            Google）へ送信されることがあります。収集された情報の取り扱いは、各事業者のプライバシーポリシーに従います。ユーザーはブラウザ設定により
            Cookie を拒否できますが、一部機能が制限されることがあります。
          </p>
        </LegalSection>

        <LegalSection title="5. 第三者提供">
          <p>
            法令に基づく場合を除き、ユーザーの API キーやリサーチ履歴を第三者に提供しません。YouTube /
            Google
            への送信は、前各項に記載したサービス提供に必要な範囲に限ります。
          </p>
        </LegalSection>

        <LegalSection title="6. 情報の削除">
          <p>
            ブラウザの localStorage
            を消去するか、本サービスの設定画面から履歴キャッシュをクリアすることで、端末内の保存データを削除できます。APIキーの入力欄を空にして保存することでも、ブラウザ内のキーを消せます。
          </p>
        </LegalSection>

        <LegalSection title="7. 改定">
          <p>
            本ポリシーは、法令やサービスの変更に応じて改定することがあります。重要な変更がある場合は、本ページの最終更新日を改めます。
          </p>
        </LegalSection>

        <LegalContact />

        <p>
          あわせて{" "}
          <Link href="/terms" className="text-foreground underline underline-offset-4">
            利用規約
          </Link>
          もご確認ください。
        </p>
      </LegalDocument>
    </AppShell>
  )
}
