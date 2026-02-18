import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { callApi } from "../utils/api";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { showToast("Please enter your email.", "warning"); return; }

    setLoading(true);
    try {
      await callApi({
        url: "/auth/forgotPassword",
        method: "POST",
        body: { userEmail: email },
        validateResponse: true,
        showToast,
      });
      setSent(true);
    } catch {
      // toast already shown by callApi
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    minHeight: "100vh",
    background: "#f8faff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: '"Segoe UI", system-ui, sans-serif',
    padding: "20px",
  };

  const cardStyle = {
    background: "#ffffff",
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 420,
    width: "100%",
    boxShadow: "0 4px 32px rgba(26,86,219,0.10)",
    border: "1px solid #e5edff",
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <img src="/logo.png" alt="Logo" style={{ width: 36, height: 36, objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1a56db" }}>Lendwise</span>
        </div>

        {sent ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ color: "#111827", margin: "0 0 8px" }}>Check your email</h2>
            <p style={{ color: "#6b7280", fontSize: 14, lineHeight: 1.6 }}>
              We've sent a password reset link to <strong>{email}</strong>. Check your inbox.
            </p>
            <Link to="/login" style={{ display: "inline-block", marginTop: 24, color: "#1a56db", fontWeight: 600, textDecoration: "none" }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>Forgot your password?</h2>
            <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 28px" }}>
              Enter your email address and we'll send you a reset link.
            </p>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={loading}
                  style={{
                    height: 44, padding: "0 14px", border: "1.5px solid #d1d5db",
                    borderRadius: 8, fontSize: 14, color: "#111827", outline: "none",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  height: 46, background: "#1a56db", color: "#fff", border: "none",
                  borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <Link to="/login" style={{ textAlign: "center", color: "#1a56db", fontSize: 13, textDecoration: "none", fontWeight: 500 }}>
                ← Back to Login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}