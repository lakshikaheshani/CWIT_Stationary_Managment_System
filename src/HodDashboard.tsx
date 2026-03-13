import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaBuilding } from "react-icons/fa";
  {/* import Logo from "./assets/L.png";*/}
import Logo from "./assets/LG.png";

import "./App.css";

function HodDashboard() {
  const [user, setUser] = useState<{ full_name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="hod-container">

      {/* Navbar */}
      <div className="hod-navbar">
        <div className="logo-section">
          <img src={Logo} alt="CWIT Logo" className="front-logo" />
          {/* <h2 className="panel-title">HOD Panel</h2>*/}
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Hello, {user?.full_name || "HOD"} 👋</h1>
        <p>Welcome to the Head of Department Dashboard</p>
      </div>

      {/* Cards Section */}
      <div className="card-container">

        {/* Stationery Card */}
        <div className="card">
          <div className="icon-wrapper">
            <FaBoxOpen className="card-icon" />
          </div>
          <h2>Office Stationery Hadle</h2>
          <p>Manage inventory and approve requests</p>
          <button
            className="card-btn"
            onClick={() => navigate("/hod-stationery")}
          >
            Open
          </button>
        </div>

        {/* Facility Card */}
        <div className="card">
          <div className="icon-wrapper">
            <FaBuilding className="card-icon" />
          </div>
          <h2>Facility Management</h2>
          <p>Handle facility maintenance and reports</p>
          <button
            className="card-btn"
            onClick={() => navigate("/hod-fm")}
          >
            Open
          </button>
        </div>

        {/* HOD Request Card */}
        <div className="card">
          <div className="icon-wrapper">
            <FaBuilding className="card-icon" />
          </div>
          <h2>Stationery Request</h2>
          <p>Handle HOD Request and reports</p>
          <button
            className="card-btn"
            onClick={() => navigate("/Hod-request")}
          >
            Open
          </button>
        </div>


      </div>
    </div>
  );
}

export default HodDashboard;