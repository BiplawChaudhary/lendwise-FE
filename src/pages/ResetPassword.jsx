import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { callApi } from "../utils/api";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState("");
  const [isValidLink, setIsValidLink] = useState(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const userRefVar = useRef(false);

  /* ---------------- VALIDATE RESET LINK ON LOAD ---------------- */
  useEffect(() => {
    if (userRefVar.current) return;
    userRefVar.current = true;

    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (!data) {
      setIsValidLink(false);
      return;
    }

    setResetData(data);
    window.history.replaceState({}, document.title, window.location.pathname);

    validateResetLink(data);
  }, []);

  const validateResetLink = async (data) => {
    try {
      await callApi({
        url: "/auth/check-reset-validity",
        method: "POST",
        body: { data },
        validateResponse: true,
        showToast,
      });

      setIsValidLink(true);
    } catch (e) {
      setIsValidLink(false);
    }
  };

  /* ---------------- PASSWORD VALIDATION ---------------- */
  const validatePasswords = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required.";
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = "Password must be at least 8 characters.";
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one uppercase letter.";
      } else if (!/[a-z]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one lowercase letter.";
      } else if (!/[0-9]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one number.";
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        newErrors.newPassword =
          "Password must contain at least one special character.";
      }
    }

    if (!confirmNewPassword) {
      newErrors.confirmNewPassword = "Please confirm your password.";
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmNewPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) return;

    setLoading(true);
    try {
      await callApi({
        url: "/auth/reset-password",
        method: "POST",
        body: {
          data: resetData,
          newPassword,
        },
        validateResponse: true,
        showToast,
      });

      showToast("Password changed successfully!", "success");
    } catch {
      // handled in callApi
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STYLES (UNCHANGED) ---------------- */
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

  /* ---------------- ERROR PAGE ---------------- */
  if (isValidLink === false) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <h2 style={{ color: "#dc2626", marginBottom: 12 }}>
            Invalid or Expired Link
          </h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            This password reset link is invalid or has expired.
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              marginTop: 20,
              color: "#1a56db",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

  if (isValidLink === null) return null;

  /* ---------------- MAIN FORM ---------------- */
  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <img
            src="/logo.png"
            alt="Logo"
            style={{ width: 36, height: 36 }}
            onError={(e) => (e.target.style.display = "none")}
          />
          <span style={{ fontSize: 22, fontWeight: 700, color: "#1a56db" }}>
            Lendwise
          </span>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Reset Your Password
        </h2>
        <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
          Please create your new password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          
          {/* NEW PASSWORD */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                style={{
                  height: 44,
                  padding: "0 40px 0 14px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: 8,
                  width: "100%",
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showNewPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.newPassword && (
              <span style={{ color: "#dc2626", fontSize: 12 }}>
                {errors.newPassword}
              </span>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600 }}>
              Confirm New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
                style={{
                  height: 44,
                  padding: "0 40px 0 14px",
                  border: "1.5px solid #d1d5db",
                  borderRadius: 8,
                  width: "100%",
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showConfirmPassword ? "🙈" : "👁"}
              </button>
            </div>
            {errors.confirmNewPassword && (
              <span style={{ color: "#dc2626", fontSize: 12 }}>
                {errors.confirmNewPassword}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: 46,
              background: "#1a56db",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Changing Password..." : "Change Password"}
          </button>

          <Link
            to="/login"
            style={{
              textAlign: "center",
              color: "#1a56db",
              fontSize: 13,
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            ← Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
