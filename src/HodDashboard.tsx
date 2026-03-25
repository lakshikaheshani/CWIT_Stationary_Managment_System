import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaBuilding, FaTimes,FaBook } from "react-icons/fa";

  {/* import Logo from "./assets/L.png";*/}
import Logo from "./assets/LG.png";

import "./App.css";

interface Item {
  item_name: string;
  category: string;
  quantity: number;
}

interface Request {
  request_id: number;
  user_email: string;
  hod_approval: number | null;
  department: string;
  items: Item[];
}

function HodDashboard() {
  const [user, setUser] = useState<{ full_name: string; department?: string; email?: string } | null>(null);
  const navigate = useNavigate();
  
  // State for tracking requests and notifications
  const [previousRequests, setPreviousRequests] = useState<Request[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newRequests, setNewRequests] = useState<Request[]>([]);
  const [hasPendingRequests, setHasPendingRequests] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      console.log("User data:", userData);
      setUser(userData);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // Function to fetch HOD's stationery requests
  const fetchHodRequests = async () => {
    let department = user?.department;
    
    if (!department) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          department = userData.department;
          console.log("Department from localStorage:", department);
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
    if (!department) {
      console.log("No department found, using default 'IT'");
      department = "IT";
    }
    
    console.log("Fetching requests for department:", department);
    
    try {
      const response = await fetch(
        `http://localhost:3000/hod?department=${department}`
      );
      if (!response.ok) throw new Error("Failed to fetch requests");
      
      const data: Request[] = await response.json();
      console.log("Fetched requests count:", data.length);
      
      // Log all requests
      data.forEach((req, index) => {
        console.log(`Request ${index + 1}: ID=${req.request_id}, hod_approval=${req.hod_approval}, department=${req.department}`);
      });
      
      const sortedData = data.sort((a: Request, b: Request) => b.request_id - a.request_id);
      
      // Check for ANY new request (regardless of approval status)
      if (previousRequests.length > 0) {
        console.log("Comparing with previous requests...");
        const allNewRequests = sortedData.filter(newReq => 
          !previousRequests.some(prevReq => prevReq.request_id === newReq.request_id)
        );
        
        console.log("All new requests found:", allNewRequests.length);
        
        if (allNewRequests.length > 0) {
          // Play notification sound
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (audioError) {
            console.log('Audio notification not supported');
          }
          
          // Show red popup notification for ANY new request
          setNewRequests(allNewRequests);
          setShowPopup(true);
          
          // Auto-hide popup after 10 seconds
          setTimeout(() => {
            setShowPopup(false);
          }, 10000);
          
          // Also try browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("New Stationery Request!", {
              body: `${allNewRequests.length} new request${allNewRequests.length > 1 ? 's' : ''} received`,
              icon: "/favicon.ico"
            });
          } else if ("Notification" in window && Notification.permission !== "denied") {
            Notification.requestPermission();
          }
        }
      } else {
        console.log("First time loading, storing initial requests");
      }
      
      setPreviousRequests(sortedData);
      
      // Check if there are any pending requests (hod_approval is null or 0)
      const pendingRequests = sortedData.filter(req => req.hod_approval === null || req.hod_approval === 0);
      const hasPending = pendingRequests.length > 0;
      setHasPendingRequests(hasPending);
      console.log("Has pending requests:", hasPending, "Count:", pendingRequests.length);
      
    } catch (error: any) {
      console.error("Fetch error:", error.message);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (user?.department || localStorage.getItem("user")) {
      // Small delay to ensure user is loaded
      setTimeout(() => {
        fetchHodRequests();
      }, 1000);
    }
  }, [user]);

  // Auto-refresh requests every 10 seconds
  useEffect(() => {
    if (user?.department || localStorage.getItem("user")) {
      const interval = setInterval(() => {
        fetchHodRequests();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [user]);

  // Manual refresh function for testing
  const refreshRequests = () => {
    fetchHodRequests();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close popup manually
  const closePopup = () => {
    setShowPopup(false);
  };

  // Navigate to stationery page
  const goToStationery = () => {
    setShowPopup(false);
    navigate("/hod-stationery");
  };

  return (
    <div className="hod-container">
      {/* Red Popup Notification */}
      {showPopup && (
        <div className="notification-popup" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000 }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b, #ff4757)',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
            width: '350px',
            maxWidth: '90vw',
            overflow: 'hidden',
            color: 'white',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px 20px',
              background: 'rgba(0, 0, 0, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>🔔 New Stationery Request!</h3>
              <button onClick={closePopup} style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaTimes />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
                You have received {newRequests.length} new stationery request{newRequests.length > 1 ? 's' : ''}:
              </p>
              <div style={{ maxHeight: '200px', overflowY: 'auto', margin: '10px 0' }}>
                {newRequests.slice(0, 3).map((req, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    padding: '8px 10px',
                    margin: '5px 0',
                    borderRadius: '6px',
                    fontSize: '13px'
                  }}>
                    <strong>#{req.request_id}</strong> - {req.user_email}<br />
                    Department: {req.department}<br />
                    {req.items.length} item(s) requested
                  </div>
                ))}
                {newRequests.length > 3 && (
                  <div style={{ fontSize: '12px', textAlign: 'center', marginTop: '5px', opacity: 0.9 }}>
                    ...and {newRequests.length - 3} more
                  </div>
                )}
              </div>
              <button onClick={goToStationery} style={{
                background: 'white',
                color: '#ff4757',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                width: '100%',
                marginTop: '15px'
              }}>
                View Requests →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <div className="hod-navbar">
        <div className="logo-section">
          <img src={Logo} alt="CWIT Logo" className="front-logo" />
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <h1>Hello, {user?.full_name || "HOD"} </h1>
        <p>Welcome</p>
        {/* Manual refresh button for testing */}
        <button 
          onClick={refreshRequests}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Check for New Requests
        </button>
      </div>

      {/* Cards Section */}
      <div className="card-container">

        {/* Stationery Card - with red border when there are pending requests */}
        <div 
          className="card" 
          style={hasPendingRequests ? {
            border: '3px solid #ff4757',
            boxShadow: '0 0 20px rgba(255, 71, 87, 0.3)',
            animation: 'pulse 2s infinite',
            position: 'relative'
          } : {}}
        >
          {hasPendingRequests && (
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              background: '#ff4757',
              color: 'white',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '14px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>
              !
            </div>
          )}
          <div className="icon-wrapper">
            <FaBoxOpen className="card-icon" style={hasPendingRequests ? { color: '#ff4757' } : {}} />
          </div>
          <h2>Office Stationery Handle</h2>
          <p>Manage inventory and approve requests</p>
          <button
            className="card-btn"
            onClick={() => navigate("/hod-stationery")}
            style={hasPendingRequests ? { background: '#ff4757' } : {}}
          >
            Open {hasPendingRequests && '📬'}
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
            <FaBook className="card-icon" />
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

      {/* Add CSS animations */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
          }
        }
        
        .notification-popup div {
          animation: slideIn 0.3s ease-out;
        }
        
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}

export default HodDashboard;