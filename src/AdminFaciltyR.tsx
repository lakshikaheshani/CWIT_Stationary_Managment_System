import { useEffect, useState } from "react";
import BG from "./assets/WBG.png";

type FacilityRequest = {
  facility_id: number;
  hod_email: string;
  request: string;
  admin_approval: boolean | null;
  payment_method: boolean | null;
  admin_message: string | null;
  time: string;
};

export default function AdminFacility() {
  const [requests, setRequests] = useState<FacilityRequest[]>([]);
  const [approvalStatus, setApprovalStatus] = useState<Record<number, boolean | null>>({});
  const [paymentMethod, setPaymentMethod] = useState<Record<number, boolean | null>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  
  // ---------------- NOTIFICATION STATE ----------------
  const [showNotifications, setShowNotifications] = useState(false);
  const [previousRequests, setPreviousRequests] = useState<FacilityRequest[]>([]);
  const [newRequestsCount, setNewRequestsCount] = useState(0);

  const fetchFacilityRequests = async () => {
    try {
      const res = await fetch("http://localhost:3000/facility/all");
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: FacilityRequest[] = await res.json();
      
      // Check for new requests (pending approval)
      const pendingRequests = data.filter(req => req.admin_approval === null);
      const newPendingCount = pendingRequests.length;
      
      // Check if there are new requests compared to previous state
      if (previousRequests.length > 0) {
        const brandNewRequests = data.filter(newReq => 
          !previousRequests.some(prevReq => prevReq.facility_id === newReq.facility_id) &&
          newReq.admin_approval === null
        );
        
        if (brandNewRequests.length > 0) {
          // Show notification for new facility requests
          try {
            const audio = new Audio('/notification.mp3');
            audio.play().catch(e => console.log('Audio play failed:', e));
          } catch (audioError) {
            console.log('Audio notification not supported');
          }
          
          alert(`🏢 ${brandNewRequests.length} new facility request${brandNewRequests.length > 1 ? 's' : ''} received from HOD!`);
        }
      }
      
      setNewRequestsCount(newPendingCount);
      setRequests(data);
      setPreviousRequests(data);

      const approvals: Record<number, boolean | null> = {};
      const payments: Record<number, boolean | null> = {};
      const adminNotes: Record<number, string> = {};

      data.forEach((r) => {
        approvals[r.facility_id] = r.admin_approval;
        payments[r.facility_id] = r.payment_method;
        adminNotes[r.facility_id] = r.admin_message || "";
      });

      setApprovalStatus(approvals);
      setPaymentMethod(payments);
      setNotes(adminNotes);
    } catch (err) {
      console.error(err);
      alert(`Failed to load facility requests: ${err}`);
    }
  };

  useEffect(() => {
    fetchFacilityRequests();
    
    // Auto-refresh every 30 seconds to check for new requests
    const interval = setInterval(fetchFacilityRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateRequest = async (id: number) => {
    try {
      const res = await fetch("http://localhost:3000/facility/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facility_id: id,
          admin_approval: approvalStatus[id],
          payment_method: paymentMethod[id],
          admin_message: notes[id],
        }),
      });

      const data = await res.json();
      if (!res.ok) return alert(data.error || "Error updating request");
      alert("Request updated successfully");
      fetchFacilityRequests();
    } catch (err) {
      console.error(err);
      alert("Error updating request");
    }
  };

  // ---------------- NAVIGATION ----------------
  const handleBack = () => window.history.back();
  const handleHome = () => (window.location.href = "/");
  const handleLogout = () => (window.location.href = "/login");

  // Get status badge color
  const getStatusBadge = (status: boolean | null) => {
    if (status === true) return { bg: '#d4edda', color: '#155724', text: 'Approved' };
    if (status === false) return { bg: '#f8d7da', color: '#721c24', text: 'Rejected' };
    return { bg: '#fff3cd', color: '#856404', text: 'Pending' };
  };

  return (
    <>
      <style>{`
        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(74,144,226,0.5);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(74,144,226,0.8);
        }

        /* Table Row Hover Effect */
        tbody tr:hover {
          background-color: rgba(74,144,226,0.1) !important;
          transition: all 0.3s ease;
        }

        /* Select and Textarea Focus */
        select:focus, textarea:focus {
          outline: none;
          border-color: #4a90e2 !important;
          box-shadow: 0 0 0 3px rgba(74,144,226,0.2);
        }

        /* Animations */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        /* Status select styles */
        .status-select {
          width: 100%;
          padding: 0.5rem;
          border-radius: 20px;
          border: 1px solid transparent;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-select.pending {
          background-color: #fff3cd;
          color: #856404;
          border-color: #ffc107;
        }

        .status-select.approved {
          background-color: #d4edda;
          color: #155724;
          border-color: #28a745;
        }

        .status-select.rejected {
          background-color: #f8d7da;
          color: #721c24;
          border-color: #dc3545;
        }

        .status-select:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
      `}</style>

      <div style={styles.container}>
        {/* Modern Navbar */}
        <div style={styles.navbar}>
          <div style={styles.navbarLeft}>
            <h1 style={styles.navbarTitle}>Facility Requests</h1>
            {newRequestsCount > 0 && (
              <span style={styles.pendingBadge}>{newRequestsCount} Pending</span>
            )}
          </div>
          <div style={styles.navbarRight}>
            <button style={styles.navButton} onClick={handleBack}>Back</button>
            <button style={styles.navButton} onClick={handleHome}>Home</button>
            <button style={styles.navButton} onClick={handleLogout}>Logout</button>
            <div style={styles.notificationWrapper}>
              <button 
                style={styles.notificationButton}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                🔔
                {newRequestsCount > 0 && (
                  <span style={styles.notificationBadge}>{newRequestsCount}</span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={styles.notificationDropdown}>
                  <div style={styles.notificationHeader}>
                    <h3 style={styles.notificationHeaderTitle}>New Facility Requests</h3>
                    <button 
                      style={styles.closeButton}
                      onClick={() => setShowNotifications(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={styles.notificationList}>
                    {requests.filter(req => req.admin_approval === null).length > 0 ? (
                      requests
                        .filter(req => req.admin_approval === null)
                        .map(req => {
                          const isNew = !previousRequests.some(prev => prev.facility_id === req.facility_id);
                          return (
                            <div 
                              key={req.facility_id} 
                              style={{
                                ...styles.notificationItem,
                                ...(isNew ? styles.newNotificationItem : {})
                              }}
                              onClick={() => {
                                const element = document.getElementById(`request-${req.facility_id}`);
                                if (element) {
                                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                  element.style.backgroundColor = 'rgba(74,144,226,0.1)';
                                  setTimeout(() => {
                                    element.style.backgroundColor = '';
                                  }, 2000);
                                }
                                setShowNotifications(false);
                              }}
                            >
                              <div style={styles.notificationItemHeader}>
                                <span style={styles.notificationItemTitle}>
                                  Request #{req.facility_id}
                                </span>
                                {isNew && <span style={styles.newBadge}>NEW</span>}
                              </div>
                              <div style={styles.notificationItemContent}>
                                <div style={styles.notificationItemDetail}>
                                  <strong>From:</strong> {req.hod_email}
                                </div>
                                <div style={styles.notificationItemDetail}>
                                  <strong>Request:</strong> {req.request.length > 40 
                                    ? req.request.substring(0, 40) + '...' 
                                    : req.request}
                                </div>
                                <div style={styles.notificationItemTime}>
                                  {new Date(req.time).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div style={styles.emptyNotifications}>
                        <div style={styles.emptyIcon}>📭</div>
                        <div style={styles.emptyText}>No pending requests</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Statistics Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{requests.length}</div>
              <div style={styles.statLabel}>Total Requests</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#ffc107'}}>
                {requests.filter(r => r.admin_approval === null).length}
              </div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#28a745'}}>
                {requests.filter(r => r.admin_approval === true).length}
              </div>
              <div style={styles.statLabel}>Approved</div>
            </div>
            <div style={styles.statCard}>
              <div style={{...styles.statValue, color: '#dc3545'}}>
                {requests.filter(r => r.admin_approval === false).length}
              </div>
              <div style={styles.statLabel}>Rejected</div>
            </div>
          </div>

          {/* Table Container */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>ID</th>
                  <th style={styles.tableHeaderCell}>HOD Email</th>
                  <th style={styles.tableHeaderCell}>Request</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Payment</th>
                  <th style={styles.tableHeaderCell}>Admin Note</th>
                  <th style={styles.tableHeaderCell}>Time</th>
                  <th style={styles.tableHeaderCell}>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => {
                  const status = getStatusBadge(req.admin_approval);
                  const isPending = req.admin_approval === null;
                  const isNew = !previousRequests.some(prev => prev.facility_id === req.facility_id);
                  
                  // Determine status select class
                  let statusSelectClass = 'status-select';
                  if (approvalStatus[req.facility_id] === true) statusSelectClass += ' approved';
                  else if (approvalStatus[req.facility_id] === false) statusSelectClass += ' rejected';
                  else statusSelectClass += ' pending';
                  
                  return (
                    <tr 
                      key={req.facility_id} 
                      id={`request-${req.facility_id}`}
                      style={{
                        ...styles.tableRow,
                        ...(isPending ? styles.pendingRow : {}),
                        backgroundColor: isPending ? 'rgba(255, 193, 7, 0.05)' : 'transparent'
                      }}
                    >
                      <td style={styles.tableCell}>
                        <div style={styles.idCell}>
                          #{req.facility_id}
                          {isPending && isNew && 
                            <span style={styles.newTag}>NEW</span>
                          }
                        </div>
                      </td>
                      <td style={styles.tableCell}>{req.hod_email}</td>
                      <td style={styles.tableCell}>
                        <div style={styles.requestCell} title={req.request}>
                          {req.request}
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          className={statusSelectClass}
                          value={approvalStatus[req.facility_id] !== null ? String(approvalStatus[req.facility_id]) : ""}
                          onChange={(e) => {
                            const newValue = e.target.value === "true" ? true : e.target.value === "false" ? false : null;
                            setApprovalStatus({
                              ...approvalStatus,
                              [req.facility_id]: newValue
                            });
                          }}
                          style={{
                            ...styles.statusSelect,
                            backgroundColor: status.bg,
                            color: status.color,
                          }}
                        >
                          <option value="" style={{backgroundColor: '#fff3cd', color: '#856404'}}>⏳ Pending</option>
                          <option value="true" style={{backgroundColor: '#d4edda', color: '#155724'}}>✅ Approved</option>
                          <option value="false" style={{backgroundColor: '#f8d7da', color: '#721c24'}}>❌ Rejected</option>
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <select
                          style={styles.select}
                          value={paymentMethod[req.facility_id] !== null ? String(paymentMethod[req.facility_id]) : ""}
                          onChange={(e) =>
                            setPaymentMethod({
                              ...paymentMethod,
                              [req.facility_id]: e.target.value === "true" ? true : e.target.value === "false" ? false : null
                            })
                          }
                        >
                          <option value="">Select Payment</option>
                          <option value="true">💰 Petty Cash</option>
                          <option value="false">📋 NFA</option>
                        </select>
                      </td>
                      <td style={styles.tableCell}>
                        <textarea
                          style={styles.textarea}
                          value={notes[req.facility_id] || ""}
                          onChange={(e) =>
                            setNotes({ ...notes, [req.facility_id]: e.target.value })
                          }
                          placeholder="Add admin note..."
                          rows={2}
                        />
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.timeCell}>
                          {new Date(req.time).toLocaleDateString()}
                          <br />
                          <span style={styles.timeSmall}>
                            {new Date(req.time).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <button 
                          style={styles.saveButton}
                          onClick={() => updateRequest(req.facility_id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#218838';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#28a745';
                          }}
                        >
                          💾 Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: `url(${BG}) center/cover no-repeat fixed`,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  navbar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    borderBottom: '1px solid rgba(255,255,255,0.3)',
  },
  navbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navbarTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: '#333',
    margin: 0,
  },
  pendingBadge: {
    backgroundColor: '#ffc107',
    color: '#333',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  navbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: 'rgba(74,144,226,0.1)',
    color: '#333',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '0.875rem',
    ':hover': {
      backgroundColor: '#4a90e2',
      color: '#fff',
    },
  },
  notificationWrapper: {
    position: 'relative' as const,
  },
  notificationButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '50%',
    backgroundColor: 'rgba(74,144,226,0.1)',
    color: '#333',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1.2rem',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  notificationBadge: {
    position: 'absolute' as const,
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    minWidth: '18px',
    textAlign: 'center' as const,
    animation: 'pulse 2s infinite',
  },
  notificationDropdown: {
    position: 'absolute' as const,
    top: '50px',
    right: 0,
    width: '350px',
    backgroundColor: 'rgba(255,255,255,0.98)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    zIndex: 1000,
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.3)',
    animation: 'slideIn 0.3s ease',
  },
  notificationHeader: {
    padding: '1rem',
    backgroundColor: 'rgba(74,144,226,0.1)',
    borderBottom: '1px solid rgba(74,144,226,0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationHeaderTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: '#333',
  },
  closeButton: {
    border: 'none',
    background: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#666',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    ':hover': {
      backgroundColor: 'rgba(0,0,0,0.05)',
    },
  },
  notificationList: {
    maxHeight: '400px',
    overflowY: 'auto' as const,
  },
  notificationItem: {
    padding: '1rem',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: 'rgba(74,144,226,0.05)',
      transform: 'translateX(5px)',
    },
  },
  newNotificationItem: {
    backgroundColor: 'rgba(74,144,226,0.05)',
    borderLeft: '4px solid #4a90e2',
  },
  notificationItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  notificationItemTitle: {
    fontWeight: 600,
    color: '#333',
    fontSize: '0.9rem',
  },
  newBadge: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 500,
  },
  notificationItemContent: {
    fontSize: '0.875rem',
    color: '#666',
  },
  notificationItemDetail: {
    marginBottom: '0.25rem',
  },
  notificationItemTime: {
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '0.5rem',
  },
  emptyNotifications: {
    padding: '2rem',
    textAlign: 'center' as const,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  emptyText: {
    color: '#666',
    fontSize: '0.875rem',
  },
  mainContent: {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    padding: '1.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
    border: '1px solid rgba(255,255,255,0.3)',
    transition: 'transform 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
    },
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#333',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#666',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  tableContainer: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  tableHeader: {
    backgroundColor: 'rgba(74,144,226,0.1)',
  },
  tableHeaderCell: {
    padding: '1rem',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#333',
    fontSize: '0.875rem',
    borderBottom: '2px solid rgba(74,144,226,0.2)',
  },
  tableRow: {
    transition: 'all 0.2s ease',
  },
  pendingRow: {
    backgroundColor: 'rgba(255, 193, 7, 0.05)',
  },
  tableCell: {
    padding: '1rem',
    borderBottom: '1px solid rgba(0,0,0,0.05)',
    fontSize: '0.875rem',
    color: '#555',
  },
  idCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  newTag: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '0.2rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: 500,
  },
  requestCell: {
    maxWidth: '250px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  statusSelect: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '20px',
    border: '1px solid transparent',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  select: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.875rem',
    width: '100%',
    backgroundColor: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  textarea: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.875rem',
    width: '100%',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  timeCell: {
    fontSize: '0.875rem',
  },
  timeSmall: {
    fontSize: '0.75rem',
    color: '#999',
  },
  saveButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 2px 8px rgba(40,167,69,0.3)',
  },
};