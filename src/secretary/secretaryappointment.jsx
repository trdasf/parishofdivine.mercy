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
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching all appointments...");
      const response = await fetch('https://parishofdivinemercy.com/backend/fetch_all_appointments.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Raw API Response:", data);
      
      if (data.success) {
        const appointmentsData = data.appointments || [];
        
        // Create unique appointments by combining sacrament type and ID
        const uniqueAppointments = appointmentsData.map((appointment, index) => ({
          ...appointment,
          // Create a unique key combining sacrament type and original ID
          uniqueKey: `${appointment.sacramentType}-${appointment.id}`,
          // Keep the original ID for navigation purposes
          originalId: appointment.id,
          // Add sequential numbering for display
          displayNumber: index + 1
        }));

        // Remove any actual duplicates based on the unique key
        const deduplicatedAppointments = uniqueAppointments.filter(
          (appointment, index, self) => 
            index === self.findIndex(apt => apt.uniqueKey === appointment.uniqueKey)
        );

        setAppointments(deduplicatedAppointments);
        
        console.log("=== APPOINTMENT LOADING SUMMARY ===");
        console.log(`Total appointments loaded: ${appointmentsData.length}`);
        console.log(`After deduplication: ${deduplicatedAppointments.length}`);
        console.log(`Backend reported count: ${data.total_count || 'N/A'}`);
        
        // Show breakdown by sacrament type
        const breakdown = {};
        deduplicatedAppointments.forEach(apt => {
          breakdown[apt.sacramentType] = (breakdown[apt.sacramentType] || 0) + 1;
        });
        console.log("Appointments by type:", breakdown);
        console.log("===================================");
        
      } else {
        console.error("API Error:", data.message);
        setError(`API Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Network Error fetching appointments:", error);
      setError(`Network Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to normalize spaces in search term
  const normalizeSpaces = (str) => {
    return str.trim().replace(/\s+/g, ' ');
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

  // Helper function to format status with proper capitalization
  const formatStatus = (status) => {
    if (!status) return '';
    
    // Ensure first letter is capitalized and rest are lowercase
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
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
        // Check for partial matches with status (case-insensitive)
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

  // View appointment details - now uses the original ID
  const viewAppointmentDetails = (appointmentData) => {
    // Navigate to appropriate form with appointment data using the original ID
    switch(appointmentData.sacramentType) {
      case "Baptism":
        navigate("/secretary-baptism-view", { 
          state: { 
            baptismID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Marriage":
        navigate("/secretary-marriage-view", { 
          state: { 
            marriageID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Funeral Mass":
        navigate("/secretary-funeral-mass-view", { 
          state: { 
            funeralID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Blessing":
        navigate("/secretary-blessing-view", { 
          state: { 
            blessingID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Communion":
        navigate("/secretary-communion-view", { 
          state: { 
            communionID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Confirmation":
        navigate("/secretary-confirmation-view", { 
          state: { 
            confirmationID: appointmentData.originalId,
            status: appointmentData.status
          } 
        });
        break;
      case "Anointing of the Sick and Viaticum":
        navigate("/secretary-anointing-of-the-sick-view", { 
          state: { 
            anointingID: appointmentData.originalId,
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

  // Enhanced filtering with flexible matching - NO PAGINATION, SHOWS ALL FILTERED RESULTS
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
      
      if ((isSearchingSacramentType && sacramentTypeFilter !== "") || (isSearchingStatus && statusFilter !== "")) {
        // If searching for a specific sacrament type or status, only show those types
        result = matchesSacramentFilter && matchesStatusFilter;
      } else {
        // Enhanced search behavior for names, dates, times, status, and other fields
        const firstName = appointment.firstName || '';
        const lastName = appointment.lastName || '';
        
        // Create full name combinations for searching
        const fullName = normalizeSpaces(`${firstName} ${lastName}`);
        const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
        
        // Check various search matches (note: removed ID search since we're not showing it)
        const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesSacramentType = appointment.sacramentType.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesStatus = appointment.status && appointment.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
        const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
        const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
        
        const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                             matchesReverseFullName || matchesSacramentType || matchesStatus ||
                             matchesDateField || matchesTimeField || matchesCreatedAt;
        
        result = matchesSacramentFilter && matchesStatusFilter && matchesSearch;
      }
      
      return result;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((appointment, index) => ({
      ...appointment,
      displayNumber: index + 1
    }));

    console.log("=== FILTERING SUMMARY (ALL RECORDS) ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Sacrament Filter: "${sacramentTypeFilter}"`);
    console.log(`Status Filter: "${statusFilter}"`);
    console.log(`Total Raw Appointments: ${appointments.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("========================================");

    return numberedFiltered;
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

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchAllAppointments();
  };

  return (
    <div className="appointment-container-sa">
      <h1 className="title-sa-sa">APPOINTMENT MANAGEMENT</h1>
      
      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredAppointments.length} of {appointments.length} total appointments
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

      <div className="table-container-sa scrollable-table">
        <table className="appointment-table-sa">
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>Loading all appointments...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", color: 'red' }}>
                  Error loading appointments: {error}
                  <br />
                  <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
                </td>
              </tr>
            ) : filteredAppointments.length > 0 ? (
              filteredAppointments.map((appointment, index) => (
                <tr key={appointment.uniqueKey}>
                  <td>{appointment.displayNumber}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{appointment.sacramentType}</td>
                  <td>{formatDateForDisplay(appointment.date)}</td>
                  <td>{convertTo12Hour(appointment.time)}</td>
                  <td>{formatStatus(appointment.status)}</td>
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