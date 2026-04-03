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

const PIE_COLORS = [
  "#ae1f81", // soft indigo
  "#14B8A6", // teal
  "#F59E0B", // amber
  "#EC4899", // pink
  "#8B5CF6", // violet
];

const tooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
};

const AdminCharts = ({ stats }) => {
  if (!stats) return null;

  const monthlyBookings = stats.monthly_bookings || [];
  const monthlyRevenue = stats.monthly_revenue || [];
  const listingsByType = stats.listings_by_type || [];
  const hostApplicationStatus = stats.host_application_status || [];

  return (
    <div className="charts-grid">
      <div className="chart-card">
        <div className="chart-header">
          <h3>Monthly Bookings</h3>
          <p>Booking volume by month</p>
        </div>

        <div className="chart-wrapper">
          {monthlyBookings.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center" }}>
              <BarChart width={700} height={300} data={monthlyBookings}>
                <defs>
                  <linearGradient id="bookingsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.95} />
                    <stop offset="100%" stopColor="#818CF8" stopOpacity={0.75} />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="bookings" fill="url(#bookingsGradient)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </div>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No booking data available</div>
          )}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Monthly Revenue</h3>
          <p>Revenue trend over time</p>
        </div>

        <div className="chart-wrapper">
          {monthlyRevenue.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center" }}>
              <LineChart width={700} height={300} data={monthlyRevenue}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`Rs. ${Number(value).toLocaleString()}`, "Revenue"]}
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
            </div>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No revenue data available</div>
          )}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-header">
          <h3>Listings by Property Type</h3>
          <p>Distribution of listed properties</p>
        </div>

        <div className="chart-wrapper">
          {listingsByType.length > 0 ? (
            <div style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center" }}>
              <PieChart width={500} height={300}>
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
            </div>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No property data available</div>
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
            <div style={{ width: "100%", overflowX: "auto", display: "flex", justifyContent: "center" }}>
              <PieChart width={500} height={300}>
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
                        let color = "#FACC15"; // default yellow
  
                        if (entry.name.toLowerCase() === "approved") {
                          color = "#2eaec4"; // green (approved)
                        } else if (entry.name.toLowerCase() === "pending") {
                          color = "#FACC15"; // yellow (pending)
                        } else if (entry.name.toLowerCase() === "rejected") {
                          color = "#EF4444"; // soft red (rejected)
                        }
  
                        return (
                          <Cell
                            key={`host-status-${index}`}
                            fill={color}
                          />
                        );
                      })}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </div>
          ) : (
            <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>No applications found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;