import Header from "@/components/Header";

export const metadata = {
  title: "戦略 | kabu-trader",
  description: "kabu-traderが採用する投資戦略と概要。",
};

export default function StrategyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f6" }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* タイトル */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
            kabu-trader について
          </span>
          <h1 className="text-2xl font-bold text-gray-900">採用戦略 &amp; 概要</h1>
          <p className="text-gray-500 mt-2 leading-relaxed">
            Claude Code（Anthropic の AI）が完全自動で日本株を売買するシステムです。
            独自スクリーニングで候補銘柄を絞り込み、シグナルスコアに応じてポジションサイズを自動計算します。
          </p>
        </div>

        <div className="space-y-5">

          {/* なぜ公開するのか */}
          <section className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">なぜ公開するのか</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              「AIが本当に株式市場で通用するのか」という問いに、実資金で答えを出すプロジェクトです。
              バックテストやシミュレーションではなく、リアルマネーでの実績をすべて公開します。
              銘柄名は<span className="font-semibold text-gray-800">2日遅延</span>で公開（インサイダー取引防止）。
            </p>
          </section>

          {/* PEAD */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">P</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">決算モメンタム戦略</h2>
                  <p className="text-xs text-gray-400">Post-Earnings Announcement Drift</p>
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">アクティブ</span>
            </div>
            <div className="px-6 py-4 text-sm text-gray-600">
              <p className="leading-relaxed">
                決算発表後の<span className="font-semibold text-gray-800">業績上方修正銘柄</span>をサプライズ率でスコアリングし、翌営業日の寄付きで買い。
                発表後に株価がサプライズの方向へ数日ドリフトする現象（PEAD）を利用。
                価格反応・センチメントフィルターで悪材料銘柄を除外する。
              </p>
            </div>
          </div>

          {/* Turnover */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <span className="text-emerald-700 text-xs font-bold">T</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">売買代金急増戦略</h2>
                  <p className="text-xs text-gray-400">Turnover Momentum</p>
                </div>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">アクティブ</span>
            </div>
            <div className="px-6 py-4 text-sm text-gray-600">
              <p className="leading-relaxed">
                前日の売買代金が過去平均から<span className="font-semibold text-gray-800">急増した銘柄</span>を検知し、翌営業日の寄付きで買い。
                機関投資家の参入やトレンド発生初期に伴う需給変化を捉える短期戦略。
              </p>
            </div>
          </div>

          {/* テクニカルモメンタム */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-700 text-xs font-bold">M</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">テクニカルモメンタム戦略</h2>
                  <p className="text-xs text-gray-400">Multi-Factor Technical</p>
                </div>
              </div>
              <span className="text-xs bg-red-50 text-red-700 px-2.5 py-1 rounded-full font-medium">アクティブ</span>
            </div>
            <div className="px-6 py-4 text-sm text-gray-600">
              <p className="leading-relaxed">
                出来高急増・板情報需給・<span className="font-semibold text-gray-800">価格モメンタムの質</span>・移動平均位置の4要素を合成してスコア化。
                上位銘柄を翌営業日の寄付きで買い、複数条件達成で決済する短期テクニカル戦略。
              </p>
            </div>
          </div>

          {/* リスク管理 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">共通リスク管理</h2>
            <div className="space-y-3">
              {[
                { label: "エントリー", desc: "各戦略のシグナルスコア上位銘柄を翌営業日の寄付きで買い" },
                { label: "エグジット", desc: "保有営業日数の上限・損切り・利確のいずれか早い条件で決済" },
                { label: "ポジションサイジング", desc: "シグナルスコアに比例して各銘柄の投資比率を自動計算" },
                { label: "資金配分", desc: "3戦略間でリスク調整済みの配分比率を設定し、同一銘柄の重複保有を防止" },
                { label: "日次リスク制限", desc: "一定以上の日次損失が発生した場合、新規エントリーを自動停止" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-gray-800">{item.label}: </span>
                    <span className="text-gray-500">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 免責事項 */}
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
              実践方法を note で公開中
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
