// EkycStatusBanner – shows a colored status banner for KYC state

const STATUS_CONFIG = {
  PENDING: {
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    icon: "⏳",
    label: "Pending",
    message: "Your eKYC verification is pending. Please complete all steps below.",
  },
  UNDER_REVIEW: {
    color: "#1e40af",
    bg: "#dbeafe",
    border: "#93c5fd",
    icon: "🔍",
    label: "Under Review",
    message: "Your eKYC has been submitted and is currently under review by our team.",
  },
  COMPLETED: {
    color: "#065f46",
    bg: "#d1fae5",
    border: "#6ee7b7",
    icon: "✅",
    label: "Verified",
    message: "Your eKYC has been successfully verified. You can view your submitted details below.",
  },
  REJECTED: {
    color: "#991b1b",
    bg: "#fee2e2",
    border: "#fca5a5",
    icon: "❌",
    label: "Rejected",
    message: "Your eKYC has been rejected. Please review the remarks below and resubmit.",
  },
};

export default function EkycStatusBanner({ kycData }) {
  if (!kycData) return null;

  const status = kycData.kyc_status || "PENDING";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <div style={{
      background: config.bg,
      border: `1px solid ${config.border}`,
      borderRadius: 12,
      padding: "16px 20px",
      marginBottom: 28,
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{config.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: config.color, fontSize: 15, marginBottom: 4 }}>
          eKYC Status: {config.label}
        </div>
        <div style={{ color: config.color, fontSize: 13, lineHeight: 1.5 }}>
          {config.message}
        </div>

        {/* Show rejection details */}
        {status === "REJECTED" && (
          <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 8, fontSize: 13 }}>
            {kycData.rejection_category && (
              <div style={{ marginBottom: 4 }}>
                <strong style={{ color: config.color }}>Category: </strong>
                <span style={{ color: config.color }}>{kycData.rejection_category}</span>
              </div>
            )}
            {kycData.rejection_reason && (
              <div style={{ marginBottom: 4 }}>
                <strong style={{ color: config.color }}>Reason: </strong>
                <span style={{ color: config.color }}>{kycData.rejection_reason}</span>
              </div>
            )}
            {kycData.admin_remarks && (
              <div>
                <strong style={{ color: config.color }}>Admin Remarks: </strong>
                <span style={{ color: config.color }}>{kycData.admin_remarks}</span>
              </div>
            )}
            {kycData.resubmission_count > 0 && (
              <div style={{ marginTop: 6, color: config.color }}>
                Resubmission attempts: {kycData.resubmission_count}
              </div>
            )}
          </div>
        )}

        {/* Progress for UNDER_REVIEW */}
        {(status === "UNDER_REVIEW" || status === "COMPLETED") && kycData.submitted_at && (
          <div style={{ marginTop: 8, fontSize: 12, color: config.color, opacity: 0.8 }}>
            Submitted: {new Date(kycData.submitted_at).toLocaleString()}
            {kycData.reviewed_at && ` · Reviewed: ${new Date(kycData.reviewed_at).toLocaleString()}`}
          </div>
        )}
      </div>
    </div>
  );
}