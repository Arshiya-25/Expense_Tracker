// NavLink from react-router-dom adds an "active" class automatically when the URL matches
// This is how the active sidebar item gets highlighted — no manual tracking needed

import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 16V4m0 0L3 8m4-4l4 4" />
        <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
      </svg>
    ),
  },
  {
    to: "/budgets",
    label: "Budgets",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("finflow_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.body.dataset.theme = theme;
    try {
      localStorage.setItem("finflow_theme", theme);
    } catch {
      // ignore if storage is blocked
    }
  }, [theme]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user initials for avatar
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <aside
      style={{
        width: "var(--sidebar-w)",
        background: "var(--bg2)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "0 8px 28px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z" />
          </svg>
        </div>
        <span
          style={{ fontWeight: 600, fontSize: 16, letterSpacing: "-0.02em" }}
        >
          FinFlow
        </span>
      </div>

      {/* Navigation */}
      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <p
          style={{
            fontSize: 11,
            color: "var(--text3)",
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "0 8px",
            marginBottom: 8,
          }}
        >
          MENU
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"} // "end" means only match exact "/" not "/transactions"
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--r-md)",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "var(--text)" : "var(--text2)",
              background: isActive ? "var(--surface)" : "transparent",
              border: isActive
                ? "1px solid var(--border)"
                : "1px solid transparent",
              transition: "all 0.15s",
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{ color: isActive ? "var(--accent)" : "currentColor" }}
                >
                  {item.icon}
                </span>
                {item.label}
                {/* Active dot */}
                {isActive && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--accent)",
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile at bottom */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Frontend-only theme toggle */}
        <button
          onClick={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "10px 12px",
            borderRadius: "var(--r-md)",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span>{theme === "dark" ? "🌙" : "☀️"}</span>
            {theme === "dark" ? "Dark mode" : "Light mode"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>
            {theme === "dark" ? "On" : "Off"}
          </span>
        </button>

        {/* Profile card */}
        <NavLink to="/profile" style={{ textDecoration: "none" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: "var(--r-md)",
              cursor: "pointer",
              transition: "background 0.15s",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "white",
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name || "User"}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text3)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.email}
              </p>
            </div>
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            borderRadius: "var(--r-md)",
            background: "transparent",
            border: "none",
            color: "var(--text3)",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--red)";
            e.currentTarget.style.background = "var(--red-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text3)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
