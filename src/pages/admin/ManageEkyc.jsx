import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { ADMIN_MENU_ITEMS } from "../../config/MenuConfig";
import { callApi } from "../../utils/api";
import { useToast } from "../../context/ToastContext";
import DataTable from "../../components/DataTable";
import Modal, { PrimaryBtn, DangerBtn, GhostBtn } from "../../components/Modal";
import MerchantDetailView from "./MerchantDetailView";

const REJECTION_CATEGORIES = [
  "DOCUMENT_QUALITY",
  "DOCUMENT_MISMATCH",
  "INVALID_CITIZENSHIP",
  "INVALID_PAN",
  "INCOMPLETE_SUBMISSION",
  "SUSPICIOUS_ACTIVITY",
  "BUSINESS_NOT_VERIFIED",
  "OTHER",
];

const STATUS_BADGE = {
  UNDER_REVIEW: { bg: "#dbeafe", color: "#1e40af", label: "Under Review" },
  APPROVED: { bg: "#d1fae5", color: "#065f46", label: "Approved" },
  REJECTED: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  PENDING: { bg: "#fef3c7", color: "#92400e", label: "Pending" },
};

function StatusBadge({ status }) {
  const s = STATUS_BADGE[status] || { bg: "#f3f4f6", color: "#374151", label: status };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

// ── Table columns ─────────────────────────────────────────────
const COLUMNS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "userEmail", label: "Email" },
  { key: "mobileNo", label: "Mobile" },
  { key: "businessName", label: "Business" },
  { key: "businessType", label: "Type", render: (v) => v?.replace(/_/g, " ") || "—" },
  { key: "province", label: "Province" },
  { key: "district", label: "District" },
  { key: "onboardingStage", label: "Stage", render: (v) => v?.replace(/_/g, " ") || "—" },
  { key: "ekycStatus", label: "Status", render: (v) => <StatusBadge status={v} /> },
  { key: "submittedAt", label: "Submitted", render: (v) => v ? new Date(v).toLocaleDateString() : "—" },
  { key: "resubmissionCount", label: "Resubmissions" },
];

export default function ManageEkyc() {
  const { showToast } = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("UNDER_REVIEW");

  // Detail view state
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // Action modals
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [adminRemarks, setAdminRemarks] = useState("");
  const [rejectionCategory, setRejectionCategory] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // ── Fetch list ─────────────────────────────────────────────
  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await callApi({
        url: "/admin/merchantList",
        method: "POST",
        body: { type: filterType },
        validateResponse: false,
      });
      if (res.apiResponseCode === 200) {
        setList(res.apiResponseData.data || []);
      } else {
        showToast(res.apiResponseMessage || "Failed to fetch list.", "error");
      }
    } catch {
      showToast("Failed to fetch merchant list.", "error");
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ── Fetch merchant details ─────────────────────────────────
  const handleViewDetails = async (row) => {
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
        showToast("Failed to fetch merchant details.", "error");
      }
    } catch {
      showToast("Failed to fetch merchant details.", "error");
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Update EKYC status ─────────────────────────────────────
  const handleUpdateStatus = async (action) => {
    if (action === "APPROVED" && !adminRemarks.trim()) {
      showToast("Please enter admin remarks before approving.", "warning");
      return;
    }
    if (action === "REJECTED" && (!rejectionCategory || !rejectionReason.trim())) {
      showToast("Please select a rejection category and provide a reason.", "warning");
      return;
    }

    setActionLoading(true);
    try {
      const res = await callApi({
        url: "/admin/updateEkycStatus",
        method: "POST",
        body: {
          userId: selectedRow.userId,
          action,
          reviewedById: 0,
          reviewerName: "ADMIN",
          adminRemarks: adminRemarks.trim(),
          rejectionReason: rejectionReason.trim(),
          rejectionCategory,
          updatedById: 0,
        },
        validateResponse: true,
        showToast,
      });

      setApproveModal(false);
      setRejectModal(false);
      setShowDetail(false);
      setAdminRemarks("");
      setRejectionCategory("");
      setRejectionReason("");
      fetchList();
    } catch {
      // toast shown by callApi
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table actions ──────────────────────────────────────────
  const actions = [
    {
      label: "View Details",
      icon: <EyeIcon />,
      onClick: handleViewDetails,
      style: { background: "#eff6ff", color: "#1a56db", borderColor: "#bfdbfe" },
    },
  ];

  return (
    <DashboardLayout menuItems={ADMIN_MENU_ITEMS}>
      <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", gap: 16 }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, flexShrink: 0 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Manage eKYC</h1>
            <p style={{ color: "#6b7280", fontSize: 13, margin: "4px 0 0" }}>Review and approve merchant KYC submissions</p>
          </div>
          {/* Filter tabs */}
          <div style={{ display: "flex", background: "#f0f4ff", borderRadius: 8, padding: 4, gap: 2 }}>
            {["UNDER_REVIEW", "APPROVED", "REJECTED", "ALL"].map((t) => (
              <button
                key={t}
                onClick={() => { setFilterType(t); }}
                style={{
                  padding: "6px 14px", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  background: filterType === t ? "#1a56db" : "transparent",
                  color: filterType === t ? "#fff" : "#6b7280",
                  transition: "all 0.15s",
                }}
              >
                {t.replace(/_/g, " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <DataTable
            title={`eKYC Submissions — ${filterType.replace(/_/g, " ")}`}
            columns={COLUMNS}
            data={list}
            actions={actions}
            loading={loading}
            emptyMessage="No eKYC submissions found."
          />
        </div>
      </div>

      {/* ── Detail / Action Drawer ─────────────────────────── */}
      {showDetail && (
        <Modal
          title={`Merchant Details — ${selectedRow?.firstName} ${selectedRow?.lastName}`}
          onClose={() => setShowDetail(false)}
          width={860}
          footer={
            selectedRow?.ekycStatus === "UNDER_REVIEW" ? (
              <>
                <GhostBtn onClick={() => setShowDetail(false)}>Cancel</GhostBtn>
                <DangerBtn onClick={() => { setRejectModal(true); }}>✕ Reject</DangerBtn>
                <PrimaryBtn onClick={() => { setApproveModal(true); }}>✓ Approve</PrimaryBtn>
              </>
            ) : (
              <GhostBtn onClick={() => setShowDetail(false)}>Close</GhostBtn>
            )
          }
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

      {/* ── Approve Modal ──────────────────────────────────── */}
      {approveModal && (
        <Modal
          title="✅ Approve eKYC"
          onClose={() => { setApproveModal(false); }}
          width={460}
          footer={
            <>
              <GhostBtn onClick={() => setApproveModal(false)}>Cancel</GhostBtn>
              <PrimaryBtn onClick={() => handleUpdateStatus("APPROVED")} loading={actionLoading}>Confirm Approval</PrimaryBtn>
            </>
          }
        >
          <p style={{ color: "#374151", fontSize: 14, marginBottom: 16 }}>
            You are about to approve the eKYC for <strong>{selectedRow?.firstName} {selectedRow?.lastName}</strong>.
            Please leave a remark for the record.
          </p>
          <label style={labelStyle}>Admin Remarks <span style={{ color: "#ef4444" }}>*</span></label>
          <textarea
            value={adminRemarks}
            onChange={(e) => setAdminRemarks(e.target.value)}
            placeholder="e.g. All documents verified and valid."
            rows={4}
            style={textareaStyle}
          />
        </Modal>
      )}

      {/* ── Reject Modal ───────────────────────────────────── */}
      {rejectModal && (
        <Modal
          title="✕ Reject eKYC"
          onClose={() => { setRejectModal(false); }}
          width={480}
          footer={
            <>
              <GhostBtn onClick={() => setRejectModal(false)}>Cancel</GhostBtn>
              <DangerBtn onClick={() => handleUpdateStatus("REJECTED")} loading={actionLoading}>Confirm Rejection</DangerBtn>
            </>
          }
        >
          <p style={{ color: "#374151", fontSize: 14, marginBottom: 16 }}>
            You are about to <strong style={{ color: "#dc2626" }}>reject</strong> the eKYC for <strong>{selectedRow?.firstName} {selectedRow?.lastName}</strong>. Please provide a reason.
          </p>

          <label style={labelStyle}>Rejection Category <span style={{ color: "#ef4444" }}>*</span></label>
          <select value={rejectionCategory} onChange={(e) => setRejectionCategory(e.target.value)} style={selectStyle}>
            <option value="">— Select category —</option>
            {REJECTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
            ))}
          </select>

          <label style={{ ...labelStyle, marginTop: 14 }}>Rejection Reason <span style={{ color: "#ef4444" }}>*</span></label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Describe why this submission is being rejected..."
            rows={4}
            style={textareaStyle}
          />
        </Modal>
      )}
    </DashboardLayout>
  );
}

// ── Shared styles ─────────────────────────────────────────────
const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 };
const textareaStyle = { width: "100%", padding: "10px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#111827", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" };
const selectStyle = { width: "100%", height: 42, padding: "0 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 14, color: "#111827", outline: "none", background: "#fff", cursor: "pointer" };

function EyeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
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