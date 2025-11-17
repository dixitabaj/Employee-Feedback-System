import { useState } from "react";

// Frappe API credentials
const API_BASE = import.meta.env.VITE_API_BASE;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_SECRET = import.meta.env.VITE_API_SECRET;

const Login = ({ onLogin }) => {
  // Local state for form inputs and status
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // clear previous errors
    setLoading(true);

    try {
      // Login API call
      const res = await fetch(`${API_BASE}/api/method/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usr: username, pwd: password }),
      });
      
      if (!res.ok) throw new Error("Invalid username or password");

      // Fetch corresponding Employee record
      const empRes = await fetch(
        `${API_BASE}/api/resource/Employee?filters=[["user","=","${username}"]]`,
        {
          headers: {
            Authorization: `token ${API_KEY}:${API_SECRET}`,
            "Content-Type": "application/json",
          },
        }
      );

      const empData = await empRes.json();
      if (!empData.data || empData.data.length === 0) {
        throw new Error("Employee record not found");
      }

      // Pass employee data to parent
      const employee = empData.data[0];
      onLogin(employee);
    } catch (err) {
      setError(err.message); // show error message
    } finally {
      setLoading(false); // stop loading spinner
    }
  };

  // Render login form
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <div className="input-fields">
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};

export default Login;
