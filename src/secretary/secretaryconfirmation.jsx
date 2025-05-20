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

  // Filter appointments based on search term
  const filteredAppointments = confirmationAppointments.filter(appointment => {
    const searchValue = searchTerm.toLowerCase();
    return (
      appointment.firstName?.toLowerCase().includes(searchValue) ||
      appointment.lastName?.toLowerCase().includes(searchValue) ||
      appointment.date?.toLowerCase().includes(searchValue) ||
      appointment.status?.toLowerCase().includes(searchValue)
    );
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
      <h1 className="title-sc">CONFIRMATION</h1>
      <div className="confirmation-actions-sc">
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
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.createdAt}</td>
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