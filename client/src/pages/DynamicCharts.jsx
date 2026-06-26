// DynamicCharts component to lazy load Recharts for performance optimization
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Custom tooltip for area charts
const ChartTooltip = ({ active, payload, label, currency, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "rgba(10, 14, 30, 0.9)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontSize: 13,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
      }}
    >
      <p style={{ color: "#E2E8F0", fontWeight: 600, margin: "0 0 6px 0" }}>{label}</p>
      {payload.map((p) => {
        const color = p.name === "Income" ? "#31D67B" : "#FF5B77";
        return (
          <p key={p.name} style={{ color: color, fontWeight: 600, margin: "2px 0 0 0" }}>
            {p.name}: {fmt(p.value, currency)}
          </p>
        );
      })}
    </div>
  );
};

export default function DynamicCharts({ categoryChartData, currency, fmt, categoryBreakdownCount, nowMonthName, year, budgets = [] }) {
  return (
    /* Donut chart — category breakdown */
    <div className="card" style={{ minHeight: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: "var(--text2)",
          marginBottom: 16,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        Spending by category — {nowMonthName}
      </p>
      {categoryBreakdownCount === 0 ? (
        <div
          style={{
            height: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--text3)", fontSize: 13 }}>
            No expenses this month yet
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "150px 1fr",
            gap: 16,
            alignItems: "center",
          }}
        >
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  stroke="none"
                >
                  {categoryChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(v) => fmt(v, currency)}
                  contentStyle={{
                    background: "rgba(10, 14, 30, 0.9)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25)",
                  }}
                  itemStyle={{ color: "#E2E8F0", fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 180, overflowY: "auto", paddingRight: 4 }}
          >
            {categoryChartData.map((entry) => (
              <div
                key={entry.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  paddingBottom: 6,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: 8 }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: entry.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 100 }}>
                    {entry.name}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text2)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                  }}
                >
                  {fmt(entry.value, currency)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
