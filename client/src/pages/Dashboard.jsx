// Redesigned premium finance dashboard matching editorial guidelines
import React, { useState, useEffect, Suspense } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { 
  Search, 
  X, 
  Bell, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target, 
  Clock, 
  CreditCard,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Heart,
  GraduationCap,
  Tag,
  Briefcase,
  Laptop,
  Building,
  Gift
} from "lucide-react";
import { getBudgets, getTransactions, getSummary } from "../api";
import { useAuth } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";
import ErrorBoundary from "../components/ErrorBoundary"; // Import component-level error boundaries
import { formatCurrency, formatDate, formatPercentage } from "../utils/formatters"; // Central utilities

// Map legacy fmt formatter to safe utility wrapper
const fmt = (amount, currency = "INR") => formatCurrency(amount, currency);

// Lazy load the charts for high performance (Lighthouse > 85, chunk splitting)
const DynamicCharts = React.lazy(() => import("./DynamicCharts"));

export default function Dashboard() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    monthlySummary: [],
    categoryBreakdown: [],
  });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Search filter state

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = prevDate.getMonth() + 1;
  const prevYear = prevDate.getFullYear();

  // Load dashboard data on mount (avoiding duplicate request loops)
  useEffect(() => {
    const load = async () => {
      try {
        const [txRes, sumRes, budgetsRes] = await Promise.all([
          getTransactions({ month: currentMonth, year: currentYear }),
          getSummary({ year: currentYear }),
          getBudgets({ month: currentMonth, year: currentYear }),
        ]);

        setTransactions(txRes.data);
        setSummary(sumRes.data);
        setBudgets(budgetsRes.data);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Compute total monthly stats from transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  const savings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0 ? Math.round((savings / totalIncome) * 100) : 0;

  // Set up chart data (Income vs Expense 12 months)
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = MONTH_NAMES.map((name, i) => {
    const monthNum = i + 1;
    const incomeEntry = summary.monthlySummary.find(
      (m) => m._id?.month === monthNum && m._id?.type === "income"
    );
    const expenseEntry = summary.monthlySummary.find(
      (m) => m._id?.month === monthNum && m._id?.type === "expense"
    );
    return {
      name,
      income: incomeEntry?.total || 0,
      expense: expenseEntry?.total || 0,
    };
  });

  // Color mappings for category pie chart
  const CATEGORY_COLORS = {
    Food: "var(--primary)",
    Transport: "var(--accent)",
    Shopping: "var(--secondary)",
    Entertainment: "rgba(168, 163, 255, 0.7)",
    Utilities: "rgba(248, 213, 238, 0.7)",
    Health: "var(--highlight)",
    Education: "var(--positive)",
    Other: "var(--text3)",
    Salary: "var(--positive)",
    Freelance: "var(--primary)",
    Business: "var(--secondary)",
    Investment: "var(--accent)",
    Gift: "rgba(168, 163, 255, 0.5)",
  };

  const categoryChartData = summary.categoryBreakdown.map((entry) => ({
    name: entry._id,
    value: entry.total,
    color: CATEGORY_COLORS[entry._id] || "var(--primary)",
  }));

  // Budget calculations
  const hasBudget = budgets && budgets.length > 0;
  const totalBudgeted = hasBudget ? budgets.reduce((s, b) => s + (b.limit || 0), 0) : 0;
  const totalBudgetSpent = hasBudget ? budgets.reduce((s, b) => s + (b.spent || 0), 0) : 0;
  const budgetPctUsed = totalBudgeted > 0 ? Math.round((totalBudgetSpent / totalBudgeted) * 100) : 0;
  const budgetBarColor =
    budgetPctUsed >= 100
      ? "var(--negative)"
      : budgetPctUsed >= 80
        ? "var(--accent)"
        : "var(--primary)";

  // Filter items based on user search query (dashboard search requirement)
  const filteredTransactions = transactions.filter((t) =>
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredGoals = (user?.goals || []).filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReminders = (user?.reminders || []).filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaved = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
    // Live update budget limits without refetching API
    try {
      const txDate = new Date(newTx.date);
      if (
        txDate.getMonth() + 1 === currentMonth &&
        txDate.getFullYear() === currentYear &&
        newTx.type === "expense"
      ) {
        setBudgets((prev) =>
          prev.map((b) => {
            if (b.category !== newTx.category) return b;
            const spent = (b.spent || 0) + (newTx.amount || 0);
            return {
              ...b,
              spent,
            };
          })
        );
      }
    } catch (e) {}
  };

  // Skeleton loader for layout changes
  if (loading) {
    return (
      <div className="page-enter">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 100, borderRadius: "var(--radius-md)" }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: 260, borderRadius: "var(--radius-lg)" }} />
      </div>
    );
  }

  return (
    <div className="page-enter" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Top: Redesigned header with Title, Search, Notifications */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            {user?.name ? `Hello, ${user.name.split(" ")[0]}` : "Hello"}
          </h1>
          <p style={{ color: "var(--text3)", fontSize: 12, marginTop: 4, margin: 0 }}>
            {format(now, "EEEE, d MMMM yyyy")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {/* Search container */}
          <div style={{ position: "relative", minWidth: 220 }}>
            <input
              type="text"
              placeholder="Search dashboard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                paddingLeft: 36,
                background: "var(--bg3)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                height: 40,
                fontSize: 13,
              }}
            />
            <Search 
              size={14} 
              style={{ 
                position: "absolute", 
                left: 12, 
                top: 13, 
                color: "var(--text3)",
                pointerEvents: "none"
              }} 
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 10,
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  height: 20,
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Interactive Notifications component */}
          <NotificationBell user={user} budgets={budgets} />

          {/* Add transaction trigger */}
          <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ height: 40 }}>
            <Plus size={16} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Row 1: Income, Expenses, Savings, Goals counts */}
      <ErrorBoundary>
        <div
          className="stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <DashboardStatCard
            label="Income this month"
            value={fmt(totalIncome, user?.currency)}
            subtext={user?.monthlyIncome ? `Monthly income: ${fmt(user.monthlyIncome, user?.currency)}` : null}
            color="var(--green)"
            icon={<TrendingUp size={16} />}
          />
          <DashboardStatCard
            label="Expenses this month"
            value={fmt(totalExpense, user?.currency)}
            subtext="Total spent this month"
            color="var(--red)"
            icon={<TrendingDown size={16} />}
          />
          <DashboardStatCard
            label="Net Savings"
            value={fmt(savings, user?.currency)}
            subtext={totalIncome > 0 ? `Savings rate: ${savingsRate}%` : null}
            color={savings >= 0 ? "var(--green)" : "var(--red)"}
            icon={<Wallet size={16} />}
          />
          <DashboardStatCard
            label="Active Goals"
            value={user?.goals?.length || 0}
            subtext={user?.goals?.length > 0
              ? `${user.goals.filter((g) => g.currentAmount >= g.targetAmount).length} of ${user.goals.length} completed`
              : null}
            color="var(--primary)"
            icon={<Target size={16} />}
          />
        </div>
      </ErrorBoundary>

      {/* Row 2: Budget Headroom Card (Left) & Right Column (Reminders + Spending Breakdown) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
        }}
      >
        {/* Left Column: BUDGET HEADROOM */}
        <ErrorBoundary>
          <BudgetHeadroomCard budgets={budgets} currency={user?.currency} />
        </ErrorBoundary>

        {/* Right Column: Upcoming Reminders & Spending by Category */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Reminders Container */}
          <ErrorBoundary>
            <div className="card-static" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div className="card-static-border" />
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Upcoming Reminders
                </p>
                {!user?.reminders || user.reminders.length === 0 ? (
                  <PremiumEmptyState
                    icon={<Clock size={24} style={{ color: "var(--primary)" }} />}
                    title="No upcoming reminders"
                    description="Configure subscriptions, bill payments, and custom alerts in your profile to stay notified."
                    actionText="Configure Reminders"
                    actionLink="/profile"
                  />
                ) : filteredReminders.length === 0 ? (
                  <p style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "20px 0", margin: 0 }}>
                    No reminders match "{searchQuery}"
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 180, overflowY: "auto" }}>
                    {filteredReminders.map((rem) => {
                      const badgeColor =
                        rem.type === "subscription"
                          ? "rgba(168, 107, 255, 0.15)"
                          : rem.type === "bill"
                            ? "rgba(255, 140, 168, 0.15)"
                            : "rgba(255, 255, 255, 0.05)";
                      const textColor =
                        rem.type === "subscription"
                          ? "var(--primary)"
                          : rem.type === "bill"
                            ? "var(--red)"
                            : "var(--text2)";

                      return (
                        <div
                          key={rem._id || rem.title}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            background: "rgba(255,255,255,0.01)",
                            border: "1px solid var(--border)",
                            borderRadius: "var(--radius-md)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                padding: "2px 8px",
                                borderRadius: 100,
                                background: badgeColor,
                                color: textColor,
                                textTransform: "uppercase",
                              }}
                            >
                              {rem.type}
                            </span>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{rem.title}</p>
                              <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 2, margin: "2px 0 0" }}>
                                Due: {formatDate(rem.dueDate)}
                              </p>
                            </div>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-heading)", color: "var(--text)" }}>
                            {fmt(rem.amount, user?.currency)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </ErrorBoundary>

          {/* Spending by Category Container (Donut Chart) */}
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="skeleton" style={{ height: 240, borderRadius: "var(--radius-lg)" }} />
              }
            >
              <DynamicCharts
                categoryChartData={categoryChartData}
                currency={user?.currency}
                fmt={fmt}
                categoryBreakdownCount={summary.categoryBreakdown.length}
                nowMonthName={format(now, "MMMM")}
                year={now.getFullYear()}
                budgets={budgets}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>

      {/* Row 4: Recent Transactions and Goals Progress */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 16,
        }}
      >
        {/* Recent Transactions List */}
        <ErrorBoundary>
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", margin: 0 }}>
                  Recent Transactions
                </p>
                <Link to="/transactions" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                  View all &rarr;
                </Link>
              </div>

              {transactions.length === 0 ? (
                <PremiumEmptyState
                  icon={<CreditCard size={24} style={{ color: "var(--primary)" }} />}
                  title="No transactions logged"
                  description="Keep track of your cash flows by adding your first transaction here."
                  actionText="Add Transaction"
                  actionClick={() => setShowModal(true)}
                />
              ) : filteredTransactions.length === 0 ? (
                <p style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "30px 0", margin: 0 }}>
                  No transactions match "{searchQuery}"
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {filteredTransactions.slice(0, 6).map((tx) => (
                    <TransactionRow key={tx._id} tx={tx} currency={user?.currency} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>

        {/* Goals Progress list */}
        <ErrorBoundary>
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text2)", margin: 0 }}>
                  Goals Progress
                </p>
                <Link to="/profile" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none" }}>
                  Manage &rarr;
                </Link>
              </div>

              {!user?.goals || user.goals.length === 0 ? (
                <PremiumEmptyState
                  icon={<Target size={24} style={{ color: "var(--primary)" }} />}
                  title="No goals set yet"
                  description="Build a roadmap for safety nets, emergency accounts, or holiday plans."
                  actionText="Manage Goals"
                  actionLink="/profile"
                />
              ) : filteredGoals.length === 0 ? (
                <p style={{ color: "var(--text3)", fontSize: 13, textAlign: "center", padding: "30px 0", margin: 0 }}>
                  No goals match "{searchQuery}"
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 310, overflowY: "auto" }}>
                  {filteredGoals.map((goal) => {
                    const pct = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                    const displayDeadline = goal.deadline ? formatDate(goal.deadline) : "No deadline";

                    return (
                      <div key={goal._id || goal.title} style={{ padding: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                          <span style={{ fontWeight: 500 }}>{goal.title}</span>
                          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600 }}>
                            {pct}% ({fmt(goal.currentAmount, user?.currency)} of {fmt(goal.targetAmount, user?.currency)})
                          </span>
                        </div>

                        <div className="progress-bar" style={{ height: 5, marginBottom: 6 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${Math.min(pct, 100)}%`,
                              background: pct >= 100 ? "var(--green)" : "var(--primary)",
                            }}
                          />
                        </div>

                        <p style={{ fontSize: 11, color: "var(--text3)", margin: 0 }}>
                          Target Date: {displayDeadline}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => setShowModal(false)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}

// Sleek stats card with modern typographic focus
function DashboardStatCard({ label, value, subtext, color, icon }) {
  return (
    <div
      className="card-sm"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div className="card-sm-border" />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", zIndex: 3 }}>
        <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
          {label}
        </p>
        <span style={{ color: color, display: "flex", alignItems: "center" }}>
          {icon}
        </span>
      </div>
      <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", fontFamily: "var(--font-heading)", margin: 0, letterSpacing: "-0.03em", position: "relative", zIndex: 3 }}>
        {value}
      </p>
      {subtext ? (
        <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, position: "relative", zIndex: 3 }}>
          {subtext}
        </p>
      ) : null}
    </div>
  );
}

// Interactive notification bell component with dropdown
function NotificationBell({ user, budgets }) {
  const [open, setOpen] = useState(false);
  const notifications = [];

  // Generate real budget warnings
  budgets.forEach((b) => {
    const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
    if (pct >= 100) {
      notifications.push({
        id: `budget-over-${b.category}`,
        type: "danger",
        text: `Budget alert: Exceeded ${b.category} limit by ${pct - 100}%!`,
      });
    } else if (pct >= 85) {
      notifications.push({
        id: `budget-warning-${b.category}`,
        type: "warning",
        text: `Budget warning: Used ${pct}% of ${b.category} allocation.`,
      });
    }
  });

  // Calculate upcoming reminders in 7 days
  const today = new Date();
  (user?.reminders || []).forEach((rem) => {
    const due = new Date(rem.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 7) {
      notifications.push({
        id: `reminder-${rem._id || rem.title}`,
        type: "info",
        text: `Upcoming bill: "${rem.title}" is due in ${diffDays} day${diffDays === 1 ? "" : "s"}.`,
      });
    }
  });

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "var(--bg3)",
          border: "1px solid var(--border)",
          width: 40,
          height: 40,
          borderRadius: "var(--radius-md)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "var(--text)",
          position: "relative",
          outline: "none",
        }}
      >
        <Bell size={16} />
        {notifications.length > 0 && (
          <span
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--red)",
            }}
          />
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 48,
            width: 280,
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            padding: 12,
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--border)",
              paddingBottom: 8,
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600 }}>Alerts & Notifications</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text3)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 200, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ color: "var(--text3)", fontSize: 11, textAlign: "center", padding: "12px 0", margin: 0 }}>
                No active notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    fontSize: 11,
                    padding: 8,
                    borderRadius: "var(--radius-sm)",
                    background:
                      n.type === "danger"
                        ? "var(--red-dim)"
                        : n.type === "warning"
                          ? "var(--amber-dim)"
                          : "rgba(255, 255, 255, 0.02)",
                    color: n.type === "danger" ? "var(--red)" : n.type === "warning" ? "var(--amber)" : "var(--text2)",
                    lineHeight: 1.4,
                  }}
                >
                  {n.text}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium visual empty state component
function PremiumEmptyState({ icon, title, description, actionText, actionLink, actionClick }) {
  return (
    <div
      style={{
        border: "1px dashed var(--border2)",
        borderRadius: "var(--radius-lg)",
        padding: "24px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255, 255, 255, 0.005)",
        marginTop: 12,
      }}
    >
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <h4 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 4px", color: "var(--text)" }}>{title}</h4>
      <p style={{ fontSize: 11, color: "var(--text3)", margin: "0 0 14px", lineHeight: 1.5, maxWidth: 280 }}>
        {description}
      </p>
      {actionLink ? (
        <Link
          to={actionLink}
          className="btn btn-ghost"
          style={{
            padding: "6px 14px",
            fontSize: 11,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          {actionText}
        </Link>
      ) : actionClick ? (
        <button
          onClick={actionClick}
          className="btn btn-ghost"
          style={{
            padding: "6px 14px",
            fontSize: 11,
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)",
          }}
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
}

// Single Transaction list row
function TransactionRow({ tx, currency }) {
  const isIncome = tx.type === "income";
  const CATEGORY_ICONS = {
    Food: <Utensils size={14} />,
    Transport: <Car size={14} />,
    Shopping: <ShoppingBag size={14} />,
    Entertainment: <Film size={14} />,
    Utilities: <Zap size={14} />,
    Health: <Heart size={14} />,
    Education: <GraduationCap size={14} />,
    Other: <Tag size={14} />,
    Salary: <Briefcase size={14} />,
    Freelance: <Laptop size={14} />,
    Business: <Building size={14} />,
    Investment: <TrendingUp size={14} />,
    Gift: <Gift size={14} />,
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 10px",
        borderRadius: "var(--radius-md)",
        transition: "var(--transition-fast)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          background: isIncome ? "var(--green-dim)" : "var(--red-dim)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: isIncome ? "var(--green)" : "var(--red)",
          flexShrink: 0,
        }}
      >
        {CATEGORY_ICONS[tx.category] || <CreditCard size={14} />}
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text)" }}>
          {tx.category}
        </p>
        <p style={{ fontSize: 11, color: "var(--text3)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {tx.description || "—"} · {formatDate(tx.date)}
        </p>
      </div>
      <p
        style={{
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "var(--font-heading)",
          color: isIncome ? "var(--green)" : "var(--red)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {isIncome ? "+" : "-"}
        {fmt(tx.amount, currency)}
      </p>
    </div>
  );
}

// BUDGET HEADROOM card component showing category budget spent progress and daily safe spending headroom
function BudgetHeadroomCard({ budgets, currency }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const daysLeft = Math.max(0, totalDays - now.getDate());

  const CATEGORY_ICONS = {
    Food: <Utensils size={13} />,
    Transport: <Car size={13} />,
    Shopping: <ShoppingBag size={13} />,
    Entertainment: <Film size={13} />,
    Utilities: <Zap size={13} />,
    Health: <Heart size={13} />,
    Education: <GraduationCap size={13} />,
    Other: <Tag size={13} />,
    Salary: <Briefcase size={13} />,
    Freelance: <Laptop size={13} />,
    Business: <Building size={13} />,
    Investment: <TrendingUp size={13} />,
    Gift: <Gift size={13} />,
  };

  return (
    <div className="card-static" style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "space-between", minHeight: 460 }}>
      <div className="card-static-border" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Budget Headroom
        </p>

        {!budgets || budgets.length === 0 ? (
          <PremiumEmptyState
            icon={<Zap size={24} style={{ color: "var(--primary)" }} />}
            title="No budgets configured"
            description="Set category limits in Budgets tab to track headroom."
            actionText="Go to Budgets"
            actionLink="/budgets"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", maxHeight: 380, paddingRight: 4 }}>
            {budgets.map((b) => {
              const spent = b.spent || 0;
              const limit = b.limit || 0;
              const remaining = limit - spent;
              const pct = limit > 0 ? (spent / limit) * 100 : 0;

              // Color choices based on spending percentage
              let barColor = "var(--primary)";
              let textColor = "var(--text3)";
              if (pct >= 100) {
                barColor = "var(--red)";
                textColor = "var(--red)";
              } else if (pct >= 80) {
                barColor = "var(--amber)";
                textColor = "var(--amber)";
              }

              // Insight line text
              let insightText = "";
              if (pct >= 100) {
                insightText = "Over budget";
              } else {
                const divisor = daysLeft > 0 ? daysLeft : 1;
                const safeSpend = Math.max(0, remaining) / divisor;
                insightText = `${fmt(safeSpend, currency)}/day safe to spend · ${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`;
              }

              return (
                <div key={b._id || b.category} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ color: barColor }}>
                        {CATEGORY_ICONS[b.category] || <CreditCard size={13} />}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{b.category}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: remaining >= 0 ? "var(--text2)" : "var(--red)" }}>
                      {remaining >= 0 ? `${fmt(remaining, currency)} remaining` : `${fmt(Math.abs(remaining), currency)} over`}
                    </span>
                  </div>

                  {/* Thin progress bar */}
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.05)", borderRadius: 10, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        height: "100%",
                        background: barColor,
                        borderRadius: 10,
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>

                  {/* Insight and raw usage stats */}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: textColor }}>{insightText}</span>
                    <span style={{ color: "var(--text3)" }}>
                      {fmt(spent, currency)} of {fmt(limit, currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {budgets && budgets.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <Link to="/budgets" style={{ fontSize: 12, color: "var(--primary)", textDecoration: "none", fontWeight: 500 }}>
            View all budgets &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
