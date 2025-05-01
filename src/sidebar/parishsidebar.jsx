import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClipboardList,
  faSignOutAlt,
  faCalendarWeek
} from "@fortawesome/free-solid-svg-icons";
import "./parishsidebar.css";

const ParishSidebar = () => {
  const location = useLocation(); // Get the current URL path
  const navigate = useNavigate(); // Get the navigation function

  // Logout Function
  const handleLogout = () => {
    // Clear any authentication-related data (if applicable)
    // localStorage.removeItem("user"); // Uncomment if using localStorage for authentication
    navigate("/"); // Navigate to homepage
  };

  return (
    <div className="parish-sidebar">
      <div className="parish-sidebar-header">
        <h2>PARISH</h2>
      </div>

      <nav className="parish-sidebar-menu">
        <Link to="/parish-dashboard" className={`parish-menu-item ${location.pathname === "/parish-dashboard" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Dashboard</span>
        </Link>

        <Link to="/parish-appointment" className={`parish-menu-item ${location.pathname === "/parish-appointment" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Appointment</span>
        </Link>

        <Link to="/parish-activities-event" className={`parish-menu-item ${location.pathname === "/parish-activities-event" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faCalendarWeek} />
          <span>Activities Event</span>
        </Link>

        <div className="parish-menu-item-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
};

export default ParishSidebar;