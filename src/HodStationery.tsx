import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaSignOutAlt } from "react-icons/fa";
import BG from "./assets/hod1.jpg";
import Logo from "./assets/LG.png";

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

const HodStationery: React.FC = () => {
  const navigate = useNavigate();
  const hodDepartment = "IT";

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
      return;
    }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/hod?department=${hodDepartment}`
      );
      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setRequests(
        data.sort((a: Request, b: Request) => b.request_id - a.request_id)
      );
    } catch (error: any) {
      console.error("Fetch error:", error.message);
      alert("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/hod/${id}?department=${hodDepartment}`,
        { method: "PUT" }
      );
      if (!response.ok) throw new Error("Approval failed");

      alert("Request Approved Successfully!");
      fetchRequests();
    } catch (error: any) {
      console.error("Approve error:", error.message);
      alert("Failed to approve request.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: "100vh",
      backgroundImage: `url(${BG})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px",
      fontFamily: "Poppins, sans-serif",
    },
    logo: {
      width: "130px",
      marginBottom: "20px",
    },
    title: {
      fontSize: "32px",
      fontWeight: 700,
      marginBottom: "30px",
      color: "#ffffff",
    },
    card: {
      width: "900px",
      background: "rgba(255,255,255,0.96)",
      padding: "30px",
      borderRadius: "20px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    },
    requestCard: {
      background: "#f9f9f9",
      padding: "20px",
      borderRadius: "15px",
      marginBottom: "20px",
      boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
      color: "#000000", // ✅ TEXT COLOR BLACK
    },
    approveBtn: {
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 18px",
      cursor: "pointer",
      marginTop: "10px",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "6px",
    },
    buttonsContainer: {
      display: "flex",
      gap: "20px",
      marginTop: "35px",
    },
    backBtn: {
      padding: "12px 26px",
      backgroundColor: "#555",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
    },
    logoutBtn: {
      padding: "12px 26px",
      backgroundColor: "red",
      color: "white",
      border: "none",
      borderRadius: "12px",
      cursor: "pointer",
      fontWeight: "bold",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    statusApproved: {
      color: "green",
      fontWeight: "bold",
    },
    statusPending: {
      color: "orange",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <img src={Logo} alt="Logo" style={styles.logo} />
      <h1 style={styles.title}>HOD Approval Dashboard</h1>

      <div style={styles.card}>
        <h3 style={{ color: "#000" }}>
          Pending Requests - {hodDepartment}
        </h3>

        {loading && <p style={{ color: "#000" }}>Loading...</p>}
        {!loading && requests.length === 0 && (
          <p style={{ color: "#000" }}>No pending requests found.</p>
        )}

        {!loading &&
          requests.map((req, index) => (
            <div
              key={req.request_id}
              style={{
                ...styles.requestCard,
                border: index === 0 ? "3px solid #4CAF50" : "none",
              }}
            >
              <p>
                <strong>User Email:</strong> {req.user_email}
              </p>

              <p>
                <strong>Department:</strong> {req.department}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={
                    req.hod_approval === 1
                      ? styles.statusApproved
                      : styles.statusPending
                  }
                >
                  {req.hod_approval === 1 ? "Approved" : "Pending"}
                </span>
              </p>

              <h4>Items:</h4>
              {req.items.map((item, idx) => (
                <p key={idx}>
                  {item.item_name} ({item.category}) - Qty: {item.quantity}
                </p>
              ))}

              {(req.hod_approval === 0 ||
                req.hod_approval === null) && (
                <button
                  style={styles.approveBtn}
                  onClick={() => handleApprove(req.request_id)}
                >
                  <FaCheckCircle /> Approve
                </button>
              )}
            </div>
          ))}
      </div>

      <div style={styles.buttonsContainer}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default HodStationery;