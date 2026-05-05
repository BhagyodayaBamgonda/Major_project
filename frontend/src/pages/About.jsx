import { useNavigate } from "react-router-dom";
import "./About.css";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <section className="about-hero">
        <div className="about-hero-text">
          <span className="hero-badge">About Auto-BI</span>
          <h1 className="about-hero-title">
            Empowering data-driven decisions<br />
            <span className="hero-accent">without the complexity of code.</span>
          </h1>
          <div className="about-hero-actions">
            <button className="btn-primary" onClick={() => navigate("/cleaning")}>
              Get Started
            </button>
            <button className="btn-outline" onClick={() => navigate("/dashboard")}>
              Explore Platform
            </button>
          </div>
        </div>

        {/* Mini dashboard preview card */}
        <div className="about-hero-preview">
          <div className="preview-topbar">
            <span className="hv-dot red" /><span className="hv-dot yellow" /><span className="hv-dot green" />
            <span className="preview-url">Auto-BI Platform</span>
          </div>
          <div className="preview-nav">
            {["Home","Cleaning","Dashboard","Reports","Data Chat"].map(t => (
              <span key={t} className="preview-nav-item">{t}</span>
            ))}
          </div>
          <div className="preview-body">
            <div className="preview-sidebar">
              <div className="preview-sidebar-item active">About Auto-BI Dashboard</div>
              {["Data cleaning","KPI generation","Interactive charts","Report generation"].map(i => (
                <div key={i} className="preview-sidebar-item">{i}</div>
              ))}
            </div>
            <div className="preview-content">
              <div className="preview-bar-group">
                {[65, 90, 45, 80, 60, 75].map((h, i) => (
                  <div key={i} className="preview-bar" style={{ height: h + "%" }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Our Mission ── */}
      <section className="mission-section">
        <div className="mission-badge">
          <span className="material-symbols-outlined">rocket_launch</span>
          Our Mission
        </div>
        <p className="mission-text">
          Our mission is to democratize business intelligence by automating the most tedious parts of the data
          workflow — cleaning and visualization.
        </p>

        {/* Stats */}
        <div className="stats-row">
          {[
            { value: "85%",  label: "Efficiency increase in data preparation for early adopters." },
            { value: "10k+", label: "Dashboards generated automatically each month across industries." },
            { value: "0",    label: "Lines of code required to build production-grade reports." },
          ].map(({ value, label }) => (
            <div key={value} className="stat-block">
              <span className="stat-value">{value}</span>
              <span className="stat-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="about-features-section">
        <div className="af-header">
          <h2 className="section-title">Precision-Engineered Features</h2>
          <p className="section-subtitle">The architecture behind intelligent business decisions.</p>
        </div>

        <div className="af-grid">
          {/* Main feature — large with visual */}
          <div className="af-card af-main">
            <span className="material-symbols-outlined af-icon">auto_fix_high</span>
            <h3>Automated Cleaning</h3>
            <p>No-code data preparation that identifies anomalies, handles missing values, and formats your sets for analysis instantly.</p>
            <div className="af-visual">
              <div className="af-bar-group">
                {[60, 85, 45, 90, 70, 55].map((h, i) => (
                  <div key={i} className="af-bar" style={{ height: h + "%" }} />
                ))}
              </div>
              <span className="af-visual-label">Auto-BI</span>
            </div>
          </div>

          {/* Instant Dashboards */}
          <div className="af-card af-secondary" onClick={() => navigate("/dashboard")}>
            <span className="material-symbols-outlined af-icon">monitoring</span>
            <h3>Instant Dashboards</h3>
            <p>Professional visualizations in seconds. Our engine maps your metrics to the best-fit charts automatically.</p>
            <span className="af-learn-more">
              Learn more <span className="material-symbols-outlined" style={{fontSize:16}}>arrow_forward</span>
            </span>
          </div>

          {/* Data Democracy */}
          <div className="af-card af-dark" onClick={() => navigate("/data-chat")}>
            <span className="material-symbols-outlined af-icon">groups</span>
            <h3>Data Democracy</h3>
            <p>Accessible insights for everyone, not just data scientists. Empowering every stakeholder with direct access to intelligence.</p>
            <div className="af-dark-chips">
              <span className="dark-chip">CSV</span>
              <span className="dark-chip">Excel</span>
              <span className="dark-chip">AI</span>
            </div>
          </div>

          {/* Scalable Precision */}
          <div className="af-card af-scalable">
            <div className="af-scalable-content">
              <span className="material-symbols-outlined af-icon">trending_up</span>
              <h3>Scalable Precision</h3>
              <p>Our backend infrastructure handles terabytes of data daily, ensuring your enterprise-level insights are delivered with zero latency.</p>
              <div className="af-uptime-badge">99.9% UPTIME GUARANTEED</div>
            </div>
            <div className="af-scalable-visual">
              <span className="material-symbols-outlined af-big-icon">query_stats</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <p className="about-cta-eyebrow">Experience Intelligent Precision.</p>
        <h2 className="about-cta-title">Join 500+ enterprises optimizing their decision-making workflow today.</h2>
        <div className="about-cta-actions">
          <button className="btn-primary-lg" onClick={() => navigate("/cleaning")}>
            Get Started Now
          </button>
          <button className="btn-outline-lg" onClick={() => navigate("/about")}>
            Talk to an Expert
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="about-footer">
        <div className="about-footer-left">
          <span className="footer-brand">Auto-BI</span>
          <span className="footer-copy">© 2024 Auto-BI Platform. Intelligent Precision in Business Intelligence.</span>
        </div>
        <div className="about-footer-links">
          {["Privacy Policy", "Terms of Service", "API Docs", "Report", "Mission"].map(l => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
      </footer>

    </div>
  );
}
