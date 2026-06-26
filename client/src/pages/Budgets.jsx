import { useState, useEffect } from "react";
import { getBudgets, setBudget, deleteBudget } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatCurrency } from "../utils/formatters";
import {
  Plus,
  X,
  AlertTriangle,
  Target,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Heart,
  GraduationCap,
  Tag,
  CreditCard,
} from "lucide-react";

const fmt = (amount, currency = "INR") => formatCurrency(amount, currency);

const CATEGORY_ICONS = {
  Food: <Utensils size={18} />,
  Transport: <Car size={18} />,
  Shopping: <ShoppingBag size={18} />,
  Entertainment: <Film size={18} />,
  Utilities: <Zap size={18} />,
  Health: <Heart size={18} />,
  Education: <GraduationCap size={18} />,
  Other: <Tag size={18} />,
};

const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Health",
  "Education",
  "Other",
];

export default function Budgets() {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "Food", limit: "" });
  const [saving, setSaving] = useState(false);
  const now = new Date();

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    try {
      const res = await getBudgets({
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newBudget.limit) return;
    setSaving(true);
    try {
      await setBudget({
        category: newBudget.category,
        limit: Number(newBudget.limit),
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      });
      setShowAdd(false);
      setNewBudget({ category: "Food", limit: "" });
      loadBudgets(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || "Could not save budget");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      setBudgets((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      alert("Could not delete");
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter((b) => b.percentage >= 100);

  return (
    <div
      className="page-enter"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Budgets
          </h1>
          <p
            style={{
              color: "var(--text3)",
              fontSize: 13,
              marginTop: 4,
              margin: "4px 0 0",
            }}
          >
            {now.toLocaleString("default", { month: "long" })}{" "}
            {now.getFullYear()} · {fmt(totalSpent, user?.currency)} of{" "}
            {fmt(totalBudgeted, user?.currency)} spent
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} />
          Set budget
        </button>
      </div>

      {/* Alert banner if over budget */}
      {overBudget.length > 0 && (
        <div
          style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(240,92,110,0.25)",
            borderRadius: "var(--radius-lg)",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <AlertTriangle size={18} style={{ color: "var(--red)" }} />
          <div>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--red)",
                margin: 0,
              }}
            >
              {overBudget.length}{" "}
              {overBudget.length === 1 ? "category" : "categories"} over budget
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--text3)",
                marginTop: 2,
                margin: "2px 0 0",
              }}
            >
              {overBudget.map((b) => b.category).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div
        className="stagger"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 14,
        }}
      >
        <SumCard
          label="Total budgeted"
          value={fmt(totalBudgeted, user?.currency)}
          color="var(--primary)"
        />
        <SumCard
          label="Total spent"
          value={fmt(totalSpent, user?.currency)}
          color="var(--red)"
        />
        <SumCard
          label="Remaining"
          value={fmt(Math.max(0, totalBudgeted - totalSpent), user?.currency)}
          color="var(--green)"
        />
      </div>

      {/* Budget cards */}
      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120 }} />
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Target
            size={32}
            style={{ color: "var(--primary)", marginBottom: 12 }}
          />
          <p
            style={{
              fontWeight: 600,
              marginBottom: 6,
              fontSize: 14,
              color: "var(--text)",
              margin: 0,
            }}
          >
            No budgets set yet
          </p>
          <p
            style={{
              color: "var(--text3)",
              fontSize: 12,
              marginBottom: 20,
              marginTop: 4,
              margin: "4px 0 16px",
            }}
          >
            Set limits per category to track your spending
          </p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            Set your first budget
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: 14,
          }}
        >
          {budgets.map((budget) => {
            const pct = Math.min(budget.percentage, 100);
            const isOver = budget.percentage >= 100;
            const isWarning = budget.percentage >= 80 && !isOver;
            const barColor = isOver
              ? "var(--red)"
              : isWarning
                ? "var(--amber)"
                : "var(--primary)";

            return (
              <div key={budget._id} className="card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        color: isOver ? "var(--red)" : "var(--primary)",
                      }}
                    >
                      {CATEGORY_ICONS[budget.category] || (
                        <CreditCard size={18} />
                      )}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>
                        {budget.category}
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--text3)",
                          marginTop: 2,
                          margin: "2px 0 0",
                        }}
                      >
                        {fmt(budget.spent, user?.currency)} of{" "}
                        {fmt(budget.limit, user?.currency)}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {/* Status badge */}
                    <span
                      className={`badge ${isOver ? "badge-expense" : isWarning ? "badge-warning" : ""}`}
                      style={
                        !isOver && !isWarning
                          ? {
                              background: "rgba(168, 107, 255, 0.08)",
                              color: "var(--primary)",
                            }
                          : {}
                      }
                    >
                      {budget.percentage}%
                    </span>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text3)",
                        padding: 4,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${pct}%`, background: barColor }}
                  />
                </div>

                {/* Remaining */}
                <p
                  style={{
                    fontSize: 12,
                    color: isOver ? "var(--red)" : "var(--text3)",
                    marginTop: 8,
                  }}
                >
                  {isOver
                    ? `Over by ${fmt(budget.spent - budget.limit, user?.currency)}`
                    : `${fmt(budget.limit - budget.spent, user?.currency)} remaining`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add budget modal */}
      {showAdd && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowAdd(false)}
        >
          <div className="modal">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Set a budget
              </h2>
              <button
                onClick={() => setShowAdd(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text3)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newBudget.category}
                  onChange={(e) =>
                    setNewBudget((p) => ({ ...p, category: e.target.value }))
                  }
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly limit</label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={newBudget.limit}
                  onChange={(e) =>
                    setNewBudget((p) => ({ ...p, limit: e.target.value }))
                  }
                  style={{
                    fontSize: 20,
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--text3)",
                  marginBottom: 20,
                }}
              >
                For {now.toLocaleString("default", { month: "long" })}{" "}
                {now.getFullYear()}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowAdd(false)}
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ flex: 1 }}
                >
                  {saving ? "Saving..." : "Save budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function SumCard({ label, value, color }) {
  return (
    <div className="card-sm">
      <p
        style={{
          fontSize: 11,
          color: "var(--text3)",
          fontWeight: 600,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color,
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}
