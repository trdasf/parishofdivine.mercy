import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./secretarycommunion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faFileExcel, faEye } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import * as XLSX from 'xlsx';

const SecretaryCommunion = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [communionData, setCommunionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch communion data on component mount
  useEffect(() => {
    fetchCommunionData();
  }, []);

  // Handle auto-search when component receives search parameters
  useEffect(() => {
    const searchParams = location.state;
    if (searchParams && searchParams.autoSearch && searchParams.firstName && searchParams.lastName) {
      const autoSearchTerm = `${searchParams.firstName} ${searchParams.lastName}`;
      setSearchTerm(autoSearchTerm);
      console.log(`Auto-searching for: ${autoSearchTerm}`);
      
      // Clear the location state to prevent re-triggering on subsequent renders
      if (window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [location.state]);

  // Function to fetch communion data
  const fetchCommunionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("Fetching approved communion data...");
      
      const response = await axios.get("https://parishofdivinemercy.com/backend/fetch_approved_communions.php");
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        // Map the response data with proper numbering and originalID preservation
        const formattedData = response.data.data.map((item, index) => ({
          originalId: item.communionID, // Preserve original database ID
          communionID: item.communionID,
          displayNumber: index + 1, // Sequential numbering for display
          uniqueKey: `communion-${item.communionID}`, // Unique key for React
          firstName: item.first_name,
          lastName: item.last_name,
          date: item.date,
          time: item.time,
          created_at: item.created_at,
          status: "Approved"
        }));
        
        console.log("=== COMMUNION APPOINTMENTS LOADING ===");
        console.log(`Total approved communions loaded: ${formattedData.length}`);
        console.log("======================================");
        
        setCommunionData(formattedData);
      } else {
        console.error("API returned error:", response.data.message);
        setError(response.data.message || "Failed to fetch communion data");
      }
    } catch (error) {
      console.error("Error fetching communion data:", error);
      
      // Provide a more specific error message based on the error type
      if (error.response) {
        // The server responded with a status code outside the 2xx range
        console.error("Server response:", error.response.data);
        setError(`Server error (${error.response.status}): ${error.response.data.message || "Unknown server error"}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError("No response received from server. Please check your internet connection and try again.");
      } else {
        // Something else caused the error
        setError(`Error: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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

  // Navigate to the communion details page
  const viewCommunionDetails = (communion) => {
    // Use the originalId for navigation to maintain compatibility with existing backend
    navigate("/secretary-communion-view", { 
      state: { 
        communionID: communion.originalId,
        status: communion.status 
      } 
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Enhanced filtering with flexible matching - similar to SecretaryBaptism and SecretaryBlessing
  const filteredData = React.useMemo(() => {
    const filtered = communionData.filter(item => {
      // If no search term, return all data
      if (searchTerm.trim() === "") {
        return true;
      }
      
      const normalizedSearchTerm = normalizeSpaces(searchTerm);
      
      // Enhanced search behavior for names, dates, times, and other fields
      const firstName = item.firstName || '';
      const lastName = item.lastName || '';
      
      // Create full name combinations for searching
      const fullName = normalizeSpaces(`${firstName} ${lastName}`);
      const reverseFullName = normalizeSpaces(`${lastName} ${firstName}`);
      
      // Check various search matches
      const matchesFirstName = firstName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesLastName = lastName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesFullName = fullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesReverseFullName = reverseFullName.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesStatus = item.status && item.status.toLowerCase().includes(normalizedSearchTerm.toLowerCase());
      const matchesDateField = matchesDate(item.date, normalizedSearchTerm);
      const matchesTimeField = matchesTime(item.time, normalizedSearchTerm);
      const matchesCreatedAt = matchesDate(item.created_at, normalizedSearchTerm);
      
      const matchesSearch = matchesFirstName || matchesLastName || matchesFullName || 
                           matchesReverseFullName || matchesStatus ||
                           matchesDateField || matchesTimeField || matchesCreatedAt;
      
      return matchesSearch;
    });

    // Renumber the filtered results for display
    const numberedFiltered = filtered.map((item, index) => ({
      ...item,
      displayNumber: index + 1
    }));

    console.log("=== COMMUNION FILTERING SUMMARY ===");
    console.log(`Search Term: "${searchTerm}"`);
    console.log(`Total Communion Appointments: ${communionData.length}`);
    console.log(`After Filtering: ${numberedFiltered.length}`);
    console.log("===================================");

    return numberedFiltered;
  }, [communionData, searchTerm]);

  // Function to format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return formatDateForDisplay(dateString);
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Handle download of communion data as Excel
  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert("No data to export");
      return;
    }

    // Create data for Excel export using filtered appointments
    const dataToExport = filteredData.map(item => ({
      'No.': item.displayNumber,
      'First Name': item.firstName || '',
      'Last Name': item.lastName || '',
      'Date': formatDate(item.date),
      'Time': convertTo12Hour(item.time),
      'Created At': formatDate(item.created_at)
    }));

    // Create worksheet and workbook
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Communion Appointments");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = searchTerm 
      ? `Communion_Appointments_Filtered_${timestamp}.xlsx`
      : `Communion_Appointments_${timestamp}.xlsx`;

    // Save the file
    XLSX.writeFile(wb, filename);

    console.log(`Exported ${filteredData.length} communion appointments to Excel`);
  };

  // Add refresh button to force reload all data
  const handleRefresh = () => {
    console.log("Manual refresh triggered");
    fetchCommunionData();
  };

  return (
    <div className="communion-container-sc">
      <h1 className="title-sc">COMMUNION</h1>

      {/* Show loading status and record count */}
      <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
        {isLoading ? (
          <span>Loading communion appointments...</span>
        ) : error ? (
          <span style={{color: 'red'}}>Error: {error}</span>
        ) : (
          <span>
            Showing {filteredData.length} of {communionData.length} approved communion appointments
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

      <div className="communion-actions-sc">
        <div className="search-bar-sc">
          <input 
            type="text" 
            placeholder="Search by name, date (yyyy-mm-dd), time, or status"
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sc" />
        </div>
        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: "8px" }} />
          Export to Excel
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container-sb">Loading communion appointments...</div>
      ) : error ? (
        <div className="error-container-sb">
          {error}
          <br />
          <button onClick={handleRefresh} style={{ marginTop: '10px' }}>Try Again</button>
        </div>
      ) : (
        <div className="communion-table-wrapper-sc">
          <table className="communion-table-sc">
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-sb">
                    {searchTerm ? 
                      "No communion appointments found matching your search criteria" : 
                      "No approved communion appointments found"
                    }
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.uniqueKey}>
                    <td>{item.displayNumber}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>{convertTo12Hour(item.time)}</td>
                    <td>{formatDate(item.created_at)}</td>
                    <td>
                      <button
                        className="sc-details"
                        onClick={() => viewCommunionDetails(item)}
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

export default SecretaryCommunion;