import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 3600;

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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

  return NextResponse.json(data);
}
