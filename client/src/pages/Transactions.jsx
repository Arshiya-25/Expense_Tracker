// src/pages/Transactions.jsx
// Filter state lives in this component and gets passed to the API call
// Every filter change triggers a new API request via useEffect

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { getTransactions, deleteTransaction } from "../api";
import { useAuth } from "../context/AuthContext";
import TransactionModal from "../components/TransactionModal";

const fmt = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);

const CATEGORY_ICONS = {
  Food: "🍜", Transport: "🚗", Shopping: "🛍️", Entertainment: "🎬",
  Utilities: "⚡", Health: "💊", Education: "📚", Other: "📌",
  Salary: "💼", Freelance: "💻", Business: "🏢", Investment: "📈", Gift: "🎁",
};

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState(null); // null = add new, object = edit existing
  const now = new Date();

  // Filters
  const [filters, setFilters] = useState({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    type: "",
    category: "",
  });
  const [search, setSearch] = useState("");

  // Re-fetch whenever filters change
  // This is the key pattern: filters live in state, useEffect watches them
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = { ...filters };
        if (!params.type) delete params.type;
        if (!params.category) delete params.category;
        const res = await getTransactions(params);
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]); // re-run whenever filters changes

  // Client-side search filter (no API call needed — data already loaded)
  const filtered = search
    ? transactions.filter(tx =>
        tx.description?.toLowerCase().includes(search.toLowerCase()) ||
        tx.category.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  const handleDelete = async (id) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert("Could not delete");
    }
  };

  const handleSaved = (saved) => {
    if (editTx) {
      // Replace the old transaction with the updated one
      setTransactions(prev => prev.map(t => t._id === saved._id ? saved : t));
    } else {
      setTransactions(prev => [saved, ...prev]);
    }
    setEditTx(null);
  };

  const totalIncome = filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div className="page-enter">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>Transactions</h1>
          <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 2 }}>
            {filtered.length} transactions · {fmt(totalIncome, user?.currency)} in · {fmt(totalExpense, user?.currency)} out
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTx(null); setShowModal(true); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add transaction
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text3)", pointerEvents: "none" }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input placeholder="Search transactions..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 34 }} />
        </div>

        {/* Month */}
        <select value={filters.month} onChange={e => setFilters(p => ({ ...p, month: Number(e.target.value) }))}
          style={{ width: 100 }}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>

        {/* Year */}
        <select value={filters.year} onChange={e => setFilters(p => ({ ...p, year: Number(e.target.value) }))}
          style={{ width: 90 }}>
          {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Type */}
        <select value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
          style={{ width: 110 }}>
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
          padding: "12px 20px", borderBottom: "1px solid var(--border)",
          fontSize: 11, color: "var(--text3)", fontWeight: 500,
          textTransform: "uppercase", letterSpacing: "0.05em",
        }}>
          <span>Description</span>
          <span>Category</span>
          <span>Date</span>
          <span style={{ textAlign: "right" }}>Amount</span>
          <span />
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%",
              border: "2px solid var(--border2)", borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center" }}>
            <p style={{ color: "var(--text3)", fontSize: 14 }}>No transactions found</p>
          </div>
        ) : (
          filtered.map((tx, i) => (
            <div key={tx._id} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: i < filtered.length - 1 ? "1px solid var(--border)" : "none",
              transition: "background 0.1s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              {/* Description col */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: tx.type === "income" ? "var(--green-dim)" : "var(--red-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
                }}>
                  {CATEGORY_ICONS[tx.category] || "💳"}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{tx.description || tx.category}</p>
                  {tx.isRecurring && (
                    <span style={{ fontSize: 10, color: "var(--accent)", background: "rgba(124,109,250,0.12)",
                      padding: "2px 6px", borderRadius: 4, fontWeight: 500 }}>
                      recurring
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <span style={{ fontSize: 13, color: "var(--text2)" }}>{tx.category}</span>

              {/* Date */}
              <span style={{ fontSize: 13, color: "var(--text3)" }}>
                {format(new Date(tx.date), "d MMM yyyy")}
              </span>

              {/* Amount */}
              <span style={{
                fontSize: 14, fontWeight: 600, textAlign: "right",
                fontFamily: "'DM Mono', monospace", letterSpacing: "-0.02em",
                color: tx.type === "income" ? "var(--green)" : "var(--red)",
              }}>
                {tx.type === "income" ? "+" : "-"}{fmt(tx.amount, user?.currency)}
              </span>

              {/* Actions */}
              <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                <ActionBtn onClick={() => { setEditTx(tx); setShowModal(true); }} title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </ActionBtn>
                <ActionBtn onClick={() => handleDelete(tx._id)} title="Delete" danger>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </ActionBtn>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <TransactionModal
          onClose={() => { setShowModal(false); setEditTx(null); }}
          onSave={handleSaved}
          existing={editTx}
        />
      )}
    </div>
  );
}

function ActionBtn({ onClick, children, title, danger }) {
  return (
    <button onClick={onClick} title={title} style={{
      width: 30, height: 30, borderRadius: 6, border: "none",
      background: "transparent", cursor: "pointer", display: "flex",
      alignItems: "center", justifyContent: "center",
      color: danger ? "var(--red)" : "var(--text3)", transition: "all 0.12s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = danger ? "var(--red-dim)" : "var(--surface2)"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      {children}
    </button>
  );
}
