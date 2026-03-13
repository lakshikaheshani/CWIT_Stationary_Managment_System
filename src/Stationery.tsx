import React, { useState } from "react";
import BG from "./assets/BG.png";
import "./App.css";

type StatusType = "Pending" | "Accepted" | "Rejected" | "Issued";

const Stationery: React.FC = () => {
  const [activeTab, setActiveTab] = useState("request");
  const [status, setStatus] = useState<StatusType | null>(null);
  const [rating, setRating] = useState(0);

  const handleRequest = () => {
    setStatus("Pending");
    alert("Request sent to HOD");
  };

  const handleHOD = (action: "Accepted" | "Rejected") => {
    setStatus(action);
  };

  const handleIssue = () => {
    setStatus("Issued");
  };

  return (
    <div
      className="page-container"
      style={{ backgroundImage: `url(${BG})` }}
    >
      {/* ===== TOP MENU ===== */}
      <div className="top-menu">
        <span
          onClick={() => setActiveTab("request")}
          className={activeTab === "request" ? "active" : ""}
        >
          Stationery Request
        </span>

        <span
          onClick={() => setActiveTab("status")}
          className={activeTab === "status" ? "active" : ""}
        >
          Current Status
        </span>

        <span
          onClick={() => setActiveTab("satisfaction")}
          className={activeTab === "satisfaction" ? "active" : ""}
        >
          Satisfaction
        </span>
      </div>

      {/* ===== CONTENT CARD ===== */}
      <div className="content-card">
        {/* REQUEST TAB */}
        {activeTab === "request" && (
          <>
            <h2>Stationery Request</h2>

            <div className="form-group">
              <label>Department</label>
              <select>
                <option>Select Department</option>
                <option>IT</option>
                <option>HR</option>
                <option>Administration</option>
              </select>
            </div>

            <div className="form-group">
              <label>Item</label>
              <select>
                <option>Select Item</option>
                <option>Pen</option>
                <option>Notebook</option>
                <option>Printer Paper</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <select>
                <option>1</option>
                <option>2</option>
                <option>3</option>
              </select>
            </div>

            <div className="form-group">
              <label>Deadline</label>
              <input type="date" />
            </div>

            <button className="primary-btn" onClick={handleRequest}>
              Send Request to HOD
            </button>
          </>
        )}

        {/* STATUS TAB */}
        {activeTab === "status" && (
          <>
            <h2>Current Status</h2>

            {status ? (
              <p className="status-text">{status}</p>
            ) : (
              <p>No request yet.</p>
            )}

            {status === "Pending" && (
              <div>
                <button
                  className="accept-btn"
                  onClick={() => handleHOD("Accepted")}
                >
                  Accept
                </button>

                <button
                  className="reject-btn"
                  onClick={() => handleHOD("Rejected")}
                >
                  Reject
                </button>
              </div>
            )}

            {status === "Accepted" && (
              <button className="primary-btn" onClick={handleIssue}>
                Issue from Admin
              </button>
            )}

            {status === "Issued" && (
              <p className="notification">
                Stationery Issued. Please collect your items.
              </p>
            )}
          </>
        )}

        {/* SATISFACTION TAB */}
        {activeTab === "satisfaction" && (
          <>
            <h2>Satisfaction Level</h2>

            {status === "Issued" ? (
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rating ? "star selected" : "star"}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            ) : (
              <p>You can rate after receiving stationery.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Stationery;
