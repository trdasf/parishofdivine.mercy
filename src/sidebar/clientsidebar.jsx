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
import "./clientsidebar.css";

const ClientSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [clientID, setClientID] = useState(null);
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
      // Check for different modal classes that might be present
      const modal = document.querySelector('.modal-backdrop-cae') || 
                   document.querySelector('.sacrament-modal-overlay-ca') ||
                   document.querySelector('.modal-overlay');
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
    console.log("Current location state:", location.state);
    
    // First try to get from location state (this is how the login component passes data)
    if (location.state && location.state.user) {
      setUserData(location.state.user);
      setClientID(location.state.clientID || location.state.user.clientID);
      console.log("User data from location state:", location.state.user);
    }
    // Also check for userData property (alternative location state structure)
    else if (location.state && location.state.userData) {
      setUserData(location.state.userData);
      setClientID(location.state.clientID || location.state.userData.clientID);
      console.log("User data from location userData:", location.state.userData);
    }
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);
          // Handle different possible property names for clientID
          setClientID(parsedUser.clientID || parsedUser.id || parsedUser.client_id);
          console.log("User data from localStorage:", parsedUser);
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // If parsing fails, clear invalid data and redirect to login
          localStorage.removeItem("user");
          navigate("/client-login");
        }
      } else {
        // No user data found, redirect to login
        console.log("No user data found, redirecting to login");
        navigate("/client-login");
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
    // Clear user data from localStorage
    localStorage.removeItem("user");
    setUserData(null);
    setClientID(null);
    closeSidebar();
    navigate("/client-login");
  };

  // Helper function to create location state with user data
  const createLocationState = () => {
    return {
      userData: userData,
      clientID: clientID,
      user: userData // Include both formats for compatibility
    };
  };

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    // Updated to match CSS breakpoint of 1150px
    if (window.innerWidth <= 1150) {
      closeSidebar();
    }
  };

  // Show loading or return early if no user data
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
      <div className={`client-sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Mobile Header with Close Button */}
        <div className="client-sidebar-mobile-header">
          <h2>CLIENT</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="client-sidebar-header">
          <h2>CLIENT</h2>
        </div>

        <nav className="client-sidebar-menu">
          <Link 
            to="/client-dashboard" 
            state={createLocationState()}
            className={`client-menu-item ${location.pathname === "/client-dashboard" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/client-appointment" 
            state={createLocationState()}
            className={`client-menu-item ${location.pathname === "/client-appointment" ? "active" : ""}`}
            onClick={handleMenuItemClick}
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
    </>
  );
};

export default ClientSidebar;