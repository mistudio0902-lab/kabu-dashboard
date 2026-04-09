"use client";

import { useState } from "react";
import PortfolioChart from "@/components/PortfolioChart";
import AgentModal from "@/components/AgentModal";
import Header from "@/components/Header";
import type { PortfolioDaily, Trade, Position } from "@/lib/supabase";

type Props = {
  portfolio: PortfolioDaily[];
  trades: Trade[];
  positions: Position[];
  baseCapital?: number;
};

function calcStats(data: PortfolioDaily[]) {
  if (!data.length) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  const unrealizedPnl = latest.unrealized_pnl ?? 0;
  const trueTotal = latest.total_capital + unrealizedPnl;
  const totalReturn = first.total_capital > 0
    ? (trueTotal - first.total_capital) / first.total_capital
    : 0;
  const returns = data.map(d => d.daily_pnl_pct).filter(v => v !== 0);
  const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1));
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
  return {
    trueTotal,
    unrealizedPnl,
    startingCapital: first.total_capital,
    totalReturn,
    sharpe,
    startDate: first.date,
    endDate: latest.date,
  };
}


function CollapsibleSection({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-800">{title}</span>
          {count !== undefined && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">
              {count}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
}

export default function DashboardClient({ portfolio, trades, positions }: Props) {
  const [displayMode, setDisplayMode] = useState<"$" | "%">("%");
  const [modalOpen, setModalOpen] = useState(false);

  const stats = calcStats(portfolio);
  const totalReturn = stats ? stats.totalReturn * 100 : 0;
  const isPositive = totalReturn >= 0;

  const benchmarkReturn = 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f6" }}>
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex gap-6">
        {/* メインエリア */}
        <div className="flex-1 min-w-0">
          {/* タイトル */}
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Claude Code による日本株自動売買
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {stats ? `${stats.startDate} 〜 ${stats.endDate}` : "—"}
            </p>
          </div>

          {/* チャート */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => setDisplayMode("$")}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                  displayMode === "$"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                ¥
              </button>
              <button
                onClick={() => setDisplayMode("%")}
                className={`px-3 py-1 text-xs font-medium rounded border transition-colors ${
                  displayMode === "%"
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                %
              </button>
            </div>
            <PortfolioChart data={portfolio} displayMode={displayMode} />
          </div>

          {/* ボトムスコアカード */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="bg-white border-2 border-blue-500 rounded-lg px-4 py-3 text-left hover:bg-blue-50 transition-colors group"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-gray-700">kabu-trader</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-gray-900">
                  {stats ? `¥${stats.trueTotal.toLocaleString()}` : "—"}
                </span>
                <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                </span>
              </div>
              {stats && stats.unrealizedPnl !== 0 && (
                <p className={`text-xs mt-0.5 ${stats.unrealizedPnl >= 0 ? "text-emerald-500" : "text-red-400"}`}>
                  含み損益 {stats.unrealizedPnl >= 0 ? "+" : ""}¥{stats.unrealizedPnl.toLocaleString()}
                </p>
              )}
            </button>

            <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-0.5 bg-gray-400" style={{ borderTop: "2px dashed #9ca3af" }} />
                <span className="text-xs font-semibold text-gray-500">TOPIX</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-base font-bold text-gray-400">ベンチマーク</span>
                <span className="text-sm font-semibold text-gray-400">
                  {benchmarkReturn >= 0 ? "+" : ""}{benchmarkReturn.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* 保有ポジション（プルダウン） */}
          <div className="mt-3">
            <CollapsibleSection title="保有ポジション" count={positions.length}>
              {positions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  保有銘柄なし（2日遅延公開）
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {["銘柄", "株数", "平均取得価格", "取得総額", "含み損益", "戦略"].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-gray-400 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {positions.map((p, i) => {
                        const ticker = p.ticker.replace(".T", "");
                        const totalCost = p.entry_price * p.quantity;
                        const pnl = p.unrealized_pnl ?? 0;
                        return (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-2 font-semibold text-gray-800">{ticker}</td>
                            <td className="px-4 py-2 text-gray-600">{p.quantity.toLocaleString()}株</td>
                            <td className="px-4 py-2 text-gray-600 tabular-nums">
                              ¥{Math.round(p.entry_price).toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-gray-600 tabular-nums">
                              ¥{Math.round(totalCost).toLocaleString()}
                            </td>
                            <td className={`px-4 py-2 tabular-nums font-medium ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                              {pnl >= 0 ? "+" : ""}¥{Math.round(pnl).toLocaleString()}
                            </td>
                            <td className="px-4 py-2">
                              {p.strategy && (
                                <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-medium">
                                  {p.strategy}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CollapsibleSection>
          </div>

          {/* 取引履歴（プルダウン） */}
          <div className="mt-2">
            <CollapsibleSection title="取引履歴" count={trades.length}>
              {trades.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-400">
                  取引データなし（2日遅延公開）
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {["日付", "銘柄", "売買", "株数", "単価", "約定金額"].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-gray-400 font-medium">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t, i) => {
                        const ticker = t.ticker.replace(".T", "");
                        return (
                          <tr
                            key={i}
                            className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-2 text-gray-500 font-mono">{t.date}</td>
                            <td className="px-4 py-2 font-semibold text-gray-800">{ticker}</td>
                            <td className="px-4 py-2">
                              <span
                                className={`font-bold px-1.5 py-0.5 rounded ${
                                  t.side === "BUY"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {t.side === "BUY" ? "買" : "売"}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">
                              {t.quantity?.toLocaleString() ?? "—"}株
                            </td>
                            <td className="px-4 py-2 text-gray-600 tabular-nums">
                              {t.price != null ? `¥${t.price.toLocaleString()}` : "—"}
                            </td>
                            <td className="px-4 py-2 text-gray-600 tabular-nums">
                              {t.notional != null ? `¥${t.notional.toLocaleString()}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CollapsibleSection>
          </div>
        </div>

        {/* 右パネル */}
        <div className="w-64 flex-shrink-0 hidden lg:block">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-20">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              ベンチマーク詳細
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-gray-900">ベンチマーク</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">TOPIX</span>
            </div>
            <p className="text-xs text-gray-400 mb-4">比較用インデックス</p>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">現在値</span>
                <span className="text-xs font-semibold text-gray-900">—</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">リターン</span>
                <span className="text-xs font-semibold text-gray-400">+0.00%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                TOPIX について
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                東証プライム市場全銘柄を対象とした時価総額加重平均型の株価指数。
                AIエージェントのパフォーマンス比較に使用。
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                ベンチマーク戦略
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                パッシブな買い持ち戦略との比較。AIが市場平均を上回れるかを検証。
              </p>
            </div>

            {/* kabu-trader 情報 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">K</span>
                </div>
                <span className="text-xs font-semibold text-gray-700">kabu-trader</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                PEAD戦略 + 売買代金急増戦略による日本株自動売買。Claude Codeにより完全自動化。
              </p>
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">評価総額</span>
                  <span className="font-semibold text-gray-900">
                    {stats ? `¥${stats.trueTotal.toLocaleString()}` : "—"}
                  </span>
                </div>
                {stats && stats.unrealizedPnl !== 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">含み損益</span>
                    <span className={`font-semibold ${stats.unrealizedPnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {stats.unrealizedPnl >= 0 ? "+" : ""}¥{stats.unrealizedPnl.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">総リターン</span>
                  <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">損益</span>
                  <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {stats ? `${isPositive ? "+" : ""}¥${(stats.trueTotal - stats.startingCapital).toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">初期資金</span>
                  <span className="font-semibold text-gray-900">
                    {stats ? `¥${stats.startingCapital.toLocaleString()}` : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* エージェントモーダル */}
      {modalOpen && (
        <AgentModal
          portfolio={portfolio}
          trades={trades}
          displayMode={displayMode}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
