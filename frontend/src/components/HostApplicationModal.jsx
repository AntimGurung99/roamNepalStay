import React, { useEffect, useMemo, useState } from "react";

import "../styles/HostApplicationModal.css"

const API_BASE_URL = "http://127.0.0.1:8000";

const KNOWN_BANKS = [
  "Nabil Bank",
  "Global IME Bank",
  "Nepal Investment Mega Bank",
  "NIC Asia Bank",
  "Rastriya Banijya Bank",
  "Nepal Bank Limited",
];

const initialFormData = {
  citizenship_number: "",
  citizenship_front_image: null,
  selfie_with_id: null,
  permanent_address: "",
  property_address: "",
  ownership_document: null,
  bank_name: "",
  account_number: "",
  account_holder_name: "",
  business_name: "",
  pan_card_image: null,
  agreed_to_terms: false,
};

const HostApplicationModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isOtherBankSelected, setIsOtherBankSelected] = useState(false);

  const token = localStorage.getItem("access");

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";

    fetchMyApplication();

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const hasPanImage = useMemo(() => {
    return !!formData.pan_card_image || !!existingApplication?.pan_card_image;
  }, [formData.pan_card_image, existingApplication]);

  const isEditMode = useMemo(() => {
    return !!existingApplication;
  }, [existingApplication]);

  const getFileUrl = (value) => {
    if (!value) return null;
    if (value.startsWith("http://") || value.startsWith("https://")) return value;
    return `${API_BASE_URL}${value}`;
  };

  const resetState = () => {
    setFormData(initialFormData);
    setExistingApplication(null);
    setErrors({});
    setServerError("");
    setSuccessMessage("");
    setIsOtherBankSelected(false);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const clearFieldError = (name) => {
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) {
      setServerError("");
    }
  };

  const fillFormFromApplication = (application) => {
    const bankName = application?.bank_name || "";
    const knownBank = KNOWN_BANKS.includes(bankName);

    setFormData((prev) => ({
      ...prev,
      citizenship_number: application?.citizenship_number || "",
      permanent_address: application?.permanent_address || "",
      property_address: application?.property_address || "",
      bank_name: bankName,
      account_number: application?.account_number || "",
      account_holder_name: application?.account_holder_name || "",
      business_name: application?.business_name || "",
      agreed_to_terms: !!application?.agreed_to_terms,
      citizenship_front_image: null,
      selfie_with_id: null,
      ownership_document: null,
      pan_card_image: null,
    }));

    setIsOtherBankSelected(!!bankName && !knownBank);
  };

  const fetchMyApplication = async () => {
    if (!token) return;

    setLoadingExisting(true);
    setServerError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/host-applications/me/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setExistingApplication(null);
        setFormData(initialFormData);
        setIsOtherBankSelected(false);
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load your host application.");
      }

      setExistingApplication(data);
      fillFormFromApplication(data);
    } catch (error) {
      setServerError(error.message || "Failed to load your host application.");
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    clearFieldError(name);
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files && files[0] ? files[0] : null;

    setFormData((prev) => ({
      ...prev,
      [name]: file,
    }));

    clearFieldError(name);
  };

  const handleBankSelectChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "Others") {
      setIsOtherBankSelected(true);
      setFormData((prev) => ({
        ...prev,
        bank_name: "",
      }));
    } else {
      setIsOtherBankSelected(false);
      setFormData((prev) => ({
        ...prev,
        bank_name: selectedValue,
      }));
    }

    clearFieldError("bank_name");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.citizenship_number.trim()) {
      newErrors.citizenship_number = "Citizenship number is required.";
    }

    if (!formData.permanent_address.trim()) {
      newErrors.permanent_address = "Permanent address is required.";
    }

    if (!formData.property_address.trim()) {
      newErrors.property_address = "Property address is required.";
    }

    if (!formData.bank_name.trim()) {
      newErrors.bank_name = "Bank name is required.";
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = "Account number is required.";
    }

    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = "Account holder name is required.";
    }

    if (!formData.agreed_to_terms) {
      newErrors.agreed_to_terms = "You must agree to the terms and conditions.";
    }

    if (formData.pan_card_image && !formData.business_name.trim()) {
      newErrors.business_name = "Business name is required if PAN card image is uploaded.";
    }

    // Required only for first submit
    if (!isEditMode) {
      if (!formData.citizenship_front_image) {
        newErrors.citizenship_front_image = "Citizenship front image is required.";
      }

      if (!formData.selfie_with_id) {
        newErrors.selfie_with_id = "Selfie with ID is required.";
      }

      if (!formData.ownership_document) {
        newErrors.ownership_document = "Ownership document is required.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildFormData = () => {
    const data = new FormData();

    data.append("citizenship_number", formData.citizenship_number.trim());
    data.append("permanent_address", formData.permanent_address.trim());
    data.append("property_address", formData.property_address.trim());
    data.append("bank_name", formData.bank_name.trim());
    data.append("account_number", formData.account_number.trim());
    data.append("account_holder_name", formData.account_holder_name.trim());
    data.append("agreed_to_terms", String(formData.agreed_to_terms));

    if (formData.business_name.trim()) {
      data.append("business_name", formData.business_name.trim());
    }

    if (formData.citizenship_front_image) {
      data.append("citizenship_front_image", formData.citizenship_front_image);
    }

    if (formData.selfie_with_id) {
      data.append("selfie_with_id", formData.selfie_with_id);
    }

    if (formData.ownership_document) {
      data.append("ownership_document", formData.ownership_document);
    }

    if (formData.pan_card_image) {
      data.append("pan_card_image", formData.pan_card_image);
    }

    return data;
  };

  const parseBackendErrors = async (response) => {
    try {
      return await response.json();
    } catch {
      return { detail: "Something went wrong. Please try again." };
    }
  };

  const normalizeBackendErrors = (data) => {
    const formatted = {};

    if (data.detail) {
      formatted.detail = Array.isArray(data.detail) ? data.detail[0] : data.detail;
    }

    Object.keys(data).forEach((key) => {
      if (key === "detail") return;

      const value = data[key];

      if (Array.isArray(value)) {
        formatted[key] = value[0];
      } else if (typeof value === "string") {
        formatted[key] = value;
      } else if (value && typeof value === "object") {
        const firstNestedKey = Object.keys(value)[0];
        if (firstNestedKey) {
          const nestedValue = value[firstNestedKey];
          formatted[key] = Array.isArray(nestedValue) ? nestedValue[0] : nestedValue;
        }
      }
    });

    return formatted;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!token) {
      setServerError("You are not logged in. Please login first.");
      return;
    }

    setLoading(true);
    setErrors({});
    setServerError("");
    setSuccessMessage("");

    try {
      const payload = buildFormData();

      const response = await fetch(`${API_BASE_URL}/api/host-applications/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      const responseData = await parseBackendErrors(response);

      if (!response.ok) {
        const normalized = normalizeBackendErrors(responseData);

        if (normalized.detail) {
          setServerError(normalized.detail);
        }

        const fieldErrors = { ...normalized };
        delete fieldErrors.detail;
        setErrors(fieldErrors);
        return;
      }

      setSuccessMessage(
        isEditMode
          ? "Host application updated and resubmitted successfully."
          : "Host application submitted successfully."
      );

      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.host_application_status = "pending";
          localStorage.setItem("user", JSON.stringify(parsedUser));
        } catch {
          // ignore localStorage parse issue
        }
      }

      setTimeout(() => {
        handleClose();
        if (onSuccess) {
          onSuccess();
        }
      }, 1500);
    } catch (error) {
      setServerError("Could not connect to server. Please check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="host-application-title"
    >
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close"
          onClick={handleClose}
          disabled={loading}
        >
          ✕
        </button>

        <div className="modal-header">
          <h2 id="host-application-title">
            {isEditMode ? "Edit Host Application" : "Apply to Become a Host"}
          </h2>
          <p>
            {isEditMode
              ? "Update your application and resubmit it for review."
              : "Submit your owner verification details to start listing your property."}
          </p>
        </div>

        {loadingExisting ? (
          <div className="loading-state">
            <p>Loading application...</p>
          </div>
        ) : successMessage ? (
          <div className="success-message">
            <h3>Success</h3>
            <p>{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="host-form">
            {serverError ? (
              <div className="error-box">
                <p>{serverError}</p>
              </div>
            ) : null}

            {isEditMode && existingApplication?.status === "needs_more_info" ? (
              <div className="info-box">
                <p>
                  Your previous application needs more information. Update the required
                  details and submit again.
                </p>
                {existingApplication.review_notes ? (
                  <p>
                    <strong>Admin notes:</strong> {existingApplication.review_notes}
                  </p>
                ) : null}

                <div className="verification-checks-grid">
                  <div className={`check-item ${existingApplication.phone_verified_check ? 'passed' : 'pending'}`}>
                    <i className={`bi ${existingApplication.phone_verified_check ? 'bi-check-circle-fill' : 'bi-info-circle'}`}></i>
                    <span>Phone Verification: {existingApplication.phone_verified_check ? 'Passed' : 'Needs Review'}</span>
                  </div>
                  <div className={`check-item ${existingApplication.identity_verified_check ? 'passed' : 'pending'}`}>
                    <i className={`bi ${existingApplication.identity_verified_check ? 'bi-check-circle-fill' : 'bi-info-circle'}`}></i>
                    <span>Identity Verification: {existingApplication.identity_verified_check ? 'Passed' : 'Needs Review'}</span>
                  </div>
                  <div className={`check-item ${existingApplication.property_verified_check ? 'passed' : 'pending'}`}>
                    <i className={`bi ${existingApplication.property_verified_check ? 'bi-check-circle-fill' : 'bi-info-circle'}`}></i>
                    <span>Property Verification: {existingApplication.property_verified_check ? 'Passed' : 'Needs Review'}</span>
                  </div>
                  <div className={`check-item ${existingApplication.bank_verified_check ? 'passed' : 'pending'}`}>
                    <i className={`bi ${existingApplication.bank_verified_check ? 'bi-check-circle-fill' : 'bi-info-circle'}`}></i>
                    <span>Bank Verification: {existingApplication.bank_verified_check ? 'Passed' : 'Needs Review'}</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="form-grid">
              <div className="section-title">Identity Details</div>

              <div className="form-group">
                <label htmlFor="citizenship_number">Citizenship Number</label>
                <input
                  id="citizenship_number"
                  type="text"
                  name="citizenship_number"
                  value={formData.citizenship_number}
                  onChange={handleInputChange}
                  placeholder="Enter citizenship number"
                />
                {errors.citizenship_number && (
                  <span className="error-text">{errors.citizenship_number}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="citizenship_front_image">Citizenship Front Image</label>
                <input
                  id="citizenship_front_image"
                  type="file"
                  name="citizenship_front_image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.citizenship_front_image ? (
                  <small>{formData.citizenship_front_image.name}</small>
                ) : existingApplication?.citizenship_front_image ? (
                  <small>
                    Existing file:{" "}
                    <a
                      href={getFileUrl(existingApplication.citizenship_front_image)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View current file
                    </a>
                  </small>
                ) : null}
                {errors.citizenship_front_image && (
                  <span className="error-text">{errors.citizenship_front_image}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="selfie_with_id">Selfie With ID</label>
                <input
                  id="selfie_with_id"
                  type="file"
                  name="selfie_with_id"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.selfie_with_id ? (
                  <small>{formData.selfie_with_id.name}</small>
                ) : existingApplication?.selfie_with_id ? (
                  <small>
                    Existing file:{" "}
                    <a
                      href={getFileUrl(existingApplication.selfie_with_id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View current file
                    </a>
                  </small>
                ) : null}
                {errors.selfie_with_id && (
                  <span className="error-text">{errors.selfie_with_id}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="permanent_address">Permanent Address</label>
                <textarea
                  id="permanent_address"
                  name="permanent_address"
                  rows="3"
                  value={formData.permanent_address}
                  onChange={handleInputChange}
                  placeholder="Enter your permanent address"
                />
                {errors.permanent_address && (
                  <span className="error-text">{errors.permanent_address}</span>
                )}
              </div>

              <div className="section-title">Property Ownership</div>

              <div className="form-group full-width">
                <label htmlFor="property_address">Property Address</label>
                <textarea
                  id="property_address"
                  name="property_address"
                  rows="3"
                  value={formData.property_address}
                  onChange={handleInputChange}
                  placeholder="Enter the full property address"
                />
                {errors.property_address && (
                  <span className="error-text">{errors.property_address}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="ownership_document">Ownership Document</label>
                <input
                  id="ownership_document"
                  type="file"
                  name="ownership_document"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handleFileChange}
                />
                {formData.ownership_document ? (
                  <small>{formData.ownership_document.name}</small>
                ) : existingApplication?.ownership_document ? (
                  <small>
                    Existing file:{" "}
                    <a
                      href={getFileUrl(existingApplication.ownership_document)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View current file
                    </a>
                  </small>
                ) : null}
                {errors.ownership_document && (
                  <span className="error-text">{errors.ownership_document}</span>
                )}
              </div>

              <div className="section-title">Bank Information</div>

              <div className="form-group">
                <label htmlFor="bank_name_select">Bank Name</label>
                <select
                  id="bank_name_select"
                  value={isOtherBankSelected ? "Others" : formData.bank_name}
                  onChange={handleBankSelectChange}
                >
                  <option value="">Select bank</option>
                  {KNOWN_BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                  <option value="Others">Others</option>
                </select>

                {isOtherBankSelected && (
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    placeholder="Enter your bank name"
                  />
                )}

                {errors.bank_name && (
                  <span className="error-text">{errors.bank_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="account_number">Account Number</label>
                <input
                  id="account_number"
                  type="text"
                  name="account_number"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  placeholder="Enter bank account number"
                />
                {errors.account_number && (
                  <span className="error-text">{errors.account_number}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label htmlFor="account_holder_name">Account Holder Name</label>
                <input
                  id="account_holder_name"
                  type="text"
                  name="account_holder_name"
                  value={formData.account_holder_name}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                />
                {errors.account_holder_name && (
                  <span className="error-text">{errors.account_holder_name}</span>
                )}
              </div>

              <div className="section-title">Optional Business Information</div>

              <div className="form-group">
                <label htmlFor="business_name">
                  Business Name {hasPanImage ? "" : "(Optional)"}
                </label>
                <input
                  id="business_name"
                  type="text"
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                />
                {errors.business_name && (
                  <span className="error-text">{errors.business_name}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="pan_card_image">PAN Card Image (Optional)</label>
                <input
                  id="pan_card_image"
                  type="file"
                  name="pan_card_image"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {formData.pan_card_image ? (
                  <small>{formData.pan_card_image.name}</small>
                ) : existingApplication?.pan_card_image ? (
                  <small>
                    Existing file:{" "}
                    <a
                      href={getFileUrl(existingApplication.pan_card_image)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View current file
                    </a>
                  </small>
                ) : null}
                {errors.pan_card_image && (
                  <span className="error-text">{errors.pan_card_image}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <input
                    type="checkbox"
                    name="agreed_to_terms"
                    checked={formData.agreed_to_terms}
                    onChange={handleInputChange}
                  />{" "}
                  I agree to the terms and conditions.
                </label>
                {errors.agreed_to_terms && (
                  <span className="error-text">{errors.agreed_to_terms}</span>
                )}
              </div>
            </div>

            <div className="form-footer">
              <button type="button" onClick={handleClose} disabled={loading}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading
                  ? "Submitting..."
                  : isEditMode
                  ? "Update & Resubmit"
                  : "Submit Application"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HostApplicationModal;