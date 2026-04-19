// Shows user info, lets them edit name + currency, shows account stats

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api";

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const readLocal = (key, fallback) => {
    try {
      const v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch {
      return fallback;
    }
  };

  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    currency: user?.currency || "INR",
    monthlyIncome: user?.monthlyIncome ? String(user.monthlyIncome) : "",
    // Fall back to the older field so existing users don't break.
    monthlySavingsGoal: user?.savingsGoal
      ? String(user.savingsGoal)
      : user?.monthlyIncomeGoal
        ? String(user.monthlyIncomeGoal)
        : "",
    avatarInitials: readLocal("finflow_avatarInitials", ""),
  }));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || "",
      currency: user?.currency || "INR",
      monthlyIncome: user?.monthlyIncome ? String(user.monthlyIncome) : "",
      monthlySavingsGoal: user?.savingsGoal
        ? String(user.savingsGoal)
        : user?.monthlyIncomeGoal
          ? String(user.monthlyIncomeGoal)
          : "",
    }));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        currency: form.currency,
        monthlyIncome: Number(form.monthlyIncome || 0),
        savingsGoal: Number(form.monthlySavingsGoal || 0),
        monthlyIncomeGoal: Number(form.monthlySavingsGoal || 0),
      };

      const res = await updateProfile(payload);
      updateUser(res.data); // update context

      try {
        localStorage.setItem(
          "finflow_avatarInitials",
          form.avatarInitials || "",
        );
      } catch {}

      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <div className="page-enter" style={{ maxWidth: 600 }}>
      <h1
        style={{
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          marginBottom: 24,
        }}
      >
        Profile
      </h1>

      {/* Profile card */}
      <div className="card" style={{ marginBottom: 16, overflow: "hidden" }}>
        {/* Avatar + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), #a78bfa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 600,
              color: "white",
              flexShrink: 0,
            }}
          >
            {(form.avatarInitials || initials).slice(0, 2)}
          </div>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 600 }}>{user?.name}</h2>
            <p style={{ color: "var(--text3)", fontSize: 14 }}>{user?.email}</p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>
              Member since {joinDate}
            </p>
          </div>
          {!editing && (
            <button
              className="btn btn-ghost"
              onClick={() => setEditing(true)}
              style={{ marginLeft: "auto" }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave}>
            {/* Profile info */}
            <div style={{ marginBottom: 18 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 10,
                }}
              >
                Profile info
              </p>

              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label>Avatar initials (optional)</label>
                <input
                  type="text"
                  value={form.avatarInitials}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      avatarInitials: e.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  placeholder="e.g. AS"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
                <p
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}
                >
                  Leave empty to use your name initials.
                </p>
              </div>
            </div>

            {/* Financial settings */}
            <div style={{ marginBottom: 8 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 10,
                }}
              >
                Financial settings
              </p>

              <div className="form-group">
                <label>Monthly income</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50000"
                  value={form.monthlyIncome}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, monthlyIncome: e.target.value }))
                  }
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
              </div>

              <div className="form-group">
                <label>Monthly savings goal</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15000"
                  value={form.monthlySavingsGoal}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      monthlySavingsGoal: e.target.value,
                    }))
                  }
                  style={{ fontFamily: "'DM Mono', monospace" }}
                />
                <p
                  style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}
                >
                  Used for your savings goal (stored on the server).
                </p>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Preferred currency</label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currency: e.target.value }))
                  }
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ marginBottom: 12 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 10,
                }}
              >
                Profile info
              </p>
              <ProfileRow label="Email" value={user?.email} />
            </div>

            <div style={{ marginBottom: 4 }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text2)",
                  marginBottom: 10,
                }}
              >
                Financial settings
              </p>
              <ProfileRow
                label="Preferred currency"
                value={
                  CURRENCIES.find((c) => c.code === user?.currency)?.name ||
                  user?.currency
                }
              />
              <ProfileRow
                label="Monthly income"
                value={
                  user?.monthlyIncome || form.monthlyIncome
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: user?.currency || "INR",
                        maximumFractionDigits: 0,
                      }).format(
                        Number(user?.monthlyIncome || form.monthlyIncome),
                      )
                    : "Not set"
                }
              />
              <ProfileRow
                label="Monthly savings goal"
                value={
                  user?.savingsGoal || user?.monthlyIncomeGoal
                    ? new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: user?.currency || "INR",
                        maximumFractionDigits: 0,
                      }).format(user?.savingsGoal || user?.monthlyIncomeGoal)
                    : "Not set"
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Success toast */}
      {saved && (
        <div
          style={{
            background: "var(--green-dim)",
            border: "1px solid rgba(34,201,135,0.25)",
            borderRadius: "var(--r-md)",
            padding: "12px 16px",
            color: "var(--green)",
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Profile updated successfully
        </div>
      )}
      {}
    </div>
  );
}

function ProfileRow({ label, value, mono }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "11px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span style={{ fontSize: 13, color: "var(--text3)" }}>{label}</span>
      <span
        style={{
          fontSize: 13,
          color: "var(--text)",
          fontWeight: 500,
          fontFamily: mono ? "'DM Mono', monospace" : "inherit",
          maxWidth: "60%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "right",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );
}
