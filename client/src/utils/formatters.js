// Formatter utilities for FinFlow dashboard
// Ensures defensive checks and fallback values to prevent ReferenceErrors or null pointer crashes

export const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return "—";
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount));
  } catch (err) {
    return `${currency} ${amount}`;
  }
};

export const formatDate = (date, formatStr = "d MMM yyyy") => {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  } catch (err) {
    return String(date);
  }
};

export const formatPercentage = (percent) => {
  if (percent === undefined || percent === null || isNaN(Number(percent))) return "0%";
  return `${Math.round(Number(percent))}%`;
};

export const getGoalUrgency = (goal) => {
  const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
  if (remainingAmount <= 0) {
    return -1; // Completed goals always last
  }
  
  if (!goal.deadline) {
    return 0; // Goals with no deadline have lower urgency than goals with deadlines
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(goal.deadline);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    // Overdue and incomplete -> extremely high urgency, sort by remainingAmount to prioritize larger deficits
    return 999999999 + remainingAmount;
  }

  return remainingAmount / diffDays;
};

export const sortGoals = (goalsList) => {
  return [...goalsList].sort((a, b) => getGoalUrgency(b) - getGoalUrgency(a));
};

export const getBudgetStatus = (percentage) => {
  const pct = Number(percentage) || 0;
  if (pct >= 100) {
    return {
      label: "Over budget",
      color: "var(--red)",
      barColor: "var(--red)",
      badgeBg: "var(--red-dim)",
      badgeText: "var(--red)",
      badgeClass: "badge-expense"
    };
  } else if (pct >= 80) {
    return {
      label: "Warning: Approaching budget limit",
      color: "var(--amber)",
      barColor: "var(--amber)",
      badgeBg: "var(--amber-dim)",
      badgeText: "var(--amber)",
      badgeClass: "badge-warning"
    };
  } else {
    return {
      label: "Healthy",
      color: "var(--green)",
      barColor: "var(--green)",
      badgeBg: "var(--green-dim)",
      badgeText: "var(--green)",
      badgeClass: ""
    };
  }
};

