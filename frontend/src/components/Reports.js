import React, { useState, useEffect } from "react";

function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theory, setTheory] = useState("");

  useEffect(() => {
    const dashboardData = JSON.parse(localStorage.getItem("dashboardData"));
    setData(dashboardData);
    setLoading(false);

    // Generate theoretical description dynamically based on dataset
    if (dashboardData && dashboardData.kpis) {
      let description = "This report analyzes the dataset by focusing on key performance indicators summarized as follows:\n\n";
      
      Object.entries(dashboardData.kpis).forEach(([key, value]) => {
        description += `- The ${key.toUpperCase()} is currently valued at ${value}. This metric indicates `;
        // Simple heuristic theoretical comment per KPI
        if (typeof value === "number") {
          if (value > 80) {
            description += "an excellent performance level, suggesting strong results.\n";
          } else if (value > 50) {
            description += "a moderate performance, indicating potential for improvement.\n";
          } else {
            description += "a below-par performance, requiring attention and action.\n";
          }
        } else {
          description += "an important qualitative indicator for analysis.\n";
        }
      });

      description += "\nFurther data analysis and interpretation are advised to align with specific organizational goals and strategies.";
      setTheory(description);
    } else {
      setTheory("Insufficient KPI data available for theoretical analysis.");
    }
  }, []);

  if (loading) return <p>Loading report...</p>;
  if (!data) return <p>No data available to generate report.</p>;

  return (
    <div className="report-container">
      <h1>Theoretical Detailed Report</h1>

      <section>
        <h2>Theoretical Summary</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
          {theory}
        </pre>
      </section>

      <section>
        <h2>Key Performance Indicators (KPIs)</h2>
        <ul>
          {data.kpis ? Object.entries(data.kpis).map(([key, value]) => (
            <li key={key}><strong>{key.toUpperCase()}</strong>: {value}</li>
          )) : <li>No KPIs available.</li>}
        </ul>
      </section>
    </div>
  );
}

export default Reports;
