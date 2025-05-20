import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./clientappointment.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

const ClientAppointment = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

 // Update the fetchAppointments function in ClientAppointment.js

const fetchAppointments = async () => {
  try {
    setLoading(true);
    // Get clientID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const clientID = user?.clientID;

    if (!clientID) {
      console.error("No client ID found");
      setLoading(false);
      return;
    }

    // Fetch all types of appointments
    const [baptismResponse, marriageResponse, funeralResponse, communionResponse, confirmationResponse, anointingResponse, blessingResponse] = await Promise.all([
      fetch(`https://parishofdivinemercy.com/backend/fetch_baptisms.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_marriages.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_funerals.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_communions.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_confirmations.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_anointings.php?clientID=${clientID}`),
      fetch(`https://parishofdivinemercy.com/backend/fetch_blessings.php?clientID=${clientID}`)
    ]);

    const baptismData = await baptismResponse.json();
    const marriageData = await marriageResponse.json();
    const funeralData = await funeralResponse.json();
    const communionData = await communionResponse.json();
    const confirmationData = await confirmationResponse.json();
    const anointingData = await anointingResponse.json();
    const blessingData = await blessingResponse.json();
    
    // Combine all types of appointments
    const allAppointments = [
      ...(baptismData.success ? baptismData.appointments || [] : []),
      ...(marriageData.success ? marriageData.appointments || [] : []),
      ...(funeralData.success ? funeralData.appointments || [] : []),
      ...(communionData.success ? communionData.appointments || [] : []),
      ...(confirmationData.success ? confirmationData.appointments || [] : []),
      ...(anointingData.success ? anointingData.appointments || [] : []),
      ...(blessingData.success ? blessingData.appointments || [] : [])
    ];

    setAppointments(allAppointments);
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
    
    // Get clientID from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const clientID = user?.clientID;
    
    // Navigate based on the selected sacrament with state
    switch(sacrament) {
      case "Baptism":
        navigate("/client-baptism", { 
          state: { clientID } 
        });
        break;
      case "Marriage":
        navigate("/client-marriage", { 
          state: { clientID } 
        });
        break;
      case "Funeral Mass":
        navigate("/client-funeral-mass", { 
          state: { clientID } 
        });
        break;
      case "Blessing":
        navigate("/client-blessing", { 
          state: { clientID } 
        });
        break;
      case "Communion":
        navigate("/client-communion", { 
          state: { clientID } 
        });
        break;
      case "Confirmation":
        navigate("/client-confirmation", { 
          state: { clientID } 
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/client-anointing-of-the-sick", { 
          state: { clientID } 
        });
        break;
      default:
        console.log(`Unknown sacrament: ${sacrament}`);
    }
  };

 // Update the viewAppointmentDetails function in ClientAppointment.js

const viewAppointmentDetails = (appointmentData) => {
  // Get clientID from localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const clientID = user?.clientID;
  
  // Navigate to appropriate form with viewOnly flag and appointment data
  switch(appointmentData.sacramentType) {
    case "Baptism":
      navigate("/client-baptism-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          baptismID: appointmentData.id
        } 
      });
      break;
    case "Marriage":
      navigate("/client-marriage-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          marriageID: appointmentData.id
        } 
      });
      break;
    case "Funeral Mass":
      navigate("/client-funeral-mass-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          funeralID: appointmentData.id
        } 
      });
      break;
    case "Blessing":
      navigate("/client-blessing-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          blessingID: appointmentData.id
        } 
      });
      break;
    case "Communion":
      navigate("/client-communion-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          communionID: appointmentData.id
        } 
      });
      break;
    case "Confirmation":
      navigate("/client-confirmation-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          confirmationID: appointmentData.id
        } 
      });
      break;
    case "Anointing of the Sick and Viaticum":
      navigate("/client-anointing-of-the-sick-view", { 
        state: { 
          viewOnly: true, 
          appointmentData,
          clientID,
          anointingID: appointmentData.id
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
      appointment.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.sacramentType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="appointment-container-ca">
      <h1 className="title-ca">APPOINTMENT</h1>
      <div className="appointment-actions-ca">
        <div className="search-bar-ca">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-ca" />
        </div>

        <div className="filter-pdf-container-ca">
          <select 
            className="filter-select-ca"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">Sacrament Type</option>
            <option value="Baptism">Baptism</option>
            <option value="Marriage">Marriage</option>
            <option value="Funeral Mass">Funeral Mass</option>
            <option value="Blessing">Blessing</option>
            <option value="Communion">Communion</option>
            <option value="Confirmation">Confirmation</option>
            <option value="Anointing of the Sick and Viaticum">Anointing of the Sick and Viaticum</option>
          </select>

          <button className="pdf-btn-ca" onClick={toggleModal}>
            <FontAwesomeIcon icon={faPlus} /> ADD
          </button>
        </div>
      </div>

      <div className="table-container">
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
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>Loading appointments...</td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.id}>
                  <td>{index + 1}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{appointment.sacramentType}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td>{appointment.createdAt}</td>
                  <td>
                    <button
                      className="ca-details"
                      onClick={() => viewAppointmentDetails(appointment)}
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

      {/* Two-Column Sacrament Selection Modal */}
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
              <div className="sacrament-options-grid">
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
                  onClick={() => handleSacramentSelection("Communion")}
                >
                  Communion
                </button>
                <button 
                  className="sacrament-option-btn-ca"
                  onClick={() => handleSacramentSelection("Confirmation")}
                >
                  Confirmation
                </button>
                <button 
                  className="sacrament-option-btn-ca"
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

export default ClientAppointment;