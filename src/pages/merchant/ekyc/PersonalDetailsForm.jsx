import { useState } from "react";
import { FormField, TextInput, SelectInput } from "../../../components/FormField";
import FileUploadInput from "../../../utils/Fileuploadinput";
import { callApi } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";

const GENDERS = ["Male", "Female", "Other"];
const NATIONALITIES = ["Nepali", "Indian", "Chinese", "American", "British", "Other"];

export default function PersonalDetailsForm({ initialData, readOnly, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    first_name: initialData?.first_name || "",
    middle_name: initialData?.middle_name || "",
    last_name: initialData?.last_name || "",
    gender: initialData?.gender || "",
    mobile_no: initialData?.mobile_no || "",
    date_of_birth: initialData?.date_of_birth || "",
    nationality: initialData?.nationality || "",
    father_name: initialData?.father_name || "",
    grandfather_name: initialData?.grandfather_name || "",
    citizenship_number: initialData?.citizenship_number || "",
    secondary_email_address: initialData?.secondary_email_address || "",
    citizenship_front_image_url: initialData?.citizenship_front_image_url || "",
    citizenship_back_image_url: initialData?.citizenship_back_image_url || "",
  });

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  const setFile = (field) => (url) => setForm((p) => ({ ...p, [field]: url }));

  const validate = () => {
    const required = ["first_name", "last_name", "gender", "mobile_no", "date_of_birth",
      "nationality", "father_name", "grandfather_name", "citizenship_number",
      "citizenship_front_image_url", "citizenship_back_image_url"];
    for (const f of required) {
      if (!form[f]) {
        showToast(`Please fill in: ${f.replace(/_/g, " ")}`, "warning");
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
        url: "/merchant/savePersonalDetails",
        method: "POST",
        body: form,
        validateResponse: true,
        showToast,
      });
      onSuccess();
    } catch {
      // toast shown by callApi
    } finally {
      setLoading(false);
    }
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px" };
  const grid3 = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "18px 24px" };

  return (
    <form onSubmit={handleSubmit}>
      <SectionTitle>Full Name</SectionTitle>
      <div style={grid3}>
        <FormField label="First Name" required>
          <TextInput value={form.first_name} onChange={set("first_name")} placeholder="First name" readOnly={readOnly} required />
        </FormField>
        <FormField label="Middle Name">
          <TextInput value={form.middle_name} onChange={set("middle_name")} placeholder="Middle name" readOnly={readOnly} />
        </FormField>
        <FormField label="Last Name" required>
          <TextInput value={form.last_name} onChange={set("last_name")} placeholder="Last name" readOnly={readOnly} required />
        </FormField>
      </div>

      <SectionTitle>Personal Information</SectionTitle>
      <div style={grid2}>
        <FormField label="Gender" required>
          <SelectInput value={form.gender} onChange={set("gender")} options={GENDERS} placeholder="Select gender" readOnly={readOnly} required />
        </FormField>
        <FormField label="Date of Birth" required>
          <TextInput type="date" value={form.date_of_birth} onChange={set("date_of_birth")} readOnly={readOnly} required />
        </FormField>
        <FormField label="Mobile Number" required>
          <TextInput value={form.mobile_no} onChange={set("mobile_no")} placeholder="98XXXXXXXX" readOnly={readOnly} required />
        </FormField>
        <FormField label="Nationality" required>
          <SelectInput value={form.nationality} onChange={set("nationality")} options={NATIONALITIES} placeholder="Select nationality" readOnly={readOnly} required />
        </FormField>
        <FormField label="Secondary Email">
          <TextInput type="email" value={form.secondary_email_address} onChange={set("secondary_email_address")} placeholder="Optional email" readOnly={readOnly} />
        </FormField>
      </div>

      <SectionTitle>Family Details</SectionTitle>
      <div style={grid2}>
        <FormField label="Father's Name" required>
          <TextInput value={form.father_name} onChange={set("father_name")} placeholder="Father's full name" readOnly={readOnly} required />
        </FormField>
        <FormField label="Grandfather's Name" required>
          <TextInput value={form.grandfather_name} onChange={set("grandfather_name")} placeholder="Grandfather's full name" readOnly={readOnly} required />
        </FormField>
      </div>

      <SectionTitle>Citizenship Details</SectionTitle>
      <div style={{ ...grid2, marginBottom: 20 }}>
        <FormField label="Citizenship Number" required>
          <TextInput value={form.citizenship_number} onChange={set("citizenship_number")} placeholder="e.g. 12345678" readOnly={readOnly} required />
        </FormField>
      </div>
      <div style={grid2}>
        <FileUploadInput
          label="Citizenship Front Image"
          value={form.citizenship_front_image_url}
          onChange={setFile("citizenship_front_image_url")}
          readOnly={readOnly}
          required
        />
        <FileUploadInput
          label="Citizenship Back Image"
          value={form.citizenship_back_image_url}
          onChange={setFile("citizenship_back_image_url")}
          readOnly={readOnly}
          required
        />
      </div>

      {!readOnly && (
        <div style={{ marginTop: 28, display: "flex", justifyContent: "flex-end" }}>
          <SubmitButton loading={loading} label="Save & Continue →" />
        </div>
      )}
    </form>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a56db", textTransform: "uppercase", letterSpacing: 0.5, margin: "24px 0 14px", paddingBottom: 6, borderBottom: "1px solid #e5edff" }}>
      {children}
    </div>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        height: 44,
        padding: "0 28px",
        background: loading ? "#93c5fd" : "#1a56db",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
      {label}
    </button>
  );
}