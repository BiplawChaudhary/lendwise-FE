import { useState } from "react";
import { FormField, TextInput, SelectInput } from "../../../components/FormField";
import { callApi } from "../../../utils/api";
import { useToast } from "../../../context/ToastContext";
import { PROVINCES, getDistricts, getMunicipalities } from "../../../config/NepalData";

function AddressSection({ title, prefix, data, onChange, readOnly }) {
  const districts = getDistricts(data.province);
  const municipalities = getMunicipalities(data.province, data.district);

  const set = (field) => (e) => {
    const val = e.target.value;
    // Reset dependent fields when parent changes
    if (field === "province") {
      onChange(prefix, { ...data, province: val, district: "", municipality: "" });
    } else if (field === "district") {
      onChange(prefix, { ...data, district: val, municipality: "" });
    } else {
      onChange(prefix, { ...data, [field]: val });
    }
  };

  const grid2 = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px" };

  return (
    <div style={{ background: "#f8faff", borderRadius: 10, padding: "20px", border: "1px solid #e5edff" }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#1a56db", marginBottom: 16 }}>{title}</div>
      <div style={grid2}>
        <FormField label="Province" required>
          <SelectInput
            value={data.province}
            onChange={set("province")}
            options={PROVINCES}
            placeholder="Select Province"
            readOnly={readOnly}
            required
          />
        </FormField>
        <FormField label="District" required>
          <SelectInput
            value={data.district}
            onChange={set("district")}
            options={districts}
            placeholder={data.province ? "Select District" : "Select Province first"}
            readOnly={readOnly || !data.province}
            required
          />
        </FormField>
        <FormField label="Municipality / VDC" required>
          <SelectInput
            value={data.municipality}
            onChange={set("municipality")}
            options={municipalities}
            placeholder={data.district ? "Select Municipality" : "Select District first"}
            readOnly={readOnly || !data.district}
            required
          />
        </FormField>
        <FormField label="Ward No." required>
          <TextInput value={data.ward_no} onChange={set("ward_no")} placeholder="e.g. 3" readOnly={readOnly} required />
        </FormField>
        <FormField label="Tole / Street" required>
          <TextInput value={data.tole} onChange={set("tole")} placeholder="e.g. Lazimpat" readOnly={readOnly} required />
        </FormField>
      </div>
    </div>
  );
}

export default function AddressDetailsForm({ initialData, readOnly, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sameAsPermanent, setSameAsPermanent] = useState(false);

  const [permanent, setPermanent] = useState({
    province: initialData?.permanent?.province || "",
    district: initialData?.permanent?.district || "",
    municipality: initialData?.permanent?.municipality || "",
    ward_no: initialData?.permanent?.ward_no || "",
    tole: initialData?.permanent?.tole || "",
  });

  const [temporary, setTemporary] = useState({
    province: initialData?.temporary?.province || "",
    district: initialData?.temporary?.district || "",
    municipality: initialData?.temporary?.municipality || "",
    ward_no: initialData?.temporary?.ward_no || "",
    tole: initialData?.temporary?.tole || "",
  });

  const handleChange = (section, values) => {
    if (section === "permanent") {
      setPermanent(values);
      if (sameAsPermanent) setTemporary(values);
    } else {
      setTemporary(values);
    }
  };

  const handleSameToggle = (e) => {
    const checked = e.target.checked;
    setSameAsPermanent(checked);
    if (checked) setTemporary({ ...permanent });
  };

  const validate = (addr, label) => {
    for (const f of ["province", "district", "municipality", "ward_no", "tole"]) {
      if (!addr[f]) {
        showToast(`Please fill in ${label}: ${f.replace(/_/g, " ")}`, "warning");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate(permanent, "Permanent Address")) return;
    if (!validate(temporary, "Temporary Address")) return;

    setLoading(true);
    try {
      await callApi({
        url: "/merchant/saveAddressDetails",
        method: "POST",
        body: { permanent, temporary },
        validateResponse: true,
        showToast,
      });
      onSuccess();
    } catch {
      // toast shown
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <AddressSection
          title="🏠 Permanent Address"
          prefix="permanent"
          data={permanent}
          onChange={handleChange}
          readOnly={readOnly}
        />

        {!readOnly && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "#374151", fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={sameAsPermanent}
              onChange={handleSameToggle}
              style={{ width: 16, height: 16, accentColor: "#1a56db" }}
            />
            Temporary address is same as permanent address
          </label>
        )}

        <AddressSection
          title="🏢 Temporary Address"
          prefix="temporary"
          data={temporary}
          onChange={handleChange}
          readOnly={readOnly || sameAsPermanent}
        />
      </div>

      {!readOnly && (
        <div style={{ marginTop: 28, display: "flex", justifyContent: "space-between" }}>
          <div />
          <button
            type="submit"
            disabled={loading}
            style={{
              height: 44, padding: "0 28px", background: loading ? "#93c5fd" : "#1a56db",
              color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
            }}
          >
            {loading && <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />}
            Save & Continue →
          </button>
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </form>
  );
}