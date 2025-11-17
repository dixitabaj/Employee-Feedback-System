import { useState } from "react";
import EmployeeForm from "./components/EmployeeForm";
import MyFeedback from "./components/MyFeedback";
import PublicFeedback from "./components/PublicFeedback";
import Login from "./components/Login";
import Navbar from "./components/Navbar"; // Navbar component
import "./styles.css";

function App() {
  // Current view/tab: submit / my / public
  const [currentView, setCurrentView] = useState("submit");

  // Logged-in user info
  const [user, setUser] = useState(null);

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    setCurrentView("submit");
    localStorage.removeItem("authToken"); // clear token
  };

  // Login handler, receives employee object
  const handleLogin = (employee) => {
    setUser(employee); // must include employee_id
  };

  // Decide which component to render based on currentView
  const renderContent = () => {
    switch (currentView) {
      case "my":
        return <MyFeedback user={user} />;
      case "public":
        return <PublicFeedback />;
      case "submit":
      default:
        return <EmployeeForm user={user} />;
    }
  };

  // Show login if no user
  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div>
      {/* Navbar with current view and logout */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user?.employee_name || user?.full_name || user?.username}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div style={{ padding: "2rem" }}>{renderContent()}</div>
    </div>
  );
}

export default App;
