import type { Trade } from "@/lib/supabase";

type Props = {
  trades: Trade[];
};

const STRATEGY_COLOR: Record<string, string> = {
  PEAD: "bg-blue-50 text-blue-700",
  Turnover: "bg-purple-50 text-purple-700",
};

// BUY/SELLをFIFOマッチングして各トレードの損益を計算
function calcPnl(trades: Trade[]): Map<number, number> {
  const pnlMap = new Map<number, number>();
  // 古い順に処理
  const sorted = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  // ticker → BUYキュー
  const buyQueues = new Map<string, { id: number; price: number; qty: number }[]>();

  for (const t of sorted) {
    const key = t.ticker;
    if (t.side === "BUY") {
      if (!buyQueues.has(key)) buyQueues.set(key, []);
      buyQueues.get(key)!.push({ id: t.id, price: t.price, qty: t.quantity });
    } else {
      if (t.realized_pnl != null) {
        pnlMap.set(t.id, Math.round(t.realized_pnl));
        continue;
      }
      const queue = buyQueues.get(key) ?? [];
      let remaining = t.quantity;
      let totalCost = 0;
      let matched = 0;
      while (remaining > 0 && queue.length > 0) {
        const buy = queue[0];
        const used = Math.min(buy.qty, remaining);
        totalCost += buy.price * used;
        matched += used;
        remaining -= used;
        buy.qty -= used;
        if (buy.qty === 0) queue.shift();
      }
      if (matched > 0) {
        const pnl = (t.price - totalCost / matched) * matched;
        pnlMap.set(t.id, Math.round(pnl));
      }
    }
  }
  return pnlMap;
}

export default function TradeHistory({ trades }: Props) {
  if (!trades.length) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        トレード履歴がありません（2日遅延で公開）
      </div>
    );
  }

  const pnlMap = calcPnl(trades);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">日時</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">銘柄</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">売買</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">株数</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">単価</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">約定金額</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">損益</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wide">戦略</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {trades.map((t) => {
            const date = new Date(t.timestamp);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
            const ticker = t.ticker.replace(".T", "");
            const strategyClass = STRATEGY_COLOR[t.strategy ?? ""] ?? "bg-gray-50 text-gray-600";
            const companyName = t.company_name ?? "";
            const pnl = pnlMap.get(t.id);

            return (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4 text-gray-500 font-mono text-xs">{dateStr}</td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900">{ticker}</div>
                  {companyName && <div className="text-xs text-gray-400 mt-0.5">{companyName}</div>}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${t.side === "BUY" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                    {t.side === "BUY" ? "買い" : "売り"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums">{t.quantity.toLocaleString()}株</td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums font-mono">¥{t.price.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-gray-700 tabular-nums font-mono">¥{t.notional.toLocaleString()}</td>
                <td className="py-3 px-4 text-right tabular-nums font-mono">
                  {pnl !== undefined ? (
                    <span className={pnl >= 0 ? "text-emerald-600 font-semibold" : "text-red-500 font-semibold"}>
                      {pnl >= 0 ? "+" : ""}¥{pnl.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-300">—</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {t.strategy && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${strategyClass}`}>
                      {t.strategy}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
