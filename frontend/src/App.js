// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Cleaning from "./pages/Cleaning";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import DataChat from "./pages/DataChat";
import Login from "./pages/login";
import Register from "./pages/register";;

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  return user ? children : <Navigate to="/login" />;
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
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}

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

          <Route path="/data-chat" element={
            <ProtectedRoute>
              <DataChat />
            </ProtectedRoute>
          } />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;