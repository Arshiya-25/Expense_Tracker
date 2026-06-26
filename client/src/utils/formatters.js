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
