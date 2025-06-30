import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretarycommunion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload, faEye } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const SecretaryCommunion = () => {
  const navigate = useNavigate();
  const [communionData, setCommunionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch communion data on component mount
  useEffect(() => {
    fetchCommunionData();
  }, []);

  // Function to fetch communion data
  const fetchCommunionData = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching approved communion data...");
      
      const response = await axios.get("https://parishofdivinemercy.com/backend/fetch_approved_communions.php");
      
      console.log("API response:", response.data);
      
      if (response.data.success) {
        // Map the response data to match component's expectations
        const formattedData = response.data.data.map(item => ({
          communionID: item.communionID,
          firstName: item.first_name,
          lastName: item.last_name,
          date: item.date,
          time: item.time,
          created_at: item.created_at,
          status: "Approved" // Add this line to explicitly set the status
        }));
        
        console.log("Formatted data:", formattedData);
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

  // Navigate to the communion details page
  const viewCommunionDetails = (communionID, status) => {
    navigate("/secretary-communion-view", { 
      state: { 
        communionID,
        status  
      } 
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter communion data based on search term with flexible matching
  const filteredData = communionData.filter(item => {
    if (searchTerm.trim() === "") {
      return true;
    }

    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const firstName = item.firstName?.toLowerCase().trim() || '';
    const lastName = item.lastName?.toLowerCase().trim() || '';
    const fullName = `${firstName} ${lastName}`.replace(/\s+/g, ' ');
    const status = item.status?.toLowerCase().trim() || '';
    const formattedDate = new Date(item.date).toISOString().split('T')[0];
    const formattedCreatedAt = new Date(item.created_at).toISOString().split('T')[0];
    
    // Normalize search value by replacing multiple spaces with single space
    const normalizedSearchValue = searchValue.replace(/\s+/g, ' ');
    
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      return (
        firstName.startsWith(normalizedSearchValue) ||
        lastName.startsWith(normalizedSearchValue) ||
        fullName.startsWith(normalizedSearchValue) ||
        formattedDate.startsWith(normalizedSearchValue) ||
        formattedCreatedAt.startsWith(normalizedSearchValue) ||
        status.startsWith(normalizedSearchValue)
      );
    } else {
      // Regular search - check if any field contains the search term
      return (
        firstName.includes(normalizedSearchValue) ||
        lastName.includes(normalizedSearchValue) ||
        fullName.includes(normalizedSearchValue) ||
        formattedDate.includes(normalizedSearchValue) ||
        formattedCreatedAt.includes(normalizedSearchValue) ||
        status.includes(normalizedSearchValue)
      );
    }
  });

  // Function to format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Handle download of communion data as CSV
  const handleDownload = () => {
    if (communionData.length === 0) {
      alert("No data available to download");
      return;
    }
    
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Date",
      "Time",
      "Created At",
    ];

    const rows = communionData.map((item) => [
      item.communionID,
      item.firstName,
      item.lastName,
      item.date,
      item.time,
      item.created_at,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "approved_communions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="communion-container-sc">
      <h1 className="title-sc">COMMUNION</h1>
      <div className="communion-actions-sc">
        <div className="search-bar-sc">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sc" />
        </div>
        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container-sb">Loading communion data...</div>
      ) : error ? (
        <div className="error-container-sb">{error}</div>
      ) : (
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
                  No approved communion applications found. {searchTerm && "Try a different search term."}
                </td>
              </tr>
            ) : (
              filteredData.map((item, index) => (
                <tr key={item.communionID}>
                  <td>{index + 1}</td>
                  <td>{item.firstName}</td>
                  <td>{item.lastName}</td>
                  <td>{formatDate(item.date)}</td>
                  <td>{item.time}</td>
                  <td>{formatDate(item.created_at)}</td>
                  <td>
                    <button
                      className="sc-details"
                      onClick={() => viewCommunionDetails(item.communionID, item.status)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SecretaryCommunion;