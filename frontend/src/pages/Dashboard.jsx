import Plot from "react-plotly.js";
import "./Dashboard.css";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Safely convert any value to a renderable string
const safeVal = (v) => {
  if (v === null || v === undefined) return "-";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const dashboardRef = useRef(null);

  // ✅ NEW STATES
  const [editMode, setEditMode] = useState(false);
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    try {
      const dashboardData = JSON.parse(localStorage.getItem("dashboardData"));
      if (dashboardData) {
        setData(dashboardData);
        setError(null);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  // ✅ FILE UPLOAD
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const responseData = await res.json();

        // ⚠️ IMPORTANT: backend must send columns + data
        // { columns: [], data: [], charts: [] }

        localStorage.setItem("dashboardData", JSON.stringify(responseData));
        setData(responseData);
        setShowUploadModal(false);
        alert("File processed successfully!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD CUSTOM CHART
  const handleAddChart = () => {
    if (!selectedX || !selectedY) {
      alert("Select both X and Y columns");
      return;
    }

    const newChart = {
      title: `${chartType.toUpperCase()} (${selectedX} vs ${selectedY})`,
      figure: {
        data: [
          {
            x: data.data.map((row) => row[selectedX]),
            y: data.data.map((row) => row[selectedY]),
            type: chartType,
          },
        ],
        layout: {
          title: `${selectedX} vs ${selectedY}`,
        },
      },
    };

    const updated = {
      ...data,
      charts: [...(data.charts || []), newChart],
    };

    setData(updated);
    localStorage.setItem("dashboardData", JSON.stringify(updated));
  };

  // ✅ DELETE CHART
  const deleteChart = (index) => {
    const updatedCharts = data.charts.filter((_, i) => i !== index);
    const updated = { ...data, charts: updatedCharts };

    setData(updated);
    localStorage.setItem("dashboardData", JSON.stringify(updated));
  };

  const clearData = () => {
    localStorage.removeItem("dashboardData");
    setData(null);
  };

  // ✅ DOWNLOAD PDF
  const handleDownloadDashboard = async () => {
    const canvas = await html2canvas(dashboardRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("landscape");
    pdf.addImage(imgData, "PNG", 10, 10, 280, 150);
    pdf.save("dashboard.pdf");
  };

  if (loading) return <h2>Loading...</h2>;

  const columns = data?.columns || [];

  return (
    <div className="dashboard-page">
      {error && <div className="error-message">{error}</div>}
      
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="dh-title">
          <span className="material-symbols-outlined">dashboard</span>
          <h1>Dashboard</h1>
        </div>

        <div className="dashboard-actions">
          <button className="btn-primary" onClick={() => setShowUploadModal(true)}>
            <span className="material-symbols-outlined">upload</span> Upload File
          </button>

          {data && (
            <>
              <button className="btn-outline" onClick={() => setEditMode(!editMode)}>
                <span className="material-symbols-outlined">edit</span> {editMode ? "Exit Edit" : "Edit Dashboard"}
              </button>

              <button className="btn-outline" onClick={handleDownloadDashboard}>
                <span className="material-symbols-outlined">download</span> Download PDF
              </button>

              <button className="btn-danger" onClick={clearData}>
                <span className="material-symbols-outlined">delete</span> Clear
              </button>
            </>
          )}
        </div>
      </header>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="dash-modal-overlay">
          <div className="dash-modal">
            <h3>Upload Dataset</h3>
            <p>Upload a CSV or Excel file to generate your dashboard.</p>
            <input type="file" onChange={handleFileUpload} className="dash-file-input" />
            <div className="dash-modal-actions">
              <button className="btn-outline" onClick={() => setShowUploadModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PANEL */}
      {editMode && data && (
        <div className="edit-panel">
          <h3><span className="material-symbols-outlined">add_chart</span> Add Visualization</h3>
          <div className="edit-controls">
            <select className="dash-select" onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Bar Chart</option>
              <option value="scatter">Scatter Plot</option>
              <option value="line">Line Chart</option>
              <option value="pie">Pie Chart</option>
            </select>

            <select className="dash-select" onChange={(e) => setSelectedX(e.target.value)}>
              <option>Select X Axis</option>
              {columns.map((col, i) => <option key={i}>{safeVal(col)}</option>)}
            </select>

            <select className="dash-select" onChange={(e) => setSelectedY(e.target.value)}>
              <option>Select Y Axis</option>
              {columns.map((col, i) => <option key={i}>{safeVal(col)}</option>)}
            </select>

            <button className="btn-primary" onClick={handleAddChart}>Add Chart</button>
          </div>
        </div>
      )}

      {/* DASHBOARD */}
      {data ? (
        <div ref={dashboardRef} className="dashboard-content">
          <div className="charts-grid">
            {data.charts?.map((chart, idx) => (
              <div key={idx} className="chart-card">
                <h3 className="chart-title">{chart.title}</h3>

                <Plot
                  data={chart.figure.data}
                  layout={{
                    ...chart.figure.layout,
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { family: 'Inter, sans-serif' }
                  }}
                  useResizeHandler={true}
                  style={{ width: "100%", height: "400px" }}
                />

                {editMode && (
                  <button className="btn-danger-sm chart-delete-btn" onClick={() => deleteChart(idx)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="dashboard-empty">
          <span className="material-symbols-outlined empty-icon">monitoring</span>
          <h2>No Dashboard Data</h2>
          <p>Upload a file or create a dashboard from the Cleaning tab to get started.</p>
        </div>
      )}
    </div>
  );
}