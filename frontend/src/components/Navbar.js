import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="logo">Auto BI Dashboard</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/reports">Reports</Link></li>
        <li><Link to="/downloads">Downloads</Link></li>
        <li><Link to="/about">About</Link></li>
        <li><Link to="/columns">Columns</Link></li>
        <li><Link to="/kpis">KPIs</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;