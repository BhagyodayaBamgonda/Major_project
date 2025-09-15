// src/pages/Dashboard.jsx
import Plot from "react-plotly.js";
import "./Dashboard.css";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dashboardData = JSON.parse(localStorage.getItem("dashboardData"));
    console.log("Dashboard data:", dashboardData); // Debugging
    setData(dashboardData);
    setLoading(false);
  }, []);

  if (loading) return <p className="loading-message">Loading...</p>;
  if (!data) return <p className="no-data-message">No data found. Please upload a file first.</p>;

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      {/* Debug info - remove after fixing */}
      <div className="debug-info" style={{display: 'none'}}>
        <p>Data exists: {data ? 'Yes' : 'No'}</p>
        <p>KPIs: {data && data.kpis ? Object.keys(data.kpis).length : 0}</p>
        <p>Charts: {data && data.charts ? data.charts.length : 0}</p>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        {Object.entries(data.kpis || {}).map(([k, v]) => (
          <div key={k} className="kpi-card">
            <h3 className="kpi-title">{k.toUpperCase()}</h3>
            <p className="kpi-value">{v}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {data.charts && data.charts.map((chart, idx) => (
          <div key={idx} className="chart-card">
            <h3 className="chart-title">{chart.title}</h3>
            <Plot 
              data={chart.figure?.data || []} 
              layout={{...chart.figure?.layout, width: 400, height: 300}} 
            />
          </div>
        ))}
      </div>

      {/* Download Section */}
  {data.download_url && (
  <div className="download-section">
    <a
      href={data.download_url}
      download="cleaned_data.csv" // optional file name suggested
      className="download-button"
      target="_blank" // optional to open download in new tab if direct link
      rel="noopener noreferrer"
    >
      Download Cleaned CSV
    </a>
  </div>
)}
    </div>
  );
}