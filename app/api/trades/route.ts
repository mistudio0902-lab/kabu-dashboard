import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  brokerTrades,
  enrichBrokerTradeMetadata,
  loadBrokerRows,
  sortTradesForDisplay,
} from "@/lib/brokerCsv";

export const dynamic = 'force-dynamic';

export async function GET() {
  const brokerRows = loadBrokerRows();
  if (brokerRows.length) {
    return NextResponse.json(sortTradesForDisplay(enrichBrokerTradeMetadata(brokerTrades(brokerRows), brokerRows)));
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // RLS で2日遅延フィルター適用済み（anon キー）
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("order_result", "success")
    .order("timestamp", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(sortTradesForDisplay(enrichBrokerTradeMetadata(data ?? [])));
}
