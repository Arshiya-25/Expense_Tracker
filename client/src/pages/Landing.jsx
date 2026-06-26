// Landing Page for FinFlow - Premium, Minimal, Editorial presentation
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { demoLogin } from "../api";

export default function Landing() {
  const { login } = useAuth();
  const [loadingDemo, setLoadingDemo] = useState(false);

  // Auto-logs the user in as the pre-seeded demo user
  const handleTryDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await demoLogin();
      login(res.data.token, res.data.user);
    } catch (err) {
      console.error(err);
      alert("Failed to start demo login. Please try again.");
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* Inline styles for Landing page transitions and interactive elements */}
      <style>{`
        .nav-link {
          color: var(--text2);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition-fast);
        }
        .nav-link:hover {
          color: var(--primary);
        }
        .cta-btn {
          background: var(--primary);
          color: #080814;
          padding: 12px 28px;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition-fast);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(168, 163, 255, 0.25);
        }
        .secondary-btn {
          background: transparent;
          border: 1px solid var(--border2);
          color: var(--text);
          padding: 12px 28px;
          border-radius: var(--radius-md);
          font-weight: 600;
          text-decoration: none;
          transition: var(--transition-fast);
        }
        .secondary-btn:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: var(--text3);
        }
        .editorial-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          transition: var(--transition-normal);
        }
        .editorial-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
        }
        .glow-bg {
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 163, 255, 0.08) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
      `}</style>

      {/* Floating Glows for editorial background design */}
      <div className="glow-bg" style={{ top: "-10%", left: "-10%" }} />
      <div className="glow-bg" style={{ top: "40%", right: "-10%" }} />

      {/* NAVBAR */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 8%",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          background: "rgba(8, 8, 20, 0.8)",
          backdropFilter: "blur(12px)",
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: "linear-gradient(135deg, var(--primary) 0%, var(--highlight) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#050816",
            }}
          >
            <TrendingUp size={16} strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-0.03em" }}>
            FinFlow
          </span>
        </div>

        <nav style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#about" className="nav-link">About</a>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="cta-btn" style={{ padding: "8px 18px", fontSize: 13 }}>
            Sign Up
          </Link>
        </nav>
      </header>

      {/* HERO SECTION */}
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "160px 8% 60px",
          position: "relative",
          zIndex: 1,
        }}
      >

        <h1
          style={{
            fontSize: "clamp(42px, 7vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-0.04em",
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Track smarter.<br />
          <span style={{ background: "linear-gradient(135deg, var(--primary) 30%, var(--secondary) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Spend better.
          </span>
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2vw, 19px)",
            color: "var(--text2)",
            maxWidth: 580,
            lineHeight: 1.6,
            marginBottom: 36,
          }}
        >
          A minimalist personal finance companion designed to bring clarity to your spending, budgets, and savings goals without the clutter.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={handleTryDemo}
            className="cta-btn"
            style={{ border: "none", cursor: "pointer" }}
            disabled={loadingDemo}
          >
            {loadingDemo ? "Starting Demo..." : "Try Demo"}
            <ArrowRight size={16} />
          </button>
          <a href="#about" className="secondary-btn">Learn More</a>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" style={{ padding: "80px 8%", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 40, textAlign: "center" }}>
          Everything you need to stay on track.
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          <div className="editorial-card">
            <BarChart3 size={24} style={{ color: "var(--primary)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Design-First Dashboard</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
              A clean grid showcasing your income, expenses, savings rate, and category budgets in a glance.
            </p>
          </div>
          <div className="editorial-card">
            <Target size={24} style={{ color: "var(--primary)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Targeted Goals</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
              Keep tabs on specific financial goals like travel plans, safety nets, or large purchases with deadline progress bars.
            </p>
          </div>
          <div className="editorial-card">
            <Clock size={24} style={{ color: "var(--primary)", marginBottom: 16 }} />
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>Upcoming Reminders</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, lineHeight: 1.6 }}>
              Never miss subscription renewals or utility bills. Keep custom alerts directly in your field of view.
            </p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" style={{ padding: "80px 8%", background: "rgba(255, 255, 255, 0.01)", borderTop: "1px solid var(--border)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 20 }}>
            Our Philosophy
          </h2>
          <p style={{ fontSize: 16, color: "var(--text2)", lineHeight: 1.8, marginBottom: 30 }}>
            FinFlow was built out of frustration with overly cluttered personal finance apps. We don't sell your data, use complicated financial models, or inject AI widgets that guess your habits. We believe in visual clarity, simple workflows, and putting you in total control.
          </p>
          <div style={{ display: "inline-block", width: 40, height: 1, background: "var(--primary)" }} />
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          marginTop: "auto",
          padding: "48px 8%",
          borderTop: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          fontSize: 13,
          color: "var(--text3)",
        }}
      >
        <p>&copy; {new Date().getFullYear()} FinFlow Inc. All rights reserved.</p>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="#features" style={{ color: "inherit", textDecoration: "none" }}>Privacy</a>
          <a href="#about" style={{ color: "inherit", textDecoration: "none" }}>Terms</a>
          <a href="mailto:support@finflow.com" style={{ color: "inherit", textDecoration: "none" }}>Support</a>
        </div>
      </footer>
    </div>
  );
}
