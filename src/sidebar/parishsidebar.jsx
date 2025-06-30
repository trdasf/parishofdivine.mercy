import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClipboardList,
  faSignOutAlt,
  faCalendarWeek,
  faBars,
  faTimes
} from "@fortawesome/free-solid-svg-icons";
import "./parishsidebar.css";

const ParishSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
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
      // Check for various modal backdrop classes used across different components
      const modalSelectors = [
        '.modal-backdrop-cae',    // Community/Ministry modals
        '.modal-backdrop-pae',    // Parish Activities Event modals
        '.modal-backdrop',        // Generic modal backdrop
        '.modal-overlay',         // Alternative modal overlay class
        '[class*="modal-backdrop"]', // Any class containing "modal-backdrop"
        '[class*="modal-overlay"]'   // Any class containing "modal-overlay"
      ];
      
      const modals = document.querySelectorAll(modalSelectors.join(', '));
      setIsModalOpen(modals.length > 0);
    };

    // Check immediately
    checkForModal();

    // Set up a MutationObserver to watch for modal changes
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations involve modal-related elements
      let shouldCheck = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check added nodes
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.className && typeof node.className === 'string' && 
                  (node.className.includes('modal') || node.className.includes('backdrop'))) {
                shouldCheck = true;
              }
            }
          });
          // Check removed nodes
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.className && typeof node.className === 'string' && 
                  (node.className.includes('modal') || node.className.includes('backdrop'))) {
                shouldCheck = true;
              }
            }
          });
        }
      });
      
      if (shouldCheck) {
        checkForModal();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    // Also listen for route changes to recheck modals
    const handleRouteChange = () => {
      setTimeout(checkForModal, 100); // Small delay to ensure DOM is updated
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

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
    // Clear any authentication-related data (if applicable)
    // localStorage.removeItem("parish_user"); // Uncomment if using localStorage for authentication
    closeSidebar();
    navigate("/"); // Navigate to homepage
  };

  // Handle menu item click - close sidebar on mobile
  const handleMenuItemClick = () => {
    // Updated to match CSS breakpoint of 1150px
    if (window.innerWidth <= 1150) {
      closeSidebar();
    }
  };

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
      <div className={`parish-sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Mobile Header with Close Button */}
        <div className="parish-sidebar-mobile-header">
          <h2>PARISH</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="parish-sidebar-header">
          <h2>PARISH</h2>
        </div>

        <nav className="parish-sidebar-menu">
          <Link 
            to="/parish-dashboard" 
            className={`parish-menu-item ${location.pathname === "/parish-dashboard" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Dashboard</span>
          </Link>

          <Link 
            to="/parish-appointment" 
            className={`parish-menu-item ${location.pathname === "/parish-appointment" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Appointment</span>
          </Link>

          <Link 
            to="/parish-activities-event" 
            className={`parish-menu-item ${location.pathname === "/parish-activities-event" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faCalendarWeek} />
            <span>Activities Event</span>
          </Link>

          <div className="parish-menu-item-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default ParishSidebar;