import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BG from "./assets/WBG.png";
import "./AdminDashboard.css";

type User = {
  full_name: string;
  username: string;
  email: string;
  department: string;
  role: string;
};

type Request = {
  request_id: number;
  user_email: string;
  item_name: string;
  quantity: number;
  category: string;
  status: string | null;
  department: string;
};

type StockItem = {
  stock_id: number;
  item_name: string;
  category: string;
  quantity: number;
  // unit_price: number;
  last_updated: string;
};

type FacilityRequest = {
  facility_id: number;
  hod_email: string;
  request: string;
  admin_approval: boolean | null;
  payment_method: boolean | null;
  admin_message: string | null;
  time: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  // Set "users" as the default active tab to show users interface first
  const [activeTab, setActiveTab] = useState<"Stationery" | "users" | "stock">("users");
  
  // ---------------- LOADING STATE ----------------
  const [isLoading, setIsLoading] = useState(true);
  
  // ---------------- NOTIFICATION STATE ----------------
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [previousRequests, setPreviousRequests] = useState<Request[]>([]);
  
  // ---------------- STOCK NOTIFICATION STATE ----------------
  const [lowStockItems, setLowStockItems] = useState<StockItem[]>([]);
  const [showStockNotifications, setShowStockNotifications] = useState(false);
  
  // ---------------- FACILITY NOTIFICATION STATE ----------------
  const [pendingFacilityCount, setPendingFacilityCount] = useState(0);
  const [previousFacilityRequests, setPreviousFacilityRequests] = useState<FacilityRequest[]>([]);
  const [showFacilityNotifications, setShowFacilityNotifications] = useState(false);

  // ---------------- USERS ----------------
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<User & { password?: string }>({
    full_name: "",
    username: "",
    email: "",
    department: "",
    role: "",
    password: "",
  });

  // Separate state for Change Password
  const [changePasswordData, setChangePasswordData] = useState({
    email: "",
    oldPassword: "",
    newPassword: "",
  });

  // Separate state for Reset Password
  const [resetEmail, setResetEmail] = useState("");

  // ---------------- STOCK ----------------
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [newStock, setNewStock] = useState<Omit<StockItem, "stock_id" | "last_updated">>({
    item_name: "",
    category: "",
    quantity: 0,
    // unit_price: 0,
  });
  const [refillQuantities, setRefillQuantities] = useState<Record<number, number>>({});

  // ---------------- REQUESTS ----------------
  const [requests, setRequests] = useState<Request[]>([]);

  // ---------------- FACILITY REQUESTS ----------------
  const [facilityRequests, setFacilityRequests] = useState<FacilityRequest[]>([]);


  

  // ---------------- CHECK LOW STOCK ----------------
  const checkLowStock = (items: StockItem[]) => {
    const lowStock = items.filter(item => item.quantity < 50);
    setLowStockItems(lowStock);
  };

  // ---------------- INITIAL LOAD - LOAD USERS FIRST AND SHOW USERS TAB ----------------
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        // Load users first
        await fetchUsers();
        // Then load other data in background
        await fetchStock();
        await fetchRequests();
        await fetchFacilityRequests();
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []); // Empty dependency array means this runs once on mount

  // ---------------- FETCH FUNCTIONS ----------------
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin-auth/users");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setUsers(data);
      return data;
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
      return [];
    }
  };

  const fetchStock = async () => {
    try {
      const res = await fetch("http://localhost:3000/stock");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setStockItems(data);
      checkLowStock(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch stock");
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/admin/requests");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      
      // Check for new pending requests
      const pendingCount = data.filter((req: Request) => req.status === null || req.status === "Pending").length;
      setPendingRequestsCount(pendingCount);
      
      // Compare with previous requests to detect new ones
      if (previousRequests.length > 0) {
        const newRequests = data.filter((newReq: Request) => 
          !previousRequests.some(prevReq => prevReq.request_id === newReq.request_id) &&
          (newReq.status === null || newReq.status === "Pending")
        );
        
        if (newRequests.length > 0) {
          // Show notification for new requests
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (audioError) {
            console.log('Audio notification not supported');
          }
          
          alert(`🔔 ${newRequests.length} new stationery request${newRequests.length > 1 ? 's' : ''} received!`);
        }
      }
      
      setRequests(data);
      setPreviousRequests(data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch requests");
    }
  };

  const fetchFacilityRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/facility/all");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: FacilityRequest[] = await res.json();
      
      // Check for pending facility requests
      const pendingCount = data.filter(req => req.admin_approval === null).length;
      setPendingFacilityCount(pendingCount);
      
      // Check if there are new facility requests compared to previous state
      if (previousFacilityRequests.length > 0) {
        const newFacilityRequests = data.filter(newReq => 
          !previousFacilityRequests.some(prevReq => prevReq.facility_id === newReq.facility_id) &&
          newReq.admin_approval === null
        );
        
        if (newFacilityRequests.length > 0) {
          // Show notification for new facility requests
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (audioError) {
            console.log('Audio notification not supported');
          }
          
          alert(`🏢 ${newFacilityRequests.length} new facility request${newFacilityRequests.length > 1 ? 's' : ''} received from HOD!`);
        }
      }
      
      setFacilityRequests(data);
      setPreviousFacilityRequests(data);
    } catch (err) {
      console.error(err);
      // Don't show alert for facility requests error to avoid spam
      console.log("Failed to fetch facility requests");
    }
  };

  // Auto-refresh requests every 30 seconds
  useEffect(() => {
    if (activeTab === "Stationery") {
      fetchRequests();
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Auto-refresh stock every 30 seconds to check low stock
  useEffect(() => {
    const checkStockInterval = setInterval(() => {
      fetchStock();
    }, 30000);
    return () => clearInterval(checkStockInterval);
  }, []);

  // Auto-refresh facility requests every 30 seconds
  useEffect(() => {
    const checkFacilityInterval = setInterval(() => {
      fetchFacilityRequests();
    }, 30000);
    return () => clearInterval(checkFacilityInterval);
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    const loadTabData = async () => {
      setIsLoading(true);
      try {
        if (activeTab === "users") {
          await fetchUsers();
        } else if (activeTab === "stock") {
          await fetchStock();
        } else if (activeTab === "Stationery") {
          await fetchRequests();
        }
      } catch (error) {
        console.error(`Error loading ${activeTab} data:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTabData();
  }, [activeTab]);

  // ---------------- USER ACTIONS ----------------
  const handleAddUser = async () => {
    const { full_name, username, password, role, email } = newUser;
    if (!full_name || !username || !password || !role || !email) return alert("Fill all required fields");
    try {
      const res = await fetch("http://localhost:3000/admin-auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error creating user");
      alert(data.message || "User created successfully");
      setNewUser({ full_name: "", username: "", email: "", department: "", role: "", password: "" });
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error creating user");
    }
  };

  const handleDeleteUser = async (identifier: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch("http://localhost:3000/admin-auth/delete-user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error deleting user");
      alert(data.message || "User deleted");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Error deleting user");
    }
  };

  const handleChangePassword = async () => {
    const { email, oldPassword, newPassword } = changePasswordData;
    if (!email || !oldPassword || !newPassword) return alert("Fill all fields for password change");
    try {
      const res = await fetch("http://localhost:3000/admin-auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });
      if (!res.ok) {
        const text = await res.text();
        return alert(`Error updating password: ${text}`);
      }
      const data = await res.json();
      alert(data.message || "Password updated successfully");
      setChangePasswordData({ email: "", oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      alert("Error updating password");
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return alert("Enter user email to send reset link");
    try {
      const res = await fetch("http://localhost:3000/admin-auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error sending reset link");
      alert(data.message || "Reset link sent successfully");
      setResetEmail("");
    } catch (err) {
      console.error(err);
      alert("Error sending reset link");
    }
  };

  
  // ---------------- REQUEST ACTIONS ----------------
  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/requests/${id}/approve`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error approving request");
      alert(data.message || "Request approved");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Error approving request");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:3000/admin/requests/${id}/reject`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error rejecting request");
      alert(data.message || "Request rejected");
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  // ---------------- STOCK ACTIONS ----------------
  const handleAddStock = async () => {
    const { item_name, category, quantity} = newStock;
    if (!item_name || !category || !quantity) return alert("Fill all fields to add stock");
    try {
      const res = await fetch("http://localhost:3000/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newStock),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error adding stock");
      alert(data.message || "Stock added successfully");
      setNewStock({ item_name: "", category: "", quantity: 0 });
      fetchStock();
    } catch (err) {
      console.error(err);
      alert("Error adding stock");
    }
  };

  const handleRefillStock = async (id: number) => {
    const quantity = refillQuantities[id];
    if (!quantity) return alert("Enter refill quantity");
    try {
      const res = await fetch(`http://localhost:3000/stock/${id}/refill`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error refilling stock");
      alert(data.message || "Stock updated");
      setRefillQuantities(prev => ({ ...prev, [id]: 0 }));
      fetchStock();
    } catch (err) {
      console.error(err);
      alert("Error refilling stock");
    }
  };


 



  // ---------------- NAVIGATION ----------------
  const handleBack = () => window.history.back();
  const handleHome = () => (window.location.href = "/");
  const handleLogout = () => (window.location.href = "/login");

  return (
    <>
     <style>{`

/* ================================
   1. GLOBAL BODY & HTML STYLE
================================ */
body, html { 
  margin: 0; 
  padding: 0; 
  font-family: 'Poppins', sans-serif; 
  background-color: #f0f2f5; 
  color: #1a1a1a; 
}

/* ================================
   2. MAIN WRAPPER BACKGROUND
================================ */
.wrapper { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  min-height: 10vh; 
  background: url(${BG}) center/cover no-repeat; 
  padding: 80px; 
  gap: 15px;
}

/* ================================
   3. NAVBAR DESIGN
================================ */
.navbar { 
  width: 100%; 
  max-width: 2000px; 
  display: flex; 
  flex-direction: column;        /* keep 3-row layout */
  align-items: center; 
  justify-content: space-between; 
  padding: 10px 30px; 
  background: rgba(255, 255, 255, 0.25); 
  backdrop-filter: blur(12px); 
  border-radius: 20px; 
  box-shadow: 0 8px 25px rgba(0,0,0,0.15); 
  margin-bottom: 30px; 
  gap: 15px;
  position: relative;
}

.navbar h2 { 
  font-size: 28px; 
  font-weight: 600; 
  color: #222; 
  align-self: flex-start;  /* force left */
  margin: 0;
}

/* ================================
   4. NAVIGATION BUTTONS
================================ */
.nav-buttons { 
  display: flex;
  justify-content: flex-end; /* move to right */
  align-items: flex-start;   /* align to top */
  gap: 15px;
  margin-top: 10;             /* optional: remove extra top margin */
  width: 100%;               /* take full width of navbar */
}

.nav-buttons button { 
  padding: 8px 18px; 
  border: none; 
  border-radius: 12px; 
  background-color: rgba(255,255,255,0.4); 
  cursor: pointer; 
  font-weight: 500; 
  transition: all 0.3s ease; 
  position: relative;
}

.nav-buttons button.active, 
.nav-buttons button:hover { 
  background-color: #4a90e2; 
  color: #fff; 
  transform: translateY(-2px); 
}

/* ================================
   5. NOTIFICATION ROW & ICONS
================================ */
.notification-row{
  display:flex;
  justify-content:flex-end;
  align-items: flex-start;
  gap:40px;
  margin-top:5px;
  width:100%;
}

.notification-icon{
  width: 40px;
  height: 40px;
  border-radius:50%;
  background: rgba(255,255,255,0.35);
  backdrop-filter: blur(10px);
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:30px;
  position: relative;
  cursor:pointer;
  transition: 0.3s;
}

.notification-icon:hover{
  transform:translateY(-4px);
  background:#4a90e2;
  color:white;
}

/* Icon sizes */
.notification-icon .bell-icon { font-size: 20px; }
.notification-icon .stock-icon { font-size: 20px; }
.notification-icon .Facility-icon { font-size: 20px; }

/* ================================
   6. BADGES
================================ */
.notification-badge{
  position:absolute;
  top:-5px;
  right:-5px;
  background:#ff4444;
  color:white;
  border-radius:20%;
  padding:2px 4px;
  font-size:13px;
}

.stock-notification-badge{
  position:absolute;
  top:-5px;
  right:-5px;
  background:#4CAF50;
  color:white;
  border-radius:50%;
  padding:4px 8px;
  font-size:13px;
}

.facility-notification-badge{
  position:absolute;
  top:-5px;
  right:-5px;
  background:#FF9800;
  color:white;
  border-radius:50%;
  padding:4px 8px;
  font-size:13px;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* ================================
   7. NOTIFICATION DROPDOWN
================================ */
.notification-dropdown {
  position: absolute;
  top: 80px;
  right: 30px;
  width: 350px;
  max-height: 400px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  z-index: 1000;
  padding: 15px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.notification-header h4 {
  margin: 0;
  color: #333;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin-bottom: 5px;
}

.notification-item:hover {
  background-color: #f5f5f5;
  transform: translateX(5px);
}

.notification-item.new {
  background-color: rgba(74,144,226,0.1);
  border-left: 3px solid #4a90e2;
}

.notification-item.low-stock {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 3px solid #4CAF50;
}

.notification-item.facility {
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 3px solid #FF9800;
}

.notification-title {
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.notification-details {
  font-size: 13px;
  color: #666;
}

.notification-time {
  font-size: 11px;
  color: #999;
  margin-top: 5px;
}

/* ================================
   8. LOADING SPINNER
================================ */
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 4px solid #4a90e2;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ================================
   9. GLASS CARD
================================ */
.glass-card { 
  width: 100%; 
  max-width: 1200px; 
  background: rgba(255,255,255,0.35); 
  backdrop-filter: blur(15px); 
  padding: 40px; 
  border-radius: 25px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.15); 
  margin-bottom: 30px; 
}

h3 { font-size: 22px; margin-bottom: 20px; color: #333; }

/* ================================
   10. INPUT FIELDS
================================ */
input { 
  width: 100%; 
  max-width: 300px; 
  padding: 12px 15px; 
  margin: 8px 0; 
  border-radius: 12px; 
  border: 1px solid #ccc; 
  outline: none; 
  font-size: 16px; 
  background: rgba(255,255,255,0.7); 
  backdrop-filter: blur(6px); 
  transition: all 0.3s ease; 
}

input:focus { 
  border-color: #4a90e2; 
  box-shadow: 0 0 8px rgba(74,144,226,0.5); 
}

/* ================================
   11. BUTTONS
================================ */
button { 
  padding: 10px 20px; 
  margin-top: 10px; 
  margin-right: 8px; 
  border: none; 
  border-radius: 12px; 
  background-color: #4a90e2; 
  color: #fff; 
  font-weight: 500; 
  cursor: pointer; 
  transition: all 0.3s ease; 
}

button:hover { 
  background-color: #357ab8; 
  transform: translateY(-2px); 
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* ================================
   12. TABLE
================================ */
table { 
  width: 100%; 
  border-collapse: collapse; 
  margin-top: 20px; 
  background: rgba(255,255,255,0.6); 
  backdrop-filter: blur(6px); 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
}

table th, table td { 
  padding: 12px 15px; 
  text-align: left; 
  font-size: 15px; 
}

table th { 
  background-color: rgba(74,144,226,0.7); 
  color: #fff; 
}

table tr:nth-child(even) { 
  background-color: rgba(255,255,255,0.3); 
}

table tr:hover { 
  background-color: rgba(74,144,226,0.2); 
  transform: scale(1.01); 
  transition: all 0.2s ease; 
}

.low-stock-row {
  background-color: rgba(255, 193, 7, 0.1) !important;
  font-weight: 500;
}

.low-stock-row td {
  color: #856404;
}

/* ================================
   13. NUMBER INPUTS IN TABLE
================================ */
td input[type="number"] { 
  width: 80px; 
  padding: 6px 10px; 
  border-radius: 8px; 
  border: 1px solid #ccc; 
  text-align: center; 
}

/* ================================
   14. TOP NAV BUTTONS
================================ */
.top-nav { 
  position: absolute;
  top: 20px;
  right: 40px;
  display: flex; 
  gap: 10px;
}

.top-nav button { 
  padding: 6px 12px; 
  font-size: 13px;
  border-radius: 10px; 
  background-color: rgba(74,144,226,0.7); 
  color: #fff; 
  position: relative;
}

.top-nav button:hover { 
  background-color: #357ab8; 
  transform: translateY(-2px); 
}

/* Facility badge on top nav */
.facility-nav-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #FF9800;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 11px;
  min-width: 18px;
  text-align: center;
  animation: pulse 2s infinite;
  border: 2px solid white;
}

`}</style>




      <div className="wrapper">
      <div className="navbar">
            
            <h2>ADMIN DASHBOARD</h2>

  {/* ROW 1 - Navigation Buttons */}
  <div className="nav-buttons">

    <button 
      onClick={() => setActiveTab("Stationery")} 
      className={activeTab === "Stationery" ? "active" : ""}
      disabled={isLoading}
    >
      Stationery
      {pendingRequestsCount > 0 && activeTab !== "Stationery" && (
        <span className="notification-badge">{pendingRequestsCount}</span>
      )}
    </button>

    <button 
      onClick={() => setActiveTab("stock")} 
      className={activeTab === "stock" ? "active" : ""}
      disabled={isLoading}
    >
      Stock
      {lowStockItems.length > 0 && activeTab !== "stock" && (
        <span className="stock-notification-badge">{lowStockItems.length}</span>
      )}
    </button>

    <button 
      onClick={() => setActiveTab("users")} 
      className={activeTab === "users" ? "active" : ""}
      disabled={isLoading}
    >
      Users
    </button>

  </div>





  {/* ROW 2 - Notification Icons */}
  <div className="notification-row">

    <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
      <span className="bell-icon">🔔</span>
      {pendingRequestsCount > 0 && (
        <span className="notification-badge">{pendingRequestsCount}</span>
      )}
    </div>

    {lowStockItems.length > 0 && (
      <div className="notification-icon" onClick={() => setShowStockNotifications(!showStockNotifications)}>
        <span className="stock-icon">📦</span>
        <span className="stock-notification-badge">{lowStockItems.length}</span>
      </div>
    )}

    {pendingFacilityCount > 0 && (
      <div className="notification-icon" onClick={() => setShowFacilityNotifications(!showFacilityNotifications)}>
        <span className="Facility-icon">🏢</span>
        <span className="facility-notification-badge">{pendingFacilityCount}</span>
      </div>
    )}

  </div>
</div>






        {/* Request Notification Dropdown */}
        {showNotifications && (
          
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Stationery Notifications</h4>
              <button onClick={() => setShowNotifications(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>Close</button>
            </div>
            {requests.filter(req => req.status === null || req.status === "Pending").length > 0 ? (
              requests
                .filter(req => req.status === null || req.status === "Pending")
                .map(req => (
                  <div 
                    key={req.request_id} 
                    className={`notification-item ${previousRequests.some(prev => prev.request_id === req.request_id) ? '' : 'new'}`}
                    onClick={() => {
                      setActiveTab("Stationery");
                      setShowNotifications(false);
                    }}




                  >
                    <div className="notification-title">New Stationery Request #{req.request_id}</div>
                    <div className="notification-details">
                      From: {req.user_email}<br />
                      Item: {req.item_name} (Qty: {req.quantity})<br />
                      Department: {req.department}
                    </div>
                    <div className="notification-time">
                      {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No new request notifications
              </div>
            )}
          </div>
        )}

        {/* Stock Notification Dropdown */}
        {showStockNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Stock Alerts (Low Stock)</h4>
              <button onClick={() => setShowStockNotifications(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>Close</button>
            </div>
            {lowStockItems.length > 0 ? (
              lowStockItems.map(item => (
                <div 
                  key={item.stock_id} 
                  className="notification-item low-stock"
                  onClick={() => {
                    setActiveTab("stock");
                    setShowStockNotifications(false);
                  }}
                >
                  <div className="notification-title">⚠️ Low Stock Alert</div>
                  <div className="notification-details">
                    Item: {item.item_name}<br />
                    Category: {item.category}<br />
                    Current Quantity: <strong style={{ color: '#ff4444' }}>{item.quantity}</strong> (Below 50)<br />
                   
                  </div>
                  <div className="notification-time">
                    Last Updated: {new Date(item.last_updated).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No low stock items
              </div>
            )}
          </div>
        )}

        {/* Facility Notification Dropdown */}
        {showFacilityNotifications && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h4>Facility Requests</h4>
              <button onClick={() => setShowFacilityNotifications(false)} style={{ padding: '5px 10px', fontSize: '12px' }}>Close</button>
            </div>
            {facilityRequests.filter(req => req.admin_approval === null).length > 0 ? (
              facilityRequests
                .filter(req => req.admin_approval === null)
                .map(req => {
                  const isNew = !previousFacilityRequests.some(prev => prev.facility_id === req.facility_id);
                  return (
                    <div 
                      key={req.facility_id} 
                      className={`notification-item facility ${isNew ? 'new' : ''}`}
                      onClick={() => {
                        navigate("/admin-facility");
                        setShowFacilityNotifications(false);
                      }}
                    >
                      <div className="notification-title">🏢 Facility Request #{req.facility_id}</div>
                      <div className="notification-details">
                        From HOD: {req.hod_email}<br />
                        Request: {req.request.length > 40 ? req.request.substring(0, 40) + '...' : req.request}<br />
                        Status: Pending
                      </div>
                      <div className="notification-time">
                        {new Date(req.time).toLocaleString()}
                      </div>
                    </div>
                  );
                })
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                No pending facility requests
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="glass-card">
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          </div>
        )}

        {/* ================= REQUESTS ================= */}
        {!isLoading && activeTab === "Stationery" && (
          <div className="glass-card">
            <h3>Manage Requests {pendingRequestsCount > 0 && `(${pendingRequestsCount} pending)`}</h3>
            <table>
              <thead>
                <tr>
                  <th>Request ID</th><th>User Email</th><th>Items</th><th>Categories</th><th>Quantities</th><th>Status</th><th>Department</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(
                  requests.reduce((acc: Record<number, any>, req) => {
                    if (!acc[req.request_id]) {
                      acc[req.request_id] = {
                        request_id: req.request_id,
                        user_email: req.user_email,
                        items: [],
                        categories: [],
                        quantities: [],
                        status: req.status || "Pending",
                        department: req.department,
                      };
                    }
                    acc[req.request_id].items.push(req.item_name);
                    acc[req.request_id].categories.push(req.category);
                    acc[req.request_id].quantities.push(req.quantity);
                    return acc;
                  }, {})
                ).map(req => (
                  <tr key={req.request_id} style={req.status === null || req.status === "Pending" ? { backgroundColor: 'rgba(255, 255, 0, 0.1)' } : {}}>
                    <td>{req.request_id}</td>
                    <td>{req.user_email}</td>
                    <td>{req.items.join(", ")}</td>
                    <td>{req.categories.join(", ")}</td>
                    <td>{req.quantities.join(", ")}</td>
                    <td>
                      {req.status || "Pending"}
                      {req.status === null && <span style={{ marginLeft: '5px', color: '#ff4444' }}>●</span>}
                    </td>
                    <td>{req.department}</td>
                    <td>
                      <button onClick={() => handleApprove(req.request_id)}>Approve</button>
                      <button onClick={() => handleReject(req.request_id)}>Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

























{/* ================= STOCK ================= */}

{!isLoading && activeTab === "stock" && (
  <div className="glass-card">
    <h3>Add New Stock Item</h3>
    
    {/* Item Name Searchable Dropdown */}
    <input
  list="item-name-options"
  placeholder="Search or Select Item Name"
  value={newStock.item_name}
  onChange={e => setNewStock({ ...newStock, item_name: e.target.value })}
  style={{
    width: "100%",
    maxWidth: "300px",
    padding: "12px 15px",
    margin: "8px 0",
    borderRadius: "12px",
    border: "1px solid #ccc",
    fontSize: "16px",
    background: "rgba(45, 43, 43, 0.7)",
    backdropFilter: "blur(6px)",
    color: "#fff"
  }}
/>

     <datalist id="item-name-options">
  <option value="Pencil" />
  <option value="Eraser" />
  <option value="Cutter – Pencil" />
  <option value="Pen Blue" />
  <option value="Pen Black" />
  <option value="Pen Red" />
  <option value="Permanent Marker Blue" />
  <option value="Permanent Marker Black" />
  <option value="Permanent Marker Red" />
  <option value="Whiteboard Marker Blue" />
  <option value="Whiteboard Marker Black" />
  <option value="Whiteboard Marker Red" />
  <option value="Highlighter Pen Green" />
  <option value="Highlighter Pen Yellow" />
  <option value="Highlighter Pen Pink" />
  <option value="Highlighter Pen Blue" />
  <option value="Highlighter Pen Orange" />
  <option value="Platignum Pen 6 Packs" />
  <option value="Platignum Pen 12 Packs" />
  <option value="Correction Pen" />
  <option value='Foot Ruler 12" Plastic' />
  <option value='Foot Ruler 6" Steel' />
  <option value="Scissors Small" />
  <option value="Scissors Medium" />
  <option value="Scissors Large" />
  <option value="Paper Cutter Small" />
  <option value="Paper Cutter Medium" />
  <option value="Paper Clips Small" />
  <option value="Paper Clips Medium" />
  <option value="Binder Clips 15 mm" />
  <option value="Binder Clips 19 mm" />
  <option value="Binder Clips 25 mm" />
  <option value="Binder Clips 32 mm" />
  <option value="Drawing Pins" />
  <option value="File Fasteners Black" />
  <option value="File Fasteners Blue" />
  <option value="File Fasteners Red" />
  <option value="File Fasteners Green" />
  <option value="File Fasteners Yellow" />
  <option value="Rubber Bands" />
  <option value="Flat File Cardboard" />
  <option value="Flat File Plastic" />
  <option value="Clip File A4" />
  <option value="Box Files" />
  <option value="File Separators" />
  <option value="Magazine Holder Plastic" />
  <option value="Certificate Files – 10 Pockets" />
  <option value="Certificate Files – 20 Pockets" />
  <option value="Certificate Files – 30 Pockets" />
  <option value="Certificate Files – 40 Pockets" />
  <option value="Two Ring Files" />
  <option value="File Lace" />
  <option value="A4 Paper White" />
  <option value="A3 Paper White" />
  <option value="A5 Paper White" />
  <option value="A4 Paper Rainbow" />
  <option value="Sticker Paper White A4" />
  <option value="Demy Paper White" />
  <option value="Flip Chart Paper 23.4 × 33.1 in" />
  <option value="Flip Chart Paper 16.5 × 23.4 in" />
  <option value="Bristol Board White" />
  <option value="Clear Glue 50ml" />
  <option value="Clear Glue 8g" />
  <option value="Binder Glue 40g" />
  <option value="Binder Glue 100g" />
  <option value="Cello Tape 12mm" />
  <option value="Cello Tape 18mm" />
  <option value="Cello Tape 24mm" />
  <option value="Cello Tape 36mm" />
  <option value="Cello Tape 48mm" />
  <option value="Cello Tape 60mm" />
  <option value="PVC Packing Tape Red 48mm × 66m" />
  <option value="PVC Packing Tape Blue 48mm × 66m" />
  <option value="PVC Packing Tape Green 48mm × 66m" />
  <option value="PVC Packing Tape Yellow 48mm × 66m" />
  <option value="PVC Packing Tape Black 48mm × 66m" />
  <option value="PVC Packing Tape Orange 48mm × 66m" />
  <option value="Masking Tape 12mm" />
  <option value="Masking Tape 18mm" />
  <option value="Masking Tape 24mm" />
  <option value="Masking Tape 36mm" />
  <option value="Masking Tape 48mm" />
  <option value="Masking Tape 72mm" />
  <option value="Double Tape 9mm" />
  <option value="Double Tape 12mm" />
  <option value="Double Tape 18mm" />
  <option value="Double Tape 24mm" />
  <option value="Double Tape 36mm" />
  <option value="Binding Tape 36mm Black" />
  <option value="Binding Tape 36mm Blue" />
  <option value="Binding Tape 36mm Red" />
  <option value="Binding Tape 36mm Green" />
  <option value="Binding Tape 36mm Yellow" />
  <option value="Binding Tape 48mm Black" />
  <option value="Binding Tape 48mm Blue" />
  <option value="Binding Tape 48mm Red" />
  <option value="Binding Tape 48mm Green" />
  <option value="Binding Tape 48mm Yellow" />
  <option value="Tape Dispenser Small" />
  <option value="Tape Dispenser Medium" />
  <option value="Tape Dispenser Large" />
  <option value='Sticky Notes 3" × 3"' />
  <option value='Sticky Notes 0.6" × 3"' />
  <option value="Puncher Small" />
  <option value="Puncher Medium" />
  <option value="Puncher Large" />
  <option value="Stapler Machine Small" />
  <option value="Stapler Machine Medium" />
  <option value="Stapler Machine Large" />
  <option value="Stapler Pins Small" />
  <option value="Stapler Pins Medium" />
  <option value="Stapler Pins Large" />
  <option value="Calculator" />
</datalist>
    
    {/* Category Dropdown */}
    <select 
      value={newStock.category} 
      onChange={e => setNewStock({ ...newStock, category: e.target.value })}
      style={{ 
        width: '100%', 
        maxWidth: '300px', 
        padding: '12px 15px', 
        margin: '8px 0', 
        borderRadius: '12px', 
        border: '1px solid #ccc', 
        fontSize: '16px', 
        background: 'rgba(72, 65, 65, 0.7)', 
        backdropFilter: 'blur(6px)',
        cursor: 'pointer'
       
      }}
    >
      <option value="">Select Category</option>
      <option value="Writing Instruments">Stationary</option>
      {/* <option value="Measuring & Cutting">Measuring & Cutting</option>
      <option value="Clips & Fasteners">Clips & Fasteners</option>
      <option value="Filing & Storage">Filing & Storage</option>
      <option value="Exercise & CR Books">Exercise & CR Books</option>
      <option value="Paper & Boards">Paper & Boards</option>
      <option value="Adhesives">Adhesives</option>
      <option value="Tapes">Tapes</option>
      <option value="Desk Accessories & Tools">Desk Accessories & Tools</option>
      <option value="Envelopes">Envelopes</option>
      <option value="Office Equipment & Furniture">Office Equipment & Furniture</option> */}
    </select>
    






























 {/* Quantity  */}


    <input 
      placeholder="Quantity" 
      type="number" 


style={{ 
        width: '100%', 
        maxWidth: '300px', 
        padding: '12px 15px', 
        margin: '8px 0', 
        borderRadius: '12px', 
        border: '1px solid #ccc', 
        fontSize: '16px', 
        background: 'rgba(72, 65, 65, 0.7)', 
        backdropFilter: 'blur(6px)',
        cursor: 'pointer'
       
      }}




      value={newStock.quantity} 
      onChange={e => setNewStock({ ...newStock, quantity: Number(e.target.value) })} 
    />
    <button onClick={handleAddStock}>Add Stock</button>

    <h3 style={{ marginTop: "30px" }}>Stock List {lowStockItems.length > 0 && `(${lowStockItems.length} items below 50)`}</h3>

    <table>
      <thead>
        <tr>
          <th>ID</th><th>Item</th><th>Category</th><th>Quantity</th><th>Last Updated</th><th>Refill</th>
        </tr>
      </thead>
      <tbody>
        {stockItems.map(item => (
          <tr key={item.stock_id} className={item.quantity < 50 ? 'low-stock-row' : ''}>
            <td>{item.stock_id}</td>
            <td>{item.item_name} {item.quantity < 50 && '⚠️'}</td>
            <td>{item.category}</td>
            <td style={item.quantity < 50 ? { color: '#ff4444', fontWeight: 'bold' } : {}}>{item.quantity}</td>
            <td>{item.last_updated}</td>
            <td>
              <input type="number" placeholder="Qty" value={refillQuantities[item.stock_id] || ""} onChange={e => setRefillQuantities(prev => ({ ...prev, [item.stock_id]: Number(e.target.value) }))} />
              <button onClick={() => handleRefillStock(item.stock_id)}>Refill</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}        


        {/* ================= USERS ================= */}
        {!isLoading && activeTab === "users" && (
          <div className="glass-card">
            {/* <h3>Add User</h3>
            <input placeholder="Full Name" value={newUser.full_name} onChange={e => setNewUser({ ...newUser, full_name: e.target.value })} />
            <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
            <input placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
            <input placeholder="Department" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
            <input placeholder="Role" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} />
            <input placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
            <button onClick={handleAddUser}>Add User</button>

            <h3 style={{ marginTop: "30px" }}>Change Password</h3>
            <input placeholder="Email" value={changePasswordData.email} onChange={e => setChangePasswordData({ ...changePasswordData, email: e.target.value })} />
            <input placeholder="Old Password" type="password" value={changePasswordData.oldPassword} onChange={e => setChangePasswordData({ ...changePasswordData, oldPassword: e.target.value })} />
            <input placeholder="New Password" type="password" value={changePasswordData.newPassword} onChange={e => setChangePasswordData({ ...changePasswordData, newPassword: e.target.value })} />
            <button onClick={handleChangePassword}>Change Password</button>

            <h3 style={{ marginTop: "30px" }}>Forgot Password</h3>
            <input placeholder="User Email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} />
            <button onClick={handleForgotPassword}>Send Reset Link</button> */}

            <h3 style={{ marginTop: "30px" }}>User List</h3>
            <table>
              <thead>
                <tr>
                  <th>Full Name</th><th>Username</th><th>Email</th><th>Department</th><th>Role</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.email}>
                    <td>{user.full_name}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.department}</td>
                    <td>{user.role}</td>
                    <td>
                      <button onClick={() => handleDeleteUser(user.email)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}





















        

        {/* ================= BOTTOM NAV ================= */}
        <div className="top-nav">
         {/* <button onClick={handleBack}>Back</button>*/}
          <button onClick={handleHome}>Home</button>
          <button onClick={handleLogout}>Logout</button>
          <button 
            onClick={() => navigate("/admin-facility")}
            style={{ position: 'relative' }}
          >
            Facility
            {pendingFacilityCount > 0 && (
              <span className="facility-nav-badge">{pendingFacilityCount}</span>
            )}
          </button>
          <button onClick={() => navigate("/admin-report")}>Report</button>
        </div>
      </div>
    </>
  );
}