// "Controlled" means every keystroke updates state, not the DOM directly

import { useState } from "react";
import { createTransaction, updateTransaction } from "../api";

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
const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

export default function TransactionModal({ onClose, onSave, existing }) {
  // If "existing" prop is passed, we're editing. Otherwise, adding new.
  const [form, setForm] = useState({
    type: existing?.type || "expense",
    amount: existing?.amount || "",
    category: existing?.category || "",
    customCategory: "",
    description: existing?.description || "",
    date: existing?.date
      ? new Date(existing.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0], // default to today
    isRecurring: existing?.isRecurring || false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ amount: "", category: "" });

  // e.target.name must match the form state key
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Small UX helper: when the user fixes a field, hide its validation message.
    setFieldErrors((prev) => {
      if (name === "amount" && prev.amount) return { ...prev, amount: "" };
      if (name === "category" && prev.category)
        return { ...prev, category: "" };
      if (name === "customCategory" && prev.category)
        return { ...prev, category: "" };
      return prev;
    });

    setForm((prev) => {
      if (name === "category") {
        // When switching away from "Other", clear the custom value.
        return {
          ...prev,
          category: value,
          customCategory: value === "Other" ? prev.customCategory : "",
        };
      }
      return { ...prev, [name]: type === "checkbox" ? checked : value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page refresh (default form behavior)

    const nextFieldErrors = { amount: "", category: "" };
    const amountOk = form.amount !== "" && form.amount !== null;
    const categoryOk = !!form.category;

    if (!amountOk) nextFieldErrors.amount = "Amount is required";
    if (!categoryOk) {
      nextFieldErrors.category = "Category is required";
    } else if (form.category === "Other" && !form.customCategory.trim()) {
      nextFieldErrors.category = "Custom category is required";
    }

    setFieldErrors(nextFieldErrors);
    if (nextFieldErrors.amount || nextFieldErrors.category) return;

    const finalCategory =
      form.category === "Other" ? form.customCategory.trim() : form.category;

    setLoading(true);
    try {
      let saved;
      const { customCategory, ...payloadRest } = form;
      const payload = { ...payloadRest, category: finalCategory };
      if (existing) {
        const res = await updateTransaction(existing._id, payload);
        saved = res.data;
      } else {
        const res = await createTransaction(payload);
        saved = res.data;
      }
      onSave(saved); // tell parent component to update its list
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const categories =
    form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const showCustomCategory = form.category === "Other";

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600 }}>
            {existing ? "Edit transaction" : "Add transaction"}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--text3)",
              cursor: "pointer",
              padding: 4,
              borderRadius: 6,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Type toggle */}
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn income ${form.type === "income" ? "active" : ""}`}
              aria-pressed={form.type === "income"}
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  type: "income",
                  category: "",
                  customCategory: "",
                }))
              }
            >
              + Income
            </button>
            <button
              type="button"
              className={`type-btn expense ${form.type === "expense" ? "active" : ""}`}
              aria-pressed={form.type === "expense"}
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  type: "expense",
                  category: "",
                  customCategory: "",
                }))
              }
            >
              − Expense
            </button>
          </div>

          {/* Amount */}
          <div className="form-group">
            <label>Amount</label>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              style={{
                fontSize: 20,
                fontWeight: 500,
                fontFamily: "'DM Mono', monospace",
              }}
            />
            {fieldErrors.amount && (
              <p style={{ color: "var(--red)", fontSize: 12, marginTop: -6 }}>
                {fieldErrors.amount}
              </p>
            )}
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {fieldErrors.category && (
              <p style={{ color: "var(--red)", fontSize: 12, marginTop: -6 }}>
                {fieldErrors.category}
              </p>
            )}

            {showCustomCategory && (
              <div style={{ marginTop: 12 }}>
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--text2)",
                    marginBottom: 6,
                  }}
                >
                  Custom category
                </label>
                <input
                  name="customCategory"
                  type="text"
                  placeholder="e.g. Coffee & Snacks"
                  value={form.customCategory}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description (optional)</label>
            <input
              name="description"
              type="text"
              placeholder="e.g. Lunch at Haldiram's"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label>Date</label>
            <input
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          {/* Recurring */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 20,
              cursor: "pointer",
              fontSize: 14,
              color: "var(--text2)",
            }}
          >
            <input
              name="isRecurring"
              type="checkbox"
              checked={form.isRecurring}
              onChange={handleChange}
              style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
            />
            Recurring monthly
          </label>

          {error && (
            <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? "Saving..." : existing ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
