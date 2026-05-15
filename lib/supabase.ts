import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PortfolioDaily = {
  date: string;
  total_capital: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  n_trades: number;
  drawdown: number;
  cumulative_return?: number;
  topix_return?: number | null;
  cash_ratio?: number | null;
  holdings_count?: number | null;
  unrealized_pnl?: number | null;
};

export type Trade = {
  id: number;
  timestamp: string;
  date: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  notional: number;
  signal_score: number | null;
  kelly_weight: number | null;
  order_result: string | null;
  strategy: string | null;
  strategy_name?: string | null;
  company_name?: string | null;
  realized_pnl?: number | null;
};

export type Position = {
  id: number;
  date: string;
  ticker: string;
  quantity: number;
  entry_price: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  side: "LONG" | "SHORT";
  strategy: string | null;
  updated_at: string;
  company_name?: string | null;
};
