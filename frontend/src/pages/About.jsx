// src/pages/About.jsx
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <h2 className="about-title">About This Project</h2>
      <p className="about-description">
        This project is an Auto-BI tool built with Flask (backend) and React (frontend).
        It lets you upload datasets, clean them, and automatically generate dashboards
        with KPIs and charts similar to Power BI.
      </p>
      <div className="about-features">
        <p className="about-features-title">Features:</p>
        <ul className="about-features-list">
          <li>Data cleaning (nulls, duplicates, fill strategy)</li>
          <li>Automatic KPI calculation</li>
          <li>Interactive charts (histogram, pie, bar, line)</li>
          <li>Download cleaned dataset</li>
        </ul>
      </div>
    </div>
  );
}