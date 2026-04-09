import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const revalidate = 3600; // 1時間キャッシュ

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("portfolio_cumulative")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
