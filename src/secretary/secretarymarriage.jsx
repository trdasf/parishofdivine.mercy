import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretarymarriage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const SecretaryMarriage = () => {
  const navigate = useNavigate();
  const [marriageAppointments, setMarriageAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMarriageAppointments();
  }, []);

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

  // Helper function to format date for display
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

  // Helper function to check if search term matches date (supports yyyy, yyyy-mm, yyyy-mm-dd)
  const matchesDate = (appointmentDate, searchTerm) => {
    if (!appointmentDate || !searchTerm) return false;
    
    const normalizedSearch = searchTerm.replace(/\s/g, '');
    const formattedDate = formatDateForDisplay(appointmentDate);
    
    // Convert appointment date to different formats for comparison
    const dateFormats = [
      formattedDate, // yyyy-mm-dd format
      formattedDate.substring(0, 7), // yyyy-mm format
      formattedDate.substring(0, 4), // yyyy format
    ];
    
    return dateFormats.some(format => 
      format.toLowerCase().includes(normalizedSearch.toLowerCase())
    );
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
      alert("No data to download");
      return;
    }

    // Create headers for CSV
    const headers = [
      "No.",
      "Groom Name",
      "Bride Name",
      "Date",
      "Time",
      "Created At",
    ];

    // Map appointments to rows using displayNumber
    const rows = filteredAppointments.map(appointment => [
      appointment.displayNumber,
      appointment.groomName,
      appointment.brideName,
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
    link.setAttribute("download", "marriage_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      
      // Enhanced search behavior for groom/bride names, dates, and other fields
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
      const matchesCreatedAt = matchesDate(appointment.createdAt, normalizedSearchTerm);
      
      return matchesGroomName || matchesBrideName || matchesCombinedNames || 
             matchesReverseCombinedNames || matchesStatus ||
             matchesDateField || matchesCreatedAt;
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
            placeholder="Search by groom/bride name, date (yyyy-mm-dd), or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sm" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
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