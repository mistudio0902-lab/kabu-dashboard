import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { applyBrokerPortfolio, loadBrokerRows } from "@/lib/brokerCsv";

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("portfolio_daily")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(applyBrokerPortfolio(data ?? [], loadBrokerRows()));
}
