import React, { useEffect, useMemo, useState } from "react";
import "../../styles/AdminComponents.css";

const API_BASE_URL = "http://127.0.0.1:8000";

const statusOptions = [
  { value: "all", label: "All Applications" },
  { value: "pending", label: "Pending" },
  { value: "needs_more_info", label: "Needs More Info" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const HostApplicationsManagement = ({ onActionComplete }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [savingChecklist, setSavingChecklist] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("access");

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      let url = `${API_BASE_URL}/api/admin/host-applications/`;

      if (statusFilter !== "all") {
        url += `?status=${encodeURIComponent(statusFilter)}`;
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch host applications.");
      }

      const data = await response.json();
      setApplications(data.results || data || []);
    } catch (error) {
      setErrorMessage(error.message || "Failed to load host applications.");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationDetail = async (applicationId) => {
    setActionLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/host-applications/${applicationId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch application detail.");
      }

      const data = await response.json();
      setSelectedApplication(data);
      setReviewNotes(data.review_notes || "");
      setShowApplicationDetail(true);
    } catch (error) {
      setErrorMessage(error.message || "Failed to fetch application detail.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleString();
  };

  const getFileUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${API_BASE_URL}${value}`;
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "approved":
        return "status-approved";
      case "rejected":
        return "status-rejected";
      case "needs_more_info":
        return "status-warning";
      case "pending":
      default:
        return "status-pending";
    }
  };

  const getPrettyStatus = (status) => {
    if (!status) return "Pending";
    return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const closeDetailModal = () => {
    setShowApplicationDetail(false);
    setSelectedApplication(null);
    setReviewNotes("");
  };

  const updateSelectedField = (field, value) => {
    setSelectedApplication((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const allChecksPassed = useMemo(() => {
    if (!selectedApplication) return false;

    return (
      !!selectedApplication.phone_verified_check &&
      !!selectedApplication.identity_verified_check &&
      !!selectedApplication.property_verified_check &&
      !!selectedApplication.bank_verified_check
    );
  }, [selectedApplication]);

  const saveReviewChecklist = async () => {
    if (!selectedApplication) return;

    setSavingChecklist(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/host-applications/${selectedApplication.id}/update_review/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone_verified_check: selectedApplication.phone_verified_check,
            identity_verified_check: selectedApplication.identity_verified_check,
            property_verified_check: selectedApplication.property_verified_check,
            bank_verified_check: selectedApplication.bank_verified_check,
            review_notes: reviewNotes,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to save review checklist.");
      }

      setSelectedApplication(data);
      setReviewNotes(data.review_notes || "");
      await fetchApplications();
      alert("Review checklist saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to save review checklist.");
    } finally {
      setSavingChecklist(false);
    }
  };

  const submitStatusAction = async (actionName) => {
    if (!selectedApplication) return;

    if ((actionName === "approve" || actionName === "reject" || actionName === "needs_more_info") && !reviewNotes.trim()) {
      alert("Please write review notes first.");
      return;
    }

    if (actionName === "approve" && !allChecksPassed) {
      alert("Complete all verification checks before approval.");
      return;
    }

    setActionLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/host-applications/${selectedApplication.id}/${actionName}/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: reviewNotes,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || `Failed to ${actionName} application.`);
      }

      alert(data.detail || "Action completed successfully.");
      closeDetailModal();
      await fetchApplications();
      if (onActionComplete) onActionComplete();
    } catch (error) {
      setErrorMessage(error.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading host applications...</p>
      </div>
    );
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <h2>Host Applications Management</h2>
        <p>Review, verify, approve, reject, or request more information from applicants.</p>
      </div>

      {errorMessage ? (
        <div className="error-message" style={{ marginBottom: "16px" }}>
          {errorMessage}
        </div>
      ) : null}

      <div className="controls-section">
        <div className="filter-controls">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Business</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Reviewed By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length > 0 ? (
              applications.map((application) => (
                <tr key={application.id}>
                  <td>
                    <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {application.citizenship_front_image ? (
                        <img
                          src={getFileUrl(application.citizenship_front_image)}
                          alt="citizenship"
                          className="admin-listing-img"
                          style={{ width: "48px", height: "36px", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "36px",
                            borderRadius: "6px",
                            background: "#e5e7eb",
                          }}
                        />
                      )}
                      <div>
                        <strong>{application.user_name || "N/A"}</strong>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>
                          {application.citizenship_number || "No citizenship number"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{application.user_email || "N/A"}</td>
                  <td>{application.user_phone || "Not provided"}</td>
                  <td>{application.business_name || "Individual"}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                      {getPrettyStatus(application.status)}
                    </span>
                  </td>
                  <td>{formatDate(application.applied_at)}</td>
                  <td>{application.reviewed_by ? "Admin" : "Not reviewed"}</td>
                  <td>
                    <button
                      onClick={() => fetchApplicationDetail(application.id)}
                      className="btn btn-info"
                      disabled={actionLoading}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: "center", padding: "24px" }}>
                  No host applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showApplicationDetail && selectedApplication && (
        <div className="host-details-overlay" onClick={closeDetailModal}>
          <div className="host-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="host-details-header">
              <div>
                <h2>Host Application Details</h2>
                <p>Review applicant identity, ownership proof, and banking details.</p>
              </div>

              <button onClick={closeDetailModal} className="host-details-close">
                ×
              </button>
            </div>

            <div className="host-details-body">
              <div className="host-section-card">
                <h3>Applicant Information</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card">
                    <span className="host-detail-label">Full Name</span>
                    <span className="host-detail-value">{selectedApplication.user_name || "N/A"}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Email</span>
                    <span className="host-detail-value">{selectedApplication.user_email || "N/A"}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Phone</span>
                    <span className="host-detail-value">{selectedApplication.user_phone || "Not provided"}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Citizenship Number</span>
                    <span className="host-detail-value">{selectedApplication.citizenship_number || "N/A"}</span>
                  </div>

                  <div className="host-detail-card" style={{ gridColumn: "1 / -1" }}>
                    <span className="host-detail-label">Permanent Address</span>
                    <span className="host-detail-value">{selectedApplication.permanent_address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Property Information</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card" style={{ gridColumn: "1 / -1" }}>
                    <span className="host-detail-label">Property Address</span>
                    <span className="host-detail-value">{selectedApplication.property_address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Bank Information</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card">
                    <span className="host-detail-label">Bank Name</span>
                    <span className="host-detail-value">{selectedApplication.bank_name || "N/A"}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Account Number</span>
                    <span className="host-detail-value">{selectedApplication.account_number || "N/A"}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Account Holder Name</span>
                    <span className="host-detail-value">{selectedApplication.account_holder_name || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Business Information</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card">
                    <span className="host-detail-label">Business Name</span>
                    <span className="host-detail-value">{selectedApplication.business_name || "Individual host"}</span>
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Application Status</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card">
                    <span className="host-detail-label">Status</span>
                    <span className={`status-badge ${getStatusBadgeClass(selectedApplication.status)}`}>
                      {getPrettyStatus(selectedApplication.status)}
                    </span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Applied At</span>
                    <span className="host-detail-value">{formatDate(selectedApplication.applied_at)}</span>
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Reviewed At</span>
                    <span className="host-detail-value">{formatDate(selectedApplication.reviewed_at)}</span>
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Uploaded Documents</h3>
                <div className="host-details-grid">
                  <div className="host-detail-card">
                    <span className="host-detail-label">Citizenship Front</span>
                    {selectedApplication.citizenship_front_image ? (
                      <a
                        href={getFileUrl(selectedApplication.citizenship_front_image)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-info"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="host-detail-value">Not uploaded</span>
                    )}
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Selfie With ID</span>
                    {selectedApplication.selfie_with_id ? (
                      <a
                        href={getFileUrl(selectedApplication.selfie_with_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-info"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="host-detail-value">Not uploaded</span>
                    )}
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">Ownership Document</span>
                    {selectedApplication.ownership_document ? (
                      <a
                        href={getFileUrl(selectedApplication.ownership_document)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-info"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="host-detail-value">Not uploaded</span>
                    )}
                  </div>

                  <div className="host-detail-card">
                    <span className="host-detail-label">PAN Card Image</span>
                    {selectedApplication.pan_card_image ? (
                      <a
                        href={getFileUrl(selectedApplication.pan_card_image)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-info"
                      >
                        View File
                      </a>
                    ) : (
                      <span className="host-detail-value">Not uploaded</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Verification Checklist</h3>
                <div className="host-details-grid">
                  <label className="host-detail-card" style={{ cursor: "pointer" }}>
                    <span className="host-detail-label">Phone Verified</span>
                    <input
                      type="checkbox"
                      checked={!!selectedApplication.phone_verified_check}
                      onChange={(e) => updateSelectedField("phone_verified_check", e.target.checked)}
                    />
                  </label>

                  <label className="host-detail-card" style={{ cursor: "pointer" }}>
                    <span className="host-detail-label">Identity Verified</span>
                    <input
                      type="checkbox"
                      checked={!!selectedApplication.identity_verified_check}
                      onChange={(e) => updateSelectedField("identity_verified_check", e.target.checked)}
                    />
                  </label>

                  <label className="host-detail-card" style={{ cursor: "pointer" }}>
                    <span className="host-detail-label">Property Verified</span>
                    <input
                      type="checkbox"
                      checked={!!selectedApplication.property_verified_check}
                      onChange={(e) => updateSelectedField("property_verified_check", e.target.checked)}
                    />
                  </label>

                  <label className="host-detail-card" style={{ cursor: "pointer" }}>
                    <span className="host-detail-label">Bank Verified</span>
                    <input
                      type="checkbox"
                      checked={!!selectedApplication.bank_verified_check}
                      onChange={(e) => updateSelectedField("bank_verified_check", e.target.checked)}
                    />
                  </label>
                </div>

                <div style={{ marginTop: "16px" }}>
                  <button
                    onClick={saveReviewChecklist}
                    className="btn btn-info"
                    disabled={savingChecklist}
                  >
                    {savingChecklist ? "Saving..." : "Save Checklist"}
                  </button>
                </div>
              </div>

              <div className="host-section-card">
                <h3>Review Notes</h3>
                <textarea
                  rows="5"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Write review notes, approval notes, rejection reason, or request for more information..."
                  className="clean-review-textarea"
                />
              </div>

              <div className="host-section-card">
                <h3>Admin Actions</h3>
                <div className="review-actions">
                  <button
                    onClick={() => submitStatusAction("approve")}
                    className="btn btn-success"
                    disabled={actionLoading || !allChecksPassed}
                    title={!allChecksPassed ? "Complete all checks before approval" : ""}
                  >
                    {actionLoading ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() => submitStatusAction("needs_more_info")}
                    className="btn btn-warning"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Needs More Info"}
                  </button>

                  <button
                    onClick={() => submitStatusAction("reject")}
                    className="btn btn-danger"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Processing..." : "Reject"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostApplicationsManagement;