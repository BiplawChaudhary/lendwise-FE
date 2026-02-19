import { useState, useMemo } from "react";

/**
 * DataTable – Generic, reusable table with:
 *  - Type-to-search across all columns
 *  - Front-end pagination with configurable page size
 *  - Horizontally scrollable data columns
 *  - Fixed (sticky) action column on the right
 *  - Configurable action buttons per row
 *
 * Props:
 * @param {string}   title        - Table heading
 * @param {Array}    columns      - [{ key, label, render? }]
 * @param {Array}    data         - Array of row objects
 * @param {Array}    actions      - [{ label, icon, onClick, style?, show? }]
 * @param {boolean}  loading      - Show skeleton rows
 * @param {string}   emptyMessage - Text when no rows found
 */
export default function DataTable({ title, columns = [], data = [], actions = [], loading = false, emptyMessage = "No records found." }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filter ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  // ── Pagination ────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handlePageSize = (e) => { setPageSize(Number(e.target.value)); setPage(1); };

  const hasActions = actions.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#fff", borderRadius: 14, border: "1px solid #e5edff", boxShadow: "0 2px 12px rgba(26,86,219,0.06)", overflow: "hidden" }}>

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "16px 20px", borderBottom: "1px solid #e5edff", flexShrink: 0 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{title}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search..."
              style={{ paddingLeft: 32, paddingRight: 12, height: 36, border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#111827", outline: "none", width: 220, background: "#f8faff" }}
              onFocus={(e) => { e.target.style.borderColor = "#1a56db"; }}
              onBlur={(e) => { e.target.style.borderColor = "#d1d5db"; }}
            />
          </div>
          {/* Page size */}
          <select
            value={pageSize}
            onChange={handlePageSize}
            style={{ height: 36, padding: "0 10px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, color: "#374151", outline: "none", background: "#f8faff", cursor: "pointer" }}
          >
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
          </select>
        </div>
      </div>

      {/* ── Table wrapper (scrollable in both axes) ──────────── */}
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f0f4ff", position: "sticky", top: 0, zIndex: 2 }}>
              <th style={thStyle}>#</th>
              {columns.map((col) => (
                <th key={col.key} style={thStyle}>{col.label}</th>
              ))}
              {hasActions && (
                <th style={{ ...thStyle, ...stickyRightStyle, background: "#f0f4ff", zIndex: 3 }}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={tdStyle}><Skeleton width={24} /></td>
                  {columns.map((col) => (
                    <td key={col.key} style={tdStyle}><Skeleton /></td>
                  ))}
                  {hasActions && (
                    <td style={{ ...tdStyle, ...stickyRightStyle, background: "#fff" }}><Skeleton width={80} /></td>
                  )}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 2 : 1)} style={{ textAlign: "center", padding: "48px 20px", color: "#9ca3af", fontSize: 14 }}>
                  {search ? `No results for "${search}"` : emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.12s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f8faff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = ""; }}
                >
                  <td style={{ ...tdStyle, color: "#9ca3af", width: 40 }}>{(safePage - 1) * pageSize + rowIdx + 1}</td>
                  {columns.map((col) => (
                    <td key={col.key} style={tdStyle}>
                      {col.render ? col.render(row[col.key], row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                  {hasActions && (
                    <td style={{ ...tdStyle, ...stickyRightStyle, background: "inherit" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {actions.map((action, ai) => {
                          if (action.show && !action.show(row)) return null;
                          return (
                            <ActionButton key={ai} action={action} row={row} />
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination bar ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #e5edff", flexShrink: 0, background: "#fafbff" }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>
          {filtered.length === 0 ? "0 records" : `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length} records`}
          {search && ` (filtered from ${data.length})`}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <PageBtn onClick={() => setPage(1)} disabled={safePage === 1} label="«" />
          <PageBtn onClick={() => setPage((p) => p - 1)} disabled={safePage === 1} label="‹" />

          {pageRange(safePage, totalPages).map((p, i) =>
            p === "..." ? (
              <span key={`dot${i}`} style={{ padding: "0 4px", color: "#9ca3af", fontSize: 13 }}>…</span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  width: 32, height: 32, border: "1px solid", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                  background: p === safePage ? "#1a56db" : "#fff",
                  color: p === safePage ? "#fff" : "#374151",
                  borderColor: p === safePage ? "#1a56db" : "#d1d5db",
                }}
              >
                {p}
              </button>
            )
          )}

          <PageBtn onClick={() => setPage((p) => p + 1)} disabled={safePage === totalPages} label="›" />
          <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages} label="»" />
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────
function ActionButton({ action, row }) {
  return (
    <button
      onClick={() => action.onClick(row)}
      title={action.label}
      style={{
        display: "flex", alignItems: "center", gap: 5,
        padding: "5px 10px", border: "1px solid", borderRadius: 6,
        fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
        transition: "all 0.15s",
        ...(action.style || { background: "#eff6ff", color: "#1a56db", borderColor: "#bfdbfe" }),
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.8"; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
    >
      {action.icon && <span style={{ display: "flex" }}>{action.icon}</span>}
      {action.label}
    </button>
  );
}

function PageBtn({ onClick, disabled, label }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 32, height: 32, border: "1px solid #d1d5db", borderRadius: 6,
        fontSize: 14, cursor: disabled ? "not-allowed" : "pointer",
        background: "#fff", color: disabled ? "#d1d5db" : "#374151",
      }}
    >
      {label}
    </button>
  );
}

function Skeleton({ width }) {
  return (
    <div style={{ height: 14, width: width || "80%", borderRadius: 4, background: "linear-gradient(90deg,#e5edff 25%,#f0f4ff 50%,#e5edff 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite" }} />
  );
}

function pageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ── Styles ────────────────────────────────────────────────────
const thStyle = {
  padding: "11px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 700,
  color: "#374151",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e5edff",
  letterSpacing: 0.3,
  textTransform: "uppercase",
};

const tdStyle = {
  padding: "12px 16px",
  color: "#374151",
  whiteSpace: "nowrap",
  maxWidth: 220,
  overflow: "hidden",
  textOverflow: "ellipsis",
  verticalAlign: "middle",
};

const stickyRightStyle = {
  position: "sticky",
  right: 0,
  boxShadow: "-2px 0 8px rgba(0,0,0,0.06)",
  zIndex: 1,
};