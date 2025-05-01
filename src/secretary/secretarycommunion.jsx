import React from "react";
import { useNavigate } from "react-router-dom";
import "./secretarycommunion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryCommunion = () => {
  const navigate = useNavigate();

  const sampleCommunion = {
    id: 201,
    firstName: "Luna",
    lastName: "Solana",
    date: "04/15/2025",
    time: "10:00 AM",
    status: "Approved",
    createdAt: "04/01/2025"
  };

  const viewCommunionDetails = (communionData) => {
    navigate("/secretary-communion-view", { state: { viewOnly: true, communionData } });
  };

  return (
    <div className="communion-container-sc">
      <h1 className="title-sc">COMMUNION APPOINTMENTS</h1>
      <div className="communion-actions-sc">
        <div className="search-bar-sc">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sc" />
        </div>

        <div className="filter-container-sc">
          <select className="filter-select-sc">
            <option value="">Filter Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <table className="communion-table-sc">
        <thead>
          <tr>
            <th>No.</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sampleCommunion.id}</td>
            <td>{sampleCommunion.firstName}</td>
            <td>{sampleCommunion.lastName}</td>
            <td>{sampleCommunion.date}</td>
            <td>{sampleCommunion.time}</td>
            <td>{sampleCommunion.status}</td>
            <td>{sampleCommunion.createdAt}</td>
            <td>
              <button
                className="sc-details"
                onClick={() => viewCommunionDetails(sampleCommunion)}
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default SecretaryCommunion;
