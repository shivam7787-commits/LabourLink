import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Shield, HardHat, Lock, User, Eye, EyeOff, AlertCircle } from "lucide-react";

export const AdminLoginPage = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier.trim() || !password.trim()) {
      setError("Please fill in both fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await login("admin", identifier.trim(), password);
      navigate(res.redirectPath, { replace: true });
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>
          ? Back to Home
        </Link>
      </div>

      <div style={{ width: "100%", maxWidth: "440px", background: "var(--bg-surface)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: "20px", padding: "2.5rem 2rem", boxShadow: "0 0 60px rgba(139,92,246,0.1)", position: "relative", zIndex: 1 }}>
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, #8b5cf6, #3b82f6)", borderRadius: "18px", display: "grid", placeItems: "center", color: "white", margin: "0 auto 1rem", boxShadow: "0 8px 32px rgba(139,92,246,0.35)" }}>
            <Shield size={30} />
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
            <HardHat size={16} color="#3b82f6" />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "1.1rem", color: "#fff" }}>
              Labour<span style={{ color: "#3b82f6" }}>Link</span>
            </span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "1.5rem", fontWeight: "800", color: "#fff", margin: "0 0 0.4rem" }}>Admin Login</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Super Admin Command Desk — Authorized Access Only</p>
        </div>

        <div style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: "10px", padding: "0.85rem 1rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#93c5fd", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
          <Lock size={14} style={{ marginTop: "1px", flexShrink: 0 }} />
          <div>
            <strong>Demo credentials:</strong><br />
            ID: <code style={{ background: "rgba(59,130,246,0.15)", padding: "0 4px", borderRadius: "4px" }}>admin</code>
            &nbsp;&nbsp;Password: <code style={{ background: "rgba(59,130,246,0.15)", padding: "0 4px", borderRadius: "4px" }}>LabourLink@Admin2025</code>
          </div>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", padding: "0.75rem 1rem", marginBottom: "1.25rem", color: "#fca5a5", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <AlertCircle size={15} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Admin ID or Email</label>
            <div style={{ position: "relative" }}>
              <User size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="admin"
                required
                style={{ width: "100%", padding: "0.75rem 0.9rem 0.75rem 2.5rem", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-glass)", borderRadius: "10px", color: "white", outline: "none", fontSize: "0.95rem", boxSizing: "border-box" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "1.75rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Password</label>
            <div style={{ position: "relative" }}>
              <Lock size={16} style={{ position: "absolute", left: "0.9rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                style={{ width: "100%", padding: "0.75rem 2.75rem 0.75rem 2.5rem", background: "var(--bg-surface-elevated)", border: "1px solid var(--border-glass)", borderRadius: "10px", color: "white", outline: "none", fontSize: "0.95rem", boxSizing: "border-box" }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={{ position: "absolute", right: "0.9rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "0", display: "grid", placeItems: "center" }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: "100%", padding: "0.9rem", background: isSubmitting ? "rgba(139,92,246,0.4)" : "linear-gradient(135deg, #8b5cf6, #3b82f6)", border: "none", borderRadius: "12px", color: "white", fontFamily: "var(--font-heading)", fontSize: "1rem", fontWeight: "700", cursor: isSubmitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(139,92,246,0.35)" }}
          >
            <Shield size={17} />
            {isSubmitting ? "Authenticating..." : "Access Admin Dashboard"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          Not an admin?{" "}
          <Link to="/auth" style={{ color: "#60a5fa", textDecoration: "none", fontWeight: "600" }}>
            Go to user portal ?
          </Link>
        </div>
      </div>
    </div>
  );
};
