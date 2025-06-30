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

  // Handle search input change with automatic sacrament type filtering
  const handleSearchChange = (e) => {
    const searchValue = e.target.value;
    setSearchTerm(searchValue);
    
    // Check if the search term matches any sacrament type (only if no filter is selected)
    if (searchValue.trim() !== "" && activeFilter === "All") {
      const matchingSacrament = allSacramentTypes.find(sacrament => 
        sacrament !== "All" && 
        sacrament.toLowerCase() === searchValue.toLowerCase()
      );
      
      if (matchingSacrament) {
        setActiveFilter(matchingSacrament);
      } else {
        // Check for partial matches with exact sacrament type
        const partialMatch = allSacramentTypes.find(sacrament => 
          sacrament !== "All" && 
          sacrament.toLowerCase().startsWith(searchValue.toLowerCase())
        );
        
        if (partialMatch) {
          setActiveFilter(partialMatch);
        }
      }
    } else if (searchValue.trim() === "") {
      // If search is cleared, reset filter to "All" only if no manual filter was selected
      setActiveFilter("All");
    }
  };

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
  const filteredAppointments = React.useMemo(() => {
    const filtered = appointments.filter(appointment => {
      const matchesFilter = activeFilter === "All" || appointment.sacramentType === activeFilter;
      
      // If no search term, just apply filter
      if (searchTerm.trim() === "") {
        return matchesFilter;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Check if the search term matches any sacrament type for auto-filtering
      const isSearchingSacramentType = allSacramentTypes.some(sacrament => 
        sacrament !== "All" && 
        (sacrament.toLowerCase() === normalizedSearchTerm.toLowerCase() || 
         sacrament.toLowerCase().startsWith(normalizedSearchTerm.toLowerCase()))
      );
      
      let result = false;
      let reason = "";
      
      if (isSearchingSacramentType && activeFilter !== "All") {
        // If searching for a specific sacrament type, only show that type
        result = appointment.sacramentType === activeFilter;
        reason = result ? 
          `Included: Sacrament type "${appointment.sacramentType}" matches active filter "${activeFilter}"` :
          `Excluded: Sacrament type "${appointment.sacramentType}" does not match active filter "${activeFilter}"`;
      } else {
        // Enhanced search behavior for names, dates, times, and other fields
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
        const matchesBlessingType = appointment.blessingType && appointment.blessingType.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
        const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
        const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
        
        const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                             matchesReverseFullName || matchesSacramentType || matchesBlessingType ||
                             matchesDateField || matchesTimeField;
        
        result = matchesFilter && matchesSearch;
        
        // Build reason string
        if (!result) {
          if (!matchesFilter) {
            reason = `Excluded: Filter mismatch - Active filter: "${activeFilter}", Appointment sacrament: "${appointment.sacramentType}"`;
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
          if (matchesBlessingType) matchReasons.push(`blessingType: "${appointment.blessingType}"`);
          if (matchesDateField) matchReasons.push(`date: "${appointment.date}"`);
          if (matchesTimeField) matchReasons.push(`time: "${appointment.time}"`);
          
          reason = `Included: Matches ${matchReasons.join(", ")} with search term: "${normalizedSearchTerm}" and filter: "${activeFilter}"`;
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

    // Console log summary
    console.log("=== SEARCH SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Normalized Search Term: "${normalizeSpaces(searchTerm)}"`);
    console.log(`Active Filter: "${activeFilter}"`);
    console.log(`Total Appointments: ${appointments.length}`);
    console.log(`Filtered Results (with duplicates): ${filtered.length}`);
    console.log(`Unique Filtered Results: ${uniqueFiltered.length}`);
    console.log("Filtered Appointment IDs:", uniqueFiltered.map(apt => apt.id));
    console.log("======================");

    return uniqueFiltered;
  }, [appointments, searchTerm, activeFilter, allSacramentTypes]);

  return (
    <div className="appointment-container-pa">
      <h1 className="title-pa">PARISH APPOINTMENT</h1>
      
      <div className="appointment-actions-pa">
        <div className="search-bar-pa">
          <input 
            type="text" 
            placeholder="Search by name, date (yyyy-mm-dd), time, or sacrament type" 
            value={searchTerm}
            onChange={handleSearchChange}
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
                    <td>{formatDateForDisplay(appointment.date)}</td>
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