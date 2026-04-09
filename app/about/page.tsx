import Header from "@/components/Header";

export const metadata = {
  title: "概要 | kabu-trader",
  description: "kabu-traderの概要。Claude Codeによる完全自動日本株売買システム。実資金100万円で運用中。",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f6" }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* タイトル */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
            プロジェクト概要
          </span>
          <h1 className="text-2xl font-bold text-gray-900">kabu-trader とは</h1>
          <p className="text-gray-500 mt-2 leading-relaxed">
            Claude Code（Anthropic の AI）が完全自動で日本株を売買するシステムです。
            人間は一切介入せず、AIが戦略判断・発注・記録をすべて行います。
          </p>
        </div>

        {/* ハイライトカード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "運用資金", value: "¥1,000,000" },
            { label: "運用開始", value: "2026年3月" },
            { label: "市場", value: "東京証券取引所" },
            { label: "自動化", value: "100%" },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-gray-200 rounded-lg p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{item.label}</p>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* セクション */}
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">なぜ公開するのか</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              「AIが本当に株式市場で通用するのか」という問いに、実資金で答えを出すプロジェクトです。
              バックテストやシミュレーションではなく、リアルマネーでの実績をすべて公開します。
              銘柄名は<span className="font-semibold text-gray-800">2日遅延</span>で公開（インサイダー取引防止）。
            </p>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">システム構成</h2>
            <div className="space-y-3">
              {[
                {
                  label: "エージェント",
                  value: "Claude Code（Anthropic claude-sonnet-4-6）",
                },
                {
                  label: "データソース",
                  value: "株価データAPI（前日OHLCV・財務データ）",
                },
                {
                  label: "発注",
                  value: "kabu STATION API（auカブコム証券）",
                },
                {
                  label: "実行環境",
                  value: "Windows / タスクスケジューラ で毎営業日自動起動",
                },
                {
                  label: "DB",
                  value: "Supabase（PostgreSQL）/ RLS で2日遅延公開",
                },
              ].map((row) => (
                <div key={row.label} className="flex gap-3 text-sm">
                  <span className="w-28 flex-shrink-0 text-gray-400">{row.label}</span>
                  <span className="text-gray-700">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">免責事項</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              本サイトは投資成績の公開を目的としており、投資助言を行うものではありません。
              掲載情報は参考目的のみであり、投資判断はご自身の責任において行ってください。
              過去の運用実績は将来の成果を保証するものではありません。
            </p>
          </section>

          {/* note・X リンク */}
          <div className="flex gap-3">
            <a
              href="https://note.com/mi_autolab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zm-7 13H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V6h3v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V6h4v2z" />
              </svg>
              noteで記事を読む
            </a>
            <a
              href="https://twitter.com/miautolab"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-700 hover:border-gray-400 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.737-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              @miautolab をフォロー
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
