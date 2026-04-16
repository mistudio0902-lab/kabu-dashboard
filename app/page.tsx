import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/DashboardClient";
import type { PortfolioDaily, Trade, Position } from "@/lib/supabase";

export const revalidate = 3600;

// 運用開始時の基準資金
export const BASE_CAPITAL = 1_000_000;

// ポートフォリオ表示開始日（¥1M入金日）
export const PORTFOLIO_START_DATE = "2026-04-08";

// T-N 営業日前の日付を計算（土日スキップ）
function bizDaysBack(from: Date, n: number): Date {
  const d = new Date(from);
  let count = 0;
  while (count < n) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return d;
}

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return {
      portfolio: [] as PortfolioDaily[],
      trades: [] as Trade[],
      positions: [] as Position[],
    };
  }

  // anon クライアント（RLS 適用）
  const supabase = createClient(url, key);
  // service_role クライアント（RLS バイパス — positions/trades 取得用）
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? key;
  const supabaseAdmin = createClient(url, serviceKey);

  // T-2 営業日のカットオフ日付（JST基準: UTC+9）
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const cutoffDate = bizDaysBack(nowJst, 2);
  const cutoff = cutoffDate.toISOString().split("T")[0]; // YYYY-MM-DD

  const [portfolioRes, tradesRes, positionsRes] = await Promise.all([
    supabase
      .from("portfolio_daily")
      .select("*")
      .order("date", { ascending: true })
      .gte("date", PORTFOLIO_START_DATE)
      .lte("date", cutoff),
    supabaseAdmin
      .from("trades")
      .select("*")
      .eq("order_result", "success")
      .lte("date", cutoff)
      .order("timestamp", { ascending: false })
      .limit(200),
    supabaseAdmin
      .from("positions")
      .select("*")
      .eq("date", cutoff)
      .order("ticker", { ascending: true }),
  ]);

  const rawPortfolio = (portfolioRes.data ?? []) as PortfolioDaily[];

  // 累積リターンをBASE_CAPITAL基準で再計算
  const portfolio = rawPortfolio.map((d) => ({
    ...d,
    cumulative_return: (d.total_capital - BASE_CAPITAL) / BASE_CAPITAL,
  }));

  return {
    portfolio,
    trades: (tradesRes.data ?? []) as Trade[],
    positions: (positionsRes.data ?? []) as Position[],
  };
}

export default async function Home() {
  const { portfolio, trades, positions } = await getData();
  return (
    <DashboardClient
      portfolio={portfolio}
      trades={trades}
      positions={positions}
      baseCapital={BASE_CAPITAL}
    />
  );
}
