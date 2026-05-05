import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">The Intelligent BI Platform</span>
          <h1 className="hero-title">
            Data Cleaning &amp; Dashboarding{" "}
            <span className="hero-accent">Without Code</span>
          </h1>
          <p className="hero-desc">
            Transform raw spreadsheets into professional insights in minutes.
            Upload, Clean, and Visualize your data through an automated analyst
            workflow that respects your precision requirements.
          </p>
          <div className="hero-actions">
            <button className="btn-primary" onClick={() => navigate("/cleaning")}>
              Get Started
            </button>
            <button className="btn-outline" onClick={() => navigate("/about")}>
              Learn More
            </button>
          </div>
        </div>

        {/* Decorative right card */}
        <div className="hero-visual">
          <div className="hero-visual-card">
            <div className="hero-visual-header">
              <span className="hv-dot red" /><span className="hv-dot yellow" /><span className="hv-dot green" />
              <span className="hv-title">Auto-BI Dashboard</span>
            </div>
            <div className="hv-grid">
              {["Cleaning", "Dashboard", "Reports", "Data Chat"].map(label => (
                <div key={label} className="hv-chip" onClick={() => navigate("/" + label.toLowerCase().replace(" ", "-"))}>
                  {label}
                </div>
              ))}
            </div>
            <div className="hv-bar-row">
              {[60, 85, 45, 90, 70].map((h, i) => (
                <div key={i} className="hv-bar" style={{ height: h + "%" }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="workflow-section">
        <div className="section-header">
          <h2 className="section-title">A Seamless Workflow</h2>
          <div className="section-divider" />
        </div>
        <div className="workflow-grid">
          {[
            { icon: "cloud_upload",        step: "1. Upload",    desc: "Drop your CSV or Excel file and let Auto-BI detect structure, types, and anomalies automatically." },
            { icon: "auto_fix_high",       step: "2. Clean",     desc: "Intelligent normalization removes duplicates, fixes date formats, and maps column headers." },
            { icon: "dashboard_customize", step: "3. Visualize", desc: "Instantly generate interactive charts, KPI cards, and export-ready PDF reports." },
          ].map(({ icon, step, desc }) => (
            <div key={step} className="workflow-card">
              <div className="workflow-icon">
                <span className="material-symbols-outlined">{icon}</span>
              </div>
              <h3 className="workflow-step">{step}</h3>
              <p className="workflow-desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <div className="features-header">
          <h2 className="section-title">Precision-Engineered Features</h2>
          <p className="section-subtitle">Built for the high-density requirements of modern data teams.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card feature-main">
            <span className="material-symbols-outlined feature-icon">auto_fix_high</span>
            <h3>Automated Cleaning</h3>
            <p>Our engine detects anomalies, corrects date formats, and maps disparate column headers automatically. Reduce manual cleaning time by up to 90%.</p>
            <div className="feature-badge">
              <span className="material-symbols-outlined" style={{fontSize:16}}>check_circle</span>
              99.8% Accuracy in structural normalization
            </div>
          </div>
          <div className="feature-side">
            <div className="feature-card feature-small" onClick={() => navigate("/dashboard")}>
              <span className="material-symbols-outlined feature-icon">monitoring</span>
              <h4>Auto-Visuals</h4>
              <p>Context-aware chart suggestions based on your data distribution.</p>
            </div>
            <div className="feature-card feature-small" onClick={() => navigate("/reports")}>
              <span className="material-symbols-outlined feature-icon">ios_share</span>
              <h4>One-Click Reports</h4>
              <p>Export to PDF, PNG, or live shareable links for presentations.</p>
            </div>
          </div>
          <div className="feature-card feature-small">
            <span className="material-symbols-outlined feature-icon">security</span>
            <h4>Data Privacy</h4>
            <p>All processing happens locally — your data never leaves your session.</p>
          </div>
          <div className="feature-card feature-small" onClick={() => navigate("/data-chat")}>
            <span className="material-symbols-outlined feature-icon">smart_toy</span>
            <h4>AI Chat</h4>
            <p>Ask questions in plain English, get instant data insights.</p>
          </div>
        </div>
      </section>

      {/* ── Talk to your data ── */}
      <section className="chat-promo-section">
        <div className="chat-promo-demo">
          <div className="chat-demo-msg user-msg">What was our revenue growth in Q3?</div>
          <div className="chat-demo-msg bot-msg">Revenue grew by <strong>24.5%</strong> in Q3, driven by a 15% increase in enterprise subscriptions.</div>
          <div className="chat-demo-msg user-msg">Show me the city-wise breakdown.</div>
        </div>
        <div className="chat-promo-text">
          <span className="hero-badge">New Feature</span>
          <h2 className="hero-title" style={{fontSize:32, marginTop:12}}>Talk to your Data</h2>
          <p className="hero-desc">Ask questions, get answers instantly. No more complex queries. Our conversational engine understands your business context.</p>
          <button className="btn-primary" onClick={() => navigate("/data-chat")}>Try Data Chat →</button>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <h2>Ready to transform your data?</h2>
        <p>Start analyzing your CSV &amp; Excel files instantly — no setup required.</p>
        <button className="btn-primary-lg" onClick={() => navigate("/cleaning")}>
          Get Started for Free
        </button>
      </section>

      {/* ── Footer ── */}
      <footer className="home-footer">
        <span className="footer-brand">Auto-BI</span>
        <span className="footer-copy">© 2024 Auto-BI Platforms. Built for precision.</span>
        <div className="footer-links">
          <span onClick={() => navigate("/about")}>About</span>
          <span onClick={() => navigate("/data-chat")}>Data Chat</span>
        </div>
      </footer>

    </div>
  );
}

