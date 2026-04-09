"use client";

import { useState } from "react";
import PortfolioChart from "@/components/PortfolioChart";
import AgentModal from "@/components/AgentModal";
import Header from "@/components/Header";
import type { PortfolioDaily, Trade } from "@/lib/supabase";

type Props = {
  portfolio: PortfolioDaily[];
  trades: Trade[];
  baseCapital?: number;
};

function calcStats(data: PortfolioDaily[]) {
  if (!data.length) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  const totalReturn = first.total_capital > 0
    ? (latest.total_capital - first.total_capital) / first.total_capital
    : 0;
  const returns = data.map(d => d.daily_pnl_pct).filter(v => v !== 0);
  const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const std = Math.sqrt(returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1));
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;
  return {
    totalCapital: latest.total_capital,
    startingCapital: first.total_capital,
    totalReturn,
    sharpe,
    startDate: first.date,
    endDate: latest.date,
  };
}

export default function DashboardClient({ portfolio, trades }: Props) {
  const [displayMode, setDisplayMode] = useState<"$" | "%">("%");
  const [modalOpen, setModalOpen] = useState(false);

  const stats = calcStats(portfolio);
  const totalReturn = stats ? stats.totalReturn * 100 : 0;
  const isPositive = totalReturn >= 0;

  // ベンチマーク（TOPIX）の仮データ（実データ接続前はフラット）
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
            {/* $ / % トグル */}
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
            {/* kabu-trader カード */}
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
                  {stats ? `¥${stats.totalCapital.toLocaleString()}` : "—"}
                </span>
                <span className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                  {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                </span>
              </div>
            </button>

            {/* ベンチマーク TOPIX カード */}
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
        </div>

        {/* 右パネル：ベンチマーク詳細 */}
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
                  <span className="text-gray-400">現在価値</span>
                  <span className="font-semibold text-gray-900">
                    {stats ? `¥${stats.totalCapital.toLocaleString()}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">総リターン</span>
                  <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">損益</span>
                  <span className={`font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                    {stats ? `${isPositive ? "+" : ""}¥${(stats.totalCapital - stats.startingCapital).toLocaleString()}` : "—"}
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
