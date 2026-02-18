// FormField – reusable labeled input/select component

export function FormField({ label, required, children, hint }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", gap: 4 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      {children}
      {hint && <span style={{ fontSize: 11, color: "#9ca3af" }}>{hint}</span>}
    </div>
  );
}

const inputStyle = (readOnly) => ({
  height: 42,
  padding: "0 12px",
  border: "1.5px solid #d1d5db",
  borderRadius: 8,
  fontSize: 14,
  color: readOnly ? "#6b7280" : "#111827",
  background: readOnly ? "#f9fafb" : "#ffffff",
  outline: "none",
  width: "100%",
  cursor: readOnly ? "not-allowed" : "auto",
  boxSizing: "border-box",
});

export function TextInput({ value, onChange, placeholder, readOnly, disabled, type = "text", required, name }) {
  return (
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled || readOnly}
      required={required}
      style={inputStyle(readOnly)}
      onFocus={(e) => { if (!readOnly) e.target.style.borderColor = "#1a56db"; }}
      onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
    />
  );
}

export function SelectInput({ value, onChange, options, placeholder, readOnly, disabled, required, name }) {
  if (readOnly) {
    return <input type="text" value={value || ""} readOnly style={inputStyle(true)} />;
  }
  return (
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      required={required}
      style={{ ...inputStyle(false), cursor: "pointer", appearance: "auto" }}
      onFocus={(e) => { e.target.style.borderColor = "#1a56db"; }}
      onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={typeof opt === "string" ? opt : opt.value} value={typeof opt === "string" ? opt : opt.value}>
          {typeof opt === "string" ? opt : opt.label}
        </option>
      ))}
    </select>
  );
}