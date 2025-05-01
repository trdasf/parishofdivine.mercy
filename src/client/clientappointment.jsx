import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./clientappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const ClientAppointment = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  // Sample appointment data - in a real app, this would come from an API/database
  const sampleAppointment = {
    id: 101,
    firstName: "Kimi",
    lastName: "Rot",
    sacramentType: "Baptism",
    date: "03/02/2025",
    time: "9:00 AM",
    status: "Pending",
    createdAt: "02/28/2025"
  };

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  const handleSacramentSelection = (sacrament) => {
    setShowModal(false);
    
    // Navigate based on the selected sacrament
    switch(sacrament) {
      case "Baptism":
        navigate("/client-baptism");
        break;
      case "Marriage":
        navigate("/client-marriage");
        break;
      case "Funeral Mass":
        navigate("/client-funeral-mass");
        break;
      case "Blessing":
        navigate("/client-blessing");
        break;
      case "Confirmation":
        navigate("/client-kumpil");
        break;
      case "Communion":
        navigate("/client-communion");
        break;
      default:
        console.log(`Unknown sacrament: ${sacrament}`);
    }
  };

  // View appointment details - passing viewOnly state
  const viewAppointmentDetails = (appointmentData) => {
    // Navigate to appropriate form with viewOnly flag and appointment data
    switch(appointmentData.sacramentType) {
      case "Baptism":
        navigate("/client-baptism-view", { state: { viewOnly: true, appointmentData } });
        break;
      case "Marriage":
        navigate("/client-marriage-view", { state: { viewOnly: true, appointmentData } });
        break;
      case "Funeral Mass":
        navigate("/client-funeral-mass-view", { state: { viewOnly: true, appointmentData } });
        break;
      case "Blessing":
        navigate("/client-blessing-view", { state: { viewOnly: true, appointmentData } });
        break;
      case "Confirmation":
        navigate("/client-kumpil-view", { state: { viewOnly: true, appointmentData } });
        break;
      case "Communion":
        navigate("/client-communion-view", { state: { viewOnly: true, appointmentData } });
        break;
      default:
        console.log(`Unknown sacrament: ${appointmentData.sacramentType}`);
    }
  };

  return (
    <div className="appointment-container-ca">
      <h1 className="title-ca">APPOINTMENT</h1>
      <div className="appointment-actions-ca">
        <div className="search-bar-ca">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-ca" />
        </div>

        <div className="filter-pdf-container-ca">
          <select className="filter-select-ca">
            <option value="">Sacrament Type</option>
            <option value="baptism">Baptism</option>
            <option value="marriage">Marriage</option>
            <option value="funeral">Funeral Mass</option>
            <option value="confirmation">Confirmation</option>
            <option value="communion">Communion</option>
          </select>

          <button className="pdf-btn-ca" onClick={toggleModal}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <table className="appointment-table-ca">
        <thead>
          <tr>
            <th>No.</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Sacrament Type</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sampleAppointment.id}</td>
            <td>{sampleAppointment.firstName}</td>
            <td>{sampleAppointment.lastName}</td>
            <td>{sampleAppointment.sacramentType}</td>
            <td>{sampleAppointment.date}</td>
            <td>{sampleAppointment.time}</td>
            <td>{sampleAppointment.status}</td>
            <td>{sampleAppointment.createdAt}</td>
            <td>
              <button
                className="ca-details"
                onClick={() => viewAppointmentDetails(sampleAppointment)}
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Sacrament Selection Modal */}
      {showModal && (
        <div className="sacrament-modal-overlay-ca">
          <div className="sacrament-modal-ca">
            <div className="sacrament-modal-header-ca">
              <h2>Select Sacrament</h2>
              <button className="close-modal-btn-ca" onClick={toggleModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <hr className="custom-hr"/>
            <div className="sacrament-options-ca">
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Baptism")}
              >
                Baptism
              </button>
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Marriage")}
              >
                Marriage
              </button>
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Funeral Mass")}
              >
                Funeral Mass
              </button>
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Blessing")}
              >
                Blessing
              </button>
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Confirmation")}
              >
                Confirmation
              </button>
              <button 
                className="sacrament-option-btn-ca"
                onClick={() => handleSacramentSelection("Communion")}
              >
                Communion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointment;