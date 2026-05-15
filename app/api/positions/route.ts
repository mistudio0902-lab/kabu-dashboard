import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { brokerPositions, enrichPositionNames, loadBrokerRows } from "@/lib/brokerCsv";

export const dynamic = 'force-dynamic';

export async function GET() {
  const brokerRows = loadBrokerRows();
  if (brokerRows.length) {
    return NextResponse.json(enrichPositionNames(brokerPositions(brokerRows), brokerRows));
  }

  // positions テーブルは anon RLS で非公開のため service_role キーを使用
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(enrichPositionNames(data ?? []));
}
