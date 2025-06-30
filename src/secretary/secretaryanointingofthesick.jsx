import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryanointingofthesick.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

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
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_anointing.php");
      const data = await response.json();

      if (data.success) {
        setAnointingAppointments(data.appointments);
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

  const viewAnointingDetails = (anointingID, status) => {
    navigate("/secretary-anointing-of-the-sick-view", {
      state: { anointingID, status },
    });
  };

  const handleDownload = () => {
    // Create headers for CSV
    const headers = [
      "No.",
      "First Name",
      "Last Name",
      "Date",
      "Time",
      "Created At",
    ];

    // Map appointments to rows
    const rows = anointingAppointments.map(appointment => [
      appointment.id,
      appointment.firstName,
      appointment.lastName,
      appointment.date,
      appointment.time,
      appointment.createdAt
    ]);

    // Combine headers and rows
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "anointing_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter appointments based on search term with flexible matching
  const filteredAppointments = anointingAppointments.filter(appointment => {
    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    
    // Normalize both data and search by trimming and replacing multiple spaces
    const firstName = appointment.firstName?.toLowerCase().trim() || '';
    const lastName = appointment.lastName?.toLowerCase().trim() || '';
    const fullName = `${firstName} ${lastName}`.replace(/\s+/g, ' ');
    const status = appointment.status?.toLowerCase().trim() || '';
    const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
    const formattedCreatedAt = new Date(appointment.createdAt).toISOString().split('T')[0];
    
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

  // If we have no real data yet, use empty array
  const displayAppointments = anointingAppointments.length === 0 && !loading && !error ? 
    [] : filteredAppointments;

  return (
    <div className="anointing-container-sa">
      <h1 className="title-sa">ANOINTING OF THE SICK</h1>

      <div className="anointing-actions-sa">
        <div className="search-bar-sa">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sa" />
        </div>

        <button className="download-button-sa" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sa">Loading anointing appointments...</div>
      ) : error ? (
        <div className="error-container-sa">{error}</div>
      ) : (
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
            {displayAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-sa">No anointing appointments found</td>
              </tr>
            ) : (
              displayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{new Date(appointment.date).toISOString().split('T')[0]}</td>
                  <td>{appointment.time}</td>
                  <td>{new Date(appointment.createdAt).toISOString().split('T')[0]}</td>
                  <td>
                    <button
                      className="sa-details"
                      onClick={() => viewAnointingDetails(appointment.id, appointment.status)}
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

export default SecretaryAnointingOfTheSick;