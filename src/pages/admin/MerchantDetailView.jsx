import { getFileStreamUrl } from "../../utils/Fileuploadinput";

/**
 * MerchantDetailView – renders full merchant info in read-only sections.
 * Used in both Manage eKYC (with approve/reject actions) and Manage Merchants.
 */
export default function MerchantDetailView({ data }) {
  if (!data) return null;

  const { userPersonalDetails: p, userAddressDetails: a, userBusinessDetails: b, userAccountProfile: acc, userEkcStatus: kyc } = data;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* KYC Status Banner */}
      {kyc && <KycBadge status={kyc.kyc_status} remarks={kyc.admin_remarks} reviewerName={kyc.reviewer_name} submittedAt={kyc.submitted_at} />}

      {/* Account Info */}
      {acc && (
        <Section title="Account">
          <Grid2>
            <Field label="Email" value={acc.user_email} />
            <Field label="Role" value={acc.user_role} />
            <Field label="User ID" value={acc.user_id} />
            <Field label="Active" value={acc.is_user_active ? "✅ Active" : "🔴 Inactive"} />
          </Grid2>
        </Section>
      )}

      {/* Personal Details */}
      {p && (
        <Section title="Personal Details">
          <Grid2>
            <Field label="Full Name" value={[p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ")} />
            <Field label="Gender" value={p.gender} />
            <Field label="Date of Birth" value={p.date_of_birth} />
            <Field label="Mobile" value={p.mobile_no} />
            <Field label="Nationality" value={p.nationality} />
            <Field label="Father's Name" value={p.father_name} />
            <Field label="Grandfather's Name" value={p.grandfather_name} />
            <Field label="Citizenship No." value={p.citizenship_number} />
            {p.secondary_email_address && <Field label="Secondary Email" value={p.secondary_email_address} />}
          </Grid2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <ImagePreview label="Citizenship Front" url={p.citizenship_front_image_url} />
            <ImagePreview label="Citizenship Back" url={p.citizenship_back_image_url} />
          </div>
        </Section>
      )}

      {/* Address Details */}
      {a && (
        <Section title="Address Details">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <AddressBlock title="Permanent Address" addr={a.permanent} />
            <AddressBlock title="Temporary Address" addr={a.temporary} />
          </div>
        </Section>
      )}

      {/* Business Details */}
      {b && (
        <Section title="Business Details">
          <Grid2>
            <Field label="Business Name" value={b.business_name} />
            <Field label="Business Type" value={b.business_type?.replace(/_/g, " ")} />
            <Field label="PAN Number" value={b.business_pan_number} />
            <Field label="Registration No." value={b.business_registration_number} />
            <Field label="Registration Date" value={b.business_registration_date} />
            <Field label="Phone" value={b.business_phone} />
            <Field label="Email" value={b.business_email} />
            <Field label="Province" value={b.province} />
            <Field label="District" value={b.district} />
            <Field label="Municipality" value={b.municipality} />
            <Field label="Tole" value={b.tole} />
            <Field label="Ward No." value={b.ward_no} />
            <Field label="Street" value={b.street_address} />
          </Grid2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
            <ImagePreview label="Business PAN" url={b.business_pan_image_url} />
            <ImagePreview label="Shop Board" url={b.shop_board_image_url} />
            <ImagePreview label="User Holding PAN" url={b.user_holding_pan_image_url} />
            <ImagePreview label="Shop Interior" url={b.shop_interior_image_url} />
            <div style={{ gridColumn: "1 / -1" }}>
              <ImagePreview label="Registration Certificate" url={b.business_registration_certificate_url} />
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#1a56db", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid #e5edff" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Grid2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>{children}</div>;
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#111827", fontWeight: 500 }}>{value || "—"}</div>
    </div>
  );
}

function AddressBlock({ title, addr }) {
  return (
    <div style={{ background: "#f8faff", borderRadius: 8, padding: 14, border: "1px solid #e5edff" }}>
      <div style={{ fontWeight: 700, fontSize: 12, color: "#374151", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Field label="Province" value={addr?.province} />
        <Field label="District" value={addr?.district} />
        <Field label="Municipality" value={addr?.municipality} />
        <Field label="Tole" value={addr?.tole} />
        <Field label="Ward No." value={addr?.ward_no} />
      </div>
    </div>
  );
}

function ImagePreview({ label, url }) {
  const streamUrl = getFileStreamUrl(url);
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", marginBottom: 6 }}>{label}</div>
      {streamUrl ? (
        <a href={streamUrl} target="_blank" rel="noreferrer">
          <img
            src={streamUrl}
            alt={label}
            style={{ width: "100%", maxHeight: 160, objectFit: "contain", borderRadius: 8, border: "1px solid #e5edff", background: "#f9fafb", cursor: "pointer" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        </a>
      ) : (
        <div style={{ height: 80, background: "#f3f4f6", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 12 }}>
          No image
        </div>
      )}
    </div>
  );
}

function KycBadge({ status, remarks, reviewerName, submittedAt }) {
  const cfg = {
    APPROVED: { bg: "#d1fae5", border: "#6ee7b7", color: "#065f46", icon: "✅" },
    REJECTED: { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b", icon: "❌" },
    UNDER_REVIEW: { bg: "#dbeafe", border: "#93c5fd", color: "#1e40af", icon: "🔍" },
    PENDING: { bg: "#fef3c7", border: "#fcd34d", color: "#92400e", icon: "⏳" },
  }[status] || { bg: "#f3f4f6", border: "#d1d5db", color: "#374151", icon: "ℹ️" };

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ fontSize: 18 }}>{cfg.icon}</span>
      <div>
        <div style={{ fontWeight: 700, color: cfg.color, fontSize: 14 }}>KYC Status: {status?.replace(/_/g, " ")}</div>
        {remarks && <div style={{ color: cfg.color, fontSize: 12, marginTop: 2 }}>Remarks: {remarks}</div>}
        {reviewerName && <div style={{ color: cfg.color, fontSize: 12 }}>Reviewed by: {reviewerName}</div>}
        {submittedAt && <div style={{ color: cfg.color, fontSize: 11, marginTop: 2, opacity: 0.8 }}>Submitted: {new Date(submittedAt).toLocaleString()}</div>}
      </div>
    </div>
  );
}