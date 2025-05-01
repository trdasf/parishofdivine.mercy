import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./parishappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ParishAppointment = () => {
  const navigate = useNavigate();
  const [selectedAppointments, setSelectedAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Enhanced sample appointment data with blessing types
  const sampleAppointments = [
    {
      id: 101,
      firstName: "Kimi",
      lastName: "Rot",
      sacramentType: "Baptism",
      date: "03/02/2025",
      time: "9:00 AM",
      status: "Pending",
      createdAt: "02/28/2025"
    },
    {
      id: 102,
      firstName: "Maria",
      lastName: "Santos",
      sacramentType: "Marriage",
      date: "03/15/2025",
      time: "2:00 PM",
      status: "Approved",
      createdAt: "03/01/2025"
    },
    {
      id: 103,
      firstName: "Juan",
      lastName: "Cruz",
      sacramentType: "Confirmation",
      date: "03/20/2025",
      time: "10:30 AM",
      status: "Pending",
      createdAt: "03/05/2025"
    },
    {
      id: 104,
      firstName: "Pedro",
      lastName: "Reyes",
      sacramentType: "Blessing",
      blessingType: "House Blessing",
      date: "03/25/2025",
      time: "4:00 PM",
      status: "Approved",
      createdAt: "03/10/2025"
    },
    {
      id: 105,
      firstName: "Elena",
      lastName: "Gomez",
      sacramentType: "Blessing",
      blessingType: "Car Blessing",
      date: "03/28/2025",
      time: "11:00 AM",
      status: "Pending",
      createdAt: "03/15/2025"
    },
    {
      id: 106,
      firstName: "Miguel",
      lastName: "Bautista",
      sacramentType: "Blessing",
      blessingType: "Business Blessing",
      date: "04/05/2025",
      time: "3:30 PM",
      status: "Pending",
      createdAt: "03/20/2025"
    },
    {
      id: 107,
      firstName: "Antonio",
      lastName: "Garcia",
      sacramentType: "Communion",
      date: "04/10/2025",
      time: "10:00 AM",
      status: "Approved",
      createdAt: "03/22/2025"
    },
    {
      id: 108,
      firstName: "Lucia",
      lastName: "Mendoza",
      sacramentType: "Funeral Mass",
      date: "03/18/2025",
      time: "2:00 PM",
      status: "Completed",
      createdAt: "03/17/2025"
    }
  ];

  // Get all unique sacrament types
  const sacramentTypes = ["All", "Baptism", "Marriage", "Funeral Mass", "Confirmation", "Communion", "Blessing"];

  // View appointment details
  const viewAppointmentDetails = (appointmentData) => {
    // For Blessing type, extract the specific blessing type and format for BlessingView
    if (appointmentData.sacramentType === "Blessing") {
      // Parse the blessing type (e.g., "House Blessing" -> "house")
      let blessingType = appointmentData.blessingType?.split(" ")[0].toLowerCase();
      
      // Create the blessing data object with the type included
      const blessingData = {
        ...appointmentData,
        blessingType: blessingType,       // Set to "house", "car", or "business"
        preferredDate: appointmentData.date,
        preferredTime: appointmentData.time,
        // Add default values for fields that BlessingView expects
        priestName: "Fr. John Doe",
        location: "Parish of the Divine Mercy",
        purpose: appointmentData.blessingType,
        status: appointmentData.status
      };
      
      // Navigate to blessing view with the enhanced data
      navigate("/blessing-view", { state: { blessingData } });
    } else {
      // Handle other sacrament types as before
      switch(appointmentData.sacramentType) {
        case "Baptism":
          navigate("/baptism-view", { state: { appointmentData } });
          break;
        case "Marriage":
          navigate("/marriage-view", { state: { appointmentData } });
          break;
        case "Funeral Mass":
          navigate("/funeral-mass-view", { state: { appointmentData } });
          break;
        case "Confirmation":
          navigate("/confirmation-view", { state: { appointmentData } });
          break;
        case "Communion":
          navigate("/communion-view", { state: { appointmentData } });
          break;
        default:
          console.log(`Unknown sacrament: ${appointmentData.sacramentType}`);
      }
    }
  };

  // Handle selection of appointments
  const handleSelectAppointment = (id) => {
    if (selectedAppointments.includes(id)) {
      setSelectedAppointments(selectedAppointments.filter(appId => appId !== id));
    } else {
      setSelectedAppointments([...selectedAppointments, id]);
    }
  };

  // Filter appointments based on the active filter and search term
  const filteredAppointments = sampleAppointments.filter(appointment => {
    const matchesFilter = activeFilter === "All" || appointment.sacramentType === activeFilter;
    const matchesSearch = searchTerm === "" || 
      appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.sacramentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.blessingType && appointment.blessingType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="appointment-container-pa">
      <h1 className="title-pa">PARISH APPOINTMENT</h1>
        <div className="search-bar-pa">
          <input 
            type="text" 
            placeholder="Search appointments" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-pa" />
        </div>
      <div className="appointment-actions-pa">
      <div className="sacrament-filter-buttons">
        {sacramentTypes.map((type) => (
          <button
            key={type}
            className={`sacrament-filter-btn ${activeFilter === type ? 'active' : ''}`}
            onClick={() => setActiveFilter(type)}
          >
            {type}
          </button>
        ))}
      </div>
      <div className="filter-actions-container-pa">
          <select className="filter-select-pa">
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        </div>

      <div className="table-container-pa">
        <table className="appointment-table-pa">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Sacrament Type</th>
              {activeFilter === "Blessing" && <th>Blessing Type</th>}
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.id}</td>
                <td>{appointment.firstName}</td>
                <td>{appointment.lastName}</td>
                <td>{appointment.sacramentType}</td>
                {activeFilter === "Blessing" && <td>{appointment.blessingType || "N/A"}</td>}
                <td>{appointment.date}</td>
                <td>{appointment.time}</td>
                <td className={`status-${appointment.status.toLowerCase()}`}>
                  {appointment.status}
                </td>
                <td>{appointment.createdAt}</td>
                <td className="actions-cell-pa">
                  <button
                    className="view-btn-pa"
                    onClick={() => viewAppointmentDetails(appointment)}
                    title="View Details"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filteredAppointments.length === 0 && (
              <tr>
                <td colSpan={activeFilter === "Blessing" ? "10" : "9"} className="no-appointments">
                  No appointments found for the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParishAppointment;