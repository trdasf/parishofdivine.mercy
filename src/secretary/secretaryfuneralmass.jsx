import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryfuneralmass.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryFuneralMass = () => {
  const navigate = useNavigate();

  const sampleFuneralMass = {
    id: 201,
    firstName: "Maria",
    lastName: "Santos",
    date: "04/10/2025",
    time: "11:00 AM",
    status: "Pending",
    createdAt: "04/08/2025"
  };

  const viewFuneralMassDetails = (funeralData) => {
    navigate("/secretary-funeral-mass-view", { state: { viewOnly: true, funeralData } });
  };

  return (
    <div className="funeralmass-container-sfm">
      <h1 className="title-sfm">FUNERAL MASS REQUESTS</h1>
      <div className="funeralmass-actions-sfm">
        <div className="search-bar-sfm">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sfm" />
        </div>

        <div className="filter-container-sfm">
          <select className="filter-select-sfm">
            <option value="">Filter Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <table className="funeralmass-table-sfm">
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
            <td>{sampleFuneralMass.id}</td>
            <td>{sampleFuneralMass.firstName}</td>
            <td>{sampleFuneralMass.lastName}</td>
            <td>{sampleFuneralMass.date}</td>
            <td>{sampleFuneralMass.time}</td>
            <td>{sampleFuneralMass.status}</td>
            <td>{sampleFuneralMass.createdAt}</td>
            <td>
              <button
                className="sfm-details"
                onClick={() => viewFuneralMassDetails(sampleFuneralMass)}
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

export default SecretaryFuneralMass;
