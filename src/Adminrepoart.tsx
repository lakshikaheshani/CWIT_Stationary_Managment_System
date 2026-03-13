import { useEffect, useState } from "react";
import BG from "./assets/WBG.png";

type StationeryReport = {
  date: string;
  item_name: string;
  opening_stock: number;
  received_qty: number;
  issued_qty: number;
  balance_stock: number;
  user: string;
};

type FacilityReport = {
  request_date: string;
  user_name: string;
  request_item: string;
  payment_type: string;
  admin_note: string;
};

export default function AdminReport() {
  const [stationeryReports, setStationeryReports] = useState<StationeryReport[]>([]);
  const [facilityReports, setFacilityReports] = useState<FacilityReport[]>([]);
  const [activeReport, setActiveReport] = useState("stationery");
  const [selectedMonth, setSelectedMonth] = useState(""); // new state

  useEffect(() => {
    setStationeryReports([
      { date: "2026-03-01", item_name: "Pens", opening_stock: 100, received_qty: 50, issued_qty: 30, balance_stock: 120, user: "Admin" },
      { date: "2026-03-05", item_name: "A4 Papers", opening_stock: 200, received_qty: 100, issued_qty: 80, balance_stock: 220, user: "Manager" },
      { date: "2026-04-02", item_name: "Markers", opening_stock: 50, received_qty: 30, issued_qty: 10, balance_stock: 70, user: "Admin" },
    ]);

    setFacilityReports([
      { request_date: "2026-03-03", user_name: "Kasun", request_item: "Meeting Room", payment_type: "NFA", admin_note: "Approved" },
      { request_date: "2026-03-07", user_name: "Nadeesha", request_item: "Projector", payment_type: "Petty Cash", admin_note: "Pending" },
      { request_date: "2026-04-10", user_name: "Amal", request_item: "Conference Hall", payment_type: "NFA", admin_note: "Approved" },
    ]);
  }, []);

  // CSV Download function
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(item => Object.values(item).map(val => `"${val}"`).join(","));
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", filename);
    link.click();
  };

  // Filter data by selected month
  const filteredStationery = stationeryReports.filter(item =>
    selectedMonth === "" || item.date.startsWith(selectedMonth)
  );

  const filteredFacility = facilityReports.filter(item =>
    selectedMonth === "" || item.request_date.startsWith(selectedMonth)
  );

  return (
    <>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background: url(${BG}) center/cover no-repeat;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          align-items: center;
          padding: 20px;
          background-attachment: fixed;
          color: #333;
        }

        .report-container {
          width: 100%;
          max-width: 1200px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: rgba(255,255,255,0.85);
          border-radius: 10px;
          overflow: hidden;
          table-layout: fixed;
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        th, td {
          padding: 12px 15px;
          text-align: left;
          word-wrap: break-word;
        }

        th {
          background: #4a90e2;
          color: white;
        }

        tr:nth-child(even) {
          background: #f2f2f2;
        }

        tr:hover {
          background: #dfefff;
        }

        .report-switch {
          display: flex;
          gap: 15px;
          margin-bottom: 20px;
          justify-content: center;
        }

        button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #4a90e2;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        button:hover {
          background: #357ab8;
        }

        .active {
          background: #2c5fb8;
        }

        .download-btn {
          margin-top: 10px;
          background: #28a745;
        }

        .download-btn:hover {
          background: #1e7e34;
        }

        select {
          padding: 6px 12px;
          margin-bottom: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }

        @media (max-width: 768px) {
          th, td {
            padding: 8px 10px;
          }
          button {
            padding: 8px 12px;
          }
        }
      `}</style>

      {/* Switch Buttons */}
      <div className="report-switch">
        <button
          className={activeReport === "stationery" ? "active" : ""}
          onClick={() => setActiveReport("stationery")}
        >
          Stationery Report
        </button>
        <button
          className={activeReport === "facility" ? "active" : ""}
          onClick={() => setActiveReport("facility")}
        >
          Facility Report
        </button>
      </div>

      {/* Month selector */}
      <div>
        <label>Select Month: </label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="">All Months</option>
          <option value="2026-03">March 2026</option>
          <option value="2026-04">April 2026</option>
          <option value="2026-05">May 2026</option>
        </select>
      </div>

      <div className="report-container">
        {/* Stationery Table */}
        {activeReport === "stationery" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item Name</th>
                  <th>Opening Stock</th>
                  <th>Received Qty</th>
                  <th>Issued Qty</th>
                  <th>Balance Stock</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {filteredStationery.map((item, i) => (
                  <tr key={i}>
                    <td>{item.date}</td>
                    <td>{item.item_name}</td>
                    <td>{item.opening_stock}</td>
                    <td>{item.received_qty}</td>
                    <td>{item.issued_qty}</td>
                    <td>{item.balance_stock}</td>
                    <td>{item.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="download-btn"
              onClick={() => downloadCSV(filteredStationery, `stationery_report_${selectedMonth || "all"}.csv`)}>
              Download CSV
            </button>
          </>
        )}

        {/* Facility Table */}
        {activeReport === "facility" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>User Name</th>
                  <th>Request Item</th>
                  <th>Payment Type</th>
                  <th>Admin Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacility.map((item, i) => (
                  <tr key={i}>
                    <td>{item.request_date}</td>
                    <td>{item.user_name}</td>
                    <td>{item.request_item}</td>
                    <td>{item.payment_type}</td>
                    <td>{item.admin_note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="download-btn"
              onClick={() => downloadCSV(filteredFacility, `facility_report_${selectedMonth || "all"}.csv`)}>
              Download CSV
            </button>
          </>
        )}

        
      </div>
    </>
  );
  
}