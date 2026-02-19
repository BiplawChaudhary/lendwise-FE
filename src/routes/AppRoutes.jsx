import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Pages
import LoginPage from "../pages/LoginPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import MerchantDashboard from "../pages/merchant/MerchantDashboard";
import AdminDashboard from "../pages/admin/AdminDashboard";
import NotFound from "../pages/NotFound";
import MerchantEkyc from "../pages/merchant/MerchantEkyc";
import Settings from "../pages/Settings";
import ResetPassword from "../pages/ResetPassword";
import { useState } from "react";
import RegisterMerchant from "../pages/merchant/RegisterMerchant";
import ManageEkyc from "../pages/admin/ManageEkyc";
import ManageMerchants from "../pages/admin/ManageMerchants";
// ─────────────────────────────────────────────────────────────
// Guard: Only accessible when NOT logged in (public routes)
// ─────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (user) {
    // Redirect logged-in users to their dashboard
    return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard"} replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────
// Guard: Only accessible when logged in, and role must match
// ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== allowedRole) {
    // Wrong role – redirect to their own dashboard
    const correctPath = user.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard";
    return <Navigate to={correctPath} replace />;
  }

  return children;
}

function LoadingScreen() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4ff" }}>
      <div style={{ color: "#1a56db", fontSize: 18, fontWeight: 500 }}>Loading...</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Root redirect based on login status
// ─────────────────────────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();

  console.log("user",user)
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/admin/dashboard" : "/merchant/dashboard"} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Public Routes ── */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register-merchant" element={<PublicRoute><RegisterMerchant/></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
    <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

      {/* ── Merchant Routes ── */}
      <Route
        path="/merchant/dashboard"
        element={
          <ProtectedRoute allowedRole="MERCHANT">
            <MerchantDashboard />
          </ProtectedRoute>
        }
      />

        <Route
        path="/merchant/ekyc"
        element={
          <ProtectedRoute allowedRole="MERCHANT">
            <MerchantEkyc />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRole="MERCHANT">
            <Settings />
          </ProtectedRoute>
        }
      />

      

      {/* ── Admin Routes ── */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

           <Route path="/admin/manage-ekyc" element={<ProtectedRoute allowedRole="ADMIN"><ManageEkyc /></ProtectedRoute>} />
      <Route path="/admin/manage-merchants" element={<ProtectedRoute allowedRole="ADMIN"><ManageMerchants /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}