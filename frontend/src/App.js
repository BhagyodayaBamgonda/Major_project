// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import About from "./pages/About";
import Cleaning from "./pages/Cleaning";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";


function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/cleaning" element={<Cleaning />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Router>
  );
}

export default App;
