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
  const [error, setError] = useState(null);

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
      setError(null);
      
      // Get clientID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      const clientID = user?.clientID;

      if (!clientID) {
        console.error("No client ID found");
        setError("No client ID found. Please log in again.");
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
      
      // Combine all types of appointments with sequential numbering and originalId
      const allAppointments = [
        ...(baptismData.success ? baptismData.appointments || [] : []),
        ...(marriageData.success ? marriageData.appointments || [] : []),
        ...(funeralData.success ? funeralData.appointments || [] : []),
        ...(communionData.success ? communionData.appointments || [] : []),
        ...(confirmationData.success ? confirmationData.appointments || [] : []),
        ...(anointingData.success ? anointingData.appointments || [] : []),
        ...(blessingData.success ? blessingData.appointments || [] : [])
      ];

      // Add sequential numbering and preserve originalId
      const numberedAppointments = allAppointments.map((appointment, index) => ({
        ...appointment,
        originalId: appointment.id, // Preserve original database ID
        displayNumber: index + 1,   // Sequential numbering for display
        uniqueKey: `${appointment.sacramentType}-${appointment.id}`, // Unique key for React
        normalizedStatus: formatStatus(appointment.status) // Normalize status for consistent filtering
      }));

      setAppointments(numberedAppointments);
      
      console.log("=== CLIENT APPOINTMENTS LOADING ===");
      console.log(`Total appointments loaded: ${numberedAppointments.length}`);
      console.log("====================================");
      
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("An error occurred while fetching appointments");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert 24-hour time to 12-hour format with AM/PM
  const convertTo12Hour = (timeStr) => {
    if (!timeStr) return '';
    
    // If already in 12-hour format, return as is
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      return timeStr;
    }
    
    // Parse 24-hour format
    let [hours, minutes, seconds] = timeStr.split(':');
    hours = parseInt(hours, 10);
    
    if (isNaN(hours)) return timeStr; // Return original if not valid
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    // Format minutes
    minutes = minutes || '00';
    
    return `${hours}:${minutes} ${ampm}`;
  };

  // Helper function to format status with proper capitalization
  const formatStatus = (status) => {
    if (!status) return '';
    
    // Ensure first letter is capitalized and rest are lowercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Helper function to normalize spaces in search term
  const normalizeSpaces = (str) => {
    return str.trim().replace(/\s+/g, ' ');
  };

  // Helper function to check if search term matches time (supports both 12h and 24h)
  const matchesTime = (appointmentTime, searchTerm) => {
    if (!appointmentTime || !searchTerm) return false;
    
    const normalizedSearch = searchTerm.toLowerCase().replace(/\s/g, '');
    const appointmentTime24 = appointmentTime;
    const appointmentTime12 = convertTo12Hour(appointmentTime);
    
    // Direct match with appointment time (both formats)
    if (appointmentTime24.toLowerCase().includes(normalizedSearch) || 
        appointmentTime12.toLowerCase().includes(normalizedSearch)) {
      return true;
    }
    
    return false;
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
    
    return dateString; // Return original if format not recognized
  };

  // Handle search input change with automatic sacrament type filtering
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
    
    // Use originalId for navigation to maintain compatibility with existing backend
    // Navigate to appropriate form with viewOnly flag and appointment data
    switch(appointmentData.sacramentType) {
      case "Baptism":
        navigate("/client-baptism-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            baptismID: appointmentData.originalId
          } 
        });
        break;
      case "Marriage":
        navigate("/client-marriage-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            marriageID: appointmentData.originalId
          } 
        });
        break;
      case "Funeral Mass":
        navigate("/client-funeral-mass-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            funeralID: appointmentData.originalId
          } 
        });
        break;
      case "Blessing":
        navigate("/client-blessing-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            blessingID: appointmentData.originalId
          } 
        });
        break;
      case "Communion":
        navigate("/client-communion-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            communionID: appointmentData.originalId
          } 
        });
        break;
      case "Confirmation":
        navigate("/client-confirmation-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            confirmationID: appointmentData.originalId
          } 
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/client-anointing-of-the-sick-view", { 
          state: { 
            viewOnly: true, 
            appointmentData,
            clientID,
            anointingID: appointmentData.originalId
          } 
        });
        break;
      default:
        console.log(`Unknown sacrament: ${appointmentData.sacramentType}`);
    }
  };

  // Enhanced filtering with case-insensitive status matching
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
      
      if (isSearchingSacramentType && filter !== "") {
        // If searching for a specific sacrament type, only show that type
        result = appointment.sacramentType === filter;
      } else {
        // Enhanced search behavior for names, dates, times, status, and other fields
        const firstName = appointment.firstName || '';
        const lastName = appointment.lastName || '';
        
        // Create full name combinations for searching
        const fullName = normalizeSpaces(`${firstName} ${lastName}`);
        const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
        
        // Check various search matches with case-insensitive status comparison
        const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesSacramentType = appointment.sacramentType.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        // Case-insensitive status matching
        const matchesStatus = appointment.status && appointment.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
        const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
        const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
        
        const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                             matchesReverseFullName || matchesSacramentType || matchesStatus ||
                             matchesDateField || matchesTimeField || matchesCreatedAt;
        
        result = matchesSacramentFilter && matchesSearch;
      }
      
      return result;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((appointment, index) => ({
      ...appointment,
      displayNumber: index + 1
    }));

    console.log("=== CLIENT APPOINTMENT FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Sacrament Filter: "${filter}"`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("=============================================");

    return numberedFiltered;
  }, [appointments, searchTerm, filter, sacramentTypes]);

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchAppointments();
  };

  return (
    <div className="appointment-container-ca">
      <h1 className="title-ca">APPOINTMENT</h1>
      
      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredAppointments.length} of {appointments.length} appointments
            <button 
              onClick={handleRefresh} 
              style={{
                marginLeft: '10px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                background: '#b3701f', 
                color: 'white', 
                border: 'none', 
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </span>
        )}
      </div>
      
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

      {loading ? (
        <div className="loading-container-ca">Loading appointments...</div>
      ) : error ? (
        <div className="error-container-ca">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="appointment-table-wrapper-ca">
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
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.uniqueKey}>
                    <td>{appointment.displayNumber}</td>
                    <td>{appointment.firstName}</td>
                    <td>{appointment.lastName}</td>
                    <td>{appointment.sacramentType}</td>
                    <td>{formatDateForDisplay(appointment.date)}</td>
                    <td>{convertTo12Hour(appointment.time)}</td>
                    <td className={`status-${appointment.normalizedStatus?.toLowerCase()}`}>
                      {appointment.normalizedStatus}
                    </td>
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
                  <td colSpan="9" className="no-data-ca">
                    {searchTerm.trim() || filter ? 
                      "No appointments found matching your search criteria" : 
                      "No appointments found"
                    }
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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