// import React, { useEffect, useState } from "react";
// import { platformSettingsAPI } from "../../api/axios";

// const PlatformSettingsManagement = () => {
//   const [serviceFeePercent, setServiceFeePercent] = useState("");
//   const [siteName, setSiteName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchPlatformSettings();
//   }, []);

//   const fetchPlatformSettings = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       setMessage("");

//       const res = await platformSettingsAPI.getSettings();
//       setServiceFeePercent(res.data.service_fee_percent ?? "");
//       setSiteName(res.data.site_name ?? "");
//     } catch (err) {
//       console.error(err);
//       setError("Failed to load platform settings.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePlatformSettings = async () => {
//     try {
//       setSaving(true);
//       setError("");
//       setMessage("");

//       await platformSettingsAPI.updateSettings({
//         site_name: siteName,
//         service_fee_percent: serviceFeePercent,
//       });

//       setMessage("Platform settings updated successfully.");
//     } catch (err) {
//       console.error(err);
//       setError(
//         err?.response?.data?.detail || "Failed to update platform settings."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return <div style={{ padding: "24px" }}>Loading platform settings...</div>;
//   }

//   return (
//     <div
//       style={{
//         padding: "24px",
//         background: "#fff",
//         borderRadius: "16px",
//         boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
//       }}
//     >
//       <h2 style={{ marginBottom: "20px" }}>Platform Settings</h2>

//       {message && (
//         <div
//           style={{
//             marginBottom: "16px",
//             padding: "12px",
//             borderRadius: "10px",
//             background: "#dcfce7",
//             color: "#166534",
//             fontWeight: "600",
//           }}
//         >
//           {message}
//         </div>
//       )}

//       {error && (
//         <div
//           style={{
//             marginBottom: "16px",
//             padding: "12px",
//             borderRadius: "10px",
//             background: "#fee2e2",
//             color: "#991b1b",
//             fontWeight: "600",
//           }}
//         >
//           {error}
//         </div>
//       )}

//       <div style={{ marginBottom: "18px" }}>
//         <label
//           style={{
//             display: "block",
//             marginBottom: "8px",
//             fontWeight: "700",
//           }}
//         >
//           Site Name
//         </label>
//         <input
//           type="text"
//           value={siteName}
//           onChange={(e) => setSiteName(e.target.value)}
//           style={{
//             width: "100%",
//             maxWidth: "400px",
//             padding: "12px",
//             borderRadius: "10px",
//             border: "1px solid #d1d5db",
//           }}
//         />
//       </div>

//       <div style={{ marginBottom: "18px" }}>
//         <label
//           style={{
//             display: "block",
//             marginBottom: "8px",
//             fontWeight: "700",
//           }}
//         >
//           Service Fee Percent
//         </label>
//         <input
//           type="number"
//           step="0.01"
//           min="0"
//           max="100"
//           value={serviceFeePercent}
//           onChange={(e) => setServiceFeePercent(e.target.value)}
//           style={{
//             width: "100%",
//             maxWidth: "250px",
//             padding: "12px",
//             borderRadius: "10px",
//             border: "1px solid #d1d5db",
//           }}
//         />
//       </div>

//       <button
//         onClick={updatePlatformSettings}
//         disabled={saving}
//         style={{
//           padding: "12px 22px",
//           border: "none",
//           borderRadius: "10px",
//           background: " #f53350",
//           color: "#fff",
//           fontWeight: "700",
//           cursor: "pointer",
//         }}
//       >
//         {saving ? "Saving..." : "Save Settings"}
//       </button>
//     </div>
//   );
// };

// export default PlatformSettingsManagement;

import React, { useEffect, useState } from "react";
import { platformSettingsAPI } from "../../api/axios";

const PlatformSettingsManagement = () => {
  const [siteName, setSiteName] = useState("");
  const [fee0To2000, setFee0To2000] = useState("");
  const [fee2001To6000, setFee2001To6000] = useState("");
  const [fee6001Above, setFee6001Above] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlatformSettings();
  }, []);

  const fetchPlatformSettings = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const res = await platformSettingsAPI.getSettings();
      setSiteName(res.data.site_name ?? "");
      setFee0To2000(res.data.fee_0_to_2000_percent ?? "");
      setFee2001To6000(res.data.fee_2001_to_6000_percent ?? "");
      setFee6001Above(res.data.fee_6001_and_above_percent ?? "");
    } catch (err) {
      console.error(err);
      setError("Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  };

  const updatePlatformSettings = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      await platformSettingsAPI.updateSettings({
        site_name: siteName,
        fee_0_to_2000_percent: fee0To2000,
        fee_2001_to_6000_percent: fee2001To6000,
        fee_6001_and_above_percent: fee6001Above,
      });

      setMessage("Platform settings updated successfully.");
    } catch (err) {
      console.error(err);
      setError(
        err?.response?.data?.detail || "Failed to update platform settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "24px" }}>Loading platform settings...</div>;
  }

  const inputStyle = {
    width: "100%",
    maxWidth: "300px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "700",
  };

  return (
    <div
      style={{
        padding: "24px",
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ marginBottom: "20px" }}>Platform Settings</h2>

      {message && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "10px",
            background: "#dcfce7",
            color: "#166534",
            fontWeight: "600",
          }}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            borderRadius: "10px",
            background: "#fee2e2",
            color: "#991b1b",
            fontWeight: "600",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "18px" }}>
        <label style={labelStyle}>Site Name</label>
        <input
          type="text"
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          style={{ ...inputStyle, maxWidth: "400px" }}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label style={labelStyle}>Fee % for price Rs. 0 to Rs. 2000</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={fee0To2000}
          onChange={(e) => setFee0To2000(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label style={labelStyle}>Fee % for price Rs. 2001 to Rs. 6000</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={fee2001To6000}
          onChange={(e) => setFee2001To6000(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: "18px" }}>
        <label style={labelStyle}>Fee % for price Rs. 6001 and above</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={fee6001Above}
          onChange={(e) => setFee6001Above(e.target.value)}
          style={inputStyle}
        />
      </div>

      <button
        onClick={updatePlatformSettings}
        disabled={saving}
        style={{
          padding: "12px 22px",
          border: "none",
          borderRadius: "10px",
          background: "#f53350",
          color: "#fff",
          fontWeight: "700",
          cursor: "pointer",
        }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

export default PlatformSettingsManagement;