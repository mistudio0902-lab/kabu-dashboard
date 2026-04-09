import { createClient } from "@supabase/supabase-js";
import DashboardClient from "@/components/DashboardClient";
import type { PortfolioDaily, Trade } from "@/lib/supabase";

export const revalidate = 3600;

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
      .limit(100),
  ]);

  return {
    portfolio: (portfolioRes.data ?? []) as PortfolioDaily[],
    trades: (tradesRes.data ?? []) as Trade[],
  };
}

export default async function Home() {
  const { portfolio, trades } = await getData();
  return <DashboardClient portfolio={portfolio} trades={trades} />;
}
