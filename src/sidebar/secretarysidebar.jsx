import React, { useState } from "react";
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
  faTasks
} from "@fortawesome/free-solid-svg-icons";
import "./secretarysidebar.css";

const SecretarySidebar = () => {
  const [openMenus, setOpenMenus] = useState({
    appointment: false,
    sacramental: false
  });

  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="secretary-sidebar">
      <div className="secretary-sidebar-header">
        <h2>SECRETARY</h2>
      </div>

      <nav className="secretary-sidebar-menu">
        <Link to="/secretary-dashboard" className="secretary-menu-item">
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
            <Link to="/secretary-appointment" className={`secretary-submenu-item ${location.pathname === "/secretary-appointment" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faClock} /> Appointment
            </Link>
            <Link to="/secretary-schedule" className={`secretary-submenu-item ${location.pathname === "/secretary-schedule" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faBookOpen} /> Schedule
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
            <Link to="/secretary-baptism" className={`secretary-submenu-item ${location.pathname === "/secretary-baptism" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faWater} /> Baptism
            </Link>
            <Link to="/secretary-marriage" className={`secretary-submenu-item ${location.pathname === "/secretary-marriage" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faRing} /> Marriage
            </Link>
            <Link to="/secretary-funeral-mass" className={`secretary-submenu-item ${location.pathname === "/secretary-funeral-mass" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faChurch} /> Funeral Mass
            </Link>
            <Link to="/secretary-blessing" className={`secretary-submenu-item ${location.pathname === "/secretary-blessing" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faHandsPraying} /> Blessing
            </Link>
            <Link to="/secretary-confirmation" className={`secretary-submenu-item ${location.pathname === "/secretary-confirmation" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faCertificate} /> Confirmation
            </Link>
            <Link to="/secretary-communion" className={`secretary-submenu-item ${location.pathname === "/secretary-communion" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faBreadSlice} /> Communion
            </Link>
            <Link to="/secretary-anointing-of-the-sick" className={`secretary-submenu-item ${location.pathname === "/secretary-anointing-of-the-sick" ? "active" : ""}`}>
              <FontAwesomeIcon icon={faHandsPraying} /> Anointing of the Sick
            </Link>
          </div>
        )}

        {/* Event and Activities */}
        <Link to="/secretary-activities-event" className={`secretary-menu-item ${location.pathname === "/secretary-activities-event" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faCalendarCheck} />
          <span>Event and Activities</span>
        </Link>

        {/* Report */}
        <Link to="/secretary-report" className={`secretary-menu-item ${location.pathname === "/secretary-report" ? "active" : ""}`}>
          <FontAwesomeIcon icon={faChartBar} />
          <span>Report</span>
        </Link>

        {/* User Management */}
        <Link to="/secretary-user-management" className={`secretary-menu-item ${location.pathname === "/secretary-user-management" ? "active" : ""}`}>
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
  );
};

export default SecretarySidebar;
