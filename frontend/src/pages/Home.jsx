// src/pages/Home.jsx
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="home-title">Auto-BI</h1>
      <p className="home-slogan">"Upload. Clean. Visualize. Discover."</p>

      <div className="home-buttons">
        <button onClick={() => navigate("/cleaning")} className="home-btn">
          Data Cleaning
        </button>
        <button onClick={() => navigate("/dashboard")} className="home-btn">
          Dashboard
        </button>
        <button onClick={() => navigate("/reports")} className="home-btn">
          Reports
        </button>
        <button onClick={() => navigate("/about")} className="home-btn">
          About Project
        </button>
      </div>
    </div>
  );
}
