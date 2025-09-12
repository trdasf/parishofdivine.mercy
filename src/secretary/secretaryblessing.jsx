import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryblessing.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const SecretaryBlessing = () => {
  const navigate = useNavigate();
  const [blessingAppointments, setBlessingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlessingAppointments();
  }, []);

  const fetchBlessingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_blessings.php");
      const data = await response.json();

      if (data.success) {
        const appointmentsData = data.appointments || [];
        
        // Create numbered appointments with originalID preservation
        const numberedAppointments = appointmentsData.map((appointment, index) => ({
          ...appointment,
          originalId: appointment.id, // Preserve original database ID
          displayNumber: index + 1,   // Sequential numbering for display
          uniqueKey: `blessing-${appointment.id}` // Unique key for React
        }));

        setBlessingAppointments(numberedAppointments);
        
        console.log("=== BLESSING APPOINTMENTS LOADING ===");
        console.log(`Total approved blessings loaded: ${numberedAppointments.length}`);
        console.log("======================================");
        
      } else {
        setError(data.message || "Failed to fetch blessing appointments");
      }
    } catch (error) {
      console.error("Error fetching blessing appointments:", error);
      setError("An error occurred while fetching data");
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
      appointmentDate, // Original format
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
    
    // Try to parse as Date object and format
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString; // Return original if parsing fails
    }
  };

  // Helper function to normalize spaces in search term
  const normalizeSpaces = (str) => {
    return str.trim().replace(/\s+/g, ' ');
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Enhanced filtering with flexible matching - similar to SecretaryBaptism
  const filteredData = React.useMemo(() => {
    const filtered = blessingAppointments.filter(blessing => {
      // First apply type filter
      const matchesType = filterType === "" || blessing.blessingType === filterType;
      
      // If no search term, only apply type filter
      if (searchTerm.trim() === "") {
        return matchesType;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Enhanced search behavior for names, dates, times, and other fields
      const firstName = blessing.firstName || '';
      const lastName = blessing.lastName || '';
      
      // Create full name combinations for searching
      const fullName = normalizeSpaces(`${firstName} ${lastName}`);
      const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
      
      // Format blessing type for display
      const blessingTypeFormatted = `${blessing.blessingType.charAt(0).toUpperCase() + blessing.blessingType.slice(1)} Blessing`;
      
      // Check various search matches
      const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesBlessingType = blessingTypeFormatted.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesStatus = blessing.status && blessing.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesDateField = matchesDate(blessing.date, normalizedSearchTerm);
      const matchesTimeField = matchesTime(blessing.time, normalizedSearchTerm);
      const matchesCreatedAt = matchesDate(blessing.createdAt, normalizedSearchTerm);
      
      const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                           matchesReverseFullName || matchesBlessingType || matchesStatus ||
                           matchesDateField || matchesTimeField || matchesCreatedAt;
      
      return matchesType && matchesSearch;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((blessing, index) => ({
      ...blessing,
      displayNumber: index + 1
    }));

    console.log("=== BLESSING FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Filter Type: "${filterType}"`);
    console.log(`Total Blessing Appointments: ${blessingAppointments.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("==================================");

    return numberedFiltered;
  }, [blessingAppointments, searchTerm, filterType]);

  const viewBlessingDetails = (blessing) => {
    // Use the originalId for navigation to maintain compatibility with existing backend
    navigate("/secretary-blessing-view", {
      state: { 
        blessingID: blessing.originalId,
        status: blessing.status 
      }
    });
  };

  const handleDownload = () => {
    // Create headers for CSV
    const headers = [
      "No.",
      "First Name",
      "Last Name",
      "Blessing Type",
      "Date",
      "Time",
      "Created At",
    ];

    // Map filtered appointments to rows using displayNumber
    const rows = filteredData.map(appointment => [
      appointment.displayNumber,
      appointment.firstName,
      appointment.lastName,
      appointment.blessingType.charAt(0).toUpperCase() + appointment.blessingType.slice(1) + " Blessing",
      formatDateForDisplay(appointment.date),
      convertTo12Hour(appointment.time),
      formatDateForDisplay(appointment.createdAt)
    ]);

    // Combine headers and rows
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "blessing_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchBlessingAppointments();
  };

  return (
    <div className="blessing-container-sb">
      <h1 className="title-sb">BLESSING</h1>

      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading blessing appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredData.length} of {blessingAppointments.length} approved blessing appointments
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

      <div className="blessing-actions-sb-bless">
        <div className="search-bar-sb-bless">
          <input 
            type="text" 
            placeholder="Search by name, blessing type, date (yyyy-mm-dd), time, or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sb-bless" />
        </div>

        <div className="filter-container-sb-bless">
          <select 
            className="filter-select-sb-bless"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Blessing Types</option>
            <option value="house">House Blessing</option>
            <option value="business">Business Blessing</option>
            <option value="car">Car Blessing</option>
          </select>
          <button className="download-button-sb" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
            Download
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container-sb">Loading blessing appointments...</div>
      ) : error ? (
        <div className="error-container-sb">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="blessing-table-wrapper-sb">
          <table className="blessing-table-sb">
            <thead>
              <tr>
                <th>No.</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Blessing Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data-sb">
                    {searchTerm || filterType ? 
                      "No blessing appointments found matching your search criteria" : 
                      "No approved blessing appointments found"
                    }
                  </td>
                </tr>
              ) : (
                filteredData.map((blessing) => (
                  <tr key={blessing.uniqueKey}>
                    <td>{blessing.displayNumber}</td>
                    <td>{blessing.firstName}</td>
                    <td>{blessing.lastName}</td>
                    <td>{blessing.blessingType.charAt(0).toUpperCase() + blessing.blessingType.slice(1)} Blessing</td>
                    <td>{formatDateForDisplay(blessing.date)}</td>
                    <td>{convertTo12Hour(blessing.time)}</td>
                    <td>{formatDateForDisplay(blessing.createdAt)}</td>
                    <td>
                      <button
                        className="sb-details"
                        onClick={() => viewBlessingDetails(blessing)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SecretaryBlessing;