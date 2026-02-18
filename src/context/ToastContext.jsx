import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  const colors = {
    success: { bg: "#e6f4ea", border: "#34a853", text: "#1e7e34", icon: "✓" },
    error: { bg: "#fce8e6", border: "#ea4335", text: "#c5221f", icon: "✕" },
    info: { bg: "#e8f0fe", border: "#1a73e8", text: "#1558b0", icon: "ℹ" },
    warning: { bg: "#fef7e0", border: "#fbbc04", text: "#9c6500", icon: "⚠" },
  };

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((toast) => {
        const style = colors[toast.type] || colors.info;
        return (
          <div
            key={toast.id}
            style={{
              background: style.bg,
              border: `1px solid ${style.border}`,
              color: style.text,
              padding: "12px 16px",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 10,
              minWidth: 280,
              maxWidth: 380,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              animation: "slideIn 0.3s ease",
            }}
          >
            <span style={{ fontWeight: "bold", fontSize: 16 }}>{style.icon}</span>
            <span style={{ flex: 1, fontSize: 14 }}>{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              style={{ background: "none", border: "none", cursor: "pointer", color: style.text, fontSize: 16, lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}