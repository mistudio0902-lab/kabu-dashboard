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
          <div style={{ fontSize: 22 }}>🤖</div>
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* パフォーマンス推移 */}
          <div className="rounded-xl overflow-hidden" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
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
        </div>

        {/* 採用戦略 */}
        <div className="rounded-xl overflow-hidden mb-5" style={{ background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,.08),0 2px 6px rgba(0,0,0,.05)" }}>
          <div style={{ padding: "20px 28px 18px", borderBottom: "1px solid #e8eaed" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center rounded-md text-base" style={{ width: 32, height: 32, background: "#e6f4ea" }}>🎯</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#202124" }}>採用戦略 &amp; 概要</div>
                  <div style={{ fontSize: 12, color: "#9aa0a6", marginTop: 1 }}>3戦略を並列運用 / シグナル自動スクリーニング</div>
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
                銘柄名は<strong style={{ color: "#202124" }}>2日遅延</strong>で公開（インサイダー取引防止）。
              </p>
            </div>

            {/* 3戦略 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
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
                {
                  tag: "Momentum", sub: "Multi-Factor Technical",
                  tagColor: "#ea4335", tagBg: "#fce8e6",
                  title: "テクニカルモメンタム戦略",
                  desc: "出来高急増・板情報需給・価格モメンタムの質・移動平均位置の4要素を合成してスコア化。上位銘柄を翌営業日の寄付きで買い、複数条件達成で決済する短期テクニカル戦略。",
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
