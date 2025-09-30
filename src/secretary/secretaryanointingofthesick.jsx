import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryanointingofthesick.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

const SecretaryAnointingOfTheSick = () => {
  const navigate = useNavigate();
  const [anointingAppointments, setAnointingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchAnointingAppointments();
  }, []);

  const fetchAnointingAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_anointing.php");
      const data = await response.json();

      if (data.success) {
        const appointmentsData = data.appointments || [];
        
        // Create numbered appointments with originalID preservation
        const numberedAppointments = appointmentsData.map((appointment, index) => ({
          ...appointment,
          originalId: appointment.id, // Preserve original database ID
          displayNumber: index + 1,   // Sequential numbering for display
          uniqueKey: `anointing-${appointment.id}` // Unique key for React
        }));

        setAnointingAppointments(numberedAppointments);
        
        console.log("=== ANOINTING APPOINTMENTS LOADING ===");
        console.log(`Total approved anointing appointments loaded: ${numberedAppointments.length}`);
        console.log("======================================");
        
      } else {
        setError(data.message || "Failed to fetch anointing appointments");
      }
    } catch (error) {
      console.error("Error fetching anointing appointments:", error);
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
    const formattedDate = new Date(appointmentDate).toISOString().split('T')[0];
    const dateFormats = [
      formattedDate, // yyyy-mm-dd format
      formattedDate.replace(/-/g, '/'), // Convert - to /
      formattedDate.split('-')[0], // year only
      formattedDate.substring(0, 7), // yyyy-mm
    ];
    
    // If appointment date has slashes, also create additional formats
    if (appointmentDate.includes('/')) {
      const [month, day, year] = appointmentDate.split('/');
      dateFormats.push(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
      dateFormats.push(`${year}-${month.padStart(2, '0')}`);
      dateFormats.push(year);
    }
    
    return dateFormats.some(format => 
      format.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
  };

  // Helper function to convert date to yyyy-mm-dd format for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    
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

  const viewAnointingDetails = (appointmentData) => {
    // Use the originalId for navigation to maintain compatibility with existing backend
    navigate("/secretary-anointing-of-the-sick-view", {
      state: { 
        anointingID: appointmentData.originalId, 
        status: appointmentData.status 
      },
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
      'First Name': appointment.firstName || '',
      'Last Name': appointment.lastName || '',
      'Date': formatDateForDisplay(appointment.date),
      'Time': convertTo12Hour(appointment.time),
      'Created At': formatDateForDisplay(appointment.createdAt)
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Anointing Appointments");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchTerm 
      ? `Anointing_Appointments_Filtered_${timestamp}.xlsx`
      : `Anointing_Appointments_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${filteredAppointments.length} anointing appointments to Excel`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Enhanced filtering with flexible matching - similar to baptism component
  const filteredAppointments = React.useMemo(() => {
    const filtered = anointingAppointments.filter(appointment => {
      // If no search term, show all appointments
      if (searchTerm.trim() === "") {
        return true;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
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
      const matchesStatus = appointment.status && appointment.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesDateField = matchesDate(appointment.date, normalizedSearchTerm);
      const matchesTimeField = matchesTime(appointment.time, normalizedSearchTerm);
      const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
      
      return matchesFirstName || matchesLastName || matchesFullName || 
             matchesReverseFullName || matchesStatus ||
             matchesDateField || matchesTimeField || matchesCreatedAt;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((appointment, index) => ({
      ...appointment,
      displayNumber: index + 1
    }));

    console.log("=== ANOINTING FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Total Anointing Appointments: ${anointingAppointments.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("===================================");

    return numberedFiltered;
  }, [anointingAppointments, searchTerm]);

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered for anointing appointments");
    fetchAnointingAppointments();
  };

  return (
    <div className="anointing-container-sa">
      <h1 className="title-sa">ANOINTING OF THE SICK</h1>

      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading anointing appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredAppointments.length} of {anointingAppointments.length} approved anointing appointments
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

      <div className="anointing-actions-sa">
        <div className="search-bar-sa">
          <input 
            type="text" 
            placeholder="Search by name, date (yyyy-mm-dd), time, or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sa" />
        </div>

        <button className="download-button-sa" onClick={handleDownload}>
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "8px" }} />
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sa">Loading anointing appointments...</div>
      ) : error ? (
        <div className="error-container-sa">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="anointing-table-wrapper-sa">
          <table className="anointing-table-sa">
            <thead>
              <tr>
                <th>No.</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-sa">
                    {searchTerm ? 
                      "No anointing appointments found matching your search criteria" : 
                      "No approved anointing appointments found"
                    }
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.uniqueKey}>
                    <td>{appointment.displayNumber}</td>
                    <td>{appointment.firstName}</td>
                    <td>{appointment.lastName}</td>
                    <td>{formatDateForDisplay(appointment.date)}</td>
                    <td>{convertTo12Hour(appointment.time)}</td>
                    <td>{formatDateForDisplay(appointment.createdAt)}</td>
                    <td>
                      <button
                        className="sa-details"
                        onClick={() => viewAnointingDetails(appointment)}
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

export default SecretaryAnointingOfTheSick;