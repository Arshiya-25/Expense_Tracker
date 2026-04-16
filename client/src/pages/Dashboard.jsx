// src/pages/Dashboard.jsx
// useEffect = runs side effects (API calls, timers) after React renders
// The [] dependency array means "run once on mount" — like componentDidMount
// Recharts: AreaChart, BarChart etc. take `data` as a prop — a plain array of objects

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { getBudgets, getTransactions, getSummary } from "../api";
import { useAuth } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";

// Currency formatter
const fmt = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface2)", border: "1px solid var(--border2)",
      borderRadius: "var(--r-md)", padding: "10px 14px", fontSize: 13,
    }}>
      <p style={{ color: "var(--text3)", marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {fmt(p.value, currency)}
        </p>
      ))}
    </div>
  );
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CATEGORY_COLORS = {
  // A slightly richer palette (less “all purple”).
  Food: "#4f7cff",
  Transport: "#22c987",
  Shopping: "#f05c6e",
  Entertainment: "#f0a030",
  Utilities: "#85b7eb",
  Health: "#ed93b1",
  Education: "#5dcaa5",
  Other: "#a7a7c2",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [prevTransactions, setPrevTransactions] = useState([]);
  const [summary, setSummary] = useState({ monthlySummary: [], categoryBreakdown: [] });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevDate.getMonth() + 1;
  const prevYear = prevDate.getFullYear();

  // Fetch this month's transactions + yearly summary
  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, sumRes] = await Promise.all([
          // Promise.all runs both requests simultaneously — faster than sequential
          getTransactions({ month: currentMonth, year: currentYear }),
          getSummary({ year: currentYear }),
        ]);

        setTransactions(txRes.data);
        setSummary(sumRes.data);

        // Extra frontend-only data for insights (still using existing endpoints).
        const [prevTxRes, budgetsRes] = await Promise.all([
          getTransactions({ month: prevMonth, year: prevYear }),
          getBudgets({ month: currentMonth, year: currentYear }),
        ]);
        setPrevTransactions(prevTxRes.data);
        setBudgets(budgetsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []); // eslint-disable-line

  // Compute stats from transaction data
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  // Build chart data: 12 months, merge income + expense from aggregation
  const chartData = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    const incomeEntry = summary.monthlySummary.find(m => m._id?.month === monthNum && m._id?.type === "income");
    const expenseEntry = summary.monthlySummary.find(m => m._id?.month === monthNum && m._id?.type === "expense");
    return {
      name,
      income: incomeEntry?.total || 0,
      expense: expenseEntry?.total || 0,
    };
  });

  // Monthly comparison (current vs last month) using the same aggregated data for consistency.
  const currentIdx = now.getMonth();
  const lastIdx = (currentIdx + 11) % 12;
  const currentMonthTotals = chartData[currentIdx] || { income: 0, expense: 0 };
  const lastMonthTotals = chartData[lastIdx] || { income: 0, expense: 0 };
  const savingsNow = (currentMonthTotals.income || 0) - (currentMonthTotals.expense || 0);
  const savingsLast = (lastMonthTotals.income || 0) - (lastMonthTotals.expense || 0);
  const savingsDelta = savingsNow - savingsLast;

  // Category insight: compare this month vs last month spending by category.
  const currentExpenseByCat = {};
  (summary.categoryBreakdown || []).forEach((c) => {
    currentExpenseByCat[c._id] = c.total || 0;
  });
  const prevExpenseByCat = {};
  (prevTransactions || [])
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      prevExpenseByCat[t.category] = (prevExpenseByCat[t.category] || 0) + (t.amount || 0);
    });

  const foodDiff =
    (currentExpenseByCat.Food || 0) - (prevExpenseByCat.Food || 0);

  let bestDiffCat = null;
  let bestDiff = -Infinity;
  const allCats = new Set([
    ...Object.keys(currentExpenseByCat),
    ...Object.keys(prevExpenseByCat),
  ]);
  allCats.forEach((cat) => {
    const diff = (currentExpenseByCat[cat] || 0) - (prevExpenseByCat[cat] || 0);
    if (diff > bestDiff) {
      bestDiff = diff;
      bestDiffCat = cat;
    }
  });

  const hasBudget = budgets && budgets.length > 0;
  const totalBudgeted = hasBudget ? budgets.reduce((s, b) => s + (b.limit || 0), 0) : 0;
  const totalBudgetSpent = hasBudget ? budgets.reduce((s, b) => s + (b.spent || 0), 0) : 0;
  const budgetPctUsed = totalBudgeted > 0 ? Math.round((totalBudgetSpent / totalBudgeted) * 100) : 0;
  const budgetBarColor =
    budgetPctUsed >= 100 ? "var(--red)" : budgetPctUsed >= 80 ? "var(--amber)" : "var(--accent)";

  // Donut chart uses the same category summary data from the backend.
  const categoryChartData = summary.categoryBreakdown.map((entry) => ({
    name: entry._id,
    value: entry.total,
    color: CATEGORY_COLORS[entry._id] || "var(--accent)",
  }));

  const handleSaved = (newTx) => {
    setTransactions(prev => [newTx, ...prev]);

    // Keep budget usage feeling “live” without another API call.
    try {
      const txDate = new Date(newTx.date);
      const isCurrentMonth = txDate.getMonth() + 1 === currentMonth && txDate.getFullYear() === currentYear;
      if (!isCurrentMonth) return;
      if (newTx.type !== "expense") return;

      setBudgets(prev =>
        prev.map((b) => {
          if (b.category !== newTx.category) return b;
          const spent = (b.spent || 0) + (newTx.amount || 0);
          return {
            ...b,
            spent,
            percentage: Math.round((spent / (b.limit || 1)) * 100),
          };
        })
      );
    } catch {
      // ignore optimistic update failures
    }
  };

  if (loading) {
    return (
      <div className="page-enter">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100 }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 260, marginBottom: 16 }} />
      </div>
    );
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
            {getGreeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 4 }}>
            {format(now, "EEEE, d MMMM yyyy")} · {format(now, "HH:mm")}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add transaction
        </button>
      </div>

      {/* Stat cards */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <StatCard label="Income this month" value={fmt(totalIncome, user?.currency)} color="var(--green)" icon="↑" />
        <StatCard label="Expenses this month" value={fmt(totalExpense, user?.currency)} color="var(--red)" icon="↓" />
        <StatCard label="Net savings" value={fmt(savings, user?.currency)} color={savings >= 0 ? "var(--green)" : "var(--red)"} icon="◈" />
        <StatCard label="Savings rate" value={`${savingsRate}%`} color="var(--accent)" icon="%" />
      </div>

      {/* Insights + Budget usage */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 14 }}>
            Insights
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: 12,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(124,109,250,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                📌
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 650, marginBottom: 2 }}>
                  {foodDiff > 0
                    ? `You spent more on Food this month`
                    : bestDiff > 0
                      ? `You spent more on ${bestDiffCat}`
                      : `Spending is steady this month`}
                </p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>
                  {foodDiff > 0
                    ? `Food is up by ${fmt(foodDiff, user?.currency)}`
                    : bestDiff > 0
                      ? `${bestDiffCat} is up by ${fmt(bestDiff, user?.currency)}`
                      : `Big jumps are less likely when this line stays calm.`}
                </p>
              </div>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--border)",
              borderRadius: "var(--r-lg)",
              padding: 12,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}>
              <div style={{ width: 26, height: 26, borderRadius: 10, background: "rgba(34,201,135,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ◈
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 650, marginBottom: 2 }}>
                  {savingsDelta > 0 ? "Your savings increased" : savingsDelta < 0 ? "Your savings decreased" : "Your savings stayed the same"}
                </p>
                <p style={{ fontSize: 12, color: "var(--text3)" }}>
                  {savingsDelta > 0
                    ? `+${fmt(savingsDelta, user?.currency)} compared to last month`
                    : savingsDelta < 0
                      ? `${fmt(savingsDelta, user?.currency)} vs last month`
                      : `No meaningful change month-to-month.`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 14 }}>
            Budget usage
          </p>
          {totalBudgeted <= 0 ? (
            <p style={{ color: "var(--text3)", fontSize: 13, lineHeight: 1.6 }}>
              Set category budgets to see how close you are to your limits.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <p style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", margin: 0 }}>
                  {budgetPctUsed}%
                </p>
                <p style={{ fontSize: 13, color: "var(--text3)", margin: 0 }}>
                  {fmt(totalBudgetSpent, user?.currency)} used of {fmt(totalBudgeted, user?.currency)}
                </p>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budgetPctUsed, 100)}%`,
                    background: budgetBarColor,
                  }}
                />
              </div>

              <p style={{ fontSize: 12, color: budgetPctUsed >= 100 ? "var(--red)" : "var(--text3)", marginTop: 2 }}>
                {budgetPctUsed >= 100
                  ? "You’re over your budget—check categories."
                  : budgetPctUsed >= 80
                    ? "Getting close—watch your top categories."
                    : "You’re in a good zone this month."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Area chart — income vs expense over year */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 16 }}>
            Income vs expenses — {now.getFullYear()}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#22c987" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c987" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#f05c6e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f05c6e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: "#5a5a70", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5a5a70", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${Math.round(v/1000)}k` : v} />
              <Tooltip content={<ChartTooltip currency={user?.currency} />} />
              <Area type="monotone" dataKey="income" stroke="#22c987" strokeWidth={2} fill="url(#gIncome)" name="Income" />
              <Area type="monotone" dataKey="expense" stroke="#f05c6e" strokeWidth={2} fill="url(#gExpense)" name="Expense" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut chart — category breakdown */}
        <div className="card">
          <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 16 }}>
            Spending by category — {format(now, "MMMM")}
          </p>
          {summary.categoryBreakdown.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "var(--text3)", fontSize: 13 }}>No expenses this month yet</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 16, alignItems: "center" }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v, user?.currency)} />
                </PieChart>
              </ResponsiveContainer>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {categoryChartData.slice(0, 5).map((entry) => (
                  <div
                    key={entry.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      paddingBottom: 8,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: entry.color,
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{entry.name}</span>
                    </div>
                    <span style={{ fontSize: 13, color: "var(--text2)", fontFamily: "'DM Mono', monospace" }}>
                      {fmt(entry.value, user?.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Recent transactions</p>
          <a href="/transactions" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>View all →</a>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: "30px 0", textAlign: "center" }}>
            <p style={{ color: "var(--text3)", fontSize: 14 }}>No transactions this month</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginTop: 12 }}>
              Add your first one
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {transactions.slice(0, 8).map((tx) => (
              <TransactionRow key={tx._id} tx={tx} currency={user?.currency} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <TransactionModal onClose={() => setShowModal(false)} onSave={handleSaved} />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }) {
  return (
    <div className="card-sm" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: -10, right: -10, width: 60, height: 60,
        borderRadius: "50%", background: color, opacity: 0.08,
      }} />
      <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginBottom: 10,
        textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 600, color, fontFamily: "'DM Mono', monospace",
        letterSpacing: "-0.02em" }}>
        {value}
      </p>
    </div>
  );
}

function TransactionRow({ tx, currency }) {
  const isIncome = tx.type === "income";
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 12px", borderRadius: "var(--r-md)",
      transition: "background 0.1s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "var(--r-sm)",
        background: isIncome ? "var(--green-dim)" : "var(--red-dim)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0,
      }}>
        {CATEGORY_ICONS[tx.category] || "💳"}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontSize: 13, fontWeight: 500 }}>{tx.category}</p>
        <p style={{ fontSize: 12, color: "var(--text3)" }}>
          {tx.description || "—"} · {format(new Date(tx.date), "d MMM")}
        </p>
      </div>
      <p style={{
        fontSize: 14, fontWeight: 600, fontFamily: "'DM Mono', monospace",
        color: isIncome ? "var(--green)" : "var(--red)",
        letterSpacing: "-0.02em",
      }}>
        {isIncome ? "+" : "-"}{fmt(tx.amount, currency)}
      </p>
    </div>
  );
}

const CATEGORY_ICONS = {
  Food: "🍜", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Utilities: "⚡", Health: "💊", Education: "📚", Other: "📌",
  Salary: "💼", Freelance: "💻", Business: "🏢", Investment: "📈", Gift: "🎁",
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
