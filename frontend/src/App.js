// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Cleaning from "./pages/Cleaning";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Login from "./pages/login";
import Register from "./pages/register";;

// 🔐 Protected Route Component
function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("user");

  return isLoggedIn ? children : <Navigate to="/login" />;
}

// 🔄 Layout to hide navbar on login/register
function Layout({ children }) {
  const location = useLocation();

  const hideNavbar = location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />

          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />

          <Route path="/cleaning" element={
            <ProtectedRoute>
              <Cleaning />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;