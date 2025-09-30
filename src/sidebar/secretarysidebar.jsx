import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faClipboardList,
  faSignOutAlt,
  faPrayingHands,
  faChevronDown,
  faClock,
  faBookOpen,
  faWater,
  faCertificate,
  faBreadSlice,
  faRing,
  faChurch,
  faHandsPraying,
  faUsersCog,
  faChartBar,
  faCalendarCheck,
  faTasks,
  faBars,
  faTimes,
  faFile,
  faCoins,
  faMoneyBillWave
} from "@fortawesome/free-solid-svg-icons";
import "./secretarysidebar.css";

const SecretarySidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    appointment: false,
    sacramental: false
  });

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

  // Enhanced modal detection - Check for multiple modal types
  useEffect(() => {
    const checkForModal = () => {
      // Check for various modal selectors that might be used in your app
      const modalSelectors = [
        '.modal-backdrop-cae',
        '.modal-backdrop-sae',
        '.secretary-document-viewer-overlay',
        '.secretary-marriage-document-viewer-overlay', 
         '.secretary-conf-document-viewer-overlay',
        '.schedule-modal-overlay-ssc',   
        '.sacrament-modal-overlay-sa', 
        '.user-modal-overlay-sum',       // User management modal
        '.report-modal-overlay-sr',      // Report modal
        '.modal-overlay',                // Generic modal overlay
        '.modal',                        // Generic modal
        '[role="dialog"]',               // Accessibility modal role
        '.react-modal-overlay',          // React modal
        '.ant-modal-mask',               // Ant Design modal
        '.MuiModal-root',                // Material-UI modal
        '.modal-backdrop',               // Bootstrap modal
        '[data-modal="true"]'            // Custom data attribute
      ];
      
      let modalFound = false;
      
      // Check each selector
      for (const selector of modalSelectors) {
        const modal = document.querySelector(selector);
        if (modal) {
          modalFound = true;
          break;
        }
      }
      
      setIsModalOpen(modalFound);
    };

    // Check immediately
    checkForModal();

    // Set up a MutationObserver to watch for modal changes
    const observer = new MutationObserver((mutations) => {
      // Check if any mutations involve modal-related changes
      let shouldCheck = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // Check if added or removed nodes contain modal-related classes
          [...mutation.addedNodes, ...mutation.removedNodes].forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node;
              if (element.classList?.contains('modal') || 
                  element.classList?.contains('modal-overlay') ||
                                    element.classList?.contains('modal-backdrop-sae') ||
                  element.classList?.contains('secretary-conf-document-viewer-overlay') ||
                  element.classList?.contains('secretary-marriage-document-viewer-overlay') ||
                  element.classList?.contains('secretary-document-viewer-overlay') ||
                  element.classList?.contains('schedule-modal-overlay-ssc') ||
                  element.classList?.contains('sacrament-modal-overlay-sa') ||
                  element.classList?.contains('user-modal-overlay-sum') ||
                  element.classList?.contains('report-modal-overlay-sr') ||
                  element.querySelector?.('[role="dialog"]') ||
                  element.querySelector?.('.modal') ||
                  element.querySelector?.('.modal-overlay')) {
                shouldCheck = true;
              }
            }
          });
        } else if (mutation.type === 'attributes' && 
                   (mutation.attributeName === 'class' || 
                    mutation.attributeName === 'style' ||
                    mutation.attributeName === 'role')) {
          shouldCheck = true;
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
      attributeFilter: ['class', 'style', 'role', 'data-modal']
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
      setUserID(location.state.userID);
      console.log("User data from location state:", location.state.userData);
    } 
    // If not in location state, try localStorage
    else {
      const storedUser = localStorage.getItem("secretary_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUserData(parsedUser);
        setUserID(parsedUser.userID);
        console.log("User data from localStorage:", parsedUser);
      } else {
        // Check if we're coming from a successful login by checking the current path
        // If we're on a secretary page, create default user data instead of redirecting
        const isSecretaryPage = location.pathname.startsWith('/secretary-');
        if (isSecretaryPage) {
          // Create default secretary user data
          const defaultSecretaryData = {
            username: "secretary",
            role: "secretary",
            userID: "secretary_001"
          };
          setUserData(defaultSecretaryData);
          setUserID("secretary_001");
          // Store in localStorage for future use
          localStorage.setItem("secretary_user", JSON.stringify(defaultSecretaryData));
          console.log("Created default secretary user data");
        } else {
          // No user data found and not on secretary page, redirect to secretary login
          console.log("No user data found, redirecting to secretary login");
          navigate("/secretary-login");
        }
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

  // Close sidebar when modal opens
  useEffect(() => {
    if (isModalOpen && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  }, [isModalOpen, isSidebarOpen]);

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    // Clear user data
    localStorage.removeItem("secretary_user");
    closeSidebar();
    navigate("/secretary-login");
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
      <div className={`secretary-sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Mobile Header with Close Button */}
        <div className="secretary-sidebar-mobile-header">
          <h2>SECRETARY</h2>
          <button className="sidebar-close-btn" onClick={closeSidebar}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="secretary-sidebar-header">
          <h2>SECRETARY</h2>
        </div>

        <nav className="secretary-sidebar-menu">
          <Link 
            to="/secretary-dashboard" 
            state={createLocationState()}
            className={`secretary-menu-item ${location.pathname === "/secretary-dashboard" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faClipboardList} />
            <span>Dashboard</span>
          </Link>

          {/* Appointment & Schedule Dropdown */}
          <div className="secretary-menu-item" onClick={() => toggleMenu("appointment")}>
            <FontAwesomeIcon icon={faCalendarAlt} />
            <span>Appointment & Schedule</span>
            <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${openMenus.appointment ? "rotate" : ""}`} />
          </div>
          {openMenus.appointment && (
            <div className="secretary-submenu">
              <Link 
                to="/secretary-appointment" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-appointment" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faClock} /> Appointment
              </Link>
              <Link 
                to="/secretary-schedule" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-schedule" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faBookOpen} /> Schedule
              </Link>
              <Link 
                to="/secretary-request-certificate" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-request-certificate" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faFile} /> Request Certificates
              </Link>
              <Link 
                to="/secretary-donation" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-donation" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faCoins} /> Donation
              </Link>
            </div>
          )}

          {/* Sacramental Preparation Dropdown */}
          <div className="secretary-menu-item" onClick={() => toggleMenu("sacramental")}>
            <FontAwesomeIcon icon={faPrayingHands} />
            <span>Sacramental Preparation</span>
            <FontAwesomeIcon icon={faChevronDown} className={`dropdown-icon ${openMenus.sacramental ? "rotate" : ""}`} />
          </div>
          {openMenus.sacramental && (
            <div className="secretary-submenu">
              <Link 
                to="/secretary-baptism" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-baptism" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faWater} /> Baptism
              </Link>
              <Link 
                to="/secretary-marriage" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-marriage" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faRing} /> Marriage
              </Link>
              <Link 
                to="/secretary-funeral-mass" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-funeral-mass" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faChurch} /> Funeral Mass
              </Link>
              <Link 
                to="/secretary-blessing" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-blessing" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faHandsPraying} /> Blessing
              </Link>
              <Link 
                to="/secretary-confirmation" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-confirmation" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faCertificate} /> Confirmation
              </Link>
              <Link 
                to="/secretary-communion" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-communion" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faBreadSlice} /> Communion
              </Link>
              <Link 
                to="/secretary-anointing-of-the-sick" 
                state={createLocationState()}
                className={`secretary-submenu-item ${location.pathname === "/secretary-anointing-of-the-sick" ? "active" : ""}`}
                onClick={handleMenuItemClick}
              >
                <FontAwesomeIcon icon={faHandsPraying} /> Anointing of the Sick
              </Link>
            </div>
          )}

          {/* Event and Activities */}
          <Link 
            to="/secretary-activities-event" 
            state={createLocationState()}
            className={`secretary-menu-item ${location.pathname === "/secretary-activities-event" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faCalendarCheck} />
            <span>Event and Activities</span>
          </Link>

          {/* Expenses */}
          <Link 
            to="/secretary-expenses" 
            state={createLocationState()}
            className={`secretary-menu-item ${location.pathname === "/secretary-expenses" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faMoneyBillWave} />
            <span>Expenses</span>
          </Link>

          {/* Report */}
          <Link 
            to="/secretary-report" 
            state={createLocationState()}
            className={`secretary-menu-item ${location.pathname === "/secretary-report" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faChartBar} />
            <span>Report</span>
          </Link>

          {/* User Management */}
          <Link 
            to="/secretary-user-management" 
            state={createLocationState()}
            className={`secretary-menu-item ${location.pathname === "/secretary-user-management" ? "active" : ""}`}
            onClick={handleMenuItemClick}
          >
            <FontAwesomeIcon icon={faUsersCog} />
            <span>User Management</span>
          </Link>

          {/* Logout */}
          <div className="secretary-menu-item-logout" onClick={handleLogout}>
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span>Logout</span>
          </div>
        </nav>
      </div>
    </>
  );
};

export default SecretarySidebar;