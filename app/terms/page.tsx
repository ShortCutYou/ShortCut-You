import type { Metadata } from "next"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { LegalContact, LegalDocument, LegalSection } from "@/components/legal-document"

export const metadata: Metadata = {
  title: "利用規約",
  description: "ShortCutYou の利用条件と免責事項",
}

export default function TermsPage() {
  return (
    <AppShell heading="利用規約" subheading="本サービスの利用条件">
      <LegalDocument updatedAt="2026年9月12日">
        <p>
          この利用規約（以下「本規約」）は、ShortCutYou（以下「本サービス」）の利用条件を定めるものです。本サービスを利用した時点で、本規約に同意したものとみなします。
        </p>

        <LegalSection title="1. サービスの内容">
          <p>
            本サービスは、公開されている YouTube
            ショート等のメタデータを取得し、AI（Gemini）によりバズ要因の言語化を補助するリサーチツールです。ログイン機能や成果保証型のコンサルティングは含みません。
          </p>
        </LegalSection>

        <LegalSection title="2. 正確性・完全性に関する免責">
          <p>
            YouTube
            から取得する数値・メタデータ、およびAIによる分析結果（冒頭フックの解釈、構成の指摘、企画案、クリエイターへの示唆などを含みます）は、参考情報です。運営者は、これらの正確性、完全性、最新性、特定目的への適合性について、一切の保証を行いません。
          </p>
          <p>
            AIの出力には誤り、偏り、または事実と異なる内容が含まれることがあります。重要な判断の前に、ユーザー自身で一次情報を確認してください。
          </p>
        </LegalSection>

        <LegalSection title="3. 損害に関する免責">
          <p>
            本サービスの利用、利用不能、分析結果への依拠、APIキーの管理不備、第三者APIの停止・制限などに起因して生じた損害について、運営者は一切の責任を負いません。これには次のものを含みますが、これらに限りません。
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>YouTube アカウント、Google アカウント、API キーの停止・制限・削除</li>
            <li>再生数・収益・指名などのビジネス上の不利益</li>
            <li>データの消失、機会損失、逸失利益、間接損害、特別損害</li>
          </ul>
          <p>
            本サービスはユーザー自身の API
            クォータを消費します。クォータ超過や課金は、ユーザーと Google / YouTube
            との契約に基づきます。
          </p>
        </LegalSection>

        <LegalSection title="4. 禁止事項">
          <p>ユーザーは、次の行為をしてはなりません。</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>違法コンテンツの生成、頒布、助長</li>
            <li>スパム、なりすまし、大量自動投稿、迷惑行為</li>
            <li>
              YouTube 利用規約、YouTube API 利用規約、Google
              のポリシーに違反する目的での利用
            </li>
            <li>第三者の権利（著作権、商標、肖像、プライバシー等）を侵害する利用</li>
            <li>本サービスまたは第三者のシステムへの不正アクセス、過度な負荷、改ざん</li>
            <li>他人の API キーの無断使用</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. APIキーと履歴の管理">
          <p>
            APIキーおよび履歴はユーザーのブラウザに保存されます。端末の共有、拡張機能、マルウェア等による漏洩リスクはユーザーの責任で管理してください。詳細は
            {" "}
            <Link href="/privacy" className="text-foreground underline underline-offset-4">
              プライバシーポリシー
            </Link>
            を参照してください。
          </p>
        </LegalSection>

        <LegalSection title="6. サービスの変更・中断">
          <p>
            運営者は、事前の通知なく本サービスの内容変更、一時停止、終了を行うことがあります。これによって生じた損害についても、運営者は責任を負いません。
          </p>
        </LegalSection>

        <LegalSection title="7. 規約の変更">
          <p>
            本規約は必要に応じて改定します。改定後に本サービスを利用した場合、改定後の規約に同意したものとみなします。
          </p>
        </LegalSection>

        <LegalSection title="8. 準拠法">
          <p>
            本規約は日本法を準拠法とします。本サービスに関する紛争は、運営者の所在地を管轄する裁判所を第一審の専属的合意管轄とします。
          </p>
        </LegalSection>

        <LegalContact />
      </LegalDocument>
    </AppShell>
  )
}
