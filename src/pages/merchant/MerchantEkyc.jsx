import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { callApi } from "../../utils/api";
import { MERCHANT_MENU_ITEMS } from "../../config/MenuConfig";
import EkycStatusBanner from "../../components/EkycStatusBanner";
import KycStepper from "../../components/KycStepper";
import PersonalDetailsForm from "./ekyc/PersonalDetailsForm";
import AddressDetailsForm from "./ekyc/AddressDetailsForm";
import BusinessDetailsForm from "./ekyc/BusinessDetailsForm";

const STEPS = ["Personal Details", "Address Details", "Business Details"];

// Map onboarding_stage from API → step number
const STAGE_TO_STEP = {
  PERSONAL_DETAILS: 1,
  ADDRESS_DETAILS: 2,
  BUSINESS_DETAILS: 3,
};

// Map step → fetch type
const STEP_FETCH_TYPE = {
  1: "PERSONAL_DETAILS",
  2: "ADDRESS_DETAILS",
  3: "BUSINESS_DETAILS",
};

export default function MerchantEkyc() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const kycStatus = sessionStorage.getItem("kycStatus") || "PENDING";

  const [loading, setLoading] = useState(true);
  const [kycStatusData, setKycStatusData] = useState(null);     // from EKYC_STATUS
  const [stepData, setStepData] = useState({});                  // cached data per step
  const [currentStep, setCurrentStep] = useState(1);
  const [activeStepDataLoading, setActiveStepDataLoading] = useState(false);

  // Determine display mode
  const isReadOnly = kycStatus === "UNDER_REVIEW" || kycStatus === "COMPLETED";
  const isRejected = kycStatus === "REJECTED";
  const isEditable = kycStatus === "PENDING" || isRejected;

  // ── 1. Fetch EKYC_STATUS on mount ─────────────────────────
  useEffect(() => {
    fetchEkycStatus();
  }, []);

  const fetchEkycStatus = async () => {
    setLoading(true);
    try {
      const res = await callApi({
        url: "/merchant/fetchUserKycData",
        method: "GET",
        headers: { type: "EKYC_STATUS" },
        validateResponse: false,
      });

      if (res.apiResponseCode === 200) {
        const data = res.apiResponseData.data;
        setKycStatusData(data);

        // Determine which step to open
        if (data.onboarding_stage && (isEditable)) {
          const stage = STAGE_TO_STEP[data.onboarding_stage];
          if (stage) {
            setCurrentStep(stage);
          }
        } else if (isReadOnly) {
          setCurrentStep(1); // Start at step 1 in read-only
        }
      }
    } catch (err) {
      showToast("Failed to fetch eKYC status.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── 2. Fetch step data when currentStep changes ──────────
  useEffect(() => {
    if (!loading) {
      fetchStepData(currentStep);
    }
  }, [currentStep, loading]);

  const fetchStepData = async (step) => {
    if (stepData[step]) return; // Already cached
    setActiveStepDataLoading(true);
    try {
      const type = STEP_FETCH_TYPE[step];
      const res = await callApi({
        url: "/merchant/fetchUserKycData",
        method: "GET",
        headers: { type },
        validateResponse: false,
      });
      if (res.apiResponseCode === 200) {
        setStepData((prev) => ({ ...prev, [step]: res.apiResponseData.data }));
      }
    } catch {
      // No data yet — it's fine, form will be empty
    } finally {
      setActiveStepDataLoading(false);
    }
  };

  // ── 3. On step form success ───────────────────────────────
  const handleStepSuccess = (step) => {
    // Invalidate cache for this step
    setStepData((prev) => { const n = { ...prev }; delete n[step]; return n; });

    if (step === 3) {
      // Final step — KYC submitted
      showToast("eKYC submitted successfully! It is now under review.", "success");
      sessionStorage.setItem("kycStatus", "UNDER_REVIEW");
      window.location.reload(); // Reload to show read-only view
    } else {
      // Move to next step
      setCurrentStep(step + 1);
    }
  };

  // ── Tab navigation (read-only mode) ──────────────────────
  const handleStepClick = (step) => {
    if (isReadOnly) {
      setCurrentStep(step);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <DashboardLayout menuItems={MERCHANT_MENU_ITEMS}>
      <div style={{ maxWidth: 2000 }}>
        {/* Page header */}
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>
          eKYC Verification
        </h1>
        <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 24px" }}>
          {user?.userEmail} · Complete your merchant verification to start using Lendwise.
        </p>

        {loading ? (
          <LoadingCard />
        ) : (
          <>
            {/* Status Banner */}
            <EkycStatusBanner kycData={kycStatusData} />

            {/* Main form card */}
            <div style={{
              background: "#ffffff",
              borderRadius: 14,
              border: "1px solid #e5edff",
              boxShadow: "0 2px 12px rgba(26,86,219,0.06)",
              padding: "32px",
            }}>
              {/* Stepper */}
              <KycStepper
                steps={STEPS}
                currentStep={currentStep}
              />

              {/* Step tabs (read-only mode allows clicking) */}
              {isReadOnly && (
                <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "2px solid #e5edff" }}>
                  {STEPS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => handleStepClick(i + 1)}
                      style={{
                        padding: "10px 20px",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: currentStep === i + 1 ? 700 : 500,
                        color: currentStep === i + 1 ? "#1a56db" : "#6b7280",
                        borderBottom: currentStep === i + 1 ? "2px solid #1a56db" : "2px solid transparent",
                        marginBottom: -2,
                        transition: "all 0.2s",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Step content */}
              {activeStepDataLoading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                  <Spinner />
                </div>
              ) : (
                <>
                  {currentStep === 1 && (
                    <PersonalDetailsForm
                      key={`personal-${isReadOnly}`}
                      initialData={stepData[1]}
                      readOnly={isReadOnly}
                      onSuccess={() => handleStepSuccess(1)}
                    />
                  )}
                  {currentStep === 2 && (
                    <AddressDetailsForm
                      key={`address-${isReadOnly}`}
                      initialData={stepData[2]}
                      readOnly={isReadOnly}
                      onSuccess={() => handleStepSuccess(2)}
                    />
                  )}
                  {currentStep === 3 && (
                    <BusinessDetailsForm
                      key={`business-${isReadOnly}`}
                      initialData={stepData[3]}
                      readOnly={isReadOnly}
                      onSuccess={() => handleStepSuccess(3)}
                    />
                  )}
                </>
              )}

              {/* Back button (editable mode) */}
              {isEditable && currentStep > 1 && (
                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => setCurrentStep((s) => s - 1)}
                    style={{
                      background: "none",
                      border: "1.5px solid #d1d5db",
                      borderRadius: 8,
                      padding: "10px 20px",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    ← Back
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

function LoadingCard() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 14, padding: 60, border: "1px solid #e5edff" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <Spinner />
        <span style={{ color: "#6b7280", fontSize: 14 }}>Loading eKYC data...</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <>
      <div style={{ width: 32, height: 32, border: "3px solid #e5edff", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}