// src/pages/About.jsx
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
      <h2 className="about-title">About Auto-BI Dashboard</h2>
      <p className="about-description">
        The <strong>Auto-BI Dashboard</strong> is an intelligent data analysis and
        visualization tool built with <strong>React</strong> (frontend) and <strong>Flask</strong> (backend).
        It empowers users to quickly transform raw datasets into meaningful insights
        without writing complex code or formulas.
      </p>

      <div className="about-features">
        <p className="about-features-title">✨ Key Features:</p>
        <ul className="about-features-list">
          <li>⚡ Upload CSV datasets with a simple drag-and-drop interface</li>
          <li>🧹 Data Cleaning (remove nulls, duplicates, apply fill strategies)</li>
          <li>📊 Automatic KPI generation for instant insights</li>
          <li>📈 Interactive charts (bar, pie, line, histogram, scatter, heatmap)</li>
          <li>📑 Report generation with summary insights</li>
          <li>📂 Download cleaned datasets and analysis outputs</li>
          <li>🎨 Modern dashboard design inspired by Power BI</li>
        </ul>
      </div>

      <p className="about-closing">
        This project bridges the gap between <strong>data preprocessing</strong> and
        <strong>business intelligence</strong>, making analytics faster, cleaner, and more
        accessible for everyone.
      </p>
    </div>
  );
}
