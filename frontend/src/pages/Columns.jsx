// src/pages/Columns.jsx
import "./Columns.css";

export default function Columns() {
  const data = JSON.parse(localStorage.getItem("dashboardData"));
  if (!data) return <p className="no-data-message">No data found. Upload first.</p>;

  return (
    <div className="columns-container">
      <h2 className="columns-title">Column Metadata</h2>
      <table className="columns-table">
        <thead>
          <tr className="table-header">
            <th>Column</th>
            <th>Dtype</th>
            <th>Role</th>
            <th>Non-null Count</th>
          </tr>
        </thead>
        <tbody>
          {data.columns.map((col, i) => (
            <tr key={i} className="table-row">
              <td className="table-cell">{col.column}</td>
              <td className="table-cell">{col.dtype}</td>
              <td className="table-cell">{col.role}</td>
              <td className="table-cell">{col.non_null_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}