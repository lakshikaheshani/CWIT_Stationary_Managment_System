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
  hodStatus: string | null;
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

  const fetchUserRequests = async () => {
    if (!userEmail) return;
    const res = await axios.get(
      `${API_BASE}/requests?user_email=${userEmail}`
    );
    const mappedRequests: UserRequest[] = res.data.map((r: any) => ({
      ...r,
      hodStatus: r.hod_approval,
      adminStatus: r.admin_approval,
    }));
    setUserRequests(mappedRequests);
  };

  useEffect(() => {
    if (activeTab === "status") fetchUserRequests();
  }, [activeTab, userEmail]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleHome = () => navigate("/");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleItemChange = (
    index: number,
    field: string,
    value: string
  ) => {
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

    await axios.post(`${API_BASE}/requests`, requestData);

    alert("Request Submitted Successfully!");

    setItems([{ item_name: "", quantity: "" }]);
    setFormData({
      category: "",
      description: "",
      department: userInfo.department,
    });

    setActiveTab("status");
  };

  const handleDelete = async (requestId: number) => {
    if (!window.confirm("Delete this request?")) return;
    await axios.delete(`${API_BASE}/requests/${requestId}`);
    fetchUserRequests();
  };

  const groupedRequests = userRequests.reduce(
    (acc: { [key: string]: UserRequest[] }, item) => {
      if (!acc[item.request_id]) acc[item.request_id] = [];
      acc[item.request_id].push(item);
      return acc;
    },
    {}
  );

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
    itemRow: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      marginBottom: "10px",
    },
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
    deleteBtn: {
      backgroundColor: "#FF4D4D",
      color: "#fff",
      border: "none",
      borderRadius: "8px",
      padding: "8px",
      cursor: "pointer",
    },
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

            {items.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <select
                  value={item.item_name}
                  onChange={(e) =>
                    handleItemChange(index, "item_name", e.target.value)
                  }
                  style={{ ...styles.select, flex: 2 }}
                >
                  <option value="">Select Items</option>
                   <option value="Pencil">Pencil</option>
      <option value="Eraser">Eraser</option>
      <option value="Cutter – Pencil">Cutter – Pencil</option>
      <option value="Pen Blue">Pen Blue</option>
      <option value="Pen Black">Pen Black</option>
      <option value="Pen Red">Pen Red</option>
      <option value="Permanent Marker Blue">Permanent Marker Blue</option>
      <option value="Permanent Marker Black">Permanent Marker Black</option>
      <option value="Permanent Marker Red">Permanent Marker Red</option>
      <option value="Whiteboard Marker Blue">Whiteboard Marker Blue</option>
      <option value="Whiteboard Marker Black">Whiteboard Marker Black</option>
      <option value="Whiteboard Marker Red">Whiteboard Marker Red</option>
      <option value="Highlighter Pen Green">Highlighter Pen Green</option>
      <option value="Highlighter Pen Yellow">Highlighter Pen Yellow</option>
      <option value="Highlighter Pen Pink">Highlighter Pen Pink</option>
      <option value="Highlighter Pen Blue">Highlighter Pen Blue</option>
      <option value="Highlighter Pen Orange">Highlighter Pen Orange</option>
      <option value="Platignum Pen 6 Packs">Platignum Pen 6 Packs</option>
      <option value="Platignum Pen 12 Packs">Platignum Pen 12 Packs</option>
      <option value="Correction Pen">Correction Pen</option>
      <option value="Foot Ruler 12&quot; Plastic">Foot Ruler 12" Plastic</option>
      <option value="Foot Ruler 6&quot; Steel">Foot Ruler 6" Steel</option>
      <option value="Scissors Small">Scissors Small</option>
      <option value="Scissors Medium">Scissors Medium</option>
      <option value="Scissors Large">Scissors Large</option>
      <option value="Paper Cutter Small">Paper Cutter Small</option>
      <option value="Paper Cutter Medium">Paper Cutter Medium</option>
      <option value="Paper Clips Small">Paper Clips Small</option>
      <option value="Paper Clips Medium">Paper Clips Medium</option>
      <option value="Binder Clips 15 mm">Binder Clips 15 mm</option>
      <option value="Binder Clips 19 mm">Binder Clips 19 mm</option>
      <option value="Binder Clips 25 mm">Binder Clips 25 mm</option>
      <option value="Binder Clips 32 mm">Binder Clips 32 mm</option>
      <option value="Drawing Pins">Drawing Pins</option>
      <option value="File Fasteners Black">File Fasteners Black</option>
      <option value="File Fasteners Blue">File Fasteners Blue</option>
      <option value="File Fasteners Red">File Fasteners Red</option>
      <option value="File Fasteners Green">File Fasteners Green</option>
      <option value="File Fasteners Yellow">File Fasteners Yellow</option>
      <option value="Rubber Bands">Rubber Bands</option>
      <option value="Flat File Cardboard">Flat File Cardboard</option>
      <option value="Flat File Plastic">Flat File Plastic</option>
      <option value="Clip File A4">Clip File A4</option>
      <option value="Box Files">Box Files</option>
      <option value="File Separators">File Separators</option>
      <option value="Magazine Holder Plastic">Magazine Holder Plastic</option>
      <option value="Certificate Files – 10 Pockets">Certificate Files – 10 Pockets</option>
      <option value="Certificate Files – 20 Pockets">Certificate Files – 20 Pockets</option>
      <option value="Certificate Files – 30 Pockets">Certificate Files – 30 Pockets</option>
      <option value="Certificate Files – 40 Pockets">Certificate Files – 40 Pockets</option>
      <option value="Two Ring Files">Two Ring Files</option>
      <option value="File Lace">File Lace</option>
      <option value="A4 Paper White">A4 Paper White</option>
      <option value="A3 Paper White">A3 Paper White</option>
      <option value="A5 Paper White">A5 Paper White</option>
      <option value="A4 Paper Rainbow">A4 Paper Rainbow</option>
      <option value="Sticker Paper White A4">Sticker Paper White A4</option>
      <option value="Demy Paper White">Demy Paper White</option>
      <option value="Flip Chart Paper 23.4 × 33.1 in">Flip Chart Paper 23.4 × 33.1 in</option>
      <option value="Flip Chart Paper 16.5 × 23.4 in">Flip Chart Paper 16.5 × 23.4 in</option>
      <option value="Bristol Board White">Bristol Board White</option>
      <option value="Clear Glue 50ml">Clear Glue 50ml</option>
      <option value="Clear Glue 8g">Clear Glue 8g</option>
      <option value="Binder Glue 40g">Binder Glue 40g</option>
      <option value="Binder Glue 100g">Binder Glue 100g</option>
      <option value="Cello Tape 12mm">Cello Tape 12mm</option>
      <option value="Cello Tape 18mm">Cello Tape 18mm</option>
      <option value="Cello Tape 24mm">Cello Tape 24mm</option>
      <option value="Cello Tape 36mm">Cello Tape 36mm</option>
      <option value="Cello Tape 48mm">Cello Tape 48mm</option>
      <option value="Cello Tape 60mm">Cello Tape 60mm</option>
      <option value="PVC Packing Tape Red 48mm × 66m">PVC Packing Tape Red 48mm × 66m</option>
      <option value="PVC Packing Tape Blue 48mm × 66m">PVC Packing Tape Blue 48mm × 66m</option>
      <option value="PVC Packing Tape Green 48mm × 66m">PVC Packing Tape Green 48mm × 66m</option>
      <option value="PVC Packing Tape Yellow 48mm × 66m">PVC Packing Tape Yellow 48mm × 66m</option>
      <option value="PVC Packing Tape Black 48mm × 66m">PVC Packing Tape Black 48mm × 66m</option>
      <option value="PVC Packing Tape Orange 48mm × 66m">PVC Packing Tape Orange 48mm × 66m</option>
      <option value="Masking Tape 12mm">Masking Tape 12mm</option>
      <option value="Masking Tape 18mm">Masking Tape 18mm</option>
      <option value="Masking Tape 24mm">Masking Tape 24mm</option>
      <option value="Masking Tape 36mm">Masking Tape 36mm</option>
      <option value="Masking Tape 48mm">Masking Tape 48mm</option>
      <option value="Masking Tape 72mm">Masking Tape 72mm</option>
      <option value="Double Tape 9mm">Double Tape 9mm</option>
      <option value="Double Tape 12mm">Double Tape 12mm</option>
      <option value="Double Tape 18mm">Double Tape 18mm</option>
      <option value="Double Tape 24mm">Double Tape 24mm</option>
      <option value="Double Tape 36mm">Double Tape 36mm</option>
      <option value="Binding Tape 36mm Black">Binding Tape 36mm Black</option>
      <option value="Binding Tape 36mm Blue">Binding Tape 36mm Blue</option>
      <option value="Binding Tape 36mm Red">Binding Tape 36mm Red</option>
      <option value="Binding Tape 36mm Green">Binding Tape 36mm Green</option>
      <option value="Binding Tape 36mm Yellow">Binding Tape 36mm Yellow</option>
      <option value="Binding Tape 48mm Black">Binding Tape 48mm Black</option>
      <option value="Binding Tape 48mm Blue">Binding Tape 48mm Blue</option>
      <option value="Binding Tape 48mm Red">Binding Tape 48mm Red</option>
      <option value="Binding Tape 48mm Green">Binding Tape 48mm Green</option>
      <option value="Binding Tape 48mm Yellow">Binding Tape 48mm Yellow</option>
      <option value="Tape Dispenser Small">Tape Dispenser Small</option>
      <option value="Tape Dispenser Medium">Tape Dispenser Medium</option>
      <option value="Tape Dispenser Large">Tape Dispenser Large</option>
      <option value="Sticky Notes 3&quot; × 3&quot;">Sticky Notes 3" × 3"</option>
      <option value="Sticky Notes 0.6&quot; × 3&quot;">Sticky Notes 0.6" × 3"</option>
      <option value="Puncher Small">Puncher Small</option>
      <option value="Puncher Medium">Puncher Medium</option>
      <option value="Puncher Large">Puncher Large</option>
      <option value="Stapler Machine Small">Stapler Machine Small</option>
      <option value="Stapler Machine Medium">Stapler Machine Medium</option>
      <option value="Stapler Machine Large">Stapler Machine Large</option>
      <option value="Stapler Pins Small">Stapler Pins Small</option>
      <option value="Stapler Pins Medium">Stapler Pins Medium</option>
      <option value="Stapler Pins Large">Stapler Pins Large</option>
      <option value="Calculator">Calculator</option>
                 
                </select>

                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", e.target.value)
                  }
                  style={{ ...styles.select, flex: 1 }}
                />

                {items.length > 1 && (
                  <button
                    type="button"
                    style={styles.deleteBtn}
                    onClick={() => removeItemRow(index)}
                  >
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
                  const hodText =
                    item.hodStatus === "1" ? "Approved" : "Pending";
                  const adminText =
                    item.adminStatus === "1" ? "Approved" : "Pending";

                  return (
                    <div key={idx} style={styles.statusCard}>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => handleDelete(item.request_id)}
                      >
                        <FaTrash />
                      </button>

                      <p><strong>Item:</strong> {item.item_name}</p>
                      <p><strong>Quantity:</strong> {item.quantity}</p>
                      <p><strong>Date:</strong> {item.created_at.split("T")[0]}</p>

                      <p>
                        <strong>HOD:</strong>{" "}
                        <span style={hodText === "Approved" ? styles.approved : styles.pending}>
                          {hodText}
                        </span>
                      </p>

                      <p>
                        <strong>Admin:</strong>{" "}
                        <span style={adminText === "Approved" ? styles.approved : styles.pending}>
                          {adminText}
                        </span>
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