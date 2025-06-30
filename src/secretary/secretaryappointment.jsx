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
  const [sacramentTypeFilter, setSacramentTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

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
    if (searchValue.trim() !== "" && sacramentTypeFilter === "") {
      // First check for EXACT matches to avoid conflicts
      const exactSacramentMatch = sacramentTypes.find(sacrament => 
        sacrament.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (exactSacramentMatch) {
        setSacramentTypeFilter(exactSacramentMatch);
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
            setSacramentTypeFilter('Communion');
          } else if (searchValue.toLowerCase().startsWith('conf')) {
            // If starts with "conf", prioritize Confirmation  
            setSacramentTypeFilter('Confirmation');
          } else if (partialMatch) {
            setSacramentTypeFilter(partialMatch);
          }
        }
      }
    }
    
    // Check if the search term matches any status (only if no status filter is selected)
    if (searchValue.trim() !== "" && statusFilter === "") {
      const exactStatusMatch = statusOptions.find(status => 
        status.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (exactStatusMatch) {
        setStatusFilter(exactStatusMatch);
      } else if (searchValue.length >= 3) { // Require at least 3 characters for status auto-selection
        // Check for partial matches with status
        const partialStatusMatch = statusOptions.find(status => 
          status.toLowerCase().startsWith(searchValue.toLowerCase())
        );
        
        if (partialStatusMatch) {
          setStatusFilter(partialStatusMatch);
        }
      }
    }
    
    // If search is cleared, reset filters to empty only if no manual filter was selected
    if (searchValue.trim() === "") {
      setSacramentTypeFilter("");
      setStatusFilter("");
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

  // Handle sacrament type filter change
  const handleSacramentTypeFilterChange = (e) => {
    setSacramentTypeFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Enhanced filtering with flexible matching - similar to ParishAppointment
  const filteredAppointments = React.useMemo(() => {
    const filtered = appointments.filter(appointment => {
      const matchesSacramentFilter = sacramentTypeFilter === "" || appointment.sacramentType === sacramentTypeFilter;
      const matchesStatusFilter = statusFilter === "" || appointment.status === statusFilter;
      
      // If no search term, just apply dropdown filters
      if (searchTerm.trim() === "") {
        return matchesSacramentFilter && matchesStatusFilter;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Check if the search term matches any sacrament type or status for auto-filtering
      const isSearchingSacramentType = sacramentTypes.some(sacrament => 
        sacrament.toLowerCase() === normalizedSearchTerm.toLowerCase() || 
        (normalizedSearchTerm.length >= 4 && sacrament.toLowerCase().startsWith(normalizedSearchTerm.toLowerCase())) ||
        (normalizedSearchTerm.toLowerCase().startsWith('comm') && sacrament === 'Communion') ||
        (normalizedSearchTerm.toLowerCase().startsWith('conf') && sacrament === 'Confirmation')
      );
      
      const isSearchingStatus = statusOptions.some(status => 
        status.toLowerCase() === normalizedSearchTerm.toLowerCase() || 
        (normalizedSearchTerm.length >= 3 && status.toLowerCase().startsWith(normalizedSearchTerm.toLowerCase()))
      );
      
      let result = false;
      let reason = "";
      
      if ((isSearchingSacramentType && sacramentTypeFilter !== "") || (isSearchingStatus && statusFilter !== "")) {
        // If searching for a specific sacrament type or status, only show those types
        result = matchesSacramentFilter && matchesStatusFilter;
        reason = result ? 
          `Included: Matches active filters - Sacrament: "${sacramentTypeFilter}", Status: "${statusFilter}"` :
          `Excluded: Does not match active filters - Sacrament: "${appointment.sacramentType}", Status: "${appointment.status}"`;
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
        
        result = matchesSacramentFilter && matchesStatusFilter && matchesSearch;
        
        // Build reason string
        if (!result) {
          if (!matchesSacramentFilter) {
            reason = `Excluded: Sacrament filter mismatch - Filter: "${sacramentTypeFilter}", Appointment: "${appointment.sacramentType}"`;
          } else if (!matchesStatusFilter) {
            reason = `Excluded: Status filter mismatch - Filter: "${statusFilter}", Appointment: "${appointment.status}"`;
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
          
          reason = `Included: Matches ${matchReasons.join(", ")} with search term: "${normalizedSearchTerm}", sacrament filter: "${sacramentTypeFilter}", status filter: "${statusFilter}"`;
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
    console.log("=== RAW DATA DEBUG ===");
    console.log("Total raw appointments received:", appointments.length);
    console.log("Sample appointments:", appointments.slice(0, 3));
    console.log("Sacrament types in data:", [...new Set(appointments.map(apt => apt.sacramentType))]);
    console.log("======================");
    console.log("=== SECRETARY APPOINTMENT SEARCH SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Normalized Search Term: "${normalizeSpaces(searchTerm)}"`);
    console.log(`Sacrament Filter: "${sacramentTypeFilter}"`);
    console.log(`Status Filter: "${statusFilter}"`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`Filtered Results (with duplicates): ${filtered.length}`);
    console.log(`Unique Filtered Results: ${uniqueFiltered.length}`);
    console.log("Filtered Appointment IDs:", uniqueFiltered.map(apt => apt.id));
    console.log("===============================================");

    return uniqueFiltered;
  }, [appointments, searchTerm, sacramentTypeFilter, statusFilter, sacramentTypes, statusOptions]);

  // Dynamic placeholder text based on active filters
  const getPlaceholderText = () => {
    const activeFilters = [];
    if (sacramentTypeFilter) activeFilters.push(sacramentTypeFilter);
    if (statusFilter) activeFilters.push(statusFilter);
    
    if (activeFilters.length > 0) {
      return `Search within ${activeFilters.join(' and ')} appointments`;
    }
    return "Search by name, date (yyyy-mm-dd), time, sacrament type, or status";
  };

  return (
    <div className="appointment-container-sa">
      <h1 className="title-sa-sa">APPOINTMENT MANAGEMENT</h1>
      <div className="appointment-actions-sa-sa">
        <div className="search-bar-sa-sa-1">
          <input 
            type="text" 
            placeholder={getPlaceholderText()} 
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sa-sa" />
        </div>

        <div className="filter-actions-container-sa-sa">
          <select 
            className="filter-select-sa-sa"
            value={sacramentTypeFilter}
            onChange={handleSacramentTypeFilterChange}
          >
            <option value="">All Sacrament Types</option>
            {sacramentTypes.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>

          <select 
            className="filter-select-sa-sa-1"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            {statusOptions.map((status, index) => (
              <option key={index} value={status}>{status}</option>
            ))}
          </select>

          <button className="add-btn-sa-sa" onClick={toggleModal}>
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
                  <td>{formatDateForDisplay(appointment.date)}</td>
                  <td>{appointment.time}</td>
                  <td className={`status-${appointment.status?.toLowerCase()}`}>
                    {appointment.status}
                  </td>
                  <td>{formatDateForDisplay(appointment.createdAt)}</td>
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
                <td colSpan="9" style={{ textAlign: "center" }}>
                  {searchTerm || sacramentTypeFilter || statusFilter ? 
                    "No appointments found matching your search criteria" : 
                    "No appointments found"
                  }
                </td>
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
                {sacramentTypes.map((sacrament, index) => (
                  <button 
                    key={index}
                    className="sacrament-option-btn-sa"
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

export default SecretaryAppointment;