import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./secretarymarriage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

const SecretaryMarriage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [marriageAppointments, setMarriageAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMarriageAppointments();
  }, []);

  // Handle auto-search when component receives search parameters
  useEffect(() => {
    const searchParams = location.state;
    if (searchParams && searchParams.autoSearch) {
      let autoSearchTerm = '';
      
      // For marriage, we can search by groom name or bride name or both
      if (searchParams.groomFirstName && searchParams.groomLastName) {
        autoSearchTerm = `${searchParams.groomFirstName} ${searchParams.groomLastName}`;
      } else if (searchParams.brideFirstName && searchParams.brideLastName) {
        autoSearchTerm = `${searchParams.brideFirstName} ${searchParams.brideLastName}`;
      } else if (searchParams.firstName && searchParams.lastName) {
        // Fallback for generic firstName/lastName
        autoSearchTerm = `${searchParams.firstName} ${searchParams.lastName}`;
      }
      
      if (autoSearchTerm) {
        setSearchTerm(autoSearchTerm);
        console.log(`Auto-searching for: ${autoSearchTerm}`);
      }
      
      // Clear the location state to prevent re-triggering on subsequent renders
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.state]);

  const fetchMarriageAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_marriages.php");
      const data = await response.json();

      if (data.success) {
        const appointmentsData = data.appointments || [];
        
        // Create numbered appointments with originalID preservation
        const numberedAppointments = appointmentsData.map((appointment, index) => ({
          ...appointment,
          originalId: appointment.id, // Preserve original database ID
          displayNumber: index + 1,   // Sequential numbering for display
          uniqueKey: `marriage-${appointment.id}` // Unique key for React
        }));

        setMarriageAppointments(numberedAppointments);
        
        console.log("=== MARRIAGE APPOINTMENTS LOADING ===");
        console.log(`Total approved marriages loaded: ${numberedAppointments.length}`);
        console.log("======================================");
        
      } else {
        setError(data.message || "Failed to fetch marriage appointments");
      }
    } catch (error) {
      console.error("Error fetching marriage appointments:", error);
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

  // Helper function to format date for display
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

  const viewMarriageDetails = (appointmentData) => {
    // Use the originalId for navigation to maintain compatibility with existing backend
    navigate("/secretary-marriage-view", {
      state: { 
        marriageID: appointmentData.originalId, 
        status: appointmentData.status 
      }
    });
  };

  const handleDownload = () => {
    if (filteredAppointments.length === 0) {
      alert("No data to export");
      return;
    }

    // Create data for Excel export using filtered appointments
    const dataToExport = filteredAppointments.map(appointment => ({
      'No.': appointment.displayNumber,
      'Groom Name': appointment.groomName || '',
      'Bride Name': appointment.brideName || '',
      'Date': formatDateForDisplay(appointment.date),
      'Time': convertTo12Hour(appointment.time),
      'Created At': formatDateForDisplay(appointment.createdAt)
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marriage Appointments");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchTerm 
      ? `Marriage_Appointments_Filtered_${timestamp}.xlsx`
      : `Marriage_Appointments_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${filteredAppointments.length} marriage appointments to Excel`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Enhanced filtering with flexible matching - adapted for marriage-specific fields
  const filteredAppointments = React.useMemo(() => {
    const filtered = marriageAppointments.filter(appointment => {
      // If no search term, show all appointments
      if (searchTerm.trim() === "") {
        return true;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Enhanced search behavior for groom/bride names, dates, times, and other fields
      const groomName = appointment.groomName || '';
      const brideName = appointment.brideName || '';
      
      // Create combined name combinations for searching
      const combinedNames = normalizeSpaces(`${groomName} ${brideName}`);
      const reverseCombinedNames = normalizeSpaces(`${brideName} ${groomName}`);
      
      // Check various search matches
      const matchesGroomName = groomName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesBrideName = brideName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesCombinedNames = combinedNames.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesReverseCombinedNames = reverseCombinedNames.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesStatus = appointment.status && appointment.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
      const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
      const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
      
      return matchesGroomName || matchesBrideName || matchesCombinedNames || 
             matchesReverseCombinedNames || matchesStatus ||
             matchesDateField || matchesTimeField || matchesCreatedAt;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((appointment, index) => ({
      ...appointment,
      displayNumber: index + 1
    }));

    console.log("=== MARRIAGE FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Total Marriage Appointments: ${marriageAppointments.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("===================================");

    return numberedFiltered;
  }, [marriageAppointments, searchTerm]);

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchMarriageAppointments();
  };

  return (
    <div className="marriage-container-sm">
      <h1 className="title-sm">MARRIAGE</h1>

      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading marriage appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredAppointments.length} of {marriageAppointments.length} approved marriage appointments
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

      <div className="marriage-actions-sm">
        <div className="search-bar-sm">
          <input 
            type="text" 
            placeholder="Search by groom/bride name, date (yyyy-mm-dd), time, or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sm" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "8px" }} />
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sm">Loading marriage appointments...</div>
      ) : error ? (
        <div className="error-container-sm">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="marriage-table-wrapper-sm">
          <table className="marriage-table-sm">
            <thead>
              <tr>
                <th>No.</th>
                <th>Groom</th>
                <th>Bride</th>
                <th>Date</th>
                <th>Time</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-sm">
                    {searchTerm ? 
                      "No marriage appointments found matching your search criteria" : 
                      "No approved marriage appointments found"
                    }
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.uniqueKey}>
                    <td>{appointment.displayNumber}</td>
                    <td>{appointment.groomName}</td>
                    <td>{appointment.brideName}</td>
                    <td>{formatDateForDisplay(appointment.date)}</td>
                    <td>{convertTo12Hour(appointment.time)}</td>
                    <td>{formatDateForDisplay(appointment.createdAt)}</td>
                    <td>
                      <button
                        className="sm-details"
                        onClick={() => viewMarriageDetails(appointment)}
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

export default SecretaryMarriage;