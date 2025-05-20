import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryblessing.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDownload} from "@fortawesome/free-solid-svg-icons";

const SecretaryBlessing = () => {
  const navigate = useNavigate();
  const [blessingAppointments, setBlessingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBlessingAppointments();
  }, []);

  const fetchBlessingAppointments = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://parishofdivinemercy.com/backend/fetch_approved_blessings.php");
      const data = await response.json();

      if (data.success) {
        setBlessingAppointments(data.appointments);
      } else {
        setError(data.message || "Failed to fetch blessing appointments");
      }
    } catch (error) {
      console.error("Error fetching blessing appointments:", error);
      setError("An error occurred while fetching data");
    } finally {
      setLoading(false);
    }
  };

  // Filter data based on blessing type and search term
  const filteredData = blessingAppointments.filter(blessing => {
    const matchesType = filterType === "" || blessing.blessingType === filterType;
    const matchesSearch = searchTerm === "" || 
      blessing.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.date?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blessing.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const viewBlessingDetails = (blessing) => {
    navigate("/secretary-blessing-view", {
      state: { 
        blessingID: blessing.id,
        status: blessing.status 
      }
    });
  };

  const handleDownload = () => {
    // Create headers for CSV
    const headers = [
      "No.",
      "First Name",
      "Last Name",
      "Blessing Type",
      "Date",
      "Time",
      "Created At",
    ];

    // Map appointments to rows
    const rows = blessingAppointments.map(appointment => [
      appointment.id,
      appointment.firstName,
      appointment.lastName,
      appointment.blessingType.charAt(0).toUpperCase() + appointment.blessingType.slice(1) + " Blessing",
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
    link.setAttribute("download", "blessing_appointments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="blessing-container-sb">
      <h1 className="title-sb">BLESSING</h1>
      <div className="blessing-actions-sb">
        <div className="search-bar-sb">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
        </div>

        <div className="filter-container-sb">
          <select 
            className="filter-select-sb"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="">Blessing Types</option>
            <option value="house">House Blessing</option>
            <option value="business">Business Blessing</option>
            <option value="car">Car Blessing</option>
          </select>
          <button className="download-button-sb" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} style={{ marginRight: "8px" }} />
            Download
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-container-sb">Loading blessing appointments...</div>
      ) : error ? (
        <div className="error-container-sb">{error}</div>
      ) : (
        <table className="blessing-table-sb">
          <thead>
            <tr>
              <th>No.</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Blessing Type</th>
              <th>Date</th>
              <th>Time</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data-sb">No blessing appointments found</td>
              </tr>
            ) : (
              filteredData.map((blessing) => (
                <tr key={blessing.id}>
                  <td>{blessing.id}</td>
                  <td>{blessing.firstName}</td>
                  <td>{blessing.lastName}</td>
                  <td>{blessing.blessingType.charAt(0).toUpperCase() + blessing.blessingType.slice(1)} Blessing</td>
                  <td>{blessing.date}</td>
                  <td>{blessing.time}</td>
                  <td>{blessing.createdAt}</td>
                  <td>
                    <button
                      className="sb-details"
                      onClick={() => viewBlessingDetails(blessing)}
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

export default SecretaryBlessing;