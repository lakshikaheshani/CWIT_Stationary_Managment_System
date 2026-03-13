import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaHome } from "react-icons/fa";
import Logo from "./assets/L.png";
import BG from "./assets/E.jpg";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:3000/auth/login", {
        username,
        password,
      });

      const user = res.data.user;

      // ✅ Save token and user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Save HOD email for Facility Management page later
      localStorage.setItem("hod_email", user.email);

      const roleId = Number(user.role_id);

      if (roleId === 1) navigate("/admin-dashboard");   // Admin dashboard
      else if (roleId === 2) navigate("/hod-dashboard"); // HOD dashboard
      else navigate("/dashboard");                        // General dashboard

    } catch (err: any) {
      setError(err.response?.data?.error || "Server error. Try again later.");
    }
  };

  return (
    <div style={styles.container}>
      <button style={styles.homeBtn} onClick={() => navigate("/")}>
        <FaHome size={16} />
      </button>
      <img src={Logo} alt="Logo" style={styles.logo} />

      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.heading}>Login</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button style={styles.button} type="submit">Log In</button>
      </form>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    position: "relative",
    minHeight: "100vh",
    backgroundImage: `url(${BG})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  homeBtn: {
    position: "absolute",
    top: "20px",
    right: "20px",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(6px)",
    color: "white",
    cursor: "pointer",
  },
  logo: { width: "90px", marginBottom: "20px" },
  card: {
    width: "320px",
    padding: "30px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(12px)",
    display: "flex",
    flexDirection: "column",
  },
  heading: { textAlign: "center", marginBottom: "20px", color: "white" },
  input: { marginBottom: "15px", padding: "10px", borderRadius: "8px", border: "none", outline: "none" },
  button: { padding: "10px", borderRadius: "8px", border: "none", background: "#00c6ff", color: "white", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#ff4d4d", fontSize: "14px", marginBottom: "10px" },
};

export default Login;