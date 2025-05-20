import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faSignOutAlt,
  faUser,
  faCalendarAlt
} from "@fortawesome/free-solid-svg-icons";
import "./ministrysidebar.css";

const CommunitySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState(null);

  // On component mount, get user data from location state or localStorage
  useEffect(() => {
    // First try to get from location state
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setUserID(location.state.userID);
      console.log("User data from location state:", location.state.userData);
    } 
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("ministry_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserID(parsedUser.userID);
        console.log("User data from localStorage:", parsedUser);
      } else {
        // No user data found, redirect to login
        console.log("No user data found, redirecting to login");
        navigate("/");
      }
    }
  }, [location, navigate]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("ministry_user");
    navigate("/");
  };

  // Helper function to create location state with user data
  const createLocationState = () => {
    return {
      userData: userData,
      userID: userID
    };
  };

  if (!userData) {
    return null; // Don't render the sidebar until user data is loaded
  }

  return (
    <div className="community-sidebar">
      <div className="community-sidebar-header">
        <h2>MINISTRY</h2>
      </div>

      <nav className="community-sidebar-menu">
        <Link 
          to="/ministry-dashboard" 
          state={createLocationState()}
          className={`community-menu-item ${location.pathname === "/ministry-dashboard" ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={faClipboardList} />
          <span>Dashboard</span>
        </Link>

        <Link 
          to="/ministry-profile" 
          state={createLocationState()}
          className={`community-menu-item ${location.pathname === "/ministry-profile" ? "active" : ""}`}
        >
          <FontAwesomeIcon icon={faUser} />
          <span>Ministry Profile</span>
        </Link>

        <Link 
          to="/ministry-activities-event" 
          state={createLocationState()}
          className={`community-menu-item ${location.pathname === "/ministry-activities-event" ? "active" : ""}`}
        >
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