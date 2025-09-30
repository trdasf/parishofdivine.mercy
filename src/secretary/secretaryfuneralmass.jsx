import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./secretaryfuneralmass.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import * as XLSX from 'xlsx';

const SecretaryFuneralMass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [funeralMassData, setFuneralMassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFuneralMassData();
    
    // Check if we're returning from an approval - if so, refresh the data
    if (location.state?.refresh) {
      fetchFuneralMassData();
    }
  }, [location]);

  const fetchFuneralMassData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_funerals.php");
      const data = await response.json();

      if (data.success) {
        const appointmentsData = data.appointments || [];
        
        // Create numbered appointments with originalID preservation
        const numberedAppointments = appointmentsData.map((appointment, index) => ({
          ...appointment,
          originalId: appointment.id, // Preserve original database ID
          displayNumber: index + 1,   // Sequential numbering for display
          uniqueKey: `funeral-${appointment.id}` // Unique key for React
        }));

        setFuneralMassData(numberedAppointments);
        
        console.log("=== FUNERAL MASS APPOINTMENTS LOADING ===");
        console.log(`Total approved funeral masses loaded: ${numberedAppointments.length}`);
        console.log("==========================================");
        
      } else {
        setError(data.message || "Failed to fetch funeral mass data");
      }
    } catch (error) {
      console.error("Error fetching funeral mass data:", error);
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

  const viewFuneralMassDetails = (appointmentData) => {
    // Use the originalId for navigation to maintain compatibility with existing backend
    navigate("/secretary-funeral-mass-view", { 
      state: { 
        funeralID: appointmentData.originalId,
        status: appointmentData.status || "Approved"
      } 
    });
  };

  const handleDownload = () => {
    if (filteredFuneralMassData.length === 0) {
      alert("No data to export");
      return;
    }

    // Create data for Excel export using filtered appointments
    const dataToExport = filteredFuneralMassData.map(funeral => ({
      'No.': funeral.displayNumber,
      'Deceased First Name': funeral.firstName || '',
      'Deceased Last Name': funeral.lastName || '',
      'Date': formatDateForDisplay(funeral.date),
      'Time': convertTo12Hour(funeral.time),
      'Created At': formatDateForDisplay(funeral.createdAt)
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Funeral Mass Requests");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchTerm 
      ? `Funeral_Mass_Requests_Filtered_${timestamp}.xlsx`
      : `Funeral_Mass_Requests_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${filteredFuneralMassData.length} funeral mass requests to Excel`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Enhanced filtering with flexible matching - similar to other components
  const filteredFuneralMassData = React.useMemo(() => {
    const filtered = funeralMassData.filter(funeral => {
      // If no search term, show all appointments
      if (searchTerm.trim() === "") {
        return true;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Enhanced search behavior for names, dates, and other fields
      const firstName = funeral.firstName || '';
      const lastName = funeral.lastName || '';
      
      // Create full name combinations for searching
      const fullName = normalizeSpaces(`${firstName} ${lastName}`);
      const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
      
      // Check various search matches
      const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesStatus = funeral.status && funeral.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesDateField = matchesDate(funeral.date, normalizedSearchTerm);
      const matchesCreatedAt = matchesDate(funeral.createdAt, normalizedSearchTerm);
      
      return matchesFirstName || matchesLastName || matchesFullName || 
             matchesReverseFullName || matchesStatus ||
             matchesDateField || matchesCreatedAt;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((funeral, index) => ({
      ...funeral,
      displayNumber: index + 1
    }));

    console.log("=== FUNERAL MASS FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Total Funeral Mass Appointments: ${funeralMassData.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("======================================");

    return numberedFiltered;
  }, [funeralMassData, searchTerm]);

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchFuneralMassData();
  };

  return (
    <div className="funeralmass-container-sfm">
      <h1 className="title-sfm">FUNERAL MASS</h1>

      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {loading ? (
          <span>Loading funeral mass requests...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredFuneralMassData.length} of {funeralMassData.length} approved funeral mass requests
            <button 
              onClick={handleRefresh} 
              style={{
                marginLeft: '10px', 
                padding: '4px 8px', 
                fontSize: '12px', 
                background: '#8e5200', 
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

      <div className="funeralmass-actions-sfm">
        <div className="search-bar-sfm">
          <input 
            type="text" 
            placeholder="Search by deceased name, date (yyyy-mm-dd), or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sfm" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "8px" }} />
          Export to Excel
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sfm">Loading funeral mass requests...</div>
      ) : error ? (
        <div className="error-container-sfm">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="funeralmass-table-wrapper-sfm">
          <table className="funeralmass-table-sfm">
            <thead>
              <tr>
                <th>No.</th>
                <th>Deceased Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFuneralMassData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data-sfm">
                    {searchTerm ? 
                      "No funeral mass requests found matching your search criteria" : 
                      "No approved funeral mass requests found"
                    }
                  </td>
                </tr>
              ) : (
                filteredFuneralMassData.map((funeral) => (
                  <tr key={funeral.uniqueKey}>
                    <td>{funeral.displayNumber}</td>
                    <td>{`${funeral.firstName} ${funeral.lastName}`}</td>
                    <td>{formatDateForDisplay(funeral.date)}</td>
                    <td>{convertTo12Hour(funeral.time)}</td>
                    <td>{formatDateForDisplay(funeral.createdAt)}</td>
                    <td>
                      <button
                        className="sfm-details"
                        onClick={() => viewFuneralMassDetails(funeral)}
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

export default SecretaryFuneralMass;