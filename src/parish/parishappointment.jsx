import React, { useState, useEffect } from "react";
import "./parishappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const ParishAppointment = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Define all possible sacrament types
  const allSacramentTypes = [
    "All",
    "Baptism",
    "Marriage",
    "Funeral Mass",
    "Confirmation",
    "Communion",
    "Blessing",
    "Anointing of the Sick and Viaticum"
  ];

  // Fetch appointments data from the PHP endpoint
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Try using a relative path first
        const response = await fetch("/backend/fetch_all_approved_appointments.php");
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setAppointments(data.appointments);
        } else {
          throw new Error(data.message || "Failed to fetch appointments");
        }
      } catch (err) {
        setError(err.message);
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // View appointment details
  const viewAppointmentDetails = (appointment) => {
    switch(appointment.sacramentType) {
      case "Baptism":
        navigate("/baptism-view", { 
          state: { 
            baptismID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Marriage":
        navigate("/marriage-view", { 
          state: { 
            marriageID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Funeral Mass":
        navigate("/funeral-mass-view", { 
          state: { 
            funeralID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Blessing":
        navigate("/blessing-view", { 
          state: { 
            blessingID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Communion":
        navigate("/communion-view", { 
          state: { 
            communionID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Confirmation":
        navigate("/confirmation-view", { 
          state: { 
            confirmationID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/anointing-of-the-sick-view", { 
          state: { 
            anointingID: appointment.id,
            status: appointment.status
          } 
        });
        break;
      default:
        console.log(`Unknown sacrament: ${appointment.sacramentType}`);
    }
  };

  // Filter appointments based on the active filter and search term
  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = activeFilter === "All" || appointment.sacramentType === activeFilter;
    const matchesSearch = searchTerm === "" || 
      (appointment.firstName && appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.lastName && appointment.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.sacramentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.blessingType && appointment.blessingType.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="appointment-container-pa">
      <h1 className="title-pa">PARISH APPOINTMENT</h1>
      
      <div className="appointment-actions-pa">
        <div className="search-bar-pa">
          <input 
            type="text" 
            placeholder="Search appointments" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-pa" />
        </div>
        
        <div className="filter-actions-container-pa">
          <select 
            className="filter-select-pa"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            {allSacramentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container-pa">
        {loading ? (
          <div className="loading-message">Loading appointments...</div>
        ) : error ? (
          <div className="error-message">
            <p>Error: {error}</p>
            <p>Please check the server logs for more information.</p>
          </div>
        ) : (
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.firstName}</td>
                    <td>{appointment.lastName}</td>
                    <td>{appointment.sacramentType}</td>
                    {activeFilter === "Blessing" && <td>{appointment.blessingType || "N/A"}</td>}
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
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
                ))
              ) : (
                <tr>
                  <td colSpan={activeFilter === "Blessing" ? "8" : "7"} className="no-appointments">
                    No appointments found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ParishAppointment;