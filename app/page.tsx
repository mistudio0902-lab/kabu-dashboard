import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/DashboardClient";
import type { PortfolioDaily, Trade, Position } from "@/lib/supabase";
import {
  applyBrokerPortfolio,
  brokerPositions,
  brokerTrades,
  enrichPositionNames,
  enrichTradeNames,
  loadBrokerRows,
} from "@/lib/brokerCsv";

export const dynamic = 'force-dynamic';

// 運用開始時の基準資金
export const BASE_CAPITAL = 1_000_000;

// ポートフォリオ表示開始日（¥1M入金日）
export const PORTFOLIO_START_DATE = "2026-04-06";

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

async function fetchTopix(startDate: string, endDate: string): Promise<Record<string, number>> {
  try {
    const p1 = Math.floor(new Date(startDate + "T00:00:00Z").getTime() / 1000);
    const p2 = Math.floor(new Date(endDate + "T23:59:59Z").getTime() / 1000);
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/1306.T?interval=1d&period1=${p1}&period2=${p2}`,
      {
        headers: { "User-Agent": "Mozilla/5.0" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return {};
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return {};
    const timestamps: number[] = result.timestamp ?? [];
    const closes: number[] = result.indicators?.quote?.[0]?.close ?? [];
    const out: Record<string, number> = {};
    timestamps.forEach((ts, i) => {
      const date = new Date(ts * 1000).toISOString().split("T")[0];
      if (closes[i] != null) out[date] = closes[i];
    });
    return out;
  } catch {
    return {};
  }
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

  // 18:00 JST以降は当日、それ以前は前営業日まで表示
  const nowJst = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const hourJst = nowJst.getUTCHours(); // UTC hours = JST hours (already offset)
  const cutoffDate = hourJst >= 18 ? nowJst : bizDaysBack(nowJst, 1);
  const cutoff = cutoffDate.toISOString().split("T")[0]; // YYYY-MM-DD

  const [portfolioRes, tradesRes, positionsRes, topixPrices] = await Promise.all([
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
      .order("updated_at", { ascending: false })
      .limit(200),
    fetchTopix(PORTFOLIO_START_DATE, cutoff),
  ]);

  const brokerRows = loadBrokerRows();
  const rawPortfolio = applyBrokerPortfolio((portfolioRes.data ?? []) as PortfolioDaily[], brokerRows);

  // TOPIX基準リターン計算（最初の取引日のTOPIX終値を100%とする）
  const topixDates = Object.keys(topixPrices).sort();
  const topixBase = topixDates.length > 0 ? topixPrices[topixDates[0]] : null;

  // 累積リターンをBASE_CAPITAL基準で再計算、TOPIX累積リターンも付与
  const portfolio = rawPortfolio.map((d) => {
    // 当日または直近のTOPIX値を前方補完で取得
    const close = topixPrices[d.date] ?? (() => {
      const prev = topixDates.filter(dt => dt <= d.date).at(-1);
      return prev ? topixPrices[prev] : null;
    })();
    return {
      ...d,
      cumulative_return: (d.total_capital - BASE_CAPITAL) / BASE_CAPITAL,
      topix_return: topixBase && close ? (close - topixBase) / topixBase : null,
    };
  });

  return {
    portfolio,
    trades: enrichTradeNames(brokerRows.length
      ? [
          ...brokerTrades(brokerRows),
          ...((tradesRes.data ?? []) as Trade[]).filter(
            (t) => !brokerRows.some((r) => r.date === t.date)
          ),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      : (tradesRes.data ?? []) as Trade[], brokerRows),
    positions: enrichPositionNames(brokerRows.length ? brokerPositions(brokerRows) : (positionsRes.data ?? []) as Position[], brokerRows),
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
