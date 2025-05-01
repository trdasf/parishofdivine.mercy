import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretarybaptism.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryBaptism = () => {
  const navigate = useNavigate();

  // Sample baptism appointment data - in a real app, this would come from an API/database
  const sampleBaptism = {
    id: 101,
    firstName: "Kimi",
    lastName: "Rot",
    date: "03/02/2025",
    time: "9:00 AM",
    status: "Pending",
    createdAt: "02/28/2025"
  };

  // View baptism appointment details - passing viewOnly state
  const viewBaptismDetails = (baptismData) => {
    navigate("/secretary-baptism-view", { state: { viewOnly: true, baptismData } });
  };

  return (
    <div className="baptism-container-sb">
      <h1 className="title-sb">BAPTISM APPOINTMENTS</h1>
      <div className="baptism-actions-sb">
        <div className="search-bar-sb">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sb" />
        </div>

        <div className="filter-container-sb">
          <select className="filter-select-sb">
            <option value="">Filter Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <table className="baptism-table-sb">
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
            <td>{sampleBaptism.id}</td>
            <td>{sampleBaptism.firstName}</td>
            <td>{sampleBaptism.lastName}</td>
            <td>{sampleBaptism.date}</td>
            <td>{sampleBaptism.time}</td>
            <td>{sampleBaptism.status}</td>
            <td>{sampleBaptism.createdAt}</td>
            <td>
              <button
                className="sb-details"
                onClick={() => viewBaptismDetails(sampleBaptism)}
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

export default SecretaryBaptism;