"use client";

import { useState } from "react";
import PortfolioChart from "@/components/PortfolioChart";
import Header from "@/components/Header";
import type { PortfolioDaily, Trade, Position } from "@/lib/supabase";

const BASE_CAPITAL = 1_000_000;

type Props = {
  portfolio: PortfolioDaily[];
  trades: Trade[];
  positions: Position[];
  baseCapital?: number;
};

function calcStats(data: PortfolioDaily[], base: number) {
  if (!data.length) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  const unrealizedPnl = latest.unrealized_pnl ?? 0;
  const trueTotal = latest.total_capital + unrealizedPnl;
  const realizedPnl = latest.total_capital - base;
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
  const stats = calcStats(portfolio, base);

  const totalReturn = stats ? stats.totalReturn * 100 : 0;
  const isPositive = totalReturn >= 0;
  const pnlColor = isPositive ? "#34a853" : "#ea4335";
  const pnlBg = isPositive ? "#e6f4ea" : "#fce8e6";

  const unrealized = stats?.unrealizedPnl ?? 0;
  const unrColor = unrealized >= 0 ? "#34a853" : "#ea4335";
  const realized = stats?.realizedPnl ?? 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa", fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* HERO */}
        <div className="rounded-xl mb-5 relative overflow-hidden" style={{
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)",
          padding: "36px 40px 32px",
        }}>
          {/* gradient top border */}
          <div className="absolute top-0 left-0 right-0" style={{
            height: 3,
            background: "linear-gradient(90deg,#1a73e8 0%,#34a853 50%,#1a73e8 100%)",
            backgroundSize: "200%",
            animation: "shimmer 4s linear infinite",
          }} />

          <div className="flex items-start justify-between mb-7" style={{ flexWrap: "wrap", gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 8 }}>
                現在の評価総額（T-2基準）
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 64, fontWeight: 700, color: "#202124", lineHeight: 1, letterSpacing: "-2px" }}>
                <span style={{ fontSize: 36, fontWeight: 500, color: "#5f6368", marginRight: 4 }}>¥</span>
                {stats ? stats.trueTotal.toLocaleString() : "1,000,000"}
              </div>
              <div className="flex items-center gap-2" style={{ marginTop: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 600, color: pnlColor }}>
                  {isPositive ? "+" : ""}¥{stats ? (stats.trueTotal - base).toLocaleString() : "0"}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 500, padding: "2px 10px", borderRadius: 20, background: pnlBg, color: pnlColor }}>
                  {isPositive ? "+" : ""}{totalReturn.toFixed(2)}%
                </span>
                <span style={{ fontSize: 11, color: "#9aa0a6" }}>基準資金比</span>
              </div>
              <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 5 }}>
                基準資金: <span style={{ color: "#5f6368", fontWeight: 500 }}>¥{base.toLocaleString()}</span>
                　開始日: <span style={{ color: "#5f6368", fontWeight: 500 }}>{stats?.startDate ?? "—"}</span>
              </div>
            </div>

            {/* VS TOPIX badge */}
            <div style={{
              display: "inline-flex", flexDirection: "column", alignItems: "center",
              border: `1px solid ${pnlColor === "#34a853" ? "#a5d6a7" : "#ef9a9a"}`,
              borderRadius: 8, padding: "12px 20px",
              background: pnlBg,
            }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, color: pnlColor }}>
                VS TOPIX（期間累計）
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 26, fontWeight: 700, color: pnlColor, lineHeight: 1.2 }}>
                {isPositive ? "+" : ""}{totalReturn.toFixed(1)}%
              </div>
              <div style={{ fontSize: 11, color: pnlColor }}>
                {isPositive ? "アウトパフォーム ↑" : "アンダーパフォーム ↓"}
              </div>
            </div>
          </div>

          {/* 4 metric cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {/* 売買損益（確定） */}
            <div className="rounded-lg relative" style={{ background: "#f8f9fa", border: "1px solid #e8eaed", padding: "16px 20px", paddingBottom: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, borderRadius: "0 0 2px 2px", background: "#1a73e8" }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>売買損益（確定）</div>
              <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: realized === 0 ? "#9aa0a6" : realized > 0 ? "#34a853" : "#ea4335", lineHeight: 1, marginBottom: 4 }}>
                {realized >= 0 ? "" : "-"}¥{Math.abs(realized).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "#9aa0a6" }}>入金・出金を除く純粋な売買差益</div>
            </div>

            {/* 含み損益 */}
            <div className="rounded-lg relative" style={{ background: "#f8f9fa", border: "1px solid #e8eaed", padding: "16px 20px", paddingBottom: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, borderRadius: "0 0 2px 2px", background: "#34a853" }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>含み損益</div>
              <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: unrColor, lineHeight: 1, marginBottom: 4 }}>
                {unrealized >= 0 ? "+" : ""}¥{unrealized.toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                {stats ? `${(unrealized / base * 100).toFixed(2)}%　` : ""}保有{positions.length}銘柄の評価損益
              </div>
            </div>

            {/* 買付余力 */}
            <div className="rounded-lg relative" style={{ background: "#f8f9fa", border: "1px solid #e8eaed", padding: "16px 20px", paddingBottom: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, borderRadius: "0 0 2px 2px", background: "#fbbc04" }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>買付余力</div>
              <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: "#202124", lineHeight: 1, marginBottom: 4 }}>—</div>
              <div style={{ fontSize: 11, color: "#9aa0a6" }}>リアルタイム残高はAPIから取得</div>
            </div>

            {/* 運用期間 */}
            <div className="rounded-lg relative" style={{ background: "#f8f9fa", border: "1px solid #e8eaed", padding: "16px 20px", paddingBottom: 20 }}>
              <div style={{ position: "absolute", bottom: 0, left: 20, right: 20, height: 2, borderRadius: "0 0 2px 2px", background: "#e8eaed" }} />
              <div style={{ fontSize: 11, fontWeight: 500, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", marginBottom: 6 }}>運用期間</div>
              <div style={{ fontFamily: "monospace", fontSize: 24, fontWeight: 700, color: "#5f6368", lineHeight: 1, marginBottom: 4 }}>
                {stats?.opDays ?? "—"}<span style={{ fontSize: 16, fontFamily: "sans-serif" }}>日</span>
              </div>
              <div style={{ fontSize: 11, color: "#9aa0a6" }}>
                {stats ? `${stats.startDate} 〜 ${stats.endDate}` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* ポートフォリオ概要 + 採用戦略 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* ポートフォリオ概要 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
            <div className="flex items-center justify-between" style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-md text-base" style={{ width: 32, height: 32, background: "#e8f0fe" }}>📊</div>
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
                { label: "現在の評価総額（T-2）", value: stats ? `¥${stats.trueTotal.toLocaleString()}` : "—", color: "#202124" },
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
              <span>毎日18:00に前々営業日（T-2）のデータで自動更新</span>
            </div>
          </div>

          {/* 採用戦略 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
            <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center rounded-md text-base" style={{ width: 32, height: 32, background: "#e6f4ea" }}>🎯</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>採用戦略</div>
                    <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>3戦略を並列運用 / シグナル自動スクリーニング</div>
                  </div>
                </div>
              </div>
              <a
                href="https://note.com/mi_autolab"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 10, fontSize: 11, fontWeight: 600, padding: "4px 14px", borderRadius: 20, background: "#fff3e0", color: "#e65100", border: "1px solid #ffcc80", textDecoration: "none", whiteSpace: "nowrap" }}
              >
                📝 noteにて実践方法公開中！
              </a>
            </div>
            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                {
                  tag: "PEAD",
                  tagColor: "#1a73e8",
                  tagBg: "#e8f0fe",
                  title: "決算モメンタム戦略",
                  desc: "決算発表後の業績上方修正銘柄をスコアリングし、翌営業日に買い、数日のドリフトを狙う短期戦略。",
                },
                {
                  tag: "Turnover",
                  tagColor: "#34a853",
                  tagBg: "#e6f4ea",
                  title: "売買代金急増戦略",
                  desc: "売買代金が過去平均から急増した銘柄を検知し、需給変化による短期的な価格インパクトを取る戦略。",
                },
                {
                  tag: "Momentum",
                  tagColor: "#ea4335",
                  tagBg: "#fce8e6",
                  title: "テクニカルモメンタム戦略",
                  desc: "出来高・板情報需給・価格モメンタム・移動平均の複合シグナルで銘柄を選定する短期テクニカル戦略。",
                },
              ].map(s => (
                <div key={s.tag} style={{ borderLeft: `3px solid ${s.tagColor}`, padding: "12px 16px", borderRadius: "0 8px 8px 0", background: s.tagBg }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4, background: s.tagColor, color: "#fff" }}>{s.tag}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#202124" }}>{s.title}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "#5f6368", margin: 0, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ margin: "0 20px 16px", fontSize: 11, color: "#9aa0a6", textAlign: "center" }}>
              全戦略はAPIを通じて自動発注　|　損切・利確ルールを設定
            </div>
          </div>
        </div>

        {/* パフォーマンス推移 */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
          <div className="flex items-center justify-between" style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center rounded-md text-base" style={{ width: 32, height: 32, background: "#fef3e2" }}>📈</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>パフォーマンス推移</div>
                <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>
                  基準資金 ¥{base.toLocaleString()} スタートで正規化（T-2データ）
                </div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: "#f1f3f4", color: "#5f6368" }}>TOPIX 期間累計</span>
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
            <PortfolioChart data={portfolio} displayMode="%" />
          </div>
        </div>

        {/* 保有ポジション */}
        <div className="mb-3">
          <CollapsibleSection title="保有ポジション" count={positions.length}>
            {positions.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#9aa0a6" }}>
                保有銘柄なし（2日遅延公開）
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
                    {positions.map((p, i) => {
                      const ticker = p.ticker.replace(".T", "");
                      const totalCost = p.entry_price * p.quantity;
                      const pnl = p.unrealized_pnl ?? 0;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #e8eaed" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafe")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1a73e8" }}>{ticker}</td>
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
        <div>
          <CollapsibleSection title="取引履歴" count={trades.length}>
            {trades.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", fontSize: 13, color: "#9aa0a6" }}>
                取引データなし（2日遅延公開）
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      {["日付", "銘柄", "売買", "株数", "単価", "約定金額"].map(h => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9aa0a6", textTransform: "uppercase", letterSpacing: ".8px", borderBottom: "1px solid #e8eaed" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((t, i) => {
                      const ticker = t.ticker.replace(".T", "");
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #e8eaed" }} onMouseEnter={e => (e.currentTarget.style.background = "#f8fafe")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#5f6368" }}>{t.date}</td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1a73e8" }}>{ticker}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "monospace", background: t.side === "BUY" ? "#e8f0fe" : "#fce8e6", color: t.side === "BUY" ? "#1a73e8" : "#ea4335" }}>
                              {t.side === "BUY" ? "買" : "売"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>
                            {t.quantity?.toLocaleString() ?? "—"}株
                          </td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>
                            {t.price != null ? `¥${t.price.toLocaleString()}` : "—"}
                          </td>
                          <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, color: "#5f6368" }}>
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

      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 0% }
          100% { background-position: 200% }
        }
      `}</style>
    </div>
  );
}
