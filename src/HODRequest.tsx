import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaSignOutAlt,
  FaHome,
  FaTrash,
} from "react-icons/fa";
import Logo from "./assets/LG.png";
import BG from "./assets/ABG.jpeg";

const API_BASE = "http://localhost:3000";

interface FormData {
  category: string;
  description: string;
  department: string;
}

interface UserRequest {
  request_id: number;
  user_email: string;
  item_name: string;
  category: string;
  quantity: string;
  description: string;
  department: string;
  hodStatus: string;    // "1" = Approved automatically
  adminStatus: string | null;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("request");

  const [formData, setFormData] = useState<FormData>({
    category: "",
    description: "",
    department: "",
  });

  const [items, setItems] = useState([{ item_name: "", quantity: "" }]);
  const [userRequests, setUserRequests] = useState<UserRequest[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    department: string;
  }>({
    name: "",
    email: "",
    department: "",
  });

  // ---------------------- LOAD USER ----------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const userObj = JSON.parse(storedUser);
    const dept = userObj.department || "";
    setUserEmail(userObj.email);
    setUserInfo({
      name: userObj.full_name || userObj.name || "",
      email: userObj.email,
      department: dept,
    });
    setFormData((prev) => ({ ...prev, department: dept }));
  }, [navigate]);

  // ---------------------- FETCH USER REQUESTS ----------------------
  const fetchUserRequests = async () => {
    if (!userEmail) return;
    try {
      const res = await axios.get(`${API_BASE}/requests?user_email=${userEmail}`);
      const mappedRequests: UserRequest[] = res.data.map((r: any) => ({
        ...r,
        hodStatus: r.hod_approval?.toString() || "0", // HOD auto-approved = "1"
        adminStatus: r.admin_approval?.toString() || "0",
      }));
      setUserRequests(mappedRequests);
    } catch (err) {
      console.error("Fetch User Requests Error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "status") fetchUserRequests();
  }, [activeTab, userEmail]);

  // ---------------------- HANDLERS ----------------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleHome = () => navigate("/");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setItems(updatedItems);
  };

  const addItemRow = () => {
    if (items.length >= 5) {
      alert("Maximum 5 items allowed");
      return;
    }
    setItems([...items, { item_name: "", quantity: "" }]);
  };

  const removeItemRow = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  // ---------------------- SUBMIT REQUEST ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    for (const item of items) {
      if (!item.item_name || !item.quantity) {
        alert("Please fill all item fields");
        return;
      }
    }

    if (!formData.category || !formData.description) {
      alert("Please fill category and description");
      return;
    }

    const requestData = {
      user_email: userEmail,
      department: formData.department,
      items: items.map((item) => ({
        item_name: item.item_name,
        category: formData.category,
        quantity: item.quantity,
        description: formData.description,
      })),
    };

    try {
      // Call HOD route, hod_approval will be set automatically to 1
      await axios.post(`${API_BASE}/hod/requests`, requestData);

      alert("Request Submitted Successfully!");

      setItems([{ item_name: "", quantity: "" }]);
      setFormData({
        category: "",
        description: "",
        department: userInfo.department,
      });

      setActiveTab("status");
      fetchUserRequests();
    } catch (err) {
      console.error("Submit Request Error:", err);
      alert("Error submitting request");
    }
  };

  const handleDelete = async (requestId: number) => {
    if (!window.confirm("Delete this request?")) return;
    try {
      await axios.delete(`${API_BASE}/requests/${requestId}`);
      fetchUserRequests();
    } catch (err) {
      console.error("Delete Request Error:", err);
      alert("Error deleting request");
    }
  };

  const groupedRequests = userRequests.reduce(
    (acc: { [key: string]: UserRequest[] }, item) => {
      if (!acc[item.request_id]) acc[item.request_id] = [];
      acc[item.request_id].push(item);
      return acc;
    },
    {}
  );

  // ---------------------- STYLES ----------------------
  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      width: "100%",
      minHeight: "100vh",
      backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${BG})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px",
      fontFamily: "Poppins, sans-serif",
    },
    card: {
      width: "750px",
      background: "rgba(255,255,255,0.15)",
      backdropFilter: "blur(15px)",
      borderRadius: "25px",
      padding: "40px",
      color: "#fff",
      boxShadow: "0 25px 40px rgba(0,0,0,0.35)",
    },
    input: {
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.3)",
      width: "100%",
      background: "rgba(255,255,255,0.1)",
      color: "#fff",
      marginBottom: "15px",
    },
    select: {
      padding: "14px",
      borderRadius: "12px",
      border: "1px solid #ccc",
      backgroundColor: "#fff",
      color: "#000",
    },
    itemRow: { display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" },
    addBtn: {
      backgroundColor: "#87CEEB",
      color: "#000",
      border: "none",
      borderRadius: "15px",
      padding: "10px 20px",
      cursor: "pointer",
      fontWeight: 600,
      marginTop: "15px",
      marginBottom: "15px",
    },
    deleteBtn: { backgroundColor: "#FF4D4D", color: "#fff", border: "none", borderRadius: "8px", padding: "8px", cursor: "pointer" },
    submitButton: {
      padding: "14px",
      backgroundColor: "#00BFFF",
      color: "#fff",
      borderRadius: "15px",
      border: "none",
      cursor: "pointer",
      fontWeight: "600",
      marginTop: "20px",
    },
    statusCard: {
      background: "rgba(255,255,255,0.15)",
      padding: "20px",
      borderRadius: "18px",
      marginBottom: "15px",
      position: "relative",
    },
    approved: { color: "#00FF88", fontWeight: 600 },
    pending: { color: "#FFD500", fontWeight: 600 },
  };

  // ---------------------- RENDER ----------------------
  return (
    <div style={styles.container}>
      <img src={Logo} width="150" alt="Logo" />
      <h1 style={{ color: "#fff" }}>Office Stationery Management</h1>

      <div style={styles.card}>
        {/* TAB BUTTONS */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab("request")}>
            <FaPaperPlane /> Request
          </button>
          <button onClick={() => setActiveTab("status")}>
            <FaCheckCircle /> Status
          </button>
        </div>

        {/* REQUEST FORM */}
        {activeTab === "request" && (
          <form onSubmit={handleSubmit}>
            <input type="email" value={userEmail} readOnly style={styles.input} />
            <input type="text" value={formData.department} readOnly style={styles.input} />

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ ...styles.select, width: "100%", marginBottom: "15px" }}
            >
              <option value="">Select Category</option>
              <option value="Stationery">Stationery</option>
            </select>

            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <select
                  value={item.item_name}
                  onChange={(e) => handleItemChange(index, "item_name", e.target.value)}
                  style={{ ...styles.select, flex: 2 }}
                >
                  <option value="">Select Items</option>
                  <option value="Pen">Pen</option>
                  <option value="Pencil">Pencil</option>
                  <option value="Notebook">Notebook</option>
                  <option value="Marker">Marker</option>
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                  style={{ ...styles.select, flex: 1 }}
                />

                {items.length > 1 && (
                  <button type="button" style={styles.deleteBtn} onClick={() => removeItemRow(index)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}

            <button type="button" style={styles.addBtn} onClick={addItemRow}>
              Add Items
            </button>

            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              style={styles.input}
            />

            <button type="submit" style={styles.submitButton}>
              <FaPaperPlane /> Submit Request
            </button>
          </form>
        )}

        {/* STATUS SECTION */}
        {activeTab === "status" && (
          <div>
            <h3>Request Status</h3>
            {Object.entries(groupedRequests).map(([requestId, items]) => (
              <div key={requestId}>
                <h4>Request #{requestId}</h4>
                {items.map((item, idx) => {
                  const hodText = item.hodStatus === "1" ? "Approved" : "Pending";
                  const adminText = item.adminStatus === "1" ? "Approved" : "Pending";

                  return (
                    <div key={idx} style={styles.statusCard}>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(item.request_id)}>
                        <FaTrash />
                      </button>

                      <p><strong>Item:</strong> {item.item_name}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Date:</strong> {item.created_at.split("T")[0]}</p>

                      <p>
                        <strong>HOD:</strong>{" "}
                        <span style={hodText === "Approved" ? styles.approved : styles.pending}>{hodText}</span>
                      </p>

                      <p>
                        <strong>Admin:</strong>{" "}
                        <span style={adminText === "Approved" ? styles.approved : styles.pending}>{adminText}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "30px" }}>
        <button onClick={handleHome}>
          <FaHome /> Home
        </button>
        <button onClick={handleLogout} style={{ marginLeft: "15px" }}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;