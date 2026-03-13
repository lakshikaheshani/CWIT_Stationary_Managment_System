// File: App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./welcome";
import Login from "./Login";
import Register from "./Register";
import Admin from "./Admin";
import Dashboard from "./Dashboard";
import HodDashboard from "./HodDashboard";
import AdminDashboard from "./AdminDashboard";
import Stationery from "./Stationery";
import HodStationery from "./HodStationery";
import HodFM from "./HodFM";
import HODRequest from "./HODRequest";
import AdminfaciltyR from "./AdminFaciltyR";
import "./App.css";
import AdminReport from "./Adminrepoart";

function App() {
  return (
    <Router>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Welcome />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />

        {/* Dashboards */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/hod-dashboard" element={<HodDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        {/* Modules */}
        <Route path="/stationery" element={<Stationery />} />
        <Route path="/hod-stationery" element={<HodStationery />} />
        <Route path="/hod-fm" element={<HodFM />} />
        <Route path="/hod-request" element={<HODRequest />} />

        {/* ✅ Admin Facility Request */}
        <Route path="/admin-facility" element={<AdminfaciltyR />} />

       {/* ✅ Admin Report */} 
        <Route path="/admin-report" element={<AdminReport />} />

        {/* 404 */}
        <Route
          path="*"
          element={<h2 style={{ textAlign: "center" }}>404 - Page Not Found</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App;

 