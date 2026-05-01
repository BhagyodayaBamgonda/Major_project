import Plot from "react-plotly.js";
import "./Dashboard.css";
import { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

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
    <div className="dashboard-wrapper">
      
      {/* HEADER */}
      <header className="dashboard-header">
        <h1>📊 Dashboard</h1>

        <div className="dashboard-actions">
          <button onClick={() => setShowUploadModal(true)}>
            Upload File
          </button>

          {data && (
            <>
              <button onClick={() => setEditMode(!editMode)}>
                {editMode ? "Exit Edit" : "Edit Dashboard"}
              </button>

              <button onClick={handleDownloadDashboard}>
                Download PDF
              </button>

              <button onClick={clearData}>Clear</button>
            </>
          )}
        </div>
      </header>

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal">
          <input type="file" onChange={handleFileUpload} />
          <button onClick={() => setShowUploadModal(false)}>Close</button>
        </div>
      )}

      {/* EDIT PANEL */}
      {editMode && data && (
        <div className="edit-panel">
          <h3>Add Visualization</h3>

          <select onChange={(e) => setChartType(e.target.value)}>
            <option value="bar">Bar</option>
            <option value="scatter">Scatter</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>

          <select onChange={(e) => setSelectedX(e.target.value)}>
            <option>Select X</option>
            {columns.map((col, i) => (
              <option key={i}>{col}</option>
            ))}
          </select>

          <select onChange={(e) => setSelectedY(e.target.value)}>
            <option>Select Y</option>
            {columns.map((col, i) => (
              <option key={i}>{col}</option>
            ))}
          </select>

          <button onClick={handleAddChart}>Add Chart</button>
        </div>
      )}

      {/* DASHBOARD */}
      {data ? (
        <div ref={dashboardRef}>
          <div className="charts-grid">
            {data.charts?.map((chart, idx) => (
              <div key={idx} className="chart-card">
                <h3>{chart.title}</h3>

                <Plot
                  data={chart.figure.data}
                  layout={chart.figure.layout}
                  style={{ width: "100%", height: "400px" }}
                />

                {editMode && (
                  <button onClick={() => deleteChart(idx)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h2>Upload file to start</h2>
      )}
    </div>
  );
}