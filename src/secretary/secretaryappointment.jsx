import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const SecretaryAppointment = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://parishofdivinemercy.com/backend/fetch_all_appointments.php');
      const data = await response.json();
      
      if (data.success) {
        setAppointments(data.appointments || []);
      } else {
        console.error("Error fetching appointments:", data.message);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleSacramentSelection = (sacrament) => {
    setShowModal(false);
    
    // Navigate based on the selected sacrament
    switch(sacrament) {
      case "Baptism":
        navigate("/baptism");
        break;
      case "Marriage":
        navigate("/marriage");
        break;
      case "Funeral Mass":
        navigate("/funeral-mass");
        break;
      case "Blessing":
        navigate("/blessing");
        break;
      case "Communion":
        navigate("/communion");
        break;
      case "Confirmation":
        navigate("/confirmation");
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/anointing-of-the-sick");
        break;
      default:
        console.log(`Unknown sacrament: ${sacrament}`);
    }
  };

  // View appointment details
  const viewAppointmentDetails = (appointmentData) => {
    // Navigate to appropriate form with appointment data
    switch(appointmentData.sacramentType) {
      case "Baptism":
        navigate("/secretary-baptism-view", { 
          state: { 
            baptismID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Marriage":
        navigate("/secretary-marriage-view", { 
          state: { 
            marriageID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Funeral Mass":
        navigate("/secretary-funeral-mass-view", { 
          state: { 
            funeralID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Blessing":
        navigate("/secretary-blessing-view", { 
          state: { 
            blessingID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Communion":
        navigate("/secretary-communion-view", { 
          state: { 
            communionID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Confirmation":
        navigate("/secretary-confirmation-view", { 
          state: { 
            confirmationID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/secretary-anointing-of-the-sick-view", { 
          state: { 
            anointingID: appointmentData.id,
            status: appointmentData.status
          } 
        });
        break;
      default:
        console.log(`Unknown sacrament: ${appointmentData.sacramentType}`);
    }
  };

  // Filter appointments by sacrament type and search term
  const filteredAppointments = appointments.filter(appointment => {
    const matchesFilter = filter === "" || appointment.sacramentType === filter;
    const matchesSearch = 
      searchTerm === "" || 
      (appointment.firstName && appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (appointment.lastName && appointment.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      appointment.sacramentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="appointment-container-sa">
      <h1 className="title-sa">APPOINTMENT MANAGEMENT</h1>
      <div className="appointment-actions-sa">
        <div className="search-bar-sa">
          <input 
            type="text" 
            placeholder="Search appointments" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sa" />
        </div>

        <div className="filter-actions-container-sa">
          <select 
            className="filter-select-sa"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Sacrament Types</option>
            <option value="Baptism">Baptism</option>
            <option value="Marriage">Marriage</option>
            <option value="Funeral Mass">Funeral Mass</option>
            <option value="Confirmation">Confirmation</option>
            <option value="Communion">Communion</option>
            <option value="Blessing">Blessing</option>
            <option value="Anointing of the Sick and Viaticum">Anointing of the Sick</option>
          </select>

          <select className="filter-select-sa">
            <option value="">Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
          </select>

          <button className="add-btn-sa" onClick={toggleModal}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <div className="table-container-sa">
        <table className="appointment-table-sa">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Sacrament Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>Loading appointments...</td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{appointment.sacramentType}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td className={`status-${appointment.status?.toLowerCase()}`}>
                    {appointment.status}
                  </td>
                  <td>{appointment.createdAt}</td>
                  <td className="actions-cell-sa">
                    <button
                      className="view-btn-sa"
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
                <td colSpan="9" style={{ textAlign: "center" }}>No appointments found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sacrament Selection Modal */}
      {showModal && (
        <div className="sacrament-modal-overlay-sa">
          <div className="sacrament-modal-sa">
            <div className="sacrament-modal-header-sa">
              <h2>Select Sacrament</h2>
              <button className="close-modal-btn-sa" onClick={toggleModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <hr className="custom-hr-sa"/>
            <div className="sacrament-options-sa">
              <div className="sacrament-options-grid-sa">
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Baptism")}
                >
                  Baptism
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Marriage")}
                >
                  Marriage
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Funeral Mass")}
                >
                  Funeral Mass
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Blessing")}
                >
                  Blessing
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Communion")}
                >
                  Communion
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Confirmation")}
                >
                  Confirmation
                </button>
                <button 
                  className="sacrament-option-btn-sa"
                  onClick={() => handleSacramentSelection("Anointing of the Sick and Viaticum")}
                >
                  Anointing of the Sick and Viaticum
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryAppointment;