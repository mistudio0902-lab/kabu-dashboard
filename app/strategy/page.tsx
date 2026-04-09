import Header from "@/components/Header";

export const metadata = {
  title: "戦略 | kabu-trader",
  description: "kabu-traderが採用する投資戦略。PEAD（決算後ドリフト）・売買代金急増戦略の詳細。",
};

export default function StrategyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f6" }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* タイトル */}
        <div className="mb-8">
          <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full mb-3">
            投資戦略
          </span>
          <h1 className="text-2xl font-bold text-gray-900">採用戦略</h1>
          <p className="text-gray-500 mt-2 leading-relaxed">
            kabu-traderは学術的根拠のある複数のアノマリー戦略を組み合わせています。
            各戦略はKelly基準でポジションサイズを自動計算します。
          </p>
        </div>

        {/* 戦略カード */}
        <div className="space-y-5">

          {/* PEAD */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-700 text-xs font-bold">P</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">PEAD 戦略</h2>
                  <p className="text-xs text-gray-400">Post-Earnings Announcement Drift</p>
                </div>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                アクティブ
              </span>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm text-gray-600">
              <p className="leading-relaxed">
                決算発表後に株価がサプライズの方向へ<span className="font-semibold text-gray-800">数日〜数週間ドリフト</span>する現象を利用。
                好業績（EPS サプライズ上位）銘柄を翌営業日に買い、3〜5日後に利確。
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "エントリー", value: "決算翌日 寄付" },
                  { label: "イグジット", value: "3〜5営業日後" },
                  { label: "フィルター", value: "流動性・サプライズ率" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 売買代金急増 */}
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
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                アクティブ
              </span>
            </div>
            <div className="px-6 py-4 space-y-3 text-sm text-gray-600">
              <p className="leading-relaxed">
                前日比で売買代金が<span className="font-semibold text-gray-800">急激に増加した銘柄</span>に短期モメンタムで乗る戦略。
                機関投資家の参入・材料出しに伴うトレンド発生初期を捉える。
              </p>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {[
                  { label: "シグナル", value: "売買代金前日比" },
                  { label: "保有期間", value: "1〜3営業日" },
                  { label: "フィルター", value: "出来高・価格帯" },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className="text-xs font-semibold text-gray-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* リスク管理 */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">リスク管理</h2>
            <div className="space-y-3">
              {[
                {
                  label: "ポジションサイジング",
                  desc: "Kelly基準（ハーフKelly）で各銘柄の投資比率を自動計算",
                },
                {
                  label: "損切りルール",
                  desc: "エントリー価格から -8% で自動損切り",
                },
                {
                  label: "集中リスク",
                  desc: "1銘柄の最大投資比率は総資産の20%以内",
                },
                {
                  label: "現金比率",
                  desc: "常に最低10%は現金保有",
                },
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

          {/* note リンク */}
          <a
            href="https://note.com/mi_autolab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-gray-400 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 3H6C4.3 3 3 4.3 3 6v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3V6c0-1.7-1.3-3-3-3zm-7 13H8v-2h3v2zm0-4H8v-2h3v2zm0-4H8V6h3v2zm6 8h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V6h4v2z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-gray-800">戦略の詳細解説を note で公開中</p>
                <p className="text-xs text-gray-400">note.com/mi_autolab</p>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </main>
    </div>
  );
}
