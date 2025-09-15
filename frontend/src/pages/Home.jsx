// src/pages/Home.jsx
import { useState } from "react";
import "./Home.css"; // Import a dedicated CSS file for Home

export default function Home() {
  const [file, setFile] = useState(null);
  const [options, setOptions] = useState({
    remove_nulls: false,
    remove_duplicates: false,
    fill_strategy: "none",
    fill_constant: ""
  });

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CSV file!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("remove_nulls", options.remove_nulls);
    formData.append("remove_duplicates", options.remove_duplicates);
    formData.append("fill_strategy", options.fill_strategy);
    formData.append("fill_constant", options.fill_constant);

    const res = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    localStorage.setItem("dashboardData", JSON.stringify(data));
    window.location.href = "/dashboard";
  };

  return (
    <div className="home-container">
      <h2 className="home-title">Upload CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="home-file-input"
      />

      <div className="home-options">
        <label className="home-option">
          <input 
            type="checkbox"
            onChange={(e) => setOptions({ ...options, remove_nulls: e.target.checked })}
          /> Remove Nulls
        </label>
        
        <label className="home-option">
          <input 
            type="checkbox"
            onChange={(e) => setOptions({ ...options, remove_duplicates: e.target.checked })}
          /> Remove Duplicates
        </label>
        
        <label className="home-option">
          Fill Strategy:
          <select
            className="home-select"
            onChange={(e) => setOptions({ ...options, fill_strategy: e.target.value })}
          >
            <option value="none">None</option>
            <option value="mean">Mean</option>
            <option value="median">Median</option>
            <option value="constant">Constant</option>
          </select>
        </label>
        
        {options.fill_strategy === "constant" && (
          <input
            type="text"
            placeholder="Enter constant value"
            onChange={(e) => setOptions({ ...options, fill_constant: e.target.value })}
            className="home-constant-input"
          />
        )}
      </div>

      <button
        onClick={handleUpload}
        className="home-upload-btn"
      >
        Upload & Analyze
      </button>
    </div>
  );
}