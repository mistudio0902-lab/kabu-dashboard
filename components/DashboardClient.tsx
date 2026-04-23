"use client";

import { useState } from "react";
import PortfolioChart from "@/components/PortfolioChart";
import Header from "@/components/Header";
import type { PortfolioDaily, Trade, Position } from "@/lib/supabase";

const BASE_CAPITAL = 1_000_000;

const COMPANY_NAMES: Record<string, string> = {
  "1719": "安藤・間",
  "1621": "三井住友建設",
  "1625": "熊谷組",
  "2341": "アルバイトタイムス",
  "2659": "サンエー",
  "3608": "TSIホールディングス",
  "3994": "マネーフォワード",
  "4825": "ウェザーニューズ",
  "6810": "マクセル",
  "8051": "山善",
  "9432": "NTT",
  "9519": "再生可能エナジー",
  "9842": "アークランズ",
};

type Props = {
  portfolio: PortfolioDaily[];
  trades: Trade[];
  positions: Position[];
  baseCapital?: number;
};

function calcFifoPnl(trades: Trade[]): number {
  const sorted = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const buyQueues: Record<string, { price: number; qty: number }[]> = {};
  let total = 0;
  for (const t of sorted) {
    if (t.side === "BUY") {
      if (!buyQueues[t.ticker]) buyQueues[t.ticker] = [];
      buyQueues[t.ticker].push({ price: t.price, qty: t.quantity });
    } else {
      const queue = buyQueues[t.ticker] ?? [];
      let remaining = t.quantity, cost = 0, matched = 0;
      while (remaining > 0 && queue.length > 0) {
        const buy = queue[0];
        const used = Math.min(buy.qty, remaining);
        cost += buy.price * used; matched += used; remaining -= used; buy.qty -= used;
        if (buy.qty === 0) queue.shift();
      }
      if (matched > 0) total += Math.round((t.price - cost / matched) * matched);
    }
  }
  return total;
}

function calcStats(data: PortfolioDaily[], base: number, trades: Trade[], positions: Position[]) {
  if (!data.length) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  const trueTotal = latest.total_capital;

  // 含み損益: positionsの合計（SELL済みは除外済みの前提）
  const soldTickers = new Set(trades.filter(t => t.side === "SELL").map(t => t.ticker));
  const latestPositions = Object.values(
    positions.reduce((acc, p) => {
      const key = p.ticker;
      if (!acc[key] || new Date(p.updated_at) > new Date(acc[key].updated_at)) acc[key] = p;
      return acc;
    }, {} as Record<string, Position>)
  ).filter(p => !soldTickers.has(p.ticker));

  const unrealizedPnl = latestPositions.reduce((sum, p) => {
    const pnl = p.unrealized_pnl !== null && p.unrealized_pnl !== undefined
      ? p.unrealized_pnl
      : p.current_price != null ? (p.current_price - p.entry_price) * p.quantity : 0;
    return sum + pnl;
  }, 0);

  // 確定損益: total_capitalベースで逆算（trades FIFO再計算との乖離を防ぐ）
  const realizedPnl = trueTotal - base - unrealizedPnl;

  const totalReturn = base > 0 ? (trueTotal - base) / base : 0;

  const startMs = new Date(first.date).getTime();
  const endMs = new Date(latest.date).getTime();
  const opDays = Math.round((endMs - startMs) / 86400000) + 1;

  return {
    trueTotal,
    unrealizedPnl,
    realizedPnl,
    startingCapital: base,
    totalReturn,
    startDate: first.date,
    endDate: latest.date,
    opDays,
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
    <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.08),0 1px 2px rgba(0,0,0,.06)", border: "1px solid #e8eaed" }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "#202124" }}>{title}</span>
          {count !== undefined && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#f1f3f4", color: "#5f6368" }}>
              {count}
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "#9aa0a6" }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <div style={{ borderTop: "1px solid #e8eaed" }}>{children}</div>}
    </div>
  );
}

export default function DashboardClient({ portfolio, trades, positions, baseCapital }: Props) {
  const base = baseCapital ?? BASE_CAPITAL;
  const stats = calcStats(portfolio, base, trades, positions);
  const [chartMode, setChartMode] = useState<"%" | "$">("%");

  const unrealized = stats?.unrealizedPnl ?? 0;
  const realized = stats?.realizedPnl ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* 説明バナー */}
        <div className="rounded-xl mb-4 flex items-center gap-4" style={{
          background: "#e8f0fe",
          border: "1px solid #c5d8fb",
          padding: "14px 24px",
        }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#1a73e8", borderRadius: 8 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="8" y1="15" x2="8" y2="15"/><line x1="12" y1="15" x2="12" y2="15"/><line x1="16" y1="15" x2="16" y2="15"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1a56c4", marginBottom: 2 }}>
              AIが自律的に売買する株式トレードの実績をリアルタイム公開しています
            </div>
            <div style={{ fontSize: 12, color: "#3b6ec0", lineHeight: 1.6 }}>
              人間の判断を介さず、独自アルゴリズム（PEAD・売買代金急増・テクニカルモメンタム）によりシグナル検知から発注まで全自動で運用。成績は加工なしで公開しています。
            </div>
          </div>
        </div>

        {/* パフォーマンス推移 + ポートフォリオ概要 */}
        <div className="grid-chart-portfolio" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* パフォーマンス推移 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
            <div className="flex items-center justify-between" style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-md" style={{ width: 32, height: 32, background: "#fef3e2" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>パフォーマンス推移</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>
                    基準資金 ¥{base.toLocaleString()} スタートで正規化
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f1f3f4", color: "#5f6368" }}>TOPIX 期間累計</span>
                <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #e8eaed" }}>
                  {(["%", "$"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartMode(mode)}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                        background: chartMode === mode ? "#1a73e8" : "#fff",
                        color: chartMode === mode ? "#fff" : "#5f6368",
                        border: "none",
                        cursor: "pointer",
                        transition: "background .15s",
                      }}
                    >
                      {mode === "%" ? "%" : "¥"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 28px" }}>
              <div className="flex items-center gap-5 mb-4">
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: "#5f6368" }}>
                  <div style={{ width: 28, height: 3, borderRadius: 2, background: "#1a73e8" }} />
                  kabu-trader
                </div>
                <div className="flex items-center gap-2" style={{ fontSize: 13, color: "#5f6368" }}>
                  <div style={{ width: 28, height: 2, background: "repeating-linear-gradient(90deg,#9aa0a6 0,#9aa0a6 5px,transparent 5px,transparent 10px)" }} />
                  TOPIX
                </div>
              </div>
              <PortfolioChart data={portfolio} displayMode={chartMode} />
            </div>
          </div>

          {/* ポートフォリオ概要 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
            <div className="flex items-center justify-between" style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-md" style={{ width: 32, height: 32, background: "#e8f0fe" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>ポートフォリオ概要</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>
                    {stats?.startDate ?? "—"} スタート / ¥{base.toLocaleString()} 基準
                  </div>
                </div>
              </div>
            </div>
            <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                { label: "基準資金（開始時）", value: `¥${base.toLocaleString()}`, color: "#202124" },
                { label: "現在の評価総額", value: stats ? `¥${stats.trueTotal.toLocaleString()}` : "—", color: "#202124" },
                {
                  label: "確定損益（売買益のみ）",
                  value: `${realized >= 0 ? "" : "-"}¥${Math.abs(realized).toLocaleString()}`,
                  color: realized === 0 ? "#9aa0a6" : realized > 0 ? "#34a853" : "#ea4335",
                },
                {
                  label: "含み損益（未決済）",
                  value: `${unrealized >= 0 ? "+" : ""}¥${unrealized.toLocaleString()}`,
                  sub: unrealized !== 0 ? `(${(unrealized / base * 100).toFixed(2)}%)` : undefined,
                  color: unrealized === 0 ? "#9aa0a6" : unrealized > 0 ? "#34a853" : "#ea4335",
                },
              ].map((row, i, arr) => (
                <div
                  key={row.label}
                  className="flex justify-between items-center"
                  style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid #e8eaed" : "none" }}
                >
                  <span style={{ fontSize: 13, color: "#5f6368" }}>{row.label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: row.color }}>
                    {row.value}
                    {row.sub && <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{row.sub}</span>}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ margin: "0 28px 20px", padding: "10px 14px", background: "#fffde7", border: "1px solid #fff176", borderLeft: "3px solid #fbbc04", borderRadius: 6, fontSize: 12, color: "#5d4037", display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span>ℹ</span>
              <span>毎日18:00に当日データで自動更新</span>
            </div>
          </div>
        </div>

        {/* KPI カード行 */}
        <div className="grid-kpi" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            {
              label: "現在の評価総額",
              value: stats ? `¥${stats.trueTotal.toLocaleString()}` : "¥1,000,000",
              sub: stats ? (() => {
                const diff = stats.trueTotal - base;
                const pct = ((diff / base) * 100).toFixed(2);
                return `${diff >= 0 ? "+" : ""}¥${diff.toLocaleString()} (${diff >= 0 ? "+" : ""}${pct}%)`;
              })() : "—",
              valueColor: "#202124",
              subColor: (stats ? stats.trueTotal - base : 0) >= 0 ? "#34a853" : "#ea4335",
              accent: "#1a73e8",
            },
            {
              label: "売買損益（確定）",
              value: `${realized >= 0 ? "" : "-"}¥${Math.abs(realized).toLocaleString()}`,
              sub: realized !== 0 ? `${((realized / base) * 100).toFixed(2)}%` : "—",
              valueColor: realized === 0 ? "#9aa0a6" : realized > 0 ? "#34a853" : "#ea4335",
              subColor: realized === 0 ? "#9aa0a6" : realized > 0 ? "#34a853" : "#ea4335",
              accent: "#1a73e8",
            },
            {
              label: "含み損益",
              value: `${unrealized >= 0 ? "+" : ""}¥${unrealized.toLocaleString()}`,
              sub: unrealized !== 0 ? `${((unrealized / base) * 100).toFixed(2)}%` : "—",
              valueColor: unrealized === 0 ? "#9aa0a6" : unrealized > 0 ? "#34a853" : "#ea4335",
              subColor: unrealized === 0 ? "#9aa0a6" : unrealized > 0 ? "#34a853" : "#ea4335",
              accent: "#34a853",
            },
            {
              label: "運用期間",
              value: stats ? `${stats.opDays}日` : "—",
              sub: stats ? `${stats.startDate} 〜 ${stats.endDate}` : "—",
              valueColor: "#5f6368",
              subColor: "#9aa0a6",
              accent: "#fbbc04",
            },
          ].map(card => (
            <div key={card.label} className="rounded-xl relative" style={{ background: "#fff", border: "1px solid #e8eaed", padding: "16px 20px 20px", boxShadow: "0 1px 3px rgba(0,0,0,.06)" }}>
              <div style={{ position: "absolute", bottom: 0, left: 16, right: 16, height: 3, borderRadius: "0 0 4px 4px", background: card.accent }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: card.valueColor, lineHeight: 1, marginBottom: 6 }}>{card.value}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: card.subColor }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* 保有ポジション */}
        <div className="mb-3">
          <CollapsibleSection title="保有ポジション" count={(() => {
            const soldTickers = new Set(trades.filter(t => t.side === "SELL").map(t => t.ticker));
            return Object.keys(
              positions.reduce((acc, p) => {
                if (!acc[p.ticker] || new Date(p.updated_at) > new Date(acc[p.ticker].updated_at)) acc[p.ticker] = p;
                return acc;
              }, {} as Record<string, Position>)
            ).filter(k => !soldTickers.has(k)).length;
          })()}>
            {positions.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#9aa0a6" }}>
                保有銘柄なし
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      {["銘柄", "株数", "平均取得価格", "取得総額", "含み損益", "戦略"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", borderBottom: "1px solid #e8eaed" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* tickerごとに最新行のみ、かつSELL済みを除外 */}
                    {(() => {
                      const soldTickers = new Set(trades.filter(t => t.side === "SELL").map(t => t.ticker));
                      return Object.values(
                        positions.reduce((acc, p) => {
                          const key = p.ticker;
                          if (!acc[key] || new Date(p.updated_at) > new Date(acc[key].updated_at)) acc[key] = p;
                          return acc;
                        }, {} as Record<string, Position>)
                      ).filter(p => !soldTickers.has(p.ticker));
                    })().map((p, i) => {
                      const ticker = p.ticker.replace(".T", "");
                      const companyName = COMPANY_NAMES[ticker] ?? "";
                      const totalCost = p.entry_price * p.quantity;
                      // unrealized_pnl がnullの場合はcurrent_priceから計算、それもなければentry_priceベース
                      const pnl = p.unrealized_pnl !== null && p.unrealized_pnl !== undefined
                        ? p.unrealized_pnl
                        : p.current_price != null
                          ? (p.current_price - p.entry_price) * p.quantity
                          : 0;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #e8eaed" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafe")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1a73e8" }}>{ticker}</div>
                            {companyName && <div style={{ fontSize: 11, color: "#9aa0a6", marginTop: 2 }}>{companyName}</div>}
                          </td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>{p.quantity.toLocaleString()}株</td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>¥{Math.round(p.entry_price).toLocaleString()}</td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>¥{Math.round(totalCost).toLocaleString()}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 8px", borderRadius: 4, fontFamily: "monospace", fontSize: 12, fontWeight: 600, background: pnl >= 0 ? "#e6f4ea" : "#fce8e6", color: pnl >= 0 ? "#34a853" : "#ea4335" }}>
                              {pnl >= 0 ? "+" : ""}¥{Math.round(pnl).toLocaleString()}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            {p.strategy && (
                              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 4, background: "#e8f0fe", color: "#1a73e8", fontWeight: 500 }}>
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

        {/* 取引履歴 */}
        <div className="mb-5">
          <CollapsibleSection title="取引履歴" count={trades.length}>
            {trades.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#9aa0a6" }}>
                取引データなし
              </div>
            ) : (() => {
              // BUY/SELLをFIFOマッチングして実現損益を計算
              const sorted = [...trades].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
              const buyQueues: Record<string, { id: number; price: number; qty: number }[]> = {};
              const pnlMap: Record<number, number> = {};
              for (const t of sorted) {
                if (t.side === "BUY") {
                  if (!buyQueues[t.ticker]) buyQueues[t.ticker] = [];
                  buyQueues[t.ticker].push({ id: t.id, price: t.price, qty: t.quantity });
                } else {
                  const queue = buyQueues[t.ticker] ?? [];
                  let remaining = t.quantity, totalCost = 0, matched = 0;
                  while (remaining > 0 && queue.length > 0) {
                    const buy = queue[0];
                    const used = Math.min(buy.qty, remaining);
                    totalCost += buy.price * used; matched += used; remaining -= used; buy.qty -= used;
                    if (buy.qty === 0) queue.shift();
                  }
                  if (matched > 0) pnlMap[t.id] = Math.round((t.price - totalCost / matched) * matched);
                }
              }
              return (
                <div className="overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        {["日付", "銘柄", "売買", "株数", "単価", "約定金額", "損益"].map(h => (
                          <th key={h} style={{ padding: "10px 20px", textAlign: h === "損益" || h === "株数" || h === "単価" || h === "約定金額" ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", borderBottom: "1px solid #e8eaed" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((t, i) => {
                        const ticker = t.ticker.replace(".T", "");
                        const companyName = COMPANY_NAMES[ticker] ?? "";
                        const pnl = pnlMap[t.id];
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #e8eaed" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafe")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#5f6368" }}>{t.date}</td>
                            <td style={{ padding: "14px 20px" }}>
                              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1a73e8" }}>{ticker}</div>
                              {companyName && <div style={{ fontSize: 11, color: "#9aa0a6", marginTop: 2 }}>{companyName}</div>}
                            </td>
                            <td style={{ padding: "14px 20px" }}>
                              <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", background: t.side === "BUY" ? "#e8f0fe" : "#fce8e6", color: t.side === "BUY" ? "#1a73e8" : "#ea4335" }}>
                                {t.side === "BUY" ? "買" : "売"}
                              </span>
                            </td>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368", textAlign: "right" }}>{t.quantity?.toLocaleString() ?? "—"}株</td>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368", textAlign: "right" }}>{t.price != null ? `¥${t.price.toLocaleString()}` : "—"}</td>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368", textAlign: "right" }}>{t.notional != null ? `¥${t.notional.toLocaleString()}` : "—"}</td>
                            <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, fontWeight: 600, textAlign: "right", color: pnl == null ? "#ccc" : pnl >= 0 ? "#34a853" : "#ea4335" }}>
                              {pnl != null ? `${pnl >= 0 ? "+" : ""}¥${pnl.toLocaleString()}` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </CollapsibleSection>
        </div>

        {/* 採用戦略 */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
          <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-md" style={{ width: 32, height: 32, background: "#e6f4ea" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#34a853" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>採用戦略 &amp; 概要</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>2戦略を並列運用 / シグナル自動スクリーニング</div>
                </div>
              </div>
              <a
                href="https://note.com/mi_autolab"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                📝 noteにて実践方法公開中！
              </a>
            </div>
          </div>

          <div style={{ padding: "20px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* なぜ公開するのか */}
            <div style={{ padding: "16px 20px", background: "#f8f9fa", borderRadius: 10, border: "1px solid #e8eaed" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", marginBottom: 6 }}>なぜ公開するのか</div>
              <p style={{ fontSize: 13, color: "#5f6368", margin: 0, lineHeight: 1.7 }}>
                「AIが本当に株式市場で通用するのか」という問いに、実資金で答えを出すプロジェクトです。
                バックテストやシミュレーションではなく、リアルマネーでの実績をすべて公開します。
                データは<strong style={{ color: "#202124" }}>当日18:00</strong>に反映（引け後）。銘柄・損益ともに即日公開。
              </p>
            </div>

            {/* 3戦略 */}
            <div className="grid-strategies" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
              {[
                {
                  tag: "PEAD", sub: "Post-Earnings Announcement Drift",
                  tagColor: "#1a73e8", tagBg: "#e8f0fe",
                  title: "決算モメンタム戦略",
                  desc: "決算発表後の業績上方修正銘柄をサプライズ率でスコアリングし、翌営業日の寄付きで買い。発表後に株価がサプライズの方向へ数日ドリフトする現象（PEAD）を利用する短期戦略。",
                },
                {
                  tag: "Turnover", sub: "Turnover Momentum",
                  tagColor: "#34a853", tagBg: "#e6f4ea",
                  title: "売買代金急増戦略",
                  desc: "前日の売買代金が過去平均から急増した銘柄を検知し、翌営業日の寄付きで買い。機関投資家の参入やトレンド発生初期に伴う需給変化を捉える短期戦略。",
                },
              ].map(s => (
                <div key={s.tag} style={{ borderRadius: 10, overflow: "hidden", border: "1px solid #e8eaed" }}>
                  <div className="flex items-center justify-between" style={{ padding: "12px 16px", borderBottom: "1px solid #e8eaed", background: s.tagBg }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: s.tagColor, color: "#fff" }}>{s.tag}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#202124" }}>{s.title}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: "#fff", color: s.tagColor, border: `1px solid ${s.tagColor}` }}>アクティブ</span>
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    <p style={{ fontSize: 11, color: "#9aa0a6", margin: "0 0 6px", fontStyle: "italic" }}>{s.sub}</p>
                    <p style={{ fontSize: 12, color: "#5f6368", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 共通リスク管理 */}
            <div style={{ padding: "16px 20px", background: "#f8f9fa", borderRadius: 10, border: "1px solid #e8eaed" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#202124", marginBottom: 12 }}>共通リスク管理</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "エントリー", desc: "各戦略のシグナルスコア上位銘柄を翌営業日の寄付きで買い" },
                  { label: "エグジット", desc: "保有営業日数の上限・損切り・利確のいずれか早い条件で決済" },
                  { label: "ポジションサイジング", desc: "シグナルスコアに比例して各銘柄の投資比率を自動計算" },
                  { label: "資金配分", desc: "3戦略間でリスク調整済みの配分比率を設定し、同一銘柄の重複保有を防止" },
                  { label: "日次リスク制限", desc: "一定以上の日次損失が発生した場合、新規エントリーを自動停止" },
                ].map(item => (
                  <div key={item.label} className="flex gap-3" style={{ fontSize: 12 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a73e8", marginTop: 5, flexShrink: 0 }} />
                    <div>
                      <span style={{ fontWeight: 600, color: "#202124" }}>{item.label}: </span>
                      <span style={{ color: "#5f6368" }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* 免責事項 */}
        <div style={{ marginBottom: 20, padding: "14px 20px", background: "#fff", borderRadius: 10, border: "1px solid #e8eaed", fontSize: 12, color: "#9aa0a6", lineHeight: 1.7 }}>
          <span style={{ fontWeight: 600, color: "#5f6368" }}>免責事項: </span>
          本サイトは投資成績の公開を目的としており、投資助言を行うものではありません。掲載情報は参考目的のみであり、投資判断はご自身の責任において行ってください。過去の運用実績は将来の成果を保証するものではありません。
        </div>


      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }
        @media (max-width: 768px) {
          .grid-chart-portfolio {
            grid-template-columns: 1fr !important;
          }
          .grid-kpi {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .grid-strategies {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .grid-kpi {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
