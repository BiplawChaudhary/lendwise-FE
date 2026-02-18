import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: '"Segoe UI", system-ui, sans-serif', background: "#f8faff" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>404 – Page Not Found</h1>
      <p style={{ color: "#6b7280", margin: "0 0 24px" }}>The page you're looking for doesn't exist.</p>
      <Link to="/" style={{ color: "#1a56db", fontWeight: 600, textDecoration: "none" }}>← Go Home</Link>
    </div>
  );
}