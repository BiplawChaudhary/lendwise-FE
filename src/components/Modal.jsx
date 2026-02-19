import { useEffect } from "react";

/**
 * Modal – generic overlay modal
 * Props: title, onClose, children, width?, footer?
 */
export default function Modal({ title, onClose, children, footer, width = 520 }) {
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
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(3px)",
          zIndex: 9000,
          animation: "fadeIn 0.15s ease",
        }}
      />

      {/* Panel */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9001,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20, pointerEvents: "none",
      }}>
        <div style={{
          background: "#fff",
          borderRadius: 14,
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          animation: "slideUp 0.2s ease",
          pointerEvents: "all",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #e5edff", flexShrink: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</span>
            <button
              onClick={onClose}
              style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 18, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#dc2626"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.color = "#374151"; }}
            >
              ×
            </button>
          </div>

          {/* Body – scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div style={{ padding: "14px 24px", borderTop: "1px solid #e5edff", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
              {footer}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(20px);opacity:0 } to { transform:translateY(0);opacity:1 } }
        @keyframes shimmer { from { background-position:200% 0 } to { background-position:-200% 0 } }
      `}</style>
    </>
  );
}

// ── Reusable button variants ──────────────────────────────────
export function PrimaryBtn({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: 40, padding: "0 22px", background: disabled || loading ? "#93c5fd" : "#1a56db",
        color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function DangerBtn({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        height: 40, padding: "0 22px", background: disabled || loading ? "#fca5a5" : "#dc2626",
        color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
        cursor: disabled || loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8,
      }}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 40, padding: "0 18px", background: "#f9fafb", color: "#374151",
        border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function Spinner() {
  return <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />;
}