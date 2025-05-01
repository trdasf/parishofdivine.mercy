import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryconfirmation.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryConfirmation = () => {
  const navigate = useNavigate();

  // Sample data
  const sampleConfirmation = {
    id: 201,
    firstName: "Maya",
    lastName: "Lopez",
    date: "04/10/2025",
    time: "10:30 AM",
    status: "Pending",
    createdAt: "04/05/2025"
  };

  const viewConfirmationDetails = (confirmationData) => {
    navigate("/secretary-confirmation-view", {
      state: { viewOnly: true, confirmationData },
    });
  };

  return (
    <div className="confirmation-container-sc">
      <h1 className="title-sc">CONFIRMATION APPOINTMENTS</h1>
      <div className="confirmation-actions-sc">
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

      <table className="confirmation-table-sc">
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
            <td>{sampleConfirmation.id}</td>
            <td>{sampleConfirmation.firstName}</td>
            <td>{sampleConfirmation.lastName}</td>
            <td>{sampleConfirmation.date}</td>
            <td>{sampleConfirmation.time}</td>
            <td>{sampleConfirmation.status}</td>
            <td>{sampleConfirmation.createdAt}</td>
            <td>
              <button
                className="sc-details"
                onClick={() => viewConfirmationDetails(sampleConfirmation)}
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

export default SecretaryConfirmation;
