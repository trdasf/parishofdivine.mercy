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
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_marriages.php");
      const data = await response.json();

      if (data.success) {
        setMarriageAppointments(data.appointments);
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

  const viewMarriageDetails = (marriageID, status) => {
    navigate("/secretary-marriage-view", {
      state: { marriageID, status },
    });
  };

  const handleDownload = () => {
    // Create headers for CSV
    const headers = [
      "No.",
      "Groom Name",
      "Bride Name",
      "Date",
      "Time",
      "Created At",
    ];

    // Map appointments to rows
    const rows = marriageAppointments.map(appointment => [
      appointment.id,
      appointment.groomName,
      appointment.brideName,
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
    link.setAttribute("download", "marriage_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter appointments based on search term
  const filteredAppointments = marriageAppointments.filter(appointment => {
    const searchValue = searchTerm.toLowerCase();
    return (
      appointment.groomName?.toLowerCase().includes(searchValue) ||
      appointment.brideName?.toLowerCase().includes(searchValue) ||
      appointment.date?.toLowerCase().includes(searchValue) ||
      appointment.status?.toLowerCase().includes(searchValue)
    );
  });

  // If we have no real data yet, use sample data
  const displayAppointments = marriageAppointments.length === 0 && !loading && !error ? 
    [] : filteredAppointments;

  return (
    <div className="marriage-container-sm">
      <h1 className="title-sm">MARRIAGE</h1>

      <div className="marriage-actions-sm">
        <div className="search-bar-sm">
          <input 
            type="text" 
            placeholder="Search" 
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
        <div className="error-container-sm">{error}</div>
      ) : (
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
            {displayAppointments.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data-sm">No marriage appointments found</td>
              </tr>
            ) : (
              displayAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.groomName}</td>
                  <td>{appointment.brideName}</td>
                  <td>{appointment.date}</td>
                  <td>{appointment.time}</td>
                  <td>{appointment.createdAt}</td>
                  <td>
                    <button
                      className="sm-details"
                      onClick={() => viewMarriageDetails(appointment.id, appointment.status)}
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

export default SecretaryMarriage;
