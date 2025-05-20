import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretarybaptism.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload } from "@fortawesome/free-solid-svg-icons";

const SecretaryBaptism = () => {
  const navigate = useNavigate();
  const [baptismAppointments, setBaptismAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBaptismAppointments();
  }, []);

  const fetchBaptismAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_baptisms.php");
      const data = await response.json();

      if (data.success) {
        setBaptismAppointments(data.appointments);
      } else {
        setError(data.message || "Failed to fetch baptism appointments");
      }
    } catch (error) {
      console.error("Error fetching baptism appointments:", error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const viewBaptismDetails = (baptismID, status) => {
    navigate("/secretary-baptism-view", {
      state: { baptismID, status },
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
    const rows = baptismAppointments.map(appointment => [
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
    link.setAttribute("download", "baptism_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter appointments based on search term
  const filteredAppointments = baptismAppointments.filter(appointment => {
    const searchValue = searchTerm.toLowerCase();
    return (
      appointment.firstName?.toLowerCase().includes(searchValue) ||
      appointment.lastName?.toLowerCase().includes(searchValue) ||
      appointment.date?.toLowerCase().includes(searchValue) ||
      appointment.status?.toLowerCase().includes(searchValue)
    );
  });

  // If we have no real data yet, use sample data
  const displayAppointments = baptismAppointments.length === 0 && !loading && !error ? 
    [] : filteredAppointments;

  return (
    <div className="baptism-container-sb">
      <h1 className="title-sb">BAPTISM</h1>

      <div className="baptism-actions-sb">
        <div className="search-bar-sb">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={handleSearch}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
        </div>

        <button className="download-button-sb" onClick={handleDownload}>
          <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
          Download
        </button>
      </div>

      {loading ? (
        <div className="loading-container-sb">Loading baptism appointments...</div>
      ) : error ? (
        <div className="error-container-sb">{error}</div>
      ) : (
        <table className="baptism-table-sb">
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
                <td colSpan="8" className="no-data-sb">No baptism appointments found</td>
              </tr>
            ) : (
              displayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.firstName}</td>
                  <td>{appointment.lastName}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.createdAt}</td>
                  <td>
                    <button
                      className="sb-details"
                      onClick={() => viewBaptismDetails(appointment.id, appointment.status)}
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

export default SecretaryBaptism;
