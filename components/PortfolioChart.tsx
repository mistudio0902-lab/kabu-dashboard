"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from "recharts";
import type { PortfolioDaily } from "@/lib/supabase";

type Props = {
  data: PortfolioDaily[];
  displayMode: "$" | "%";
  height?: number;
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const formatYen = (v: number) =>
  v >= 1_000_000
    ? `¥${(v / 1_000_000).toFixed(1)}M`
    : `¥${(v / 1_000).toFixed(0)}K`;

const CustomTooltip = ({
  active,
  payload,
  label,
  isYen,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
  isYen: boolean;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-lg"
      style={{ fontSize: 12 }}
    >
      <p className="text-gray-500 mb-1 font-medium">{label}</p>
      {payload.filter(p => p.name === "kabu-trader" || p.name === "TOPIX").map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}:{" "}
          {isYen
            ? `¥${Number(p.value).toLocaleString()}`
            : `${p.value > 0 ? "+" : ""}${p.value}%`}
        </p>
      ))}
    </div>
  );
};

export default function PortfolioChart({ data, displayMode, height = 340 }: Props) {
  const isYen = displayMode === "$";

  const chartData = data.map((d) => ({
    date: d.date,
    label: formatDate(d.date),
    capital: d.total_capital,
    cumReturn: +(d.cumulative_return! * 100).toFixed(2),
    topix: d.topix_return != null ? +(d.topix_return * 100).toFixed(2) : null,
    topixYen: d.topix_return != null ? Math.round(1_000_000 * (1 + d.topix_return)) : null,
  }));

  // Extend benchmark flat line across full range if data exists
  const startCapital = data.length > 0 ? data[0].total_capital : 0;

  // Dynamic Y-axis domain so TOPIX vs portfolio diff is visible
  const yDomain: [number | string, number | string] = (() => {
    if (chartData.length === 0) return ["auto", "auto"];
    if (isYen) {
      const vals = chartData.flatMap((d) =>
        [d.capital, d.topixYen].filter((v): v is number => v != null)
      );
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const pad = (max - min) * 0.05 || max * 0.01;
      return [Math.floor(min - pad), Math.ceil(max + pad)];
    } else {
      const vals = chartData.flatMap((d) =>
        [d.cumReturn, d.topix].filter((v): v is number => v != null)
      );
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const pad = (max - min) * 0.05 || 0.5;
      return [+((min - pad).toFixed(2)), +((max + pad).toFixed(2))];
    }
  })();

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
      >
        <defs>
          <linearGradient id="kabuGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="kabuGradientYen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.12} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="0"
          stroke="#f3f4f6"
          horizontal={true}
          vertical={false}
        />

        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={isYen ? formatYen : (v) => `${v > 0 ? "+" : ""}${v}%`}
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          width={56}
          domain={yDomain}
        />

        <Tooltip
          content={<CustomTooltip isYen={isYen} />}
          cursor={{ stroke: "#e5e7eb", strokeWidth: 1 }}
        />

        {/* ゼロライン */}
        {!isYen && (
          <ReferenceLine y={0} stroke="#e5e7eb" strokeWidth={1} />
        )}
        {isYen && (
          <ReferenceLine
            y={startCapital}
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        )}

        {/* TOPIX ベンチマーク（破線グレー） */}
        <Line
          type="monotone"
          dataKey={isYen ? "topixYen" : "topix"}
          stroke="#9ca3af"
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          activeDot={false}
          name="TOPIX"
        />

        {/* グラデーションエリア */}
        <Area
          type="monotone"
          dataKey={isYen ? "capital" : "cumReturn"}
          stroke="none"
          fill="url(#kabuGradient)"
          dot={false}
          activeDot={false}
          legendType="none"
          tooltipType="none"
          name=""
        />

        {/* kabu-trader ライン */}
        <Line
          type="monotone"
          dataKey={isYen ? "capital" : "cumReturn"}
          stroke="#2563eb"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
          name="kabu-trader"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
