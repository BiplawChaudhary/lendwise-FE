import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { ADMIN_MENU_ITEMS } from "../../config/MenuConfig";
import { callApi } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/DataTable";
import Modal, { GhostBtn, PrimaryBtn, DangerBtn } from "../../components/Modal";
import MerchantDetailView from "./MerchantDetailView";

const STATUS_BADGE = {
  APPROVED: { bg: "#d1fae5", color: "#065f46" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b" },
  UNDER_REVIEW: { bg: "#dbeafe", color: "#1e40af" },
  PENDING: { bg: "#fef3c7", color: "#92400e" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {status?.replace(/_/g, " ") || "—"}
    </span>
  );
}

function ActiveBadge({ active }) {
  return (
    <span style={{
      background: active ? "#d1fae5" : "#fee2e2",
      color: active ? "#065f46" : "#991b1b",
      padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
    }}>
      {active ? "Active" : "Inactive"}
    </span>
  );
}

const COLUMNS = [
  { key: "ekycStatus", label: "KYC Status", render: (v) => <StatusBadge status={v} /> },
  { key: "isUserActive", label: "Active", render: (v) => <ActiveBadge active={v} /> },
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "userEmail", label: "Email" },
  { key: "mobileNo", label: "Mobile" },
  { key: "businessName", label: "Business" },
  { key: "businessType", label: "Type", render: (v) => v?.replace(/_/g, " ") || "—" },
  { key: "province", label: "Province" },
  { key: "district", label: "District" },
  { key: "submittedAt", label: "Submitted", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
];

export default function ManageMerchants() {
  const { showToast } = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail modal
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Toggle confirm modal
  const [toggleModal, setToggleModal] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [toggleTarget, setToggleTarget] = useState(null);

  // ── Fetch list ─────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callApi({
        url: "/admin/merchantList",
        method: "POST",
        body: { type: "" },
        validateResponse: false,
      });
      if (res.apiResponseCode === 200) {
        setList(res.apiResponseData.data || []);
      } else {
        showToast(res.apiResponseMessage || "Failed to fetch merchants.", "error");
      }
    } catch {
      showToast("Failed to fetch merchant list.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── View details ───────────────────────────────────────────
  const handleView = async (row) => {
    setSelectedRow(row);
    setDetailData(null);
    setShowDetail(true);
    setDetailLoading(true);
    try {
      const res = await callApi({
        url: "/admin/getUserInfo",
        method: "GET",
        headers: { userId: String(row.userId) },
        validateResponse: false,
      });
      if (res.apiResponseCode === 200) {
        setDetailData(res.apiResponseData.data);
      } else {
        showToast("Failed to load merchant details.", "error");
      }
    } catch {
      showToast("Failed to load merchant details.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Toggle active status ───────────────────────────────────
  const handleToggleClick = (row) => {
    setToggleTarget(row);
    setToggleModal(true);
  };

  const confirmToggle = async () => {
    setToggleLoading(true);
    try {
      const res = await callApi({
        url: "/auth/toggleActiveStatus",
        method: "GET",
        headers: { userId: String(toggleTarget.userId) },
        validateResponse: true,
        showToast,
      });
      setToggleModal(false);
      setToggleTarget(null);
      await fetchList();
    } catch {
      // toast shown
    } finally {
      setToggleLoading(false);
    }
  };

  // ── Table actions ──────────────────────────────────────────
  const actions = [
    {
      label: "View",
      icon: <EyeIcon />,
      onClick: handleView,
      style: { background: "#eff6ff", color: "#1a56db", borderColor: "#bfdbfe" },
    },
    {
      label: "Toggle Status",
      icon: <ToggleIcon />,
      onClick: handleToggleClick,
      // Dynamic style based on current status
      style: { background: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" },
    },
  ];

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", gap: 16 }}>
        {/* Header */}
        <div style={{ flexShrink: 0 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Manage Merchants</h1>
          <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>View and manage all registered merchants</p>
        </div>

        {/* Table */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <DataTable
            title="All Merchants"
            columns={COLUMNS}
            data={list}
            actions={actions}
            loading={loading}
            emptyMessage="No merchants found."
          />
        </div>
      </div>

      {/* ── Detail Modal ───────────────────────────────────── */}
      {showDetail && (
        <Modal
          title={`Merchant — ${selectedRow?.firstName} ${selectedRow?.lastName}`}
          onClose={() => setShowDetail(false)}
          width={860}
          footer={<GhostBtn onClick={() => setShowDetail(false)}>Close</GhostBtn>}
        >
          {detailLoading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
              <Spinner />
            </div>
          ) : detailData ? (
            <MerchantDetailView data={detailData} />
          ) : (
            <div style={{ textAlign: "center", color: "#9ca3af", padding: 40 }}>Failed to load details.</div>
          )}
        </Modal>
      )}

      {/* ── Toggle Confirm Modal ───────────────────────────── */}
      {toggleModal && toggleTarget && (
        <Modal
          title="Confirm Status Change"
          onClose={() => setToggleModal(false)}
          width={420}
          footer={
            <>
              <GhostBtn onClick={() => setToggleModal(false)}>Cancel</GhostBtn>
              {toggleTarget.isUserActive ? (
                <DangerBtn onClick={confirmToggle} loading={toggleLoading}>Deactivate</DangerBtn>
              ) : (
                <PrimaryBtn onClick={confirmToggle} loading={toggleLoading}>Activate</PrimaryBtn>
              )}
            </>
          }
        >
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>
              {toggleTarget.isUserActive ? "🔴" : "🟢"}
            </div>
            <p style={{ color: "#374151", fontSize: 15, lineHeight: 1.6 }}>
              Are you sure you want to{" "}
              <strong style={{ color: toggleTarget.isUserActive ? "#dc2626" : "#16a34a" }}>
                {toggleTarget.isUserActive ? "deactivate" : "activate"}
              </strong>{" "}
              the account for{" "}
              <strong>{toggleTarget.firstName} {toggleTarget.lastName}</strong>?
            </p>
            <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 8 }}>{toggleTarget.userEmail}</p>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function ToggleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/>
    </svg>
  );
}

function Spinner() {
  return (
    <>
      <div style={{ width: 36, height: 36, border: "3px solid #e5edff", borderTopColor: "#1a56db", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}