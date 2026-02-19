import { useState, useRef, useEffect } from "react";
import { useToast } from "../context/ToastContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:9004";

/**
 * uploadFile – uploads a file to the backend and returns the fileUrl.
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("uploadedFile", file);

  const headers = { urn: "LENDWISE_WEB" };
  const authToken = sessionStorage.getItem("authToken");
  if (authToken) headers["authToken"] = authToken;

  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  const json = await response.json();
  if (json.apiResponseCode === 200) {
    return json.apiResponseData.data.fileUrl;
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
  return `${BASE_URL}${fileUrl}`;
}

// ── Image Viewer Modal ────────────────────────────────────────
function ImageViewerModal({ streamUrl, label, onClose }) {
  // Close on Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.75)",
          zIndex: 9000,
          backdropFilter: "blur(3px)",
          animation: "fadeIn 0.18s ease",
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9001,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "20px 16px",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 14,
            width: "100%",
            maxWidth: 780,
            maxHeight: "calc(100vh - 40px)",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
            animation: "slideUp 0.2s ease",
            pointerEvents: "all",
          }}
        >
          {/* Header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "1px solid #e5edff",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>🖼️</span>
              <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>{label}</span>
            </div>
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "none",
                background: "#f3f4f6",
                cursor: "pointer",
                fontSize: 18,
                color: "#374151",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
            >
              ×
            </button>
          </div>

          {/* Scrollable image area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}>
            <img
              src={streamUrl}
              alt={label}
              style={{
                maxWidth: "100%",
                borderRadius: 8,
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                display: "block",
              }}
              onError={(e) => {
                e.target.replaceWith(Object.assign(document.createElement("div"), {
                  innerText: "⚠️ Failed to load image.",
                  style: "color:#ef4444;font-size:14px;padding:40px;text-align:center;",
                }));
              }}
            />
          </div>

          {/* Footer */}
          <div style={{
            padding: "12px 20px",
            borderTop: "1px solid #e5edff",
            display: "flex",
            justifyContent: "flex-end",
            flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: "8px 20px",
                background: "#1a56db",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ── FileUploadInput ───────────────────────────────────────────
/**
 * Props:
 * - label: string
 * - value: string — relative fileUrl e.g. "/files/stream/abc.webp"
 * - onChange: (fileUrl: string) => void
 * - accept: string
 * - readOnly: boolean
 * - required: boolean
 */
export default function FileUploadInput({ label, value, onChange, accept = "image/*", readOnly = false, required = false }) {
  const { showToast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const inputRef = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const streamUrl = getFileStreamUrl(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* Label */}
      <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", gap: 4 }}>
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>

      {/* Upload / preview box */}
      <div
        style={{
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
          position: "relative",
        }}
        onClick={() => !readOnly && !uploading && inputRef.current?.click()}
        onMouseEnter={(e) => { if (!readOnly) e.currentTarget.style.borderColor = "#1a56db"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d1d5db"; }}
      >
        {streamUrl ? (
          <>
            <img
              src={streamUrl}
              alt={label}
              style={{ maxHeight: 100, maxWidth: "100%", borderRadius: 6, objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
            {!readOnly && (
              <span style={{ fontSize: 11, color: "#6b7280" }}>Click to replace</span>
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

        {/* Uploading spinner overlay */}
        {uploading && (
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(255,255,255,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
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

      {/* View button — shown whenever a file exists (both editable AND read-only) */}
      {streamUrl && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          style={{
            alignSelf: "flex-start",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 6,
            color: "#1a56db",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          View Image
        </button>
      )}

      {/* Hidden file input */}
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

      {/* Modal */}
      {modalOpen && (
        <ImageViewerModal
          streamUrl={streamUrl}
          label={label}
          onClose={() => setModalOpen(false)}
        />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}