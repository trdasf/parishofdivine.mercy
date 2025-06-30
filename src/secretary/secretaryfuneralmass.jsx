import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./secretaryfuneralmass.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const SecretaryFuneralMass = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [funeralMassData, setFuneralMassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchFuneralMassData();
    
    // Check if we're returning from an approval - if so, refresh the data
    if (location.state?.refresh) {
      fetchFuneralMassData();
    }
  }, [location, refreshTrigger]);

  const fetchFuneralMassData = async () => {
    try {
      setLoading(true);
      // Fetch funeral mass data from backend
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_funerals.php");
      const data = await response.json();

      if (data.success) {
        console.log("Funeral mass data:", data.appointments);
        setFuneralMassData(data.appointments || []);
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

  // Function to manually refresh the data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const viewFuneralMassDetails = (funeralID) => {
    navigate("/secretary-funeral-mass-view", { 
      state: { 
        funeralID: funeralID,
        status: "Approved" 
      } 
    });
  };

  const handleDownload = () => {
    if (funeralMassData.length === 0) {
      alert("No data to download");
      return;
    }

    // Define headers for CSV
    const headers = [
      "No.",
      "Deceased First Name",
      "Deceased Last Name",
      "Date",
      "Time",
      "Created At",
    ];

    // Map data to CSV rows
    const rows = funeralMassData.map(funeral => [
      funeral.id,
      funeral.firstName,
      funeral.lastName,
      funeral.date,
      funeral.time,
      funeral.createdAt,
    ]);

    // Combine headers and rows
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    // Create a download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "funeral_mass_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter funeral mass data based on search term with flexible matching
  const filteredFuneralMassData = funeralMassData.filter(funeral => {
    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    const fullName = `${funeral.firstName} ${funeral.lastName}`.toLowerCase();
    const formattedDate = new Date(funeral.date).toISOString().split('T')[0];
    const formattedCreatedAt = new Date(funeral.createdAt).toISOString().split('T')[0];
    
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      return (
        funeral.firstName?.toLowerCase().startsWith(searchValue) ||
        funeral.lastName?.toLowerCase().startsWith(searchValue) ||
        fullName.startsWith(searchValue) ||
        formattedDate.startsWith(searchValue) ||
        formattedCreatedAt.startsWith(searchValue) ||
        funeral.status?.toLowerCase().startsWith(searchValue)
      );
    } else {
      // Regular search - check if any field contains the search term
      return (
        funeral.firstName?.toLowerCase().includes(searchValue) ||
        funeral.lastName?.toLowerCase().includes(searchValue) ||
        fullName.includes(searchValue) ||
        formattedDate.includes(searchValue) ||
        formattedCreatedAt.includes(searchValue) ||
        funeral.status?.toLowerCase().includes(searchValue)
      );
    }
  });

  if (loading) {
    return <div className="loading-message">Loading funeral mass requests...</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="funeralmass-container-sfm">
      <h1 className="title-sfm">FUNERAL MASS</h1>
      <div className="funeralmass-actions-sfm">
        <div className="search-bar-sfm">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sfm" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sb">Loading funeral mass requests...</div>
      ) : error ? (
        <div className="error-container-sb">{error}</div>
      ) : (
        <div className="table-wrapper-sfm">
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
                  <td colSpan="7" className="no-data-sb">No funeral mass requests found</td>
                </tr>
              ) : (
                filteredFuneralMassData.map((funeral) => (
                  <tr key={funeral.id}>
                    <td>{funeral.id}</td>
                    <td>{`${funeral.firstName} ${funeral.lastName}`}</td>
                    <td>{new Date(funeral.date).toISOString().split('T')[0]}</td>
                    <td>{funeral.time}</td>
                    <td>{new Date(funeral.createdAt).toISOString().split('T')[0]}</td>
                    <td>
                      <button
                        className="sfm-details"
                        onClick={() => viewFuneralMassDetails(funeral.id)}
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