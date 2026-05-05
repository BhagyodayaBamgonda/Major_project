import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Cleaning.css";

export default function Cleaning() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const [options, setOptions] = useState({
    remove_nulls: false,
    remove_duplicates: false,
    fill_strategy: "none",
    fill_constant: "",
    standardize: false,
    normalize: false,
  });

  const [cleanedFileUrl, setCleanedFileUrl] = useState(null);
  const [cleanedData, setCleanedData] = useState([]);
  const [cleanedHeaders, setCleanedHeaders] = useState([]);

  const handleUpload = async () => {
    if (!file) { alert("Please upload a CSV file!"); return; }
    setLoading(true);

    try {
      const text = await file.text();
      const lines = text.trim().split("\n");
      if (lines.length < 2) { alert("Invalid CSV file!"); return; }

      const headers = lines[0].split(",").map(h => h.trim());
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(",").map(v => v.trim());
          const row = {};
          headers.forEach((header, index) => { row[header] = values[index] || null; });
          data.push(row);
        }
      }

      const res = await fetch("http://127.0.0.1:5000/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data, options }),
      });

      if (!res.ok) throw new Error("Server error");

      const result = await res.json();
      setCleanedData(result.cleaned_data);
      setCleanedHeaders(headers);

      const csvContent = convertToCSV(result.cleaned_data, headers);
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      setCleanedFileUrl(url);

    } catch (err) {
      console.error(err);
      alert("Error processing file!");
    } finally {
      setLoading(false);
    }
  };

  const convertToCSV = (data, headers) => {
    const csvRows = [headers.join(",")];
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        return value !== null && value !== undefined ? `"${value}"` : "";
      });
      csvRows.push(values.join(","));
    }
    return csvRows.join("\n");
  };

  // ── NEW: Auto-send cleaned JSON to /create-dashboard ────────────────────
  const handleCreateDashboard = async () => {
    if (!cleanedData.length) return;

    setDashboardLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/create-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: cleanedData }),
      });

      if (!res.ok) throw new Error("Dashboard creation failed");

      const dashboardData = await res.json();
      localStorage.setItem("dashboardData", JSON.stringify(dashboardData));

      // Navigate straight to Dashboard
      navigate("/dashboard");

    } catch (err) {
      console.error(err);
      alert("Failed to create dashboard: " + err.message);
    } finally {
      setDashboardLoading(false);
    }
  };

  return (
    <div className="cleaning-page">

      {/* ── Header ── */}
      <div className="cleaning-page-header">
        <h1 className="cleaning-page-title">
          <span className="material-symbols-outlined">auto_fix_high</span>
          Data Cleaning
        </h1>
        <p className="cleaning-page-subtitle">
          Upload a CSV file, configure cleaning options, and download your refined dataset.
        </p>
      </div>

      <div className="cleaning-layout">

        {/* ── Left Panel: Options ── */}
        <div className="cleaning-panel">
          <div className="panel-section">
            <h3 className="panel-section-title">
              <span className="material-symbols-outlined">upload_file</span>
              Upload File
            </h3>
            <label className="file-upload-label">
              <span className="material-symbols-outlined">attach_file</span>
              {file ? file.name : "Choose CSV file"}
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </label>
          </div>

          <div className="panel-section">
            <h3 className="panel-section-title">
              <span className="material-symbols-outlined">tune</span>
              Cleaning Options
            </h3>

            <div className="option-list">
              <label className="option-row">
                <div className="option-info">
                  <span className="option-label">Remove Nulls</span>
                  <span className="option-desc">Drop rows with missing values</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={options.remove_nulls}
                  onChange={(e) => setOptions({ ...options, remove_nulls: e.target.checked })}
                />
              </label>

              <label className="option-row">
                <div className="option-info">
                  <span className="option-label">Remove Duplicates</span>
                  <span className="option-desc">Eliminate repeated rows</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={options.remove_duplicates}
                  onChange={(e) => setOptions({ ...options, remove_duplicates: e.target.checked })}
                />
              </label>

              <label className="option-row">
                <div className="option-info">
                  <span className="option-label">Standardize</span>
                  <span className="option-desc">Z-score normalization</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={options.standardize}
                  onChange={(e) => setOptions({ ...options, standardize: e.target.checked })}
                />
              </label>

              <label className="option-row">
                <div className="option-info">
                  <span className="option-label">Normalize</span>
                  <span className="option-desc">Scale values to 0–1 range</span>
                </div>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={options.normalize}
                  onChange={(e) => setOptions({ ...options, normalize: e.target.checked })}
                />
              </label>

              <div className="option-row">
                <div className="option-info">
                  <span className="option-label">Fill Strategy</span>
                  <span className="option-desc">Handle missing values</span>
                </div>
                <select
                  value={options.fill_strategy}
                  onChange={(e) => setOptions({ ...options, fill_strategy: e.target.value })}
                  className="option-select"
                >
                  <option value="none">None</option>
                  <option value="mean">Mean</option>
                  <option value="median">Median</option>
                  <option value="constant">Constant</option>
                </select>
              </div>

              {options.fill_strategy === "constant" && (
                <div className="option-row">
                  <div className="option-info">
                    <span className="option-label">Constant Value</span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 0"
                    value={options.fill_constant}
                    onChange={(e) => setOptions({ ...options, fill_constant: e.target.value })}
                    className="option-text-input"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleUpload}
            className="clean-run-btn"
            disabled={loading || !file}
          >
            {loading
              ? <><span className="material-symbols-outlined spin">refresh</span> Processing…</>
              : <><span className="material-symbols-outlined">auto_fix_high</span> Clean & Process</>
            }
          </button>
        </div>

        {/* ── Right Panel: Results ── */}
        <div className="cleaning-results">
          {cleanedData.length === 0 ? (
            <div className="results-empty">
              <span className="material-symbols-outlined results-empty-icon">table_chart</span>
              <p>Cleaned data preview will appear here</p>
              <small>Upload and process a CSV file to get started</small>
            </div>
          ) : (
            <>
              {/* Stats row */}
              <div className="results-stats">
                <div className="stat-chip">
                  <span className="material-symbols-outlined">check_circle</span>
                  {cleanedData.length} rows
                </div>
                <div className="stat-chip">
                  <span className="material-symbols-outlined">view_column</span>
                  {cleanedHeaders.length} columns
                </div>
                <div className="stat-chip success">Cleaning Complete</div>
              </div>

              {/* Table Preview */}
              <div className="results-table-wrap">
                <p className="results-table-label">Preview — first 5 rows</p>
                <div className="cleaning-preview">
                  <table>
                    <thead>
                      <tr>
                        {Object.keys(cleanedData[0]).map(h => <th key={h}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {cleanedData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {Object.values(row).map((v, j) => <td key={j}>{v}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="results-actions">
                <a
                  href={cleanedFileUrl}
                  download="cleaned_data.csv"
                  className="action-btn btn-download"
                >
                  <span className="material-symbols-outlined">download</span>
                  Download Cleaned File
                </a>

                {/* ── NEW: Create Dashboard button ── */}
                <button
                  className="action-btn btn-dashboard"
                  onClick={handleCreateDashboard}
                  disabled={dashboardLoading}
                >
                  {dashboardLoading
                    ? <><span className="material-symbols-outlined spin">refresh</span> Creating…</>
                    : <><span className="material-symbols-outlined">dashboard_customize</span> Create Dashboard</>
                  }
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
