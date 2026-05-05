import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ correct import
import "./Reports.css";

// Safely convert any value to a string React can render
const safeVal = (v) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

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

      // Normalize columns_meta so it is ALWAYS an array of plain-string objects.
      // `columns` might be strings ["col1"] OR legacy objects [{column,dtype,...}].
      if (!parsed.columns_meta && parsed.columns) {
        parsed.columns_meta = parsed.columns.map((c) => {
          if (c !== null && typeof c === "object") {
            return {
              column: String(c.column ?? ""),
              dtype: String(c.dtype ?? "-"),
              role: String(c.role ?? "-"),
              non_null_count: String(c.non_null_count ?? "-"),
            };
          }
          return { column: String(c), dtype: "-", role: "-", non_null_count: "-" };
        });
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
      <div className="reports-page">
        <div className="reports-empty">
          <span className="material-symbols-outlined empty-icon">description</span>
          <h2>No Data Found</h2>
          <p>Please upload and process a dataset first.</p>
          {localStorage.getItem("dashboardData") && (
            <div className="reports-empty-actions">
              <button className="btn-primary" onClick={() => setData(JSON.parse(localStorage.getItem("dashboardData")))}>
                Reload Saved Data
              </button>
              <button className="btn-danger" onClick={clearData}>Clear Saved Data</button>
            </div>
          )}
        </div>
      </div>
    );

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div className="rh-title">
          <span className="material-symbols-outlined">summarize</span>
          <h2>Data Reports</h2>
        </div>
        <div className="reports-actions">
          <button onClick={downloadReport} className="btn-outline">
            <span className="material-symbols-outlined">download</span> Download PDF
          </button>
          <button onClick={clearData} className="btn-danger">
            <span className="material-symbols-outlined">delete</span> Clear Saved Data
          </button>
        </div>
      </div>

      <div className="reports-content">
        {/* KPI Section */}
        <div className="reports-kpis">
          {Object.entries(data.kpis || {}).map(([k, v]) => (
            <div key={k} className="report-kpi-card">
              <h3>{k.toUpperCase()}</h3>
              <p>{safeVal(v)}</p>
            </div>
          ))}
        </div>

        {/* Columns Summary */}
        <div className="reports-table-wrap">
          <h3 className="table-title">Column Details</h3>
          <div className="reports-table">
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
                {(data.columns_meta || []).map((col, idx) => (
                  <tr key={idx}>
                    <td>{safeVal(col.column)}</td>
                    <td>{safeVal(col.dtype)}</td>
                    <td>{safeVal(col.role)}</td>
                    <td>{safeVal(col.non_null_count)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 Rows */}
        {(data.preview?.rows || data.data?.slice(0, 10) || data.rows?.slice(0, 10)) && (
          <div className="reports-table-wrap">
            <h3 className="table-title">Top 10 Rows</h3>
            <div className="reports-table">
              <table>
                <thead>
                  <tr>
                    {Object.keys((data.preview?.rows || data.data || data.rows)[0] || {}).map((h, idx) => (
                      <th key={idx}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.preview?.rows || data.data?.slice(0, 10) || data.rows?.slice(0, 10)).map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row).map((v, i) => (
                        <td key={i}>{safeVal(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
