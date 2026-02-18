import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import EkycStatus from "../../components/EkycStatus";
import { MERCHANT_MENU_ITEMS } from "../../config/MenuConfig";

export default function MerchantDashboard() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout menuItems={MERCHANT_MENU_ITEMS}>
      <div>
        <EkycStatus></EkycStatus>

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 32px" }}>
          {user?.userEmail} · Merchant Portal
        </p>

        {/* Stats placeholder */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          {["Total Loans", "Active Loans", "Pending Approval", "Disbursed Amount"].map((label) => (
            <div key={label} style={{
              background: "#ffffff", borderRadius: 12, padding: "24px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)", border: "1px solid #e5edff"
            }}>
              <p style={{ color: "#6b7280", fontSize: 13, margin: "0 0 8px", fontWeight: 500 }}>{label}</p>
              <p style={{ color: "#111827", fontSize: 28, fontWeight: 700, margin: 0 }}>—</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}