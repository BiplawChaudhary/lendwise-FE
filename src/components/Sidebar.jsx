import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ── Icons (inline SVG so no icon library needed) ──
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Chevron: ({ collapsed }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: collapsed ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }}>
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const SIDEBAR_WIDTH = 240;
const SIDEBAR_COLLAPSED_WIDTH = 64;

export default function Sidebar({ menuItems }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const s = {
    sidebar: {
      width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
      minHeight: "100vh",
      background: "#0d3b8e",
      display: "flex",
      flexDirection: "column",
      transition: "width 0.25s ease",
      overflow: "hidden",
      position: "relative",
      flexShrink: 0,
    },
    header: {
      padding: collapsed ? "20px 0" : "20px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: collapsed ? "center" : "space-between",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      minHeight: 64,
    },
    logo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      overflow: "hidden",
      textDecoration: "none",
    },
    logoText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: 700,
      whiteSpace: "nowrap",
      opacity: collapsed ? 0 : 1,
      transition: "opacity 0.2s",
      width: collapsed ? 0 : "auto",
    },
    toggleBtn: {
      background: "rgba(255,255,255,0.1)",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
      color: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 6,
      flexShrink: 0,
    },
    nav: {
      flex: 1,
      padding: "12px 0",
      overflowY: "auto",
      overflowX: "hidden",
    },
    navItem: (isActive) => ({
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: collapsed ? "12px 0" : "12px 20px",
      justifyContent: collapsed ? "center" : "flex-start",
      color: isActive ? "#ffffff" : "rgba(255,255,255,0.65)",
      background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
      borderLeft: isActive ? "3px solid #60a5fa" : "3px solid transparent",
      textDecoration: "none",
      fontSize: 14,
      fontWeight: isActive ? 600 : 400,
      whiteSpace: "nowrap",
      transition: "background 0.15s, color 0.15s",
      cursor: "pointer",
    }),
    navLabel: {
      opacity: collapsed ? 0 : 1,
      transition: "opacity 0.15s",
      width: collapsed ? 0 : "auto",
      overflow: "hidden",
    },
    footer: {
      borderTop: "1px solid rgba(255,255,255,0.1)",
      padding: collapsed ? "16px 0" : "16px",
    },
    userInfo: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginBottom: 12,
      justifyContent: collapsed ? "center" : "flex-start",
      overflow: "hidden",
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      background: "#1a56db",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontWeight: 700,
      fontSize: 14,
      flexShrink: 0,
      overflow: "hidden",
    },
    userEmail: {
      color: "rgba(255,255,255,0.75)",
      fontSize: 12,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      opacity: collapsed ? 0 : 1,
      transition: "opacity 0.15s",
      maxWidth: collapsed ? 0 : 160,
    },
    logoutBtn: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: collapsed ? "10px 0" : "10px 12px",
      justifyContent: collapsed ? "center" : "flex-start",
      background: "rgba(255,255,255,0.08)",
      border: "none",
      borderRadius: 8,
      color: "rgba(255,255,255,0.75)",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      width: "100%",
      transition: "background 0.15s",
    },
  };

  const initials = user?.userEmail
    ? user.userEmail.split("@")[0].slice(0, 2).toUpperCase()
    : "?";

  return (
    <aside style={s.sidebar}>
      {/* Header / Logo */}
      <div style={s.header}>
        {!collapsed && (
          <div style={s.logo}>
            <img src="/logo.png" alt="Logo" style={{ width: 28, height: 28, objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }} />
            <span style={s.logoText}>Lendwise</span>
          </div>
        )}
        <button style={s.toggleBtn} onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expand" : "Collapse"}>
          <Icons.Chevron collapsed={collapsed} />
        </button>
      </div>

      {/* Navigation */}
      <nav style={s.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => s.navItem(isActive)}
            title={collapsed ? item.label : ""}
          >
            <span style={{ flexShrink: 0 }}>{item.icon}</span>
            <span style={s.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer: user info + logout */}
      <div style={s.footer}>
        <div style={s.userInfo}>
          <div style={s.avatar}>
            {user?.userProfilePictureUrl ? (
              <img src={user.userProfilePictureUrl} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              initials
            )}
          </div>
          <span style={s.userEmail} title={user?.userEmail}>{user?.userEmail}</span>
        </div>

        <button style={s.logoutBtn} onClick={handleLogout} title={collapsed ? "Logout" : ""}>
          <Icons.Logout />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}