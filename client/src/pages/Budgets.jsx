// src/pages/Budgets.jsx
// The star feature — shows category budgets with % spent
// When you cross 80%, the bar turns amber. 100%+ turns red.
// This is a "derived state" pattern: one API gives you budget + spending, you compute percentage

import { useState, useEffect } from "react";
import { getBudgets, setBudget, deleteBudget } from "../api";
import { useAuth } from "../context/AuthContext";

const EXPENSE_CATEGORIES = ["Food", "Transport", "Shopping", "Entertainment", "Utilities", "Health", "Education", "Other"];

const fmt = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const CATEGORY_ICONS = {
  Food: "🍜", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Utilities: "⚡", Health: "💊", Education: "📚", Other: "📌",
};

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
      const res = await getBudgets({ month: now.getMonth() + 1, year: now.getFullYear() });
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
      setBudgets(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      alert("Could not delete");
    }
  };

  const totalBudgeted = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overBudget = budgets.filter(b => b.percentage >= 100);

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Budgets</h1>
          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 2 }}>
            {now.toLocaleString("default", { month: "long" })} {now.getFullYear()} ·{" "}
            {fmt(totalSpent, user?.currency)} of {fmt(totalBudgeted, user?.currency)} spent
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Set budget
        </button>
      </div>

      {/* Alert banner if over budget */}
      {overBudget.length > 0 && (
        <div style={{
          background: "var(--red-dim)", border: "1px solid rgba(240,92,110,0.25)",
          borderRadius: "var(--r-lg)", padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--red)" }}>
              {overBudget.length} {overBudget.length === 1 ? "category" : "categories"} over budget
            </p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>
              {overBudget.map(b => b.category).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        <SumCard label="Total budgeted" value={fmt(totalBudgeted, user?.currency)} color="var(--accent)" />
        <SumCard label="Total spent" value={fmt(totalSpent, user?.currency)} color="var(--red)" />
        <SumCard label="Remaining" value={fmt(Math.max(0, totalBudgeted - totalSpent), user?.currency)} color="var(--green)" />
      </div>

      {/* Budget cards */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 48 }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🎯</p>
          <p style={{ fontWeight: 500, marginBottom: 6 }}>No budgets set yet</p>
          <p style={{ color: "var(--text3)", fontSize: 14, marginBottom: 20 }}>
            Set limits per category to track your spending
          </p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            Set your first budget
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14 }}>
          {budgets.map((budget) => {
            const pct = Math.min(budget.percentage, 100);
            const isOver = budget.percentage >= 100;
            const isWarning = budget.percentage >= 80 && !isOver;
            const barColor = isOver ? "var(--red)" : isWarning ? "var(--amber)" : "var(--accent)";

            return (
              <div key={budget._id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{CATEGORY_ICONS[budget.category] || "📌"}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500 }}>{budget.category}</p>
                      <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 1 }}>
                        {fmt(budget.spent, user?.currency)} of {fmt(budget.limit, user?.currency)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {/* Status badge */}
                    <span className={`badge ${isOver ? "badge-expense" : isWarning ? "badge-warning" : ""}`}
                      style={!isOver && !isWarning ? {
                        background: "rgba(124,109,250,0.12)", color: "var(--accent)"
                      } : {}}>
                      {budget.percentage}%
                    </span>
                    <button onClick={() => handleDelete(budget._id)} style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: "var(--text3)", padding: 4, borderRadius: 4,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: barColor }} />
                </div>

                {/* Remaining */}
                <p style={{ fontSize: 12, color: isOver ? "var(--red)" : "var(--text3)", marginTop: 8 }}>
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
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAdd(false)}>
          <div className="modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 600 }}>Set a budget</h2>
              <button onClick={() => setShowAdd(false)} style={{
                background: "none", border: "none", color: "var(--text3)", cursor: "pointer",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="form-group">
                <label>Category</label>
                <select value={newBudget.category}
                  onChange={e => setNewBudget(p => ({ ...p, category: e.target.value }))}>
                  {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly limit</label>
                <input type="number" min="1" placeholder="e.g. 5000"
                  value={newBudget.limit}
                  onChange={e => setNewBudget(p => ({ ...p, limit: e.target.value }))}
                  style={{ fontSize: 20, fontFamily: "'DM Mono', monospace" }}
                />
              </div>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>
                For {now.toLocaleString("default", { month: "long" })} {now.getFullYear()}
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ flex: 1 }}>
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
      <p style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500, marginBottom: 8,
        textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 600, color, fontFamily: "'DM Mono', monospace" }}>
        {value}
      </p>
    </div>
  );
}
