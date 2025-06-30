import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClipboardList,
  faSignOutAlt,
  faUser,
  faCalendarAlt,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import "./ministrysidebar.css";

const CommunitySidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toggle sidebar for mobile
  const toggleSidebar = (e) => {
    e.stopPropagation(); // Prevent event bubbling
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Check for modal presence in the DOM
  useEffect(() => {
    const checkForModal = () => {
      const modal = document.querySelector('.modal-backdrop-cae');
      setIsModalOpen(!!modal);
    };

    // Check immediately
    checkForModal();

    // Set up a MutationObserver to watch for modal changes
    const observer = new MutationObserver(checkForModal);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // On component mount, get user data from location state or localStorage
  useEffect(() => {
    // First try to get from location state
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setUserID(location.state.userID || location.state.userData.userID);
      console.log("User data from location state:", location.state.userData);
    } 
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("ministry_user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          // Handle different possible property names for userID
          setUserID(parsedUser.userID || parsedUser.id || parsedUser.user_id);
          console.log("User data from localStorage:", parsedUser);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // If parsing fails, clear invalid data and redirect to login
          localStorage.removeItem("ministry_user");
          navigate("/ministry-login");
        }
      } else {
        // No user data found, redirect to login
        console.log("No user data found, redirecting to login");
        navigate("/ministry-login");
      }
    }
  }, [location, navigate]);

  // Close sidebar when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      // Updated to match CSS breakpoint of 1150px
      if (window.innerWidth > 1150 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isSidebarOpen]);

  // Add body scroll lock when sidebar is open
  useEffect(() => {
    if (isSidebarOpen && window.innerWidth <= 1150) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [isSidebarOpen]);

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("ministry_user");
    closeSidebar();
    navigate("/ministry-login");
  };

  // Helper function to create location state with user data
  const createLocationState = () => {
    return {
      userData: userData,
      userID: userID
    };
  };

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    // Updated to match CSS breakpoint of 1150px
    if (window.innerWidth <= 1150) {
      closeSidebar();
    }
  };

  if (!userData) {
    return null; // Don't render the sidebar until user data is loaded
  }

  return (
    <>
      {/* Mobile Hamburger Button - Only show when sidebar is closed AND no modal is open */}
      {!isSidebarOpen && !isModalOpen && (
        <button 
          className="sidebar-toggle-btn" 
          onClick={toggleSidebar}
          aria-label="Open menu"
        >
          <FontAwesomeIcon icon={faBars} />
        </button>
      )}

      {/* Sidebar */}
      <div className={`community-sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Mobile Header with Close Button */}
        <div className="community-sidebar-mobile-header">
          <h2>MINISTRY</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="community-sidebar-header">
          <h2>MINISTRY</h2>
        </div>

        <nav className="community-sidebar-menu">
          <Link 
            to="/ministry-dashboard" 
            state={createLocationState()}
            className={`community-menu-item ${location.pathname === "/ministry-dashboard" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/ministry-profile" 
            state={createLocationState()}
            className={`community-menu-item ${location.pathname === "/ministry-profile" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Ministry Profile</span>
          </Link>

          <Link 
            to="/ministry-activities-event" 
            state={createLocationState()}
            className={`community-menu-item ${location.pathname === "/ministry-activities-event" ? "active" : ""}`}
            onClick={handleMenuItemClick}
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
    </>
  );
};

export default CommunitySidebar;