"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartData } from "../dashboard.types";

export function DashboardChart({ chart }: { chart: DashboardChartData }) {
  const common = (
    <>
      <CartesianGrid strokeDasharray="3 3" vertical={false} />
      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={48} />
      <Tooltip
        contentStyle={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "12px",
          fontSize: "12px",
        }}
      />
      <Legend wrapperStyle={{ fontSize: "11px" }} />
    </>
  );

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h2 className="text-base font-bold text-foreground">{chart.title}</h2>
      <p className="mb-6 mt-1 text-xs text-muted-foreground">
        {chart.description}
      </p>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "bar" ? (
            <BarChart data={chart.points}>
              {common}
              <Bar
                dataKey="primary"
                name={chart.primaryLabel}
                fill="var(--primary)"
                radius={[4, 4, 0, 0]}
              />
              {chart.secondaryLabel && (
                <Bar
                  dataKey="secondary"
                  name={chart.secondaryLabel}
                  fill="var(--accent)"
                  radius={[4, 4, 0, 0]}
                />
              )}
            </BarChart>
          ) : chart.type === "line" ? (
            <LineChart data={chart.points}>
              {common}
              <Line
                type="monotone"
                dataKey="primary"
                name={chart.primaryLabel}
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--primary)" }}
              />
            </LineChart>
          ) : (
            <AreaChart data={chart.points}>
              {common}
              <Area
                type="monotone"
                dataKey="primary"
                name={chart.primaryLabel}
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.12}
              />
              {chart.secondaryLabel && (
                <Area
                  type="monotone"
                  dataKey="secondary"
                  name={chart.secondaryLabel}
                  stroke="var(--accent)"
                  fill="var(--accent)"
                  fillOpacity={0.18}
                />
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}

