import { useEffect, useState } from "react";
import BG from "./assets/WBG.png";

type StationeryReport = {
  date: string;
  item_name: string;
  issued_qty: any;
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
  const [selectedMonth, setSelectedMonth] = useState("");

  // ================= LOAD DATA ON INIT =================
  useEffect(() => {
    fetchAllIssues();       // Load Stationery
    fetchFacilityReports(); // Load Facility
  }, []);

  // ================= FETCH STATIONERY ALL =================
  const fetchAllIssues = async () => {
    try {
      const res = await fetch("http://localhost:3000/reports/issues");
      const data = await res.json();

      const formatted = data.map((item: any) => ({
        date: item.created_at ? item.created_at.split("T")[0] : "-", // YYYY-MM-DD only
        item_name: item.item_name || "-",
        issued_qty: item.quantity || "-",
        user: item.user_email || "-",
      }));

      setStationeryReports(formatted);
    } catch (err) {
      console.error("Fetch Stationery Error:", err);
    }
  };

  // ================= FETCH STATIONERY MONTHLY =================
  const fetchMonthlyReport = async (year: string, month: string) => {
    try {
      const res = await fetch(
        `http://localhost:3000/reports/monthly?year=${year}&months=${parseInt(month)}`
      );
      const data = await res.json();

      const formatted = data.map((item: any) => ({
        date: item.Date ? item.Date.split("T")[0] : "-", // YYYY-MM-DD only
        item_name: item.item_name || "-",
        issued_qty: item.total_quantity || "-",
        user: item.user_email || "-",
      }));

      setStationeryReports(formatted);
    } catch (err) {
      console.error("Monthly Stationery Fetch Error:", err);
    }
  };

  // ================= FETCH FACILITY REPORT =================
  const fetchFacilityReports = async (year?: string, month?: string) => {
    try {
      let url = "http://localhost:3000/facility-reports";

      if (year && month) {
        url = `${url}/monthly?year=${year}&month=${parseInt(month)}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      const formatted: FacilityReport[] = data.map((item: any) => ({
        request_date: item.Date ? item.Date.split("T")[0] : "-", // YYYY-MM-DD only
        user_name: item.Name || "-",
        request_item: item["Request Item"] || "-",
        payment_type:
          item["Payment Type"] === true || item["Payment Type"] === "true"
            ? "Peticash"
            : "NFA",
        admin_note: item["Admin Note"] || "-",
      }));

      setFacilityReports(formatted);
    } catch (err) {
      console.error("Facility Fetch Error:", err);
    }
  };

  // ================= CSV DOWNLOAD =================
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((item) =>
      Object.values(item).map((val) => `"${val}"`).join(",")
    );

    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    link.click();
  };

  return (
    <>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Poppins', sans-serif;
          background: url(${BG}) center/cover no-repeat;
          min-height: 100vh;
          background-attachment: fixed;
          color: #333;
        }
        .report-container {
          width: 100%;
          max-width: 1200px;
          margin: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          background: rgba(255,255,255,0.9);
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
        tr:nth-child(even) { background: #f2f2f2; }
        tr:hover { background: #dfefff; }
        .report-switch { display: flex; gap: 15px; margin-top: 80px; margin-bottom: 20px; justify-content: center; }
        button {
          padding: 10px 18px;
          border: none;
          border-radius: 8px;
          background: #4a90e2;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: 0.3s;
        }
        button:hover { background: #357ab8; }
        .active { background: #2c5fb8; }
        .download-btn { margin-top: 10px; background: #28a745; }
        .download-btn:hover { background: #1e7e34; }
        input[type=month] { padding: 6px 12px; margin-bottom: 10px; border-radius: 6px; border: 1px solid #ccc; }
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
          background-color: rgba(74,144,226,0.8);
          color: white;
        }

        .white-label {
        color: white;
        }



        .top-nav button:hover { background-color: #357ab8; transform: translateY(-2px); }
        @media (max-width:768px){ th, td { padding: 8px; } }
      `}</style>

      {/* TOP NAV */}
      <div className="top-nav">
        <button onClick={() => window.history.back()}>Back</button>
        <button onClick={() => (window.location.href = "/admin-dashboard")}>Home</button>
        <button onClick={() => (window.location.href = "/login")}>Logout</button>
      </div>

      {/* SWITCH BUTTONS */}
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







      {/* MONTH-YEAR PICKER */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>

        <label style={{ color: "white" }}>
  Select Month & Year:
</label>








        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => {
            const value = e.target.value;
            setSelectedMonth(value);

            if (value) {
              const [year, month] = value.split("-");
              fetchMonthlyReport(year, month);    // Stationery
              fetchFacilityReports(year, month);  // Facility
            } else {
              fetchAllIssues();
              fetchFacilityReports();
            }
          }}
        />
      </div>

      <div className="report-container">
        {/* STATIONERY TABLE */}
        {activeReport === "stationery" && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item Name</th>
                  <th>Issued Qty</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {stationeryReports.length > 0 ? (
                  stationeryReports.map((item, i) => (
                    <tr key={i}>
                      <td>{item.date}</td>
                      <td>{item.item_name}</td>
                      <td>{item.issued_qty}</td>
                      <td>{item.user}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center" }}>
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="download-btn"
              onClick={() =>
                downloadCSV(
                  stationeryReports,
                  `stationery_report_${selectedMonth || "all"}.csv`
                )
              }
            >
              Download CSV
            </button>
          </>
        )}

        {/* FACILITY TABLE */}
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
                {facilityReports.length > 0 ? (
                  facilityReports.map((item, i) => (
                    <tr key={i}>
                      <td>{item.request_date}</td>
                      <td>{item.user_name}</td>
                      <td>{item.request_item}</td>
                      <td>{item.payment_type}</td>
                      <td>{item.admin_note}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center" }}>
                      No Data Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <button
              className="download-btn"
              onClick={() =>
                downloadCSV(
                  facilityReports,
                  `facility_report_${selectedMonth || "all"}.csv`
                )
              }
            >
              Download CSV
            </button>
          </>
        )}
      </div>
    </>
  );
}