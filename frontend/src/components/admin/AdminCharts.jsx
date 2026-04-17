// import React from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";

// const PIE_COLORS = [
//   "#ae1f81",
//   "#14B8A6",
//   "#F59E0B",
//   "#EC4899",
//   "#8B5CF6",
// ];

// const tooltipStyle = {
//   backgroundColor: "#ffffff",
//   border: "1px solid #e5e7eb",
//   borderRadius: "12px",
//   boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
// };

// const emptyChartStyle = {
//   height: 300,
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   color: "#9ca3af",
// };

// const AdminCharts = ({ stats }) => {
//   if (!stats) return null;

//   const monthlyBookings = stats.monthly_bookings || [];
//   const monthlyRevenue = stats.monthly_revenue || [];
//   const listingsByType = stats.listings_by_type || [];
//   const hostApplicationStatus = stats.host_application_status || [];

//   return (
//     <div className="charts-grid">
//       {/* Row 1 - Monthly Bookings + Listings by Property Type */}
//       <div className="chart-card">
//         <div className="chart-header">
//           <h3>Monthly Bookings</h3>
//           <p>Booking volume by month</p>
//         </div>

//         <div className="chart-wrapper">
//           {monthlyBookings.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart
//                 data={monthlyBookings}
//                 margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
//                 barCategoryGap="28%"
//               >
//                 <defs>
//                   <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
//                     <stop offset="100%" stopColor="#818CF8" stopOpacity={0.75} />
//                   </linearGradient>
//                 </defs>

//                 <CartesianGrid
//                   stroke="#e5e7eb"
//                   strokeDasharray="4 4"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="month"
//                   tick={{ fill: "#6b7280", fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   allowDecimals={false}
//                   tick={{ fill: "#6b7280", fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar
//                   dataKey="bookings"
//                   fill="url(#bookingsGradient)"
//                   radius={[10, 10, 0, 0]}
//                   barSize={42}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={emptyChartStyle}>No booking data available</div>
//           )}
//         </div>
//       </div>

//       <div className="chart-card">
//         <div className="chart-header">
//           <h3>Listings by Property Type</h3>
//           <p>Distribution of listed properties</p>
//         </div>

//         <div className="chart-wrapper">
//           {listingsByType.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={listingsByType}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   innerRadius={70}
//                   outerRadius={110}
//                   paddingAngle={3}
//                 >
//                   {listingsByType.map((entry, index) => (
//                     <Cell
//                       key={`listing-type-${index}`}
//                       fill={PIE_COLORS[index % PIE_COLORS.length]}
//                     />
//                   ))}
//                 </Pie>
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={emptyChartStyle}>No property data available</div>
//           )}
//         </div>
//       </div>

//       {/* Row 2 - Monthly Revenue + Host Application Status */}
//       <div className="chart-card">
//         <div className="chart-header">
//           <h3>Monthly Revenue</h3>
//           <p>Revenue trend over time</p>
//         </div>

//         <div className="chart-wrapper">
//           {monthlyRevenue.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart
//                 data={monthlyRevenue}
//                 margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
//               >
//                 <CartesianGrid
//                   stroke="#e5e7eb"
//                   strokeDasharray="4 4"
//                   vertical={false}
//                 />
//                 <XAxis
//                   dataKey="month"
//                   tick={{ fill: "#6b7280", fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <YAxis
//                   tick={{ fill: "#6b7280", fontSize: 12 }}
//                   axisLine={false}
//                   tickLine={false}
//                 />
//                 <Tooltip
//                   contentStyle={tooltipStyle}
//                   formatter={(value) => [
//                     `Rs. ${Number(value).toLocaleString()}`,
//                     "Revenue",
//                   ]}
//                 />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="#14B8A6"
//                   strokeWidth={3}
//                   dot={{ r: 4, fill: "#14B8A6" }}
//                   activeDot={{ r: 6 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={emptyChartStyle}>No revenue data available</div>
//           )}
//         </div>
//       </div>

//       <div className="chart-card">
//         <div className="chart-header">
//           <h3>Host Application Status</h3>
//           <p>Approval status overview</p>
//         </div>

//         <div className="chart-wrapper">
//           {hostApplicationStatus.length > 0 ? (
//             <ResponsiveContainer width="100%" height={300}>
//               <PieChart>
//                 <Pie
//                   data={hostApplicationStatus}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={110}
//                   paddingAngle={3}
//                   label={false}
//                 >
//                   {hostApplicationStatus.map((entry, index) => {
//                     let color = "#FACC15";

//                     if (entry.name.toLowerCase() === "approved") {
//                       color = "#2eaec4";
//                     } else if (entry.name.toLowerCase() === "pending") {
//                       color = "#FACC15";
//                     } else if (entry.name.toLowerCase() === "rejected") {
//                       color = "#EF4444";
//                     }

//                     return (
//                       <Cell
//                         key={`host-status-${index}`}
//                         fill={color}
//                       />
//                     );
//                   })}
//                 </Pie>
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Legend />
//               </PieChart>
//             </ResponsiveContainer>
//           ) : (
//             <div style={emptyChartStyle}>No applications found</div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminCharts;

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#ae1f81", "#14B8A6", "#F59E0B", "#EC4899", "#8B5CF6"];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
};

const emptyChartStyle = {
  height: 300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9ca3af",
  fontSize: "15px",
  fontWeight: 500,
};

const periodOptions = [
  { label: "Last 7 Days", value: "7days" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

const AdminCharts = ({
  stats,
  period = "monthly",
  selectedCity = "all",
  chartLoading = false,
  onPeriodChange,
  onCityChange,
}) => {
  if (!stats) return null;

  const bookingData = stats.monthly_bookings || [];
  const revenueData = stats.monthly_revenue || [];
  const listingsByType = stats.listings_by_type || [];
  const hostApplicationStatus = stats.host_application_status || [];
  const availableCities = stats.available_cities || ["All"];

  const bookingsTitle =
    period === "7days"
      ? "Bookings - Last 7 Days"
      : period === "weekly"
      ? "Weekly Bookings"
      : period === "yearly"
      ? "Yearly Bookings"
      : "Monthly Bookings";

  const revenueTitle =
    period === "7days"
      ? "Revenue - Last 7 Days"
      : period === "weekly"
      ? "Weekly Revenue"
      : period === "yearly"
      ? "Yearly Revenue"
      : "Monthly Revenue";

  const bookingsSubtitle =
    selectedCity && selectedCity.toLowerCase() !== "all"
      ? `Booking volume for ${selectedCity}`
      : "Booking trend overview";

  const revenueSubtitle =
    selectedCity && selectedCity.toLowerCase() !== "all"
      ? `Revenue trend for ${selectedCity}`
      : "Revenue trend overview";

  return (
    <div className="charts-section">
      <div className="charts-topbar">
        <div>
          <h2 className="charts-main-title">Analytics Overview</h2>
          <p className="charts-main-subtitle">
            View trends by time range and city
          </p>
        </div>

        <div className="charts-controls">
          <div className="chart-filter-tabs">
            {periodOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`chart-filter-btn ${
                  period === item.value ? "active" : ""
                }`}
                onClick={() => onPeriodChange?.(item.value)}
                disabled={chartLoading}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="chart-city-filter">
            <select
              value={selectedCity}
              onChange={(e) => onCityChange?.(e.target.value)}
              className="chart-city-select"
              disabled={chartLoading}
            >
              {availableCities.map((city) => {
                const normalizedValue =
                  city.toLowerCase() === "all" ? "all" : city;

                return (
                  <option key={city} value={normalizedValue}>
                    {city}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="charts-content-wrapper">
        {chartLoading && (
          <div className="charts-loading-overlay">
            <div className="charts-loading-spinner"></div>
            <p>Updating charts...</p>
          </div>
        )}

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>{bookingsTitle}</h3>
              <p>{bookingsSubtitle}</p>
            </div>

            <div className="chart-wrapper">
              {bookingData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={bookingData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                    barCategoryGap="28%"
                  >
                    <defs>
                      <linearGradient
                        id="bookingsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366F1"
                          stopOpacity={0.95}
                        />
                        <stop
                          offset="100%"
                          stopColor="#818CF8"
                          stopOpacity={0.75}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#e5e7eb"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={period === "weekly" ? -15 : 0}
                      textAnchor={period === "weekly" ? "end" : "middle"}
                      height={period === "weekly" ? 60 : 40}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar
                      dataKey="bookings"
                      fill="url(#bookingsGradient)"
                      radius={[10, 10, 0, 0]}
                      barSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={emptyChartStyle}>No booking data available</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Listings by Property Type</h3>
              <p>
                {selectedCity && selectedCity.toLowerCase() !== "all"
                  ? `Property distribution in ${selectedCity}`
                  : "Distribution of listed properties"}
              </p>
            </div>

            <div className="chart-wrapper">
              {listingsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={listingsByType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {listingsByType.map((entry, index) => (
                        <Cell
                          key={`listing-type-${index}`}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={emptyChartStyle}>No property data available</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>{revenueTitle}</h3>
              <p>{revenueSubtitle}</p>
            </div>

            <div className="chart-wrapper">
              {revenueData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={revenueData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      stroke="#e5e7eb"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={period === "weekly" ? -15 : 0}
                      textAnchor={period === "weekly" ? "end" : "middle"}
                      height={period === "weekly" ? 60 : 40}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [
                        `Rs. ${Number(value).toLocaleString()}`,
                        "Revenue",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#14B8A6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#14B8A6" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div style={emptyChartStyle}>No revenue data available</div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Host Application Status</h3>
              <p>Approval status overview</p>
            </div>

            <div className="chart-wrapper">
              {hostApplicationStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={hostApplicationStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      paddingAngle={3}
                      label={false}
                    >
                      {hostApplicationStatus.map((entry, index) => {
                        let color = "#FACC15";

                        if (entry.name.toLowerCase() === "approved") {
                          color = "#2eaec4";
                        } else if (entry.name.toLowerCase() === "pending") {
                          color = "#FACC15";
                        } else if (entry.name.toLowerCase() === "rejected") {
                          color = "#EF4444";
                        } else if (
                          entry.name.toLowerCase() === "needs more info"
                        ) {
                          color = "#8B5CF6";
                        }

                        return (
                          <Cell key={`host-status-${index}`} fill={color} />
                        );
                      })}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={emptyChartStyle}>No applications found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// today added: Memoizing charts to avoid performance bottlenecks
export default React.memo(AdminCharts);