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
  const [chartLoading, setChartLoading] = useState(true);
  const dashboardRef = useRef(null);

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
        localStorage.setItem("dashboardData", JSON.stringify(responseData));
        setData(responseData);
        setShowUploadModal(false);
        alert("File processed successfully! Dashboard is now updated.");
      } else {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to process file");
      }
    } catch (err) {
      setError("Error processing file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    localStorage.removeItem("dashboardData");
    setData(null);
    setError("Dashboard data cleared.");
  };

  const handleDownloadDashboard = async () => {
    if (!dashboardRef.current) return;

    try {
      // Give charts time to render before capturing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const canvas = await html2canvas(dashboardRef.current, { 
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a'
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "mm", "a4");
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("data_dashboard.pdf");
    } catch (err) {
      alert("Error generating PDF: " + err.message);
    }
  };

  const LoadingAnimation = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p className="loading-text">Processing your file...</p>
    </div>
  );

  const ChartLoadingPlaceholder = () => (
    <div className="chart-loading">
      <div className="chart-spinner"></div>
      <p>Loading visualization...</p>
    </div>
  );

  if (loading) {
    return <LoadingAnimation />;
  }

  return (
    <div className="dashboard-wrapper">
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Upload Data File</h3>
            <p>Select a data file to create dashboard visualizations:</p>
            
            <div className="file-upload-container">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.json,.txt"
                onChange={handleFileUpload}
                className="file-input"
                id="dashboard-file-upload"
              />
              <label htmlFor="dashboard-file-upload" className="file-upload-label">
                Choose Data File (CSV, Excel, JSON, etc.)
              </label>
              <p className="file-types-info">Supported formats: CSV, Excel, JSON, Text</p>
            </div>
            
            <div className="modal-actions">
              <button onClick={() => setShowUploadModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <h1>📊 Data Insights Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={() => setShowUploadModal(true)} className="upload-data-btn">
            Upload Data File
          </button>
          {data && (
            <>
              <button onClick={handleDownloadDashboard} className="download-dashboard-btn">
                Download PDF
              </button>
              <button onClick={clearData} className="clear-dashboard-btn">
                Clear Data
              </button>
            </>
          )}
        </div>
      </header>

      {error && !data && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => setShowUploadModal(true)} className="upload-data-btn">
              Try Again
            </button>
          </div>
        </div>
      )}

      {data ? (
        <div className="dashboard-container" ref={dashboardRef}>
          {data.charts && data.charts.length > 0 ? (
            <div className="visualizations-section">
              <h2>📊 Data Visualizations</h2>
              <div className="charts-grid">
                {data.charts.map((chart, idx) => (
                  <div key={idx} className="chart-card">
                    <h3 className="chart-title">{chart.title}</h3>
                    <div className="chart-container">
                      {chart.figure && chart.figure.data ? (
                        <Plot
                          data={chart.figure.data}
                          layout={{
                            ...chart.figure.layout,
                            autosize: true,
                            margin: { t: 60, l: 60, r: 40, b: 60 },
                            showlegend: true,
                            legend: {
                              x: 0.5,
                              y: -0.2,
                              xanchor: 'center',
                              orientation: 'h'
                            },
                            paper_bgcolor: 'rgba(30, 41, 59, 0.9)',
                            plot_bgcolor: 'rgba(30, 41, 59, 0.9)',
                            font: {
                              color: '#f1f5f9',
                              family: 'Arial, sans-serif'
                            },
                            xaxis: {
                              color: '#f1f5f9',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            },
                            yaxis: {
                              color: '#f1f5f9',
                              gridcolor: 'rgba(255, 255, 255, 0.1)'
                            }
                          }}
                          config={{
                            displayModeBar: true,
                            displaylogo: false,
                            modeBarButtonsToRemove: ['lasso2d', 'select2d'],
                            responsive: true,
                            toImageButtonOptions: {
                              format: 'png',
                              width: 800,
                              height: 600,
                              scale: 2
                            }
                          }}
                          style={{ 
                            width: '100%', 
                            height: '400px',
                            backgroundColor: 'rgba(30, 41, 59, 0.9)',
                            borderRadius: '8px'
                          }}
                          useResizeHandler={true}
                          onInitialized={() => setChartLoading(false)}
                          onUpdate={() => setChartLoading(false)}
                        />
                      ) : (
                        <div className="chart-error">
                          <p>Unable to display chart</p>
                          <small>Chart data format is invalid</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-charts-message">
              <h3>No Visualizations Available</h3>
              <p>The uploaded data didn't generate any charts. This could be due to:</p>
              <ul>
                <li>Insufficient data for visualization</li>
                <li>Data format issues</li>
                <li>All columns being of incompatible types</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        !error && (
          <div className="welcome-message">
            <h2>Welcome to the Data Dashboard</h2>
            <p>Upload any data file to create beautiful visualizations:</p>
            <ul className="supported-formats">
              <li>📊 CSV files</li>
              <li>📈 Excel spreadsheets</li>
              <li>📋 JSON data</li>
              <li>📝 Text files</li>
            </ul>
            <div className="welcome-actions">
              <button onClick={() => setShowUploadModal(true)} className="upload-data-btn">
                Upload Data File
              </button>
            </div>
          </div>
        )
      )}
    </div>
  );
}