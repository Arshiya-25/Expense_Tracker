import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { register as registerApi } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    currency: "INR",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
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
        background: "#050816",
        color: "#F6F6F8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowX: "hidden",
        position: "relative",
        padding: "40px 24px",
        // Force dark mode local variables overrides
        "--bg": "#050816",
        "--bg2": "#09122A",
        "--bg3": "#0e1228",
        "--surface": "rgba(14, 18, 40, 0.75)",
        "--surface2": "rgba(14, 18, 40, 0.9)",
        "--border": "rgba(255, 255, 255, 0.06)",
        "--border2": "rgba(255, 255, 255, 0.12)",
        "--text": "#F6F6F8",
        "--text2": "#B8B8C8",
        "--text3": "#626784",
        "--primary": "#A86BFF",
        "--accent": "#37C6D9",
        "--highlight": "#FF6BCB",
        "--secondary": "#5D7BFF",
        "--red": "#FF8CA8",
        "--red-dim": "rgba(255, 140, 168, 0.08)",
        "--radius-xl": "20px",
        "--radius-md": "8px",
        "--radius-full": "999px",
      }}
      className="reg-root"
    >
      {/* Local styles only (keeps this file self-contained). */}
      <style>{`
        .reg-container {
          width: 100%;
          max-width: 1050px;
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 60px;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
        }
        .reg-left-col {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .reg-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--border2);
          border-radius: var(--radius-xl);
          padding: 32px;
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

        .reg-right-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          width: 100%;
        }
        .reg-hero {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        .reg-pill {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: var(--radius-full);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.10);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
        }
        .reg-hero-title {
          font-size: clamp(24px, 2.5vw, 30px);
          font-weight: 750;
          line-height: 1.2;
          letter-spacing: -0.04em;
          margin-bottom: 8px;
          margin-top: 12px;
        }
        .reg-hero-sub {
          color: var(--text2);
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 420px;
        }
        .glow-bg {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168, 163, 255, 0.08) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }
        @media (max-width: 980px) and (min-width: 768px) {
          .reg-container {
            grid-template-columns: 420px 1fr;
            gap: 32px;
          }
        }
        @media (max-width: 767px) {
          .reg-container {
            grid-template-columns: 1fr;
            gap: 48px;
            max-width: 420px;
          }
        }
      `}</style>

      {/* Floating Glows for background design */}
      <div className="glow-bg" style={{ top: "-10%", left: "-10%" }} />
      <div className="glow-bg" style={{ bottom: "-10%", right: "-10%" }} />

      <div className="reg-container">
        {/* Left: signup form */}
        <div className="reg-left-col">
          <div className="reg-card">
            <div style={{ textAlign: "center", marginBottom: 26 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
                </svg>
              </div>
              <h1
                style={{
                  fontSize: 26,
                  fontWeight: 650,
                  letterSpacing: "-0.03em",
                  color: "var(--text)",
                }}
              >
                Create account
              </h1>
              <p
                style={{
                  color: "var(--text3)",
                  fontSize: 14,
                  marginTop: 6,
                  lineHeight: 1.6,
                }}
              >
                Track smarter. Spend better.
              </p>
            </div>

            {/* Signup form */}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label style={{ color: "var(--text2)" }}>Full name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label style={{ color: "var(--text2)" }}>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label style={{ color: "var(--text2)" }}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, password: e.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label style={{ color: "var(--text2)" }}>Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, currency: e.target.value }))
                  }
                >
                  <option value="INR">₹ Indian Rupee (INR)</option>
                  <option value="USD">$ US Dollar (USD)</option>
                  <option value="EUR">€ Euro (EUR)</option>
                  <option value="GBP">£ British Pound (GBP)</option>
                </select>
              </div>

              {error && (
                <div
                  style={{
                    background: "var(--red-dim)",
                    border: "1px solid rgba(240,92,110,0.25)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    color: "var(--red)",
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{
                  width: "100%",
                  justifyContent: "center",
                  height: 42,
                  marginTop: 4,
                }}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              <p
                style={{
                  textAlign: "center",
                  marginTop: 18,
                  fontSize: 14,
                  color: "var(--text3)",
                }}
              >
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 550,
                  }}
                >
                  Sign in
                </Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right: visual/branding with illustration */}
        <div className="reg-right-col" aria-hidden="true">
          <div className="reg-hero">
            <div className="reg-pill">
              <span style={{ color: "var(--accent)" }}>FinFlow</span>
              <span
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--border2)",
                }}
              />
              <span style={{ color: "var(--text2)", fontWeight: 600 }}>
                Premium, minimal, useful
              </span>
            </div>

            <div className="reg-hero-title">Track smarter. Spend better.</div>
            <div className="reg-hero-sub">
              A calm way to track expenses, set category budgets, and understand
              your spending - month by month.
            </div>

            {/* Subtle premium CSS-only decorative element */}
            <div
              style={{
                width: "100%",
                maxWidth: 420,
                height: 220,
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(255, 255, 255, 0.04)",
                background:
                  "linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
                position: "relative",
                overflow: "hidden",
                marginTop: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "24px",
                boxSizing: "border-box",
              }}
            >
              {/* Subtle blurred purple/pink glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-40px",
                  right: "-40px",
                  width: 150,
                  height: 150,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(168, 107, 255, 0.15) 0%, transparent 70%)",
                  filter: "blur(15px)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "-50px",
                  left: "-50px",
                  width: 180,
                  height: 180,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(55, 198, 217, 0.1) 0%, transparent 70%)",
                  filter: "blur(20px)",
                  pointerEvents: "none",
                }}
              />

              {/* Clean abstract lines representing UI layout blocks (Linear/Vercel style) */}
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--primary)",
                    opacity: 0.7,
                  }}
                />
                <div
                  style={{
                    width: 80,
                    height: 8,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <div
                  style={{
                    width: "90%",
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
                <div
                  style={{
                    width: "65%",
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
                <div
                  style={{
                    width: "40%",
                    height: 6,
                    borderRadius: 3,
                    background: "rgba(255,255,255,0.04)",
                  }}
                />
              </div>

              {/* Faint divider line with a subtle accent gradient */}
              <div
                style={{
                  width: "100%",
                  height: 1,
                  background:
                    "linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(168, 107, 255, 0.25) 50%, rgba(255,255,255,0.04) 100%)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 8,
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.08)",
                  }}
                />
                <div
                  style={{
                    width: 32,
                    height: 16,
                    borderRadius: 8,
                    background: "rgba(55, 198, 217, 0.08)",
                    border: "1px solid rgba(55, 198, 217, 0.15)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
