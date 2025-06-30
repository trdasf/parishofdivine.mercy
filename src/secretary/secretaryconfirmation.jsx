import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryconfirmation.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const SecretaryConfirmation = () => {
  const navigate = useNavigate();
  const [confirmationAppointments, setConfirmationAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConfirmationAppointments();
  }, []);

  const fetchConfirmationAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_confirmations.php");
      const data = await response.json();

      if (data.success) {
        setConfirmationAppointments(data.appointments);
      } else {
        setError(data.message || "Failed to fetch confirmation appointments");
      }
    } catch (error) {
      console.error("Error fetching confirmation appointments:", error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const viewConfirmationDetails = (confirmationID, status) => {
    navigate("/secretary-confirmation-view", {
      state: { 
        confirmationID,
        status 
      }
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter appointments based on search term with flexible matching
  const filteredAppointments = confirmationAppointments.filter(appointment => {
    const searchValue = searchTerm.toLowerCase().trim(); // Remove leading/trailing spaces for comparison
    const originalSearchValue = searchTerm.toLowerCase(); // Keep original for trailing space detection
    const fullName = `${appointment.firstName} ${appointment.lastName}`.toLowerCase();
    const formattedDate = new Date(appointment.date).toISOString().split('T')[0];
    const formattedCreatedAt = new Date(appointment.createdAt).toISOString().split('T')[0];
    
    // If search ends with space, only match if the trimmed search is a prefix
    const endsWithSpace = originalSearchValue !== searchValue;
    
    if (endsWithSpace && searchValue) {
      // For searches ending with space, check if any field starts with the search term
      return (
        appointment.firstName?.toLowerCase().startsWith(searchValue) ||
        appointment.lastName?.toLowerCase().startsWith(searchValue) ||
        fullName.startsWith(searchValue) ||
        formattedDate.startsWith(searchValue) ||
        formattedCreatedAt.startsWith(searchValue) ||
        appointment.status?.toLowerCase().startsWith(searchValue)
      );
    } else {
      // Regular search - check if any field contains the search term
      return (
        appointment.firstName?.toLowerCase().includes(searchValue) ||
        appointment.lastName?.toLowerCase().includes(searchValue) ||
        fullName.includes(searchValue) ||
        formattedDate.includes(searchValue) ||
        formattedCreatedAt.includes(searchValue) ||
        appointment.status?.toLowerCase().includes(searchValue)
      );
    }
  });

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
    const rows = confirmationAppointments.map(appointment => [
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
    link.setAttribute("download", "confirmation_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="confirmation-container-sc">
      <h1 className="title-sc-sc">CONFIRMATION</h1>
      <div className="confirmation-actions-sc-sc">
        <div className="search-bar-sc-sc">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sc-sc" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sc">Loading confirmation appointments...</div>
      ) : error ? (
        <div className="error-container-sc">{error}</div>
      ) : (
        <table className="confirmation-table-sc">
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
                <td colSpan="8" className="no-data-sc">No confirmation appointments found</td>
              </tr>
            ) : (
              filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{new Date(appointment.date).toISOString().split('T')[0]}</td>
                  <td>{appointment.time}</td>
                  <td>{new Date(appointment.createdAt).toISOString().split('T')[0]}</td>
                  <td>
                    <button
                      className="sc-details"
                      onClick={() => viewConfirmationDetails(appointment.id, appointment.status)}
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

export default SecretaryConfirmation;