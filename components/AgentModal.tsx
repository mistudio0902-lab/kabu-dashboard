"use client";

import { useState } from "react";
import PortfolioChart from "@/components/PortfolioChart";
import type { PortfolioDaily, Trade } from "@/lib/supabase";

type Props = {
  portfolio: PortfolioDaily[];
  trades: Trade[];
  displayMode: "$" | "%";
  onClose: () => void;
};

function calcModalStats(data: PortfolioDaily[]) {
  if (!data.length) return null;
  const latest = data[data.length - 1];
  const first = data[0];
  const returns = data.map((d) => d.daily_pnl_pct).filter((v) => v !== 0);
  const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const std = Math.sqrt(
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1)
  );
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
  const cumReturn =
    first.total_capital > 0
      ? ((latest.total_capital - first.total_capital) / first.total_capital) * 100
      : 0;
  const unrealizedPnl = latest.unrealized_pnl ?? 0;
  return {
    totalCapital: latest.total_capital + unrealizedPnl,
    unrealizedPnl,
    latestDate: latest.date,
    dailyPnlPct: latest.daily_pnl_pct * 100,
    cumReturn,
    sharpe,
    cashRatio: latest.cash_ratio ?? null,
    holdingsCount: latest.holdings_count ?? null,
  };
}

const STRATEGIES: Record<string, string> = {
  PEAD: "PEAD",
  turnover: "売買代金急増",
};

function formatStrategy(signal: string | null) {
  if (!signal) return "—";
  return STRATEGIES[signal] ?? signal;
}

export default function AgentModal({
  portfolio,
  trades,
  displayMode,
  onClose,
}: Props) {
  const [tab, setTab] = useState<"overview" | "activity" | "history">(
    "overview"
  );
  const stats = calcModalStats(portfolio);

  const tabs = [
    { id: "overview" as const, label: "取引概要" },
    { id: "activity" as const, label: "アクティビティ" },
    { id: "history" as const, label: "取引履歴" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">K</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">kabu-trader</h2>
              <p className="text-xs text-gray-400">Claude Code による日本株自動売買</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-100 px-5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`py-3 mr-6 text-xs font-semibold border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="overflow-y-auto flex-1">
          {/* --- 取引概要 --- */}
          {tab === "overview" && (
            <div className="p-5">
              {/* スタッツグリッド */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  {
                    label: "残高",
                    value: stats
                      ? `¥${stats.totalCapital.toLocaleString()}`
                      : "—",
                    color: "text-gray-900",
                  },
                  {
                    label: stats ? `日次 % (${stats.latestDate})` : "日次 %",
                    value: stats
                      ? `${stats.dailyPnlPct >= 0 ? "+" : ""}${stats.dailyPnlPct.toFixed(2)}%`
                      : "—",
                    color:
                      !stats || stats.dailyPnlPct >= 0
                        ? "text-emerald-600"
                        : "text-red-500",
                  },
                  {
                    label: "総リターン",
                    value: stats
                      ? `${stats.cumReturn >= 0 ? "+" : ""}${stats.cumReturn.toFixed(2)}%`
                      : "—",
                    color:
                      !stats || stats.cumReturn >= 0
                        ? "text-emerald-600"
                        : "text-red-500",
                  },
                  {
                    label: "保有銘柄数",
                    value:
                      stats?.holdingsCount != null
                        ? String(stats.holdingsCount)
                        : "—",
                    color: "text-gray-900",
                  },
                  {
                    label: "現金比率",
                    value:
                      stats?.cashRatio != null
                        ? `${(stats.cashRatio * 100).toFixed(1)}%`
                        : "—",
                    color: "text-gray-900",
                  },
                  {
                    label: "シャープ比",
                    value: stats ? stats.sharpe.toFixed(2) : "—",
                    color: "text-gray-900",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-gray-50 rounded-lg px-3 py-2.5"
                  >
                    <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                    <p className={`text-sm font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* パフォーマンスグラフ */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  パフォーマンス
                </p>
                <div className="bg-gray-50 rounded-lg p-2">
                  <PortfolioChart
                    data={portfolio}
                    displayMode={displayMode}
                    height={180}
                  />
                </div>
              </div>

              {/* エージェント指示 */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  エージェント戦略
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-800">PEAD戦略</p>
                      <p className="text-xs text-blue-600 mt-0.5">
                        決算発表後のドリフトを利用。好決算銘柄を翌日買い、数日で利確。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">売買代金急増戦略</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        前日比で売買代金が急増した銘柄にモメンタムで乗る。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- アクティビティ --- */}
          {tab === "activity" && (
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                直近の取引（2日遅延公開）
              </p>
              {trades.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  取引データがありません
                </div>
              ) : (
                <div className="space-y-2">
                  {trades.slice(0, 20).map((t, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded ${
                            t.side === "BUY"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.side === "BUY" ? "買" : "売"}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-800">
                            {t.ticker}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t.date} · {formatStrategy(t.strategy)}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">
                        ¥{(t.notional ?? 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- 取引履歴 --- */}
          {tab === "history" && (
            <div className="p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                取引履歴（2日遅延公開）
              </p>
              {trades.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  取引データがありません
                </div>
              ) : (
                <div className="overflow-x-auto -mx-5">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-100">
                        {["日付", "銘柄", "売買", "数量", "単価", "金額"].map(
                          (h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-gray-400 font-medium"
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-3 py-2 text-gray-500">{t.date}</td>
                          <td className="px-3 py-2 font-semibold text-gray-800">
                            {t.ticker}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`font-bold px-1.5 py-0.5 rounded text-xs ${
                                t.side === "BUY"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {t.side === "BUY" ? "買" : "売"}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {t.quantity?.toLocaleString() ?? "—"}
                          </td>
                          <td className="px-3 py-2 text-gray-600">
                            {t.price != null
                              ? `¥${t.price.toLocaleString()}`
                              : "—"}
                          </td>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {t.notional != null
                              ? `¥${t.notional.toLocaleString()}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* フッター */}
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            ※ 銘柄名は2日遅延で公開
          </span>
          <a
            href="https://twitter.com/miautolab"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.739l7.737-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
            </svg>
            @miautolab
          </a>
        </div>
      </div>
    </div>
  );
}
