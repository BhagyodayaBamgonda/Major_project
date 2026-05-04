import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // const user = JSON.parse(localStorage.getItem("user"));
  const user = { name: "Local Tester" }; // Bypassed for local testing

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <h2 className="logo">Auto-BI</h2>

          <ul className="nav-links">
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/about">About</NavLink></li>
            {user && (
              <>
                <li><NavLink to="/cleaning">Cleaning</NavLink></li>
                <li><NavLink to="/dashboard">Dashboard</NavLink></li>
                <li><NavLink to="/reports">Reports</NavLink></li>
                <li><NavLink to="/data-chat">Data Chat</NavLink></li>
              </>
            )}
          </ul>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="username">Hi, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="auth-link">Login</NavLink>
              <NavLink to="/register" className="auth-link">Register</NavLink>
            </>
          )}
        </div>
      </nav>
      {/* Spacer so content doesn't hide under fixed navbar */}
      <div className="navbar-spacer" />
    </>
  );
};

export default Navbar;