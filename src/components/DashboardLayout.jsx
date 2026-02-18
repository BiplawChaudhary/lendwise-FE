import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, menuItems }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4ff", fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      <Sidebar menuItems={menuItems} />
      <main style={{ flex: 1, padding: "32px", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}