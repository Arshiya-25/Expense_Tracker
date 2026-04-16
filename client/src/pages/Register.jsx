// src/pages/Register.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", currency: "INR" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await registerApi(form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "stretch",
      }}
    >
      {/* Local styles only (keeps this file self-contained). */}
      <style>{`
        .reg-split { width: 100%; min-height: 100vh; display: flex; }
        .reg-left { flex: 0 0 440px; display: flex; align-items: center; justify-content: center; padding: 28px 18px; }
        .reg-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border2);
          border-radius: var(--r-xl);
          padding: 28px;
          box-shadow: 0 18px 70px rgba(0,0,0,0.35);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          position: relative;
          overflow: hidden;
        }
        .reg-card::before {
          content: "";
          position: absolute;
          inset: -120px;
          background:
            radial-gradient(circle at 15% 10%, rgba(79,124,255,0.35) 0%, transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(124,109,250,0.25) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, rgba(34,201,135,0.18) 0%, transparent 55%);
          filter: blur(18px);
          pointer-events: none;
        }
        .reg-card > * { position: relative; z-index: 1; }
        .reg-right {
          flex: 1;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
          padding: 44px 44px 44px;
          background:
            radial-gradient(900px circle at 20% 0%, rgba(79,124,255,0.20) 0%, transparent 55%),
            radial-gradient(900px circle at 90% 10%, rgba(124,109,250,0.18) 0%, transparent 55%),
            radial-gradient(900px circle at 30% 100%, rgba(34,201,135,0.14) 0%, transparent 55%),
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0));
        }
        .reg-right::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.45) 90%);
          pointer-events: none;
        }
        .reg-hero { position: relative; z-index: 1; max-width: 520px; }
        .reg-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
        }
        .reg-hero-title { font-size: 32px; font-weight: 750; letter-spacing: -0.04em; margin-bottom: 10px; }
        .reg-hero-sub { color: var(--text2); font-size: 14px; line-height: 1.7; margin-bottom: 18px; max-width: 460px; }
        .reg-graphic {
          width: 100%;
          max-width: 520px;
          height: 220px;
          border-radius: var(--r-xl);
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 980px) {
          .reg-split { flex-direction: column; }
          .reg-left { flex: initial; padding: 18px 14px; }
          .reg-right { padding: 28px 18px; align-items: center; }
          .reg-hero-title { font-size: 26px; }
        }
      `}</style>

      <div className="reg-split">
        {/* Left: signup form */}
        <div className="reg-left">
          <div className="reg-card">
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 16px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 650, letterSpacing: "-0.03em" }}>Create account</h1>
              <p style={{ color: "var(--text3)", fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>
                Track smarter. Spend better.
              </p>
            </div>

            {/* Signup form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Arshiya Singh"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm((p) => ({ ...p, currency: e.target.value }))}
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
              </div>

              {error && (
                <div style={{
                  background: "var(--red-dim)",
                  border: "1px solid rgba(240,92,110,0.25)",
                  borderRadius: "var(--r-md)",
                  padding: "10px 14px",
                  color: "var(--red)",
                  fontSize: 13,
                  marginBottom: 16,
                }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: "100%", justifyContent: "center", height: 42, marginTop: 4 }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p style={{ textAlign: "center", marginTop: 18, fontSize: 14, color: "var(--text3)" }}>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 550 }}>
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: visual/branding */}
        <div className="reg-right" aria-hidden="true">
          <div className="reg-hero">
            <div className="reg-pill">
              <span style={{ color: "var(--accent)" }}>FinFlow</span>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--border2)" }} />
              <span style={{ color: "var(--text2)", fontWeight: 600 }}>Premium, minimal, useful</span>
            </div>

            <div className="reg-hero-title">Track smarter. Spend better.</div>
            <div className="reg-hero-sub">
              A calm way to track expenses, set category budgets, and understand your spending—month by month.
            </div>

            <div className="reg-graphic">
              {/* purely decorative */}
              <svg width="100%" height="100%" viewBox="0 0 520 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="r1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
                    <stop offset="55%" stopColor="#22c987" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="#f05c6e" stopOpacity="0.22" />
                  </linearGradient>
                  <linearGradient id="r2" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="white" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="white" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="520" height="220" fill="url(#r2)" />
                {Array.from({ length: 10 }).map((_, i) => (
                  <line
                    key={i}
                    x1={i * 52}
                    y1={0}
                    x2={i * 52}
                    y2={220}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="1"
                  />
                ))}
                <path
                  d="M25 170 C 110 130, 160 190, 210 150
                     C 270 104, 310 170, 360 140
                     C 420 112, 455 150, 495 95"
                  fill="none"
                  stroke="url(#r1)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
