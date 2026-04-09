import type { PortfolioDaily } from "@/lib/supabase";

type Props = {
  data: PortfolioDaily[];
};

function calcStats(data: PortfolioDaily[]) {
  if (!data.length) return null;

  const latest = data[data.length - 1];
  const first = data[0];

  const totalReturn =
    first.total_capital > 0
      ? (latest.total_capital - first.total_capital) / first.total_capital
      : 0;

  const returns = data.map((d) => d.daily_pnl_pct).filter((v) => v !== 0);
  const mean = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const std = Math.sqrt(
    returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length || 1)
  );
  const sharpe = std > 0 ? (mean / std) * Math.sqrt(252) : 0;

  const wins = returns.filter((r) => r > 0).length;
  const winRate = returns.length > 0 ? wins / returns.length : 0;

  // 最大ドローダウン
  const maxDD = Math.min(...data.map((d) => d.drawdown ?? 0));

  const tradingDays = data.filter((d) => d.n_trades > 0).length;

  return {
    totalCapital: latest.total_capital,
    totalReturn,
    sharpe,
    winRate,
    maxDD,
    tradingDays,
    totalDays: data.length,
  };
}

type CardProps = {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red" | "blue" | "default";
};

function Card({ label, value, sub, color = "default" }: CardProps) {
  const valueColor =
    color === "green"
      ? "text-emerald-600"
      : color === "red"
      ? "text-red-500"
      : color === "blue"
      ? "text-blue-600"
      : "text-gray-900";

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function StatsCards({ data }: Props) {
  const s = calcStats(data);
  if (!s) return null;

  const returnColor = s.totalReturn >= 0 ? "green" : "red";
  const returnStr =
    (s.totalReturn >= 0 ? "+" : "") +
    (s.totalReturn * 100).toFixed(2) +
    "%";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Card
        label="総資産"
        value={`¥${s.totalCapital.toLocaleString()}`}
        sub={`${s.totalDays}日間稼働`}
        color="blue"
      />
      <Card
        label="総リターン"
        value={returnStr}
        sub={`¥${(s.totalCapital - (data[0]?.total_capital ?? 0)).toLocaleString()}`}
        color={returnColor}
      />
      <Card
        label="Sharpe Ratio"
        value={s.sharpe.toFixed(2)}
        sub="年率換算"
        color={s.sharpe >= 1 ? "green" : s.sharpe >= 0 ? "default" : "red"}
      />
      <Card
        label="勝率"
        value={(s.winRate * 100).toFixed(1) + "%"}
        sub={`取引日数: ${s.tradingDays}日`}
        color={s.winRate >= 0.5 ? "green" : "default"}
      />
      <Card
        label="最大DD"
        value={(s.maxDD * 100).toFixed(2) + "%"}
        sub="最大ドローダウン"
        color={Math.abs(s.maxDD) <= 0.15 ? "green" : "red"}
      />
      <Card
        label="戦略"
        value="PEAD + Turnover"
        sub="Claude Code 自動売買"
        color="default"
      />
    </div>
  );
}
