import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BGImage from "./assets/ABG.jpeg";

interface Request {
  id: number;
  description: string;
  status: "Pending" | "Approved";
}

const HodFM: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<Request[]>([]);
  const [description, setDescription] = useState("");
  const [hodEmail, setHodEmail] = useState("");

  // Load HOD email and requests
  useEffect(() => {
    const email = localStorage.getItem("hod_email");

    if (email) {
      setHodEmail(email);
      fetchRequests(email);
    }
  }, []);

  // Fetch requests from backend
  const fetchRequests = async (email: string) => {
    try {
      const res = await axios.get("http://localhost:3000/facility/all");

      const filteredRequests = res.data
        .filter((r: any) => r.hod_email === email)
        .map((r: any) => ({
          id: r.facility_id,
          description: r.request,
          status: r.admin_approval ? "Approved" : "Pending",
        }));

      setRequests(filteredRequests);
    } catch (err) {
      console.error("Error loading requests", err);
    }
  };

  // Send new request
  const handleSubmit = async () => {
    if (!description.trim()) return;

    try {
      const res = await axios.post("http://localhost:3000/facility/send", {
        hod_email: hodEmail,
        request: description,
      });

      if (res.status === 201) {
        setDescription("");
        fetchRequests(hodEmail); // reload requests
        alert("Request sent successfully ✅");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${BGImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "20px",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      {/* Navbar */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => navigate(-1)} style={navBtn}>
          ← Back
        </button>

        <button onClick={() => navigate("/login")} style={navBtn}>
          Logout
        </button>
      </div>

      <div style={containerStyle}>
        <h2 style={{ textAlign: "center", color: "#000" }}>
          HOD - Request Any Items
        </h2>

        {/* Email */}
        <input type="email" value={hodEmail} readOnly style={emailBox} />

        {/* Request box */}
        <textarea
          placeholder="Write your full request here..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={textareaStyle}
        />

        {/* Note */}
        <div style={noteBox}>
          <strong>Please add these details in your request:</strong>
          <ul>
            <li>Item Name</li>
            <li>Qty / Unit</li>
            <li>Color (if needed)</li>
            <li>Shop Name</li>
            <li>Requester Mobile Number</li>
          </ul>
        </div>

        <button style={submitBtn} onClick={handleSubmit}>
          Submit Request
        </button>

        {/* Requests list */}
        <div style={{ marginTop: "20px" }}>
          {requests.length === 0 ? (
            <p style={{ textAlign: "center", color: "#888" }}>
              No requests yet.
            </p>
          ) : (
            requests.map((req) => (
              <div key={req.id} style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Request #{req.id}</span>

                  <span style={statusStyle(req.status)}>{req.status}</span>
                </div>

                <p style={{ marginTop: "10px" }}>{req.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ---------------- Styles ---------------- */

const navBtn = {
  padding: "8px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#333",
  color: "#fff",
  cursor: "pointer",
};

const containerStyle = {
  maxWidth: "800px",
  margin: "40px auto",
  background: "rgba(255,255,255,0.95)",
  padding: "30px",
  borderRadius: "15px",
};

const textareaStyle = {
  width: "100%",
  minHeight: "120px",
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginTop: "20px",
  color: "#ffffff",
};

const emailBox = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  marginBottom: "15px",
  backgroundColor: "#f1f1f1",
  color: "#000",
  fontWeight: "bold",
};

const noteBox = {
  marginTop: "15px",
  background: "#f8f9fa",
  padding: "15px",
  borderRadius: "8px",
  fontSize: "14px",
  borderLeft: "4px solid #4e73df",
  color: "#000",
};

const submitBtn = {
  marginTop: "20px",
  padding: "10px 25px",
  background: "#4e73df",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const cardStyle = {
  background: "#ffffff",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "15px",
  boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
};

const statusStyle = (status: string) => ({
  padding: "4px 10px",
  borderRadius: "15px",
  color: "#fff",
  backgroundColor:
    status === "Approved"
      ? "#28a745"
      : status === "Pending"
      ? "#ffc107"
      : "#dc3545",
});

export default HodFM;