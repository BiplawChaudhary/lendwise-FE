import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import EkycStatus from "../../components/EkycStatus";
import { MERCHANT_MENU_ITEMS } from "../../config/MenuConfig";

export default function MerchantEkyc() {
  const { user } = useAuth();
  
  return (
    <DashboardLayout menuItems={MERCHANT_MENU_ITEMS}>
      <div>
        {/* <EkycStatus></EkycStatus> */}

        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          Proceed with ekyc
        </h1>
        <p style={{ color: "#6b7280", fontSize: 15, margin: "0 0 32px" }}>
          {user?.userEmail} · Merchant Portal
        </p>
      </div>
    </DashboardLayout>
  );
}