import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLoader() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            border: "2px solid var(--border2)",
            borderTopColor: "var(--accent)",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }}
        />
        <p style={{ color: "var(--text3)", fontSize: 14 }}>
          Loading FinFlow...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppLayout({ children }) {
  const { user } = useAuth();
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}>
        {user?.isDemo && (
          <div
            style={{
              background: "rgba(168, 107, 255, 0.12)",
              borderBottom: "1px solid rgba(168, 107, 255, 0.25)",
              padding: "10px 24px",
              color: "var(--text)",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              zIndex: 100,
              textAlign: "center",
              backdropFilter: "blur(8px)",
              animation: "slideDown 0.3s ease-out",
            }}
          >
            <span style={{ fontWeight: 600, color: "var(--primary)" }}>Demo Mode:</span>
            <span>You are logged in as a Demo User. Profile changes are disabled, but you can add transactions, goals, budgets, and reminders to test the app.</span>
          </div>
        )}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "var(--bg)",
            padding: "32px 36px",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

import Landing from "./pages/Landing"; // Import the landing page

export default function App() {
  const { user } = useAuth(); // Read the authentication state from context

  return (
    <Routes>
      {/* Public routes — redirect to dashboard if already logged in */}
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" replace /> : <Register />}
      />

      {/* Landing page or Dashboard route */}
      <Route
        path="/"
        element={
          user ? (
            <AppLayout>
              <Dashboard />
            </AppLayout>
          ) : (
            <Landing />
          )
        }
      />
      <Route
        path="/transactions"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Transactions />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Budgets />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
