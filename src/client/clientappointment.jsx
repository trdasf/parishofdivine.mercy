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

  // Sacrament Types list (for consistency)
  const sacramentTypes = [
    "Baptism",
    "Marriage", 
    "Funeral Mass",
    "Confirmation",
    "Communion",
    "Blessing",
    "Anointing of the Sick and Viaticum"
  ];

  // Status options
  const statusOptions = ["Pending", "Approved"];

  useEffect(() => {
    fetchAppointments();
  }, []);

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

  // Helper function to normalize spaces in search term
  const normalizeSpaces = (str) => {
    return str.trim().replace(/\s+/g, ' ');
  };

  // Helper function to convert 12-hour time to 24-hour for comparison
  const convertTo24Hour = (timeStr) => {
    if (!timeStr) return '';
    
    // If already in 24-hour format, return as is
    if (timeStr.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      return timeStr;
    }
    
    // Convert 12-hour to 24-hour
    const time12h = timeStr.toLowerCase().replace(/\s/g, '');
    let [time, modifier] = time12h.split(/(am|pm)/);
    
    if (!modifier) return timeStr; // Not a 12-hour format
    
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'pm') {
      hours = parseInt(hours, 10) + 12;
    }
    
    return `${hours.padStart(2, '0')}:${minutes || '00'}:00`;
  };

  // Helper function to check if search term matches time (supports both 12h and 24h)
  const matchesTime = (appointmentTime, searchTerm) => {
    if (!appointmentTime || !searchTerm) return false;
    
    const normalizedSearch = searchTerm.toLowerCase().replace(/\s/g, '');
    const appointmentTime24 = appointmentTime;
    
    // Direct match with appointment time
    if (appointmentTime24.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    // Convert appointment time to 12-hour format for comparison
    const [hours, minutes] = appointmentTime24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'pm' : 'am';
    const time12h = `${hour12}:${minutes}${ampm}`;
    const time12hWithSpace = `${hour12}:${minutes} ${ampm}`;
    
    return time12h.includes(normalizedSearch) || 
           time12hWithSpace.includes(normalizedSearch) ||
           appointmentTime24.includes(normalizedSearch);
  };

  // Helper function to check if search term matches date (supports yyyy, yyyy-mm, yyyy-mm-dd with - or /)
  const matchesDate = (appointmentDate, searchTerm) => {
    if (!appointmentDate || !searchTerm) return false;
    
    const normalizedSearch = searchTerm.replace(/\s/g, '');
    
    // Convert appointment date to different formats for comparison
    const dateFormats = [
      appointmentDate, // Original format (mm/dd/yyyy or yyyy-mm-dd)
      appointmentDate.replace(/\//g, '-'), // Convert / to -
      appointmentDate.replace(/-/g, '/'), // Convert - to /
    ];
    
    // If appointment date is in mm/dd/yyyy format, also create yyyy-mm-dd format
    if (appointmentDate.includes('/')) {
      const [month, day, year] = appointmentDate.split('/');
      dateFormats.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      dateFormats.push(`${year}-${month.padStart(2, '0')}`);
      dateFormats.push(year);
    } else if (appointmentDate.includes('-')) {
      const [year, month, day] = appointmentDate.split('-');
      dateFormats.push(`${month}/${day}/${year}`);
      dateFormats.push(`${year}-${month}`);
      dateFormats.push(year);
    }
    
    return dateFormats.some(format => 
      format.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  };

  // Helper function to convert date to yyyy-mm-dd format for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
    // If already in yyyy-mm-dd format, return as is
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // If in mm/dd/yyyy format, convert to yyyy-mm-dd
    if (dateString.includes('/')) {
      const [month, day, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // If in dd/mm/yyyy format (less common but possible)
    if (dateString.includes('/') && dateString.split('/')[2].length === 4) {
      const parts = dateString.split('/');
      if (parts[0].length <= 2 && parts[1].length <= 2) {
        const [day, month, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    return dateString; // Return original if format not recognized
  };

  // Handle search input change with automatic sacrament type and status filtering
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    // Check if the search term matches any sacrament type (only if no filter is selected)
    if (searchValue.trim() !== "" && filter === "") {
      // First check for EXACT matches to avoid conflicts
      const exactSacramentMatch = sacramentTypes.find(sacrament => 
        sacrament.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (exactSacramentMatch) {
        setFilter(exactSacramentMatch);
      } else {
        // For partial matches, be more specific to avoid "co" matching "Confirmation" when user wants "Communion"
        // Only auto-select if the search is long enough or very specific
        if (searchValue.length >= 4) { // Require at least 4 characters for auto-selection
          const partialMatch = sacramentTypes.find(sacrament => 
            sacrament.toLowerCase().startsWith(searchValue.toLowerCase())
          );
          
          // Special handling for communion vs confirmation conflict
          if (searchValue.toLowerCase().startsWith('comm')) {
            // If starts with "comm", prioritize Communion
            setFilter('Communion');
          } else if (searchValue.toLowerCase().startsWith('conf')) {
            // If starts with "conf", prioritize Confirmation  
            setFilter('Confirmation');
          } else if (partialMatch) {
            setFilter(partialMatch);
          }
        }
      }
    }
    
    // If search is cleared, reset filter to empty only if no manual filter was selected
    if (searchValue.trim() === "") {
      setFilter("");
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

  // Enhanced filtering with flexible matching - similar to ParishAppointment and SecretaryAppointment
  const filteredAppointments = React.useMemo(() => {
    const filtered = appointments.filter(appointment => {
      const matchesSacramentFilter = filter === "" || appointment.sacramentType === filter;
      
      // If no search term, just apply dropdown filter
      if (searchTerm.trim() === "") {
        return matchesSacramentFilter;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Check if the search term matches any sacrament type for auto-filtering
      const isSearchingSacramentType = sacramentTypes.some(sacrament => 
        sacrament.toLowerCase() === normalizedSearchTerm.toLowerCase() || 
        (normalizedSearchTerm.length >= 4 && sacrament.toLowerCase().startsWith(normalizedSearchTerm.toLowerCase())) ||
        (normalizedSearchTerm.toLowerCase().startsWith('comm') && sacrament === 'Communion') ||
        (normalizedSearchTerm.toLowerCase().startsWith('conf') && sacrament === 'Confirmation')
      );
      
      let result = false;
      let reason = "";
      
      if (isSearchingSacramentType && filter !== "") {
        // If searching for a specific sacrament type, only show that type
        result = appointment.sacramentType === filter;
        reason = result ? 
          `Included: Sacrament type "${appointment.sacramentType}" matches active filter "${filter}"` :
          `Excluded: Sacrament type "${appointment.sacramentType}" does not match active filter "${filter}"`;
      } else {
        // Enhanced search behavior for names, dates, times, status, and other fields
        const firstName = appointment.firstName || '';
        const lastName = appointment.lastName || '';
        
        // Create full name combinations for searching
        const fullName = normalizeSpaces(`${firstName} ${lastName}`);
        const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
        
        // Check various search matches
        const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesSacramentType = appointment.sacramentType.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesStatus = appointment.status && appointment.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesId = appointment.id && appointment.id.toString().includes(normalizedSearchTerm);
        const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
        const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
        const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
        
        const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                             matchesReverseFullName || matchesSacramentType || matchesStatus ||
                             matchesId || matchesDateField || matchesTimeField || matchesCreatedAt;
        
        result = matchesSacramentFilter && matchesSearch;
        
        // Build reason string
        if (!result) {
          if (!matchesSacramentFilter) {
            reason = `Excluded: Sacrament filter mismatch - Filter: "${filter}", Appointment: "${appointment.sacramentType}"`;
          } else if (!matchesSearch) {
            reason = `Excluded: Search mismatch - Search term: "${normalizedSearchTerm}" not found in any field`;
          }
        } else {
          let matchReasons = [];
          if (matchesFirstName) matchReasons.push(`firstName: "${firstName}"`);
          if (matchesLastName) matchReasons.push(`lastName: "${lastName}"`);
          if (matchesFullName && !matchesFirstName && !matchesLastName) matchReasons.push(`fullName: "${fullName}"`);
          if (matchesReverseFullName && !matchesFullName) matchReasons.push(`reverseFullName: "${reverseFullName}"`);
          if (matchesSacramentType) matchReasons.push(`sacramentType: "${appointment.sacramentType}"`);
          if (matchesStatus) matchReasons.push(`status: "${appointment.status}"`);
          if (matchesId) matchReasons.push(`id: "${appointment.id}"`);
          if (matchesDateField) matchReasons.push(`date: "${appointment.date}"`);
          if (matchesTimeField) matchReasons.push(`time: "${appointment.time}"`);
          if (matchesCreatedAt) matchReasons.push(`createdAt: "${appointment.createdAt}"`);
          
          reason = `Included: Matches ${matchReasons.join(", ")} with search term: "${normalizedSearchTerm}", filter: "${filter}"`;
        }
      }
      
      // Console log for debugging
      console.log(`ID: ${appointment.id} | ${reason}`);
      
      return result;
    });

    // Remove duplicates based on appointment ID
    const uniqueFiltered = filtered.filter((appointment, index, self) => 
      index === self.findIndex(apt => apt.id === appointment.id)
    );

    // Console log to debug data issues
    console.log("=== CLIENT APPOINTMENT RAW DATA DEBUG ===");
    console.log("Total raw appointments received:", appointments.length);
    console.log("Sample appointments:", appointments.slice(0, 3));
    console.log("Sacrament types in data:", [...new Set(appointments.map(apt => apt.sacramentType))]);
    console.log("===========================================");

    // Console log summary
    console.log("=== CLIENT APPOINTMENT SEARCH SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Normalized Search Term: "${normalizeSpaces(searchTerm)}"`);
    console.log(`Sacrament Filter: "${filter}"`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`Filtered Results (with duplicates): ${filtered.length}`);
    console.log(`Unique Filtered Results: ${uniqueFiltered.length}`);
    console.log("Filtered Appointment IDs:", uniqueFiltered.map(apt => apt.id));
    console.log("==========================================");

    return uniqueFiltered;
  }, [appointments, searchTerm, filter, sacramentTypes]);

  return (
    <div className="appointment-container-ca">
      <h1 className="title-ca">APPOINTMENT</h1>
      <div className="appointment-actions-ca">
        <div className="search-bar-ca">
          <input 
            type="text" 
            placeholder="Search by name, date (yyyy-mm-dd), time, sacrament type, or status" 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-ca" />
        </div>

        <div className="filter-pdf-container-ca">
          <select 
            className="filter-select-ca"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">All Sacraments</option>
            {sacramentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
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
                  <td>{formatDateForDisplay(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.status}</td>
                  <td>{formatDateForDisplay(appointment.createdAt)}</td>
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
                <td colSpan="9" style={{ textAlign: "center" }}>
                  {searchTerm.trim() || filter ? "No appointments match your search criteria" : "No appointments found"}
                </td>
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
                {sacramentTypes.map((sacrament, index) => (
                  <button 
                    key={index}
                    className="sacrament-option-btn-ca"
                    onClick={() => handleSacramentSelection(sacrament)}
                  >
                    {sacrament}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientAppointment;