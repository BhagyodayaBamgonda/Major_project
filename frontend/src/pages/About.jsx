// src/pages/About.jsx
import "./About.css";

export default function About() {
  return (
    <div className="about-container">
  <div className="about-content">

    <div className="about-grid">

      {/* LEFT */}
      <div className="about-left">
        <h1 className="about-title">About Auto-BI Dashboard</h1>

        <p className="about-description">
          The Auto-BI Dashboard is an intelligent data analysis and visualization tool...
        </p>
      </div>

      {/* RIGHT */}
      <div className="about-right">
        <h3 className="about-features-title">✨ Key Features:</h3>

        <ul className="about-features-list">
          <li>Upload CSV datasets</li>
          <li>Data cleaning</li>
          <li>KPI generation</li>
          <li>Interactive charts</li>
          <li>Report generation</li>
        </ul>
      </div>

    </div>

    {/* Bottom Section */}
    <p className="about-closing">
      This project bridges the gap between data preprocessing and business intelligence...
    </p>

  </div>
</div>
  );
}
