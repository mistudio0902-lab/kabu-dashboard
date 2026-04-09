import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/DashboardClient";
import type { PortfolioDaily, Trade } from "@/lib/supabase";

export const revalidate = 3600;

// 運用開始時の基準資金
export const BASE_CAPITAL = 1_000_000;

async function getData() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { portfolio: [] as PortfolioDaily[], trades: [] as Trade[] };
  }

  const supabase = createClient(url, key);

  const [portfolioRes, tradesRes] = await Promise.all([
    supabase
      .from("portfolio_cumulative")
      .select("*")
      .order("date", { ascending: true }),
    supabase
      .from("trades")
      .select("*")
      .eq("order_result", "success")
      .order("timestamp", { ascending: false })
      .limit(200),
  ]);

  const rawPortfolio = (portfolioRes.data ?? []) as PortfolioDaily[];

  // ¥1,000,000投入以降のデータのみ表示（入金操作を除外）
  const filteredPortfolio = rawPortfolio.filter(
    (d) => d.total_capital >= BASE_CAPITAL * 0.9
  );

  // 累積リターンをBASE_CAPITAL基準で再計算（入金ではなく売買差益のみ反映）
  const portfolio = filteredPortfolio.map((d) => ({
    ...d,
    cumulative_return: (d.total_capital - BASE_CAPITAL) / BASE_CAPITAL,
  }));

  return {
    portfolio,
    trades: (tradesRes.data ?? []) as Trade[],
  };
}

export default async function Home() {
  const { portfolio, trades } = await getData();
  return (
    <DashboardClient
      portfolio={portfolio}
      trades={trades}
      baseCapital={BASE_CAPITAL}
    />
  );
}
