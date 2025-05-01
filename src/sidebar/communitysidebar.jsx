import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faSignOutAlt,
  faUser,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import "./communitysidebar.css";

const CommunitySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="community-sidebar">
      <div className="community-sidebar-header">
        <h2>COMMUNITY</h2>
      </div>

      <nav className="community-sidebar-menu">
        <Link to="/community-dashboard" className={`community-menu-item ${location.pathname === "/community-dashboard" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Dashboard</span>
        </Link>

        <Link to="/community-profile" className={`community-menu-item ${location.pathname === "/community-profile" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faUser} />
          <span>Community Profile</span>
        </Link>

        <Link to="/community-activities-event" className={`community-menu-item ${location.pathname === "/community-activities-event" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>Events and Activities</span>
        </Link>

        <div className="community-menu-item-logout" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
};

export default CommunitySidebar;