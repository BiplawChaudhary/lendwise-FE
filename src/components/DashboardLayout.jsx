import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, menuItems }) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", fontFamily: '"Segoe UI", system-ui, sans-serif' }}>
      {/* Sidebar: fixed height, never scrolls */}
      <div style={{ flexShrink: 0, height: "100vh", position: "sticky", top: 0 }}>
        <Sidebar menuItems={menuItems} />
      </div>

      {/* Main content: takes remaining width, scrolls independently */}
      <main style={{ flex: 1, height: "100vh", overflowY: "auto", background: "#f0f4ff", padding: "32px" }}>
        {children}
      </main>
    </div>
  );
}