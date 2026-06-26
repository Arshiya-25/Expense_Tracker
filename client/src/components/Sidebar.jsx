import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  PieChart, 
  User, 
  Moon, 
  Sun, 
  LogOut, 
  TrendingUp 
} from "lucide-react";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    to: "/transactions",
    label: "Transactions",
    icon: <ArrowLeftRight size={18} />,
  },
  {
    to: "/budgets",
    label: "Budgets",
    icon: <PieChart size={18} />,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: <User size={18} />,
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
          padding: "0 8px 24px",
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
            background: "linear-gradient(135deg, var(--primary) 0%, var(--highlight) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#050816",
          }}
        >
          <TrendingUp size={18} strokeWidth={2.5} />
        </div>
        <span
          style={{ 
            fontFamily: "var(--font-heading)",
            fontWeight: 700, 
            fontSize: 16, 
            letterSpacing: "-0.03em",
            color: "var(--text)"
          }}
        >
          FinFlow
        </span>
      </div>

      {/* Navigation */}
      <nav
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}
      >
        <p
          style={{
            fontSize: 10,
            color: "var(--text3)",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0 16px",
            marginBottom: 4,
          }}
        >
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
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
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text2)",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
            transition: "all var(--transition-fast)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {theme === "dark" ? <Moon size={15} /> : <Sun size={15} />}
            <span>{theme === "dark" ? "Dark mode" : "Light mode"}</span>
          </span>
          <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 500 }}>
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
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              transition: "background var(--transition-fast)",
              background: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
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
                background: "linear-gradient(135deg, var(--primary), var(--highlight))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 600,
                color: "#050816",
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
                  margin: 0,
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
                  margin: "2px 0 0",
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
            padding: "10px 12px",
            borderRadius: "var(--radius-md)",
            background: "transparent",
            border: "none",
            color: "var(--text3)",
            fontSize: 13,
            cursor: "pointer",
            width: "100%",
            transition: "all var(--transition-fast)",
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
          <LogOut size={15} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
