import { useState, useRef } from "react";
import { useToast } from "../context/ToastContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9004";

/**
 * uploadFile – uploads a file to the backend and returns the fileUrl.
 * Does NOT use callApi (because it's multipart/form-data, not JSON).
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("uploadedFile", file);

  const headers = {
    urn: "LENDWISE_WEB",
  };

  const authToken = sessionStorage.getItem("authToken");
  if (authToken) {
    headers["authToken"] = authToken;
  }

  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await response.json();

  if (json.apiResponseCode === 200) {
    return json.apiResponseData.data.fileUrl; // e.g. "/files/stream/abc.webp"
  } else {
    throw new Error(json.apiResponseMessage || "File upload failed.");
  }
}

/**
 * getFileStreamUrl – converts the relative fileUrl to a full stream URL.
 */
export function getFileStreamUrl(fileUrl) {
  if (!fileUrl) return null;
  if (fileUrl.startsWith("http")) return fileUrl;
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:9004";
  return `${base}/lendwisemw/api/v1${fileUrl}`;
}

/**
 * FileUploadInput – a reusable file upload component.
 *
 * Props:
 * - label: string — field label
 * - value: string — current fileUrl (from API)
 * - onChange: (fileUrl: string) => void — called after successful upload
 * - accept: string — file types, e.g. "image/*"
 * - readOnly: boolean — if true, shows image only (no upload)
 * - required: boolean
 */
export default function FileUploadInput({ label, value, onChange, accept = "image/*", readOnly = false, required = false }) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const fileUrl = await uploadFile(file);
      onChange(fileUrl);
      showToast(`${label} uploaded successfully.`, "success");
    } catch (err) {
      showToast(err.message || "Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const streamUrl = getFileStreamUrl(value);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    display: "flex",
    gap: 4,
  };

  const previewBoxStyle = {
    border: "1.5px dashed #d1d5db",
    borderRadius: 10,
    padding: 12,
    minHeight: 120,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    background: readOnly ? "#f9fafb" : "#f8faff",
    cursor: readOnly ? "default" : "pointer",
    transition: "border-color 0.2s",
  };

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      <div
        style={previewBoxStyle}
        onClick={() => !readOnly && !uploading && inputRef.current?.click()}
        onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.borderColor = "#1a56db"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
      >
        {streamUrl ? (
          <>
            <img
              src={streamUrl}
              alt={label}
              style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {!readOnly && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>Click to replace</span>
            )}
          </>
        ) : (
          <>
            <div style={{ fontSize: 28, color: "#9ca3af" }}>📁</div>
            {!readOnly && (
              <>
                <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                  {uploading ? "Uploading..." : "Click to upload"}
                </span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>PNG, JPG, WEBP up to 5MB</span>
              </>
            )}
            {readOnly && (
              <span style={{ fontSize: 13, color: "#9ca3af" }}>No file uploaded</span>
            )}
          </>
        )}

        {uploading && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
          }}>
            <div style={{
              width: 24, height: 24,
              border: "3px solid #e5edff",
              borderTopColor: "#1a56db",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }} />
          </div>
        )}
      </div>

      {!readOnly && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: "none" }}
          disabled={uploading}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}