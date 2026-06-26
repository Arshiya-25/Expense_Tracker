// Redesigned profile settings page with tabbed layout and goals/reminders management
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../api";
import { format } from "date-fns";
import { formatCurrency, formatDate, sortGoals } from "../utils/formatters";
import { User, Settings, BarChart3, Target, Bell, Wallet, PiggyBank, CreditCard, Percent } from "lucide-react";

// Map legacy fmt formatter to safe utility wrapper
const fmt = (amount, currency) => formatCurrency(amount, currency);

const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todayStr = getLocalDateString();
  const [activeTab, setActiveTab] = useState("profile"); // Tab navigation state
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    currency: user?.currency || "INR",
    monthlyIncome: user?.monthlyIncome ? String(user.monthlyIncome) : "",
    savingsGoal: user?.savingsGoal ? String(user.savingsGoal) : "",
    avatarInitials: localStorage.getItem("finflow_avatarInitials") || "",
  }));

  const [goals, setGoals] = useState(() => sortGoals(user?.goals || []));
  const [reminders, setReminders] = useState(() => user?.reminders || []);

  // Goal modal/inline state
  const [newGoal, setNewGoal] = useState({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
  const [editingGoalIndex, setEditingGoalIndex] = useState(null);

  // Reminder state
  const [newReminder, setNewReminder] = useState({ title: "", amount: "", dueDate: "", type: "custom" });
  const [editingReminderIndex, setEditingReminderIndex] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [goalError, setGoalError] = useState("");
  const [reminderError, setReminderError] = useState("");

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        currency: user.currency || "INR",
        monthlyIncome: user.monthlyIncome ? String(user.monthlyIncome) : "",
        savingsGoal: user.savingsGoal ? String(user.savingsGoal) : "",
        avatarInitials: localStorage.getItem("finflow_avatarInitials") || "",
      });
      setGoals(sortGoals(user.goals || []));
      setReminders(user.reminders || []);
    }
  }, [user]);

  // Handle core profile patches (Name, avatar, initials)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await updateProfile({
        name: form.name,
        currency: form.currency,
      });
      updateUser(res.data);
      localStorage.setItem("finflow_avatarInitials", form.avatarInitials.toUpperCase());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  // Handle financial setup variables (optional income/savings goal)
  const handleSaveFinancials = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await updateProfile({
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : 0,
        savingsGoal: form.savingsGoal ? Number(form.savingsGoal) : 0,
      });
      updateUser(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save financial setup");
    } finally {
      setSaving(false);
    }
  };

  // Save the modified goals list back to profile
  const saveGoalsList = async (updatedGoals) => {
    setSaving(true);
    try {
      const res = await updateProfile({ goals: updatedGoals });
      updateUser(res.data);
      setGoals(sortGoals(res.data.goals || []));
    } catch (err) {
      alert("Failed to update goals list");
    } finally {
      setSaving(false);
    }
  };

  // Save the modified reminders list back to profile
  const saveRemindersList = async (updatedReminders) => {
    setSaving(true);
    try {
      const res = await updateProfile({ reminders: updatedReminders });
      updateUser(res.data);
      setReminders(res.data.reminders || []);
    } catch (err) {
      alert("Failed to update reminders list");
    } finally {
      setSaving(false);
    }
  };

  // Goals operations
  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.targetAmount) return;

    if (newGoal.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = newGoal.deadline.split("-");
      const chosenDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      chosenDate.setHours(0, 0, 0, 0);
      if (chosenDate < today) {
        setGoalError("Goal deadline date cannot be in the past.");
        return;
      }
    }
    setGoalError("");

    const formatted = {
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount || 0),
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : null,
    };
    const nextGoals = [...goals, formatted];
    saveGoalsList(nextGoals);
    setNewGoal({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
  };

  const handleUpdateGoal = (e) => {
    e.preventDefault();
    if (editingGoalIndex === null) return;

    if (newGoal.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = newGoal.deadline.split("-");
      const chosenDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      chosenDate.setHours(0, 0, 0, 0);
      if (chosenDate < today) {
        setGoalError("Goal deadline date cannot be in the past.");
        return;
      }
    }
    setGoalError("");

    const updated = [...goals];
    updated[editingGoalIndex] = {
      ...updated[editingGoalIndex],
      title: newGoal.title,
      targetAmount: Number(newGoal.targetAmount),
      currentAmount: Number(newGoal.currentAmount || 0),
      deadline: newGoal.deadline ? new Date(newGoal.deadline) : null,
    };
    saveGoalsList(updated);
    setEditingGoalIndex(null);
    setNewGoal({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
  };

  const handleDeleteGoal = (index) => {
    const updated = goals.filter((_, i) => i !== index);
    saveGoalsList(updated);
  };

  // Reminders operations
  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!newReminder.title || !newReminder.amount || !newReminder.dueDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = newReminder.dueDate.split("-");
    const chosenDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      setReminderError("Reminder due date cannot be in the past.");
      return;
    }
    setReminderError("");

    const formatted = {
      title: newReminder.title,
      amount: Number(newReminder.amount),
      dueDate: new Date(newReminder.dueDate),
      type: newReminder.type,
    };
    const nextReminders = [...reminders, formatted];
    saveRemindersList(nextReminders);
    setNewReminder({ title: "", amount: "", dueDate: "", type: "custom" });
  };

  const handleUpdateReminder = (e) => {
    e.preventDefault();
    if (editingReminderIndex === null) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = newReminder.dueDate.split("-");
    const chosenDate = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    chosenDate.setHours(0, 0, 0, 0);
    if (chosenDate < today) {
      setReminderError("Reminder due date cannot be in the past.");
      return;
    }
    setReminderError("");

    const updated = [...reminders];
    updated[editingReminderIndex] = {
      ...updated[editingReminderIndex],
      title: newReminder.title,
      amount: Number(newReminder.amount),
      dueDate: new Date(newReminder.dueDate),
      type: newReminder.type,
    };
    saveRemindersList(updated);
    setEditingReminderIndex(null);
    setNewReminder({ title: "", amount: "", dueDate: "", type: "custom" });
  };

  const handleDeleteReminder = (index) => {
    const updated = reminders.filter((_, i) => i !== index);
    saveRemindersList(updated);
  };

  return (
    <div className="page-enter" style={{ maxWidth: 860, margin: "0 auto" }}>
      {/* Header card with profile overview */}
      <div className="card" style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary), var(--secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#080814",
          }}
        >
          {form.avatarInitials || initials}
        </div>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{user?.name}</h2>
          <p style={{ color: "var(--text3)", fontSize: 13, margin: "4px 0 0" }}>{user?.email}</p>
        </div>
      </div>

      {/* Main Settings Navigation Layout (Left list, right active panel) */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        {/* Left Side Tab Navigation list */}
        <div style={{ flex: "0 0 200px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { id: "profile", label: "Profile", icon: <User size={16} /> },
            { id: "financial", label: "Financial Setup", icon: <Settings size={16} /> },
            { id: "summary", label: "Financial Summary", icon: <BarChart3 size={16} /> },
            { id: "goals", label: "Savings Goals", icon: <Target size={16} /> },
            { id: "reminders", label: "Reminder Settings", icon: <Bell size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingGoalIndex(null);
                setEditingReminderIndex(null);
                setError("");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                border: "none",
                background: activeTab === tab.id ? "var(--surface)" : "transparent",
                color: activeTab === tab.id ? "var(--primary)" : "var(--text2)",
                fontWeight: activeTab === tab.id ? 600 : 400,
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13,
                transition: "var(--transition-fast)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center" }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Active Details Panel */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div className="card">
            {error && (
              <div style={{ background: "var(--red-dim)", color: "var(--red)", border: "1px solid var(--red)", padding: 12, borderRadius: "var(--radius-md)", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            {saved && (
              <div style={{ background: "var(--green-dim)", color: "var(--green)", border: "1px solid var(--green)", padding: 12, borderRadius: "var(--radius-md)", fontSize: 13, marginBottom: 16 }}>
                Settings updated successfully
              </div>
            )}

            {/* TAB 1: Profile information */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile}>
                <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)", marginBottom: 18 }}>Profile Settings</h3>
                {user?.isDemo && (
                  <p style={{ color: "var(--primary)", fontSize: 12, marginBottom: 16 }}>Note: Profile settings cannot be changed in Demo Mode.</p>
                )}
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    disabled={user?.isDemo}
                  />
                </div>
                <div className="form-group">
                  <label>Avatar Initials (Optional)</label>
                  <input
                    type="text"
                    maxLength="2"
                    value={form.avatarInitials}
                    placeholder="e.g. AS"
                    onChange={(e) => setForm((p) => ({ ...p, avatarInitials: e.target.value.toUpperCase() }))}
                    disabled={user?.isDemo}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address (Cannot change)</label>
                  <input type="email" value={user?.email || ""} disabled style={{ opacity: 0.6, cursor: "not-allowed" }} />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving || user?.isDemo}>
                  {saving ? "Saving..." : user?.isDemo ? "Disabled in Demo Mode" : "Save Profile"}
                </button>
              </form>
            )}

            {/* TAB 2: Financial Setup */}
            {activeTab === "financial" && (
              <form onSubmit={handleSaveFinancials}>
                <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)", marginBottom: 18 }}>Financial Configuration</h3>
                {user?.isDemo && (
                  <p style={{ color: "var(--primary)", fontSize: 12, marginBottom: 16 }}>Note: Financial settings cannot be changed in Demo Mode.</p>
                )}
                <div className="form-group">
                  <label>Monthly Income (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 50000"
                    value={form.monthlyIncome}
                    onChange={(e) => setForm((p) => ({ ...p, monthlyIncome: e.target.value }))}
                    disabled={user?.isDemo}
                  />
                </div>
                <div className="form-group">
                  <label>Monthly Savings Goal (Optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 15000"
                    value={form.savingsGoal}
                    onChange={(e) => setForm((p) => ({ ...p, savingsGoal: e.target.value }))}
                    disabled={user?.isDemo}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Currency</label>
                  <select value={form.currency} onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))} disabled={user?.isDemo}>
                    {CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.symbol} {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }} disabled={saving || user?.isDemo}>
                  {saving ? "Saving..." : user?.isDemo ? "Disabled in Demo Mode" : "Save Financial Setup"}
                </button>
              </form>
            )}

            {/* TAB 3: Financial Summary */}
            {activeTab === "summary" && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)", marginBottom: 18 }}>Financial Summary</h3>
                
                {/* 2x2 Grid of stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <div style={{ background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "var(--green-dim)", color: "var(--green)", display: "flex", alignItems: "center", flexShrink: 0, justifyContent: "center" }}>
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>Monthly Income</p>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0", fontFamily: "var(--font-heading)" }}>
                        {user?.monthlyIncome ? fmt(user.monthlyIncome, user.currency) : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(168, 107, 255, 0.12)", color: "var(--primary)", display: "flex", alignItems: "center", flexShrink: 0, justifyContent: "center" }}>
                      <PiggyBank size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>Savings Target</p>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0", fontFamily: "var(--font-heading)" }}>
                        {user?.savingsGoal ? fmt(user.savingsGoal, user.currency) : "Not set"}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(93, 123, 255, 0.12)", color: "var(--secondary)", display: "flex", alignItems: "center", flexShrink: 0, justifyContent: "center" }}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>Spending Limit</p>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0", fontFamily: "var(--font-heading)", color: "var(--primary)" }}>
                        {user?.monthlyIncome && user?.savingsGoal
                          ? fmt(Math.max(0, user.monthlyIncome - user.savingsGoal), user.currency)
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.015)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(255, 121, 200, 0.12)", color: "var(--highlight)", display: "flex", alignItems: "center", flexShrink: 0, justifyContent: "center" }}>
                      <Percent size={18} />
                    </div>
                    <div>
                      <p style={{ fontSize: 11, color: "var(--text3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.02em" }}>Savings Rate</p>
                      <p style={{ fontSize: 15, fontWeight: 700, margin: "2px 0 0", fontFamily: "var(--font-heading)" }}>
                        {user?.monthlyIncome && user?.monthlyIncome > 0
                          ? `${Math.round((user.savingsGoal / user.monthlyIncome) * 100)}%`
                          : "0%"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Savings rate circular progress visual */}
                {user?.monthlyIncome > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.005)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: 24, marginBottom: 24 }}>
                    <div style={{ position: "relative", width: 120, height: 120, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <svg width="120" height="120" style={{ transform: "rotate(-90deg)" }}>
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="var(--border2)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="transparent"
                          stroke="var(--primary)"
                          strokeWidth="8"
                          strokeDasharray={2 * Math.PI * 50}
                          strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(1, user.savingsGoal / user.monthlyIncome))}
                          strokeLinecap="round"
                          style={{ transition: "stroke-dashoffset 0.8s ease" }}
                        />
                      </svg>
                      <div style={{ position: "absolute", textAlign: "center" }}>
                        <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                          {Math.round((user.savingsGoal / user.monthlyIncome) * 100)}%
                        </span>
                        <p style={{ fontSize: 9, color: "var(--text3)", margin: "2px 0 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Saved</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 12, marginBottom: 0 }}>Savings Rate Visualization</p>
                  </div>
                )}

                {/* Plain-English summary line */}
                <div style={{ background: "rgba(168, 107, 255, 0.06)", border: "1px solid rgba(168, 107, 255, 0.12)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--text2)", margin: 0, fontStyle: "italic" }}>
                    {user?.monthlyIncome && user?.monthlyIncome > 0
                      ? `You plan to save ${fmt(user.savingsGoal, user.currency)} of your ${fmt(user.monthlyIncome, user.currency)} income each month, leaving ${fmt(Math.max(0, user.monthlyIncome - user.savingsGoal), user.currency)} for expenses.`
                      : "Provide your Monthly Income and Savings Target in the Financial Setup tab to generate your summary."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: Goals management */}
            {activeTab === "goals" && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)", marginBottom: 18 }}>
                  {editingGoalIndex !== null ? "Edit Savings Goal" : "Create New Goal"}
                </h3>

                <form onSubmit={editingGoalIndex !== null ? handleUpdateGoal : handleAddGoal} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                  {goalError && (
                    <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>
                      {goalError}
                    </p>
                  )}
                  <div className="form-group">
                    <label>Goal Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Vacation to Japan"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Target Amount</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 5000"
                        value={newGoal.targetAmount}
                        onChange={(e) => setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Saved Amount</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 1200"
                        value={newGoal.currentAmount}
                        onChange={(e) => setNewGoal((p) => ({ ...p, currentAmount: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Target Deadline (Date)</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      min={todayStr}
                      onChange={(e) => {
                        setNewGoal((p) => ({ ...p, deadline: e.target.value }));
                        setGoalError("");
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : editingGoalIndex !== null ? "Update Goal" : "Add Goal"}
                    </button>
                    {editingGoalIndex !== null && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditingGoalIndex(null);
                          setNewGoal({ title: "", targetAmount: "", currentAmount: "", deadline: "" });
                          setGoalError("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>Active Goals ({goals.length})</h4>
                {goals.length === 0 ? (
                  <p style={{ color: "var(--text3)", fontSize: 13, fontStyle: "italic" }}>No active goals configured.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {goals.map((goal, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 14,
                          background: "rgba(255,255,255,0.01)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{goal.title}</p>
                          <p style={{ fontSize: 12, color: "var(--text3)", margin: "4px 0 0" }}>
                            {fmt(goal.currentAmount, user?.currency)} of {fmt(goal.targetAmount, user?.currency)} saved
                            {goal.deadline ? ` · Due: ${format(new Date(goal.deadline), "d MMM yyyy")}` : ""}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => {
                              setEditingGoalIndex(idx);
                              setNewGoal({
                                title: goal.title,
                                targetAmount: String(goal.targetAmount),
                                currentAmount: String(goal.currentAmount),
                                deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
                              });
                            }}
                            className="btn btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteGoal(idx)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Reminder settings */}
            {activeTab === "reminders" && (
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, textTransform: "uppercase", color: "var(--text2)", marginBottom: 18 }}>
                  {editingReminderIndex !== null ? "Edit Reminder" : "Create New Reminder"}
                </h3>

                <form onSubmit={editingReminderIndex !== null ? handleUpdateReminder : handleAddReminder} style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
                  {reminderError && (
                    <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>
                      {reminderError}
                    </p>
                  )}
                  <div className="form-group">
                    <label>Reminder Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Electricity Bill"
                      value={newReminder.title}
                      onChange={(e) => setNewReminder((p) => ({ ...p, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="form-group">
                      <label>Amount</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 150"
                        value={newReminder.amount}
                        onChange={(e) => setNewReminder((p) => ({ ...p, amount: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Type</label>
                      <select value={newReminder.type} onChange={(e) => setNewReminder((p) => ({ ...p, type: e.target.value }))}>
                        <option value="bill">Upcoming Bill</option>
                        <option value="subscription">Subscription</option>
                        <option value="custom">Custom Reminder</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Due Date (Date)</label>
                    <input
                      type="date"
                      value={newReminder.dueDate}
                      min={todayStr}
                      onChange={(e) => {
                        setNewReminder((p) => ({ ...p, dueDate: e.target.value }));
                        setReminderError("");
                      }}
                      required
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? "Saving..." : editingReminderIndex !== null ? "Update Reminder" : "Add Reminder"}
                    </button>
                    {editingReminderIndex !== null && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => {
                          setEditingReminderIndex(null);
                          setNewReminder({ title: "", amount: "", dueDate: "", type: "custom" });
                          setReminderError("");
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <h4 style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>Active Reminders ({reminders.length})</h4>
                {reminders.length === 0 ? (
                  <p style={{ color: "var(--text3)", fontSize: 13, fontStyle: "italic" }}>No reminders configured.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {reminders.map((rem, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: 14,
                          background: "rgba(255,255,255,0.01)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
                            {rem.title}{" "}
                            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 8, background: "rgba(255,255,255,0.05)", marginLeft: 6, color: "var(--text2)" }}>
                              {rem.type}
                            </span>
                          </p>
                          <p style={{ fontSize: 12, color: "var(--text3)", margin: "4px 0 0" }}>
                            Amount: {fmt(rem.amount, user?.currency)} · Due: {format(new Date(rem.dueDate), "d MMM yyyy")}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => {
                              setEditingReminderIndex(idx);
                              setNewReminder({
                                title: rem.title,
                                amount: String(rem.amount),
                                dueDate: rem.dueDate ? new Date(rem.dueDate).toISOString().split("T")[0] : "",
                                type: rem.type,
                              });
                            }}
                            className="btn btn-ghost"
                            style={{ padding: "6px 12px", fontSize: 12 }}
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteReminder(idx)} className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
