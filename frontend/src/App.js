import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Reports from "./components/Reports";
import Downloads from "./components/Downloads";
// Import the additional pages
import Home from "./pages/Home";
import About from "./pages/About";
import Columns from "./pages/Columns";
import KPIs from "./pages/KPIs";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/about" element={<About />} />
            <Route path="/columns" element={<Columns />} />
            <Route path="/kpis" element={<KPIs />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;