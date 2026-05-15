import fs from "node:fs";

import type { PortfolioDaily, Position, Trade } from "@/lib/supabase";
import brokerTradeOverrides from "@/data/brokerTradeOverrides.json";

const BROKER_CSV = process.env.TRADE_KABU_CSV ?? "";
const BASE_CAPITAL = 1_000_000;

const STOCK_NAMES: Record<string, string> = {
  "142A": "ジンジブ",
  "7974": "任天堂",
  "8358": "スルガ銀",
  "7860": "エイベックス",
  "8368": "百五銀",
  "1720": "東急建設",
  "9509": "北海電",
  "4028": "石原産",
  "3608": "TSIHD",
  "3635": "コーテクHD",
  "9842": "アークランズ",
  "6810": "マクセル",
  "3697": "SHIFT",
  "2341": "アルバイトT",
  "9602": "東宝",
  "2659": "サンエー",
  "4825": "WNIウェザ",
  "8051": "山善",
  "1719": "安藤ハザマ",
};

type BrokerRow = {
  date: string;
  name: string;
  ticker: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  notional: number;
  pnl: number;
};

type BrokerTradeOverride = {
  date: string;
  ticker: string;
  company_name: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  notional: number;
  realized_pnl: number | null;
  source_order: number;
  strategy: "PEAD" | "COMBO";
};

const BROKER_TRADE_OVERRIDES = brokerTradeOverrides as BrokerTradeOverride[];

function overrideRows(): BrokerRow[] {
  return BROKER_TRADE_OVERRIDES.map((row) => ({
    date: row.date,
    name: row.company_name,
    ticker: row.ticker,
    side: row.side,
    quantity: row.quantity,
    price: row.price,
    notional: row.notional,
    pnl: row.realized_pnl ?? 0,
  }));
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function num(value: string | undefined): number {
  return Number((value ?? "0").replaceAll(",", "")) || 0;
}

export function loadBrokerRows(): BrokerRow[] {
  if (!BROKER_CSV) return overrideRows();
  if (!fs.existsSync(BROKER_CSV)) return overrideRows();

  // TRADE_KABU_CSV is disabled on Vercel. If enabled locally, read the broker
  // export as UTF-8 only; production gets canonical rows from Supabase.
  const text = fs.readFileSync(BROKER_CSV, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);
  return lines.slice(1).flatMap((line) => {
    const r = parseCsvLine(line);
    const dateRaw = r[idx("約定日")];
    const code = r[idx("銘柄コード")];
    const sideRaw = r[idx("売買区分")];
    if (!dateRaw || !code) return [];
    return [
      {
        date: dateRaw.replaceAll("/", "-"),
        name: r[idx("銘柄名")] ?? "",
        ticker: `${code.replace(".T", "")}.T`,
        side: sideRaw === "買" ? "BUY" : "SELL",
        quantity: num(r[idx("数量")]),
        price: num(r[idx("単価")]),
        notional: num(r[idx("受渡金額")]),
        pnl: num(r[idx("売買損益")]),
      },
    ];
  });
}

export function brokerNameMap(rows = loadBrokerRows()): Record<string, string> {
  return {
    ...STOCK_NAMES,
    ...Object.fromEntries(rows.map((r) => [r.ticker.replace(".T", ""), r.name]).filter(([, name]) => name)),
  };
}

export function enrichTradeNames<T extends Trade>(trades: T[], rows = loadBrokerRows()): T[] {
  const names = brokerNameMap(rows);
  return trades.map((trade) => ({
    ...trade,
    company_name: names[trade.ticker.replace(".T", "")] ?? trade.company_name ?? null,
  }));
}

function tradeOverrideKey(trade: Pick<Trade, "date" | "ticker" | "side" | "quantity" | "price">): string {
  return [
    trade.date,
    trade.ticker,
    trade.side,
    trade.quantity,
    Number(trade.price).toFixed(4),
  ].join("|");
}

const OVERRIDE_BY_KEY = new Map(
  BROKER_TRADE_OVERRIDES.map((override) => [
    tradeOverrideKey(override),
    override,
  ]),
);

export function enrichBrokerTradeMetadata<T extends Trade>(trades: T[], rows = loadBrokerRows()): T[] {
  const named = enrichTradeNames(trades, rows);
  return named.map((trade) => {
    const override = OVERRIDE_BY_KEY.get(tradeOverrideKey(trade));
    return {
      ...trade,
      company_name: override?.company_name ?? trade.company_name ?? null,
      realized_pnl: override?.realized_pnl ?? trade.realized_pnl ?? null,
      broker_source_order: override?.source_order ?? trade.broker_source_order ?? null,
      strategy: override?.strategy ?? (trade.strategy === "Turnover" ? "COMBO" : trade.strategy),
      strategy_name: null,
    };
  });
}

export function sortTradesForDisplay<T extends Trade>(trades: T[]): T[] {
  return [...trades].sort((a, b) => {
    const dateCmp = b.date.localeCompare(a.date);
    if (dateCmp !== 0) return dateCmp;

    const aOrder = a.broker_source_order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.broker_source_order ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;

    const timeCmp = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (timeCmp !== 0) return timeCmp;
    return b.id - a.id;
  });
}

export function enrichPositionNames<T extends Position>(positions: T[], rows = loadBrokerRows()): T[] {
  const names = brokerNameMap(rows);
  return positions.map((position) => ({
    ...position,
    company_name: names[position.ticker.replace(".T", "")] ?? position.company_name ?? null,
  }));
}

export function brokerTrades(rows = loadBrokerRows()): Trade[] {
  return rows.map((r, i) => ({
    id: 9_000_000 + i,
    timestamp: `${r.date}T09:00:00+09:00`,
    date: r.date,
    ticker: r.ticker,
    side: r.side,
    quantity: r.quantity,
    price: r.price,
    notional: r.notional,
    signal_score: null,
    kelly_weight: null,
    order_result: "success",
    strategy: "broker_csv",
    strategy_name: "TradeKabu.csv",
    company_name: r.name,
    realized_pnl: r.pnl,
  }));
}

export function applyBrokerPortfolio(portfolio: PortfolioDaily[], rows = loadBrokerRows()): PortfolioDaily[] {
  if (!rows.length) return portfolio;
  const byDate = new Map<string, BrokerRow[]>();
  for (const row of rows) {
    byDate.set(row.date, [...(byDate.get(row.date) ?? []), row]);
  }

  const merged = new Map(portfolio.map((p) => [p.date, { ...p }]));
  const dates = [...byDate.keys()].sort();
  const firstBrokerDate = dates[0];
  const previous = [...portfolio].filter((p) => p.date < firstBrokerDate).at(-1);
  let running = previous ? previous.total_capital - BASE_CAPITAL : 0;
  for (const date of dates) {
    const dayRows = byDate.get(date) ?? [];
    const dailyPnl = dayRows.reduce((sum, row) => sum + row.pnl, 0);
    running += dailyPnl;
    const total = BASE_CAPITAL + running;
    const prev = total - dailyPnl;
    merged.set(date, {
      ...(merged.get(date) ?? { date }),
      date,
      total_capital: total,
      daily_pnl: dailyPnl,
      daily_pnl_pct: prev ? dailyPnl / prev : 0,
      n_trades: dayRows.length,
      drawdown: Math.min(0, prev ? dailyPnl / prev : 0),
      unrealized_pnl: 0,
      holdings_count: 0,
    });
  }
  return [...merged.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function brokerPositions(rows = loadBrokerRows()): Position[] {
  const lots = new Map<string, { qty: number; price: number; name: string; date: string }[]>();
  for (const row of [...rows].sort((a, b) => a.date.localeCompare(b.date) || (a.side === "BUY" ? -1 : 1))) {
    if (row.side === "BUY") {
      lots.set(row.ticker, [...(lots.get(row.ticker) ?? []), { qty: row.quantity, price: row.price, name: row.name, date: row.date }]);
      continue;
    }
    let remaining = row.quantity;
    const q = lots.get(row.ticker) ?? [];
    while (remaining > 0 && q.length) {
      const lot = q[0];
      const used = Math.min(lot.qty, remaining);
      lot.qty -= used;
      remaining -= used;
      if (lot.qty <= 0) q.shift();
    }
  }

  let id = 9_000_000;
  return [...lots.entries()].flatMap(([ticker, q]) =>
    q
      .filter((lot) => lot.qty > 0)
      .map((lot) => ({
        id: id++,
        date: lot.date,
        ticker,
        quantity: lot.qty,
        entry_price: lot.price,
        current_price: null,
        unrealized_pnl: 0,
        side: "LONG" as const,
        strategy: "broker_csv",
        updated_at: `${lot.date}T15:30:00+09:00`,
        company_name: lot.name,
      })),
  );
}
