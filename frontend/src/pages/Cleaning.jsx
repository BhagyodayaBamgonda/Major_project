import { useState } from "react";
import "./Cleaning.css";

export default function Cleaning() {
const [file, setFile] = useState(null);
const [loading, setLoading] = useState(false);

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

const handleUpload = async () => {
  if (!file) {
    alert("Please upload a CSV file!");
    return;
  }

  setLoading(true);

  try {
    const text = await file.text();
    const lines = text.trim().split("\n");

    if (lines.length < 2) {
      alert("Invalid CSV file!");
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(",").map(v => v.trim());
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || null;
        });

        data.push(row);
      }
    }

    const res = await fetch("http://127.0.0.1:5000/clean", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: data,
        options: options,
      }),
    });

    if (!res.ok) {
      throw new Error("Server error");
    }

    const result = await res.json();

    setCleanedData(result.cleaned_data);

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
    const values = headers.map((header) => {
      const value = row[header];
      return value !== null && value !== undefined ? `"${value}"` : "";
    });

    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

return ( <div className="cleaning-main-container"> <div className="cleaning-container">

```
    <h2 className="cleaning-title">Data Cleaning</h2>

    <input
      type="file"
      accept=".csv"
      onChange={(e) => setFile(e.target.files[0])}
      className="cleaning-file-input"
    />

    <div className="cleaning-options">

      <label>
        <input
          type="checkbox"
          checked={options.remove_nulls}
          onChange={(e) =>
            setOptions({ ...options, remove_nulls: e.target.checked })
          }
        />
        Remove Nulls
      </label>

      <label>
        <input
          type="checkbox"
          checked={options.remove_duplicates}
          onChange={(e) =>
            setOptions({
              ...options,
              remove_duplicates: e.target.checked,
            })
          }
        />
        Remove Duplicates
      </label>

      <label>
        Fill Strategy:
        <select
          value={options.fill_strategy}
          onChange={(e) =>
            setOptions({ ...options, fill_strategy: e.target.value })
          }
          className="cleaning-select"
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
          value={options.fill_constant}
          onChange={(e) =>
            setOptions({ ...options, fill_constant: e.target.value })
          }
          className="cleaning-constant-input"
        />
      )}

      <label>
        <input
          type="checkbox"
          checked={options.standardize}
          onChange={(e) =>
            setOptions({ ...options, standardize: e.target.checked })
          }
        />
        Standardize Data
      </label>

      <label>
        <input
          type="checkbox"
          checked={options.normalize}
          onChange={(e) =>
            setOptions({ ...options, normalize: e.target.checked })
          }
        />
        Normalize Data
      </label>

    </div>

    <button
      onClick={handleUpload}
      className="cleaning-upload-btn"
      disabled={loading}
    >
      {loading ? "Processing..." : "Clean & Process"}
    </button>

    {/* Preview Section */}
    {cleanedData.length > 0 && (
      <>
        <h3 className="preview-title">
          Preview of Cleaned Data (First 5 rows)
        </h3>

        <div className="cleaning-preview">
          <table>
            <thead>
              <tr>
                {Object.keys(cleanedData[0]).map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {cleanedData.slice(0, 5).map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}

    {/* Download Button */}
    {cleanedFileUrl && (
      <a
        href={cleanedFileUrl}
        download="cleaned_data.csv"
        className="cleaning-download-btn"
      >
        Download Cleaned File
      </a>
    )}

  </div>
</div>

);
}
