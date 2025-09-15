// src/pages/KPIs.jsx
import "./KPIs.css";

export default function KPIs() {
  const data = JSON.parse(localStorage.getItem("dashboardData"));
  if (!data) return <p className="no-data-message">No data found. Upload first.</p>;

  return (
    <div className="kpis-container">
      <h2 className="kpis-title">KPI Summary</h2>
      <div className="kpis-grid">
        {Object.entries(data.kpis).map(([k, v]) => (
          <div key={k} className="kpi-item">
            <h3 className="kpi-name">{k.toUpperCase()}</h3>
            <p className="kpi-value">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}