import React, { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/charts")
      .then(res => res.json())
      .then(data => setCharts(data))
      .catch(err => console.error("Error fetching charts:", err));
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard Overview</h1>
      <div className="chart-grid">
        {charts.map((chart, index) => (
          <div className="chart-card" key={index}>
            <h3>{chart.title}</h3>
            <img src={`http://127.0.0.1:5000${chart.image_url}`} alt={chart.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
