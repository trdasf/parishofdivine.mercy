// ClientSidebar.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faUser,
  faCalendarAlt,
  faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import "./clientsidebar.css";

const ClientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/"); // Redirect to login or home page
  };

  return (
    <div className="client-sidebar">
      <div className="client-sidebar-header">
        <h2>CLIENT</h2>
      </div>

      <nav className="client-sidebar-menu">
        <Link
          to="/client-dashboard"
          className={`client-menu-item ${
            location.pathname === "/client-dashboard" ? "active" : ""
          }`}
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/client-profile"
          className={`client-menu-item ${
            location.pathname === "/client-profile" ? "active" : ""
          }`}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Profile</span>
        </Link>

        <Link
          to="/client-appointment"
          className={`client-menu-item ${
            location.pathname === "/client-appointment" ? "active" : ""
          }`}
        >
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Appointment</span>
        </Link>

        <div className="client-menu-item-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
};

export default ClientSidebar;
