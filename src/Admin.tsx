import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type StockItem = {
  id: number;
  name: string;
  currentStock: number;
  lastRefillDate: string;
};

function AdminDashboard() {
  const [user, setUser] = useState<{ full_name: string } | null>(null);
  const [items, setItems] = useState<StockItem[]>([
    { id: 1, name: "Pens", currentStock: 100, lastRefillDate: "2026-02-01" },
    { id: 2, name: "Books", currentStock: 50, lastRefillDate: "2026-02-05" },
  ]);

  const [selectedItem, setSelectedItem] = useState<number>(1);
  const [refillQty, setRefillQty] = useState<number>(0);
  const [refillDate, setRefillDate] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleRefill = () => {
    if (!refillQty || !refillDate) {
      alert("Please fill all fields");
      return;
    }

    const updatedItems = items.map((item) =>
      item.id === selectedItem
        ? {
            ...item,
            currentStock: item.currentStock + refillQty,
            lastRefillDate: refillDate,
          }
        : item
    );

    setItems(updatedItems);
    setRefillQty(0);
    setRefillDate("");
    alert("Stock updated successfully!");
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <div
        style={{
          width: "220px",
          background: "#1f2937",
          color: "#fff",
          padding: "20px",
        }}
      >
        <h2>Admin Panel</h2>
        <p style={{ marginTop: 30 }}>📦 Stock Management</p>
        <button
          onClick={handleLogout}
          style={{
            marginTop: 40,
            padding: "8px 12px",
            borderRadius: 5,
            border: "none",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", background: "#f3f4f6" }}>
        <h1>Hello, {user?.full_name || "Admin"} 👋</h1>

        {/* Refill Form */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: 10,
            marginTop: 20,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Add Stock Refill</h2>

          <div style={{ marginTop: 10 }}>
            <label>Item:</label>
            <select
              value={selectedItem}
              onChange={(e) => setSelectedItem(Number(e.target.value))}
              style={{ marginLeft: 10, padding: 5 }}
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Refill Quantity:</label>
            <input
              type="number"
              value={refillQty}
              onChange={(e) => setRefillQty(Number(e.target.value))}
              style={{ marginLeft: 10, padding: 5 }}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Refill Date:</label>
            <input
              type="date"
              value={refillDate}
              onChange={(e) => setRefillDate(e.target.value)}
              style={{ marginLeft: 10, padding: 5 }}
            />
          </div>

          <button
            onClick={handleRefill}
            style={{
              marginTop: 15,
              padding: "8px 15px",
              borderRadius: 5,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Save Refill
          </button>
        </div>

        {/* Stock Table */}
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: 10,
            marginTop: 30,
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>Stock Overview</h2>
          <table
            style={{
              width: "100%",
              marginTop: 15,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr style={{ background: "#e5e7eb" }}>
                <th style={{ padding: 10 }}>Item</th>
                <th>Current Stock</th>
                <th>Last Refill Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ textAlign: "center" }}>
                  <td style={{ padding: 10 }}>{item.name}</td>
                  <td>{item.currentStock}</td>
                  <td>{item.lastRefillDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
