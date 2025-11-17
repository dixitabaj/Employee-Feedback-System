import React from 'react';
import '../styles.css';

const Navbar = ({ currentView, setCurrentView, onLogout }) => {
  // Navigation items
  const navItems = [
    { key: "submit", label: "Submit Feedback" },
    { key: "my", label: "My Feedback" },
    { key: "public", label: "Public Feedbacks"}
  ];

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand / Logo */}
        <div className="nav-brand">
          <span className="logo-text">Employee Feedback System</span>
        </div>
        
        {/* Navigation menu */}
        <div className="nav-main">
          <ul className="nav-menu">
            {navItems.map(item => (
              <li key={item.key} className="nav-item">
                <button
                  className={`nav-link ${currentView === item.key ? 'active' : ''}`}
                  onClick={() => setCurrentView(item.key)} // switch view
                >
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout button */}
        <div className="nav-user">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
