import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ correct import
import "./Reports.css";

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("dashboardData");
    if (stored) {
      const parsed = JSON.parse(stored);

      // Dynamically generate top 10 rows if not present
      if (!parsed.top_rows && parsed.rows) {
        parsed.top_rows = parsed.rows.slice(0, 10);
      }

      setData(parsed);
    }
  }, []);

  const clearData = () => {
    localStorage.removeItem("dashboardData");
    setData(null);
  };

  const downloadReport = () => {
    if (!data) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("📊 Data Report", 14, 20);

    // --- KPIs ---
    doc.setFontSize(12);
    doc.text("Key Performance Indicators (KPIs)", 14, 30);
    const kpiRows = Object.entries(data.kpis || {}).map(([k, v]) => [k.toUpperCase(), v]);
    autoTable(doc, {
      startY: 35,
      head: [["KPI", "Value"]],
      body: kpiRows,
    });

    // --- Columns Summary ---
    doc.text("Column Details", 14, doc.lastAutoTable.finalY + 10);
    const colRows = (data.columns || []).map((col) => [
      col.column,
      col.dtype,
      col.role,
      col.non_null_count,
    ]);
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Column", "DType", "Role", "Non-Null Count"]],
      body: colRows,
    });

    // --- Top 10 Rows ---
    if (data.rows && data.rows.length > 0) {
      const topRows = data.rows.slice(0, 10); // dynamically slice top 10
      doc.text("Top 10 Rows", 14, doc.lastAutoTable.finalY + 10);
      const headers = Object.keys(topRows[0]);
      const rows = topRows.map((row) => headers.map((h) => row[h]));
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 15,
        head: [headers],
        body: rows,
      });
    }

    doc.save("data_report.pdf");
  };

  if (!data)
    return (
      <div className="reports-container">
        <h2 className="reports-title">No Data Found</h2>
        <p>Please upload and process a dataset first.</p>
        {localStorage.getItem("dashboardData") && (
          <div className="reports-actions">
            <button onClick={() => setData(JSON.parse(localStorage.getItem("dashboardData")))}>
              Reload Saved Data
            </button>
            <button onClick={clearData}>Clear Saved Data</button>
          </div>
        )}
      </div>
    );

  return (
    <div className="reports-container">
      <h2 className="reports-title">📑 Data Reports</h2>

      {/* KPI Section */}
      <div className="reports-kpis">
        {Object.entries(data.kpis || {}).map(([k, v]) => (
          <div key={k} className="report-card">
            <h3>{k.toUpperCase()}</h3>
            <p>{v}</p>
          </div>
        ))}
      </div>

      {/* Columns Summary */}
      <div className="reports-table">
        <h3>Column Details</h3>
        <table>
          <thead>
            <tr>
              <th>Column</th>
              <th>DType</th>
              <th>Role</th>
              <th>Non-Null Count</th>
            </tr>
          </thead>
          <tbody>
            {data.columns &&
              data.columns.map((col, idx) => (
                <tr key={idx}>
                  <td>{col.column}</td>
                  <td>{col.dtype}</td>
                  <td>{col.role}</td>
                  <td>{col.non_null_count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Top 10 Rows */}
      {data.rows && data.rows.length > 0 && (
        <div className="reports-table">
          <h3>Top 10 Rows</h3>
          <table>
            <thead>
              <tr>
                {Object.keys(data.rows[0]).map((h, idx) => (
                  <th key={idx}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 10).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Download Report Button */}
      <button onClick={downloadReport} className="download-report-btn">
        📥 Download PDF Report
      </button>

      {/* Clear Data Button */}
      <button onClick={clearData} className="clear-report-data-btn">
        🗑 Clear Saved Data
      </button>
    </div>
  );
}
