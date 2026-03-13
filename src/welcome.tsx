import { useNavigate } from "react-router-dom";
import Logo from "./assets/L.png";
import Background from "./assets/hod1.jpg";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        fontFamily: "Segoe UI, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.35)",
          zIndex: 0,
        }}
      ></div>

      {/* Logo at top center */}
      <img
        src={Logo}
        alt="CWIT Logo"
        style={{
          position: "absolute",
          top: "40px",
          width: "120px",
          zIndex: 2,
        }}
      />

      {/* Glass Card */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: "700px",
          width: "80%",
          padding: "50px",
          textAlign: "center",
          background: "rgba(255, 255, 255, 0.15)", // more transparent
          borderRadius: "25px",
          boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff",
          animation: "fadeIn 1s ease-in-out",
          
        }}
      >
        <h1 style={{ fontSize: "48px", fontWeight: 700, marginBottom: "20px", letterSpacing: "1px" }}>
          WELCOME!
        </h1>
        <p style={{ fontSize: "20px", fontStyle: "italic", lineHeight: 1.6, marginBottom: "35px" }}>
          Manage your stationery requests <br />
          and stock with ease.
        </p>
        <button
          onClick={() => navigate("/login")}
          style={{
            padding: "15px 50px",
            fontSize: "18px",
            border: "none",
            borderRadius: "50px",
            background: "linear-gradient(135deg, #3b82f6, #1e3a8a)",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            ((e.target as HTMLButtonElement).style.background =
              "linear-gradient(135deg, #1e3a8a, #3b82f6)")
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLButtonElement).style.background =
              "linear-gradient(135deg, #3b82f6, #1e3a8a)")
          }
        >
          Get Started →
        </button>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          div[style*="maxWidth: 700px"] {
            width: 90% !important;
            padding: 35px !important;
          }
          div[style*="fontSize: 48px"] {
            font-size: 36px !important;
          }
          div[style*="fontSize: 20px"] {
            font-size: 16px !important;
          }
          img[alt="CWIT Logo"] {
            width: 100px !important;
            top: 30px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Welcome;