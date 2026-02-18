import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { callApi } from "../../utils/api";
import "../LoginPage.css";

export default function RegisterMerchant() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      showToast("Please enter username and password.", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await callApi({
        url: "/auth/saveMerchant",
        method: "POST",
        body: { userEmail: form.username, userPassword: form.password },
        validateResponse: false, // We handle login manually
      });

      if (response.apiResponseCode === 200) {
        showToast("User Created Successfully.", "success");

        navigate("/login");
      } else {
        showToast(
          response.apiResponseMessage ||
            "User creation failed. Please try again.",
          "error",
        );
      }
    } catch (err) {
      showToast(
        "User creation failed. Please check your credentials.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left decorative panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="brand-tagline">
            <h1>
              Smart Lending,
              <br />
              Simplified.
            </h1>
            <p>
              Manage your loan portfolio with clarity, speed, and confidence.
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-logo">
            <img
              src="/logo.png"
              alt="Lendwise Logo"
              className="logo-img"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="logo-text">Lendwise</span>
          </div>
          <button
            type="button"
            className="back-login-btn"
            onClick={() => navigate("/login")}
          >
            ← Back to Login
          </button>
          <h2 className="login-title">Create your account</h2>
          <p className="login-subtitle">Fill in your details to continue</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* <div className="forgot-row">
              <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
            </div> */}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Register Merchant"}
            </button>
          </form>
        </div>

        <p className="login-footer">
          © {new Date().getFullYear()} Lendwise. All rights reserved.
        </p>
      </div>
    </div>
  );
}
