import { useState } from "react";
import { FormField, TextInput, SelectInput } from "../../../components/FormField";
import FileUploadInput from "../../../utils/Fileuploadinput";
import { callApi } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { PROVINCES, getDistricts, getMunicipalities } from "../../../config/NepalData";

const BUSINESS_TYPES = [
  { value: "SOLE_PROPRIETOR", label: "Sole Proprietor" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "PRIVATE_LIMITED", label: "Private Limited" },
  { value: "PUBLIC_LIMITED", label: "Public Limited" },
  { value: "CO_OPERATIVE", label: "Co-operative" },
  { value: "NGO_INGO", label: "NGO / INGO" },
  { value: "OTHER", label: "Other" },
];

export default function BusinessDetailsForm({ initialData, readOnly, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fonepayId : initialData?.fonepay_id || "",
    businessName: initialData?.business_name || "",
    businessType: initialData?.business_type || "",
    businessPanNumber: initialData?.business_pan_number || "",
    businessRegistrationNumber: initialData?.business_registration_number || "",
    businessRegistrationDate: initialData?.business_registration_date || "",
    province: initialData?.province || "",
    district: initialData?.district || "",
    municipality: initialData?.municipality || "",
    tole: initialData?.tole || "",
    wardNo: initialData?.ward_no || "",
    streetAddress: initialData?.street_address || "",
    businessPhone: initialData?.business_phone || "",
    businessEmail: initialData?.business_email || "",
    businessPanImageUrl: initialData?.business_pan_image_url || "",
    shopBoardImageUrl: initialData?.shop_board_image_url || "",
    userHoldingPanImageUrl: initialData?.user_holding_pan_image_url || "",
    shopInteriorImageUrl: initialData?.shop_interior_image_url || "",
    businessRegistrationCertificateUrl: initialData?.business_registration_certificate_url || "",
  });

  const set = (field) => (e) => {
    const val = e.target.value;
    if (field === "province") {
      setForm((p) => ({ ...p, province: val, district: "", municipality: "" }));
    } else if (field === "district") {
      setForm((p) => ({ ...p, district: val, municipality: "" }));
    } else {
      setForm((p) => ({ ...p, [field]: val }));
    }
  };
  const setFile = (field) => (url) => setForm((p) => ({ ...p, [field]: url }));

  const validate = () => {
    const requiredFields = [
      ["fonepayId", "FonePay Id"],
      ["businessName", "Business Name"],
      ["businessType", "Business Type"],
      ["businessPanNumber", "Business PAN Number"],
      ["businessRegistrationNumber", "Registration Number"],
      ["businessRegistrationDate", "Registration Date"],
      ["province", "Province"],
      ["district", "District"],
      ["municipality", "Municipality"],
      ["tole", "Tole"],
      ["wardNo", "Ward No."],
      ["businessPhone", "Business Phone"],
      ["businessEmail", "Business Email"],
      ["businessPanImageUrl", "Business PAN Image"],
      ["shopBoardImageUrl", "Shop Board Image"],
      ["userHoldingPanImageUrl", "User Holding PAN Image"],
      ["shopInteriorImageUrl", "Shop Interior Image"],
      ["businessRegistrationCertificateUrl", "Registration Certificate"],
    ];
    for (const [field, label] of requiredFields) {
      if (!form[field]) {
        showToast(`Please fill in: ${label}`, "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await callApi({
        url: "/merchant/saveBusinessDetails",
        method: "POST",
        body: form,
        validateResponse: true,
        showToast,
      });

      // Update kycStatus in sessionStorage to UNDER_REVIEW
      sessionStorage.setItem("kycStatus", "UNDER_REVIEW");

      onSuccess();
    } catch {
      // toast shown
    } finally {
      setLoading(false);
    }
  };

  const districts = getDistricts(form.province);
  const municipalities = getMunicipalities(form.province, form.district);

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" };

  return (
    <form onSubmit={handleSubmit}>
      <Section title="Business Information">
        <div style={grid2}>
        <FormField label="FonePay Id" required>
            <TextInput value={form.fonepayId} onChange={set("fonepayId")} placeholder="465786907912345" readOnly={readOnly} required />
          </FormField>
          <FormField label="Business Name" required>
            <TextInput value={form.businessName} onChange={set("businessName")} placeholder="ABC Traders" readOnly={readOnly} required />
          </FormField>
          <FormField label="Business Type" required>
            <SelectInput value={form.businessType} onChange={set("businessType")} options={BUSINESS_TYPES} placeholder="Select type" readOnly={readOnly} required />
          </FormField>
          <FormField label="Business PAN Number" required>
            <TextInput value={form.businessPanNumber} onChange={set("businessPanNumber")} placeholder="123456789" readOnly={readOnly} required />
          </FormField>
          <FormField label="Registration Number" required>
            <TextInput value={form.businessRegistrationNumber} onChange={set("businessRegistrationNumber")} placeholder="REG-XXXXX" readOnly={readOnly} required />
          </FormField>
          <FormField label="Registration Date" required>
            <TextInput type="date" value={form.businessRegistrationDate} onChange={set("businessRegistrationDate")} readOnly={readOnly} required />
          </FormField>
        </div>
      </Section>

      <Section title="Contact Information">
        <div style={grid2}>
          <FormField label="Business Phone" required>
            <TextInput value={form.businessPhone} onChange={set("businessPhone")} placeholder="98XXXXXXXX" readOnly={readOnly} required />
          </FormField>
          <FormField label="Business Email" required>
            <TextInput type="email" value={form.businessEmail} onChange={set("businessEmail")} placeholder="business@email.com" readOnly={readOnly} required />
          </FormField>
        </div>
      </Section>

      <Section title="Business Address">
        <div style={grid2}>
          <FormField label="Province" required>
            <SelectInput value={form.province} onChange={set("province")} options={PROVINCES} placeholder="Select Province" readOnly={readOnly} required />
          </FormField>
          <FormField label="District" required>
            <SelectInput value={form.district} onChange={set("district")} options={districts} placeholder={form.province ? "Select District" : "Select Province first"} readOnly={readOnly || !form.province} required />
          </FormField>
          <FormField label="Municipality / VDC" required>
            <SelectInput value={form.municipality} onChange={set("municipality")} options={municipalities} placeholder={form.district ? "Select Municipality" : "Select District first"} readOnly={readOnly || !form.district} required />
          </FormField>
          <FormField label="Ward No." required>
            <TextInput value={form.wardNo} onChange={set("wardNo")} placeholder="e.g. 3" readOnly={readOnly} required />
          </FormField>
          <FormField label="Tole" required>
            <TextInput value={form.tole} onChange={set("tole")} placeholder="e.g. Lazimpat" readOnly={readOnly} required />
          </FormField>
          <FormField label="Street Address">
            <TextInput value={form.streetAddress} onChange={set("streetAddress")} placeholder="Near City Center" readOnly={readOnly} />
          </FormField>
        </div>
      </Section>

      <Section title="Documents & Images">
        <div style={grid2}>
          <FileUploadInput label="Business PAN Image" value={form.businessPanImageUrl} onChange={setFile("businessPanImageUrl")} readOnly={readOnly} required />
          <FileUploadInput label="Shop Board Image" value={form.shopBoardImageUrl} onChange={setFile("shopBoardImageUrl")} readOnly={readOnly} required />
          <FileUploadInput label="User Holding PAN Image" value={form.userHoldingPanImageUrl} onChange={setFile("userHoldingPanImageUrl")} readOnly={readOnly} required />
          <FileUploadInput label="Shop Interior Image" value={form.shopInteriorImageUrl} onChange={setFile("shopInteriorImageUrl")} readOnly={readOnly} required />
          <div style={{ gridColumn: "1 / -1" }}>
            <FileUploadInput label="Business Registration Certificate" value={form.businessRegistrationCertificateUrl} onChange={setFile("businessRegistrationCertificateUrl")} readOnly={readOnly} required />
          </div>
        </div>
      </Section>

      {!readOnly && (
        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44, padding: "0 28px",
              background: loading ? "#93c5fd" : "#16a34a",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
            Submit eKYC ✓
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: "#1a56db", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 14px", paddingBottom: 6, borderBottom: "1px solid #e5edff" }}>
        {title}
      </div>
      {children}
    </div>
  );
}