import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EkycStatus(){
    const navigate = useNavigate();
      const [showBanner, setShowBanner] = useState(false);
    
      useEffect(() => {
        const kycStatus = sessionStorage.getItem("kycStatus");
        console.log("KYC STATUS: ", kycStatus);
        // Show banner if kycStatus exists and is NOT completed
        if (kycStatus && kycStatus !== "COMPLETED") {
          setShowBanner(true);
        }
      }, []);

    return (
        <div>
            {/* ✅ eKYC Pending Banner */}
        {showBanner && (
          <div
            style={{
              background: "#FEF3C7",
              border: "1px solid #FCD34D",
              color: "#92400E",
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer"
            }}
            onClick={() => navigate("/merchant/ekyc")}
          >
            <span style={{ fontWeight: 500 }}>
              ⚠️ Your eKYC verification is pending. Please complete it to apply for loan.
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation(); // prevent navigation
                setShowBanner(false);
              }}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                color: "#92400E"
              }}
            >
              ✕
            </button>
          </div>
        )}
        </div>
    )
}