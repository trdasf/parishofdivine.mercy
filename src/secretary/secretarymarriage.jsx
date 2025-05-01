import React from "react";
import { useNavigate } from "react-router-dom";
import "./secretarymarriage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryMarriage = () => {
  const navigate = useNavigate();

  const sampleMarriage = {
    id: 202,
    groomName: "John",
    brideName: "Jane",
    date: "04/15/2025",
    time: "2:00 PM",
    status: "Pending",
    createdAt: "04/01/2025"
  };

  const viewMarriageDetails = (marriageData) => {
    navigate("/secretary-marriage-view", { state: { viewOnly: true, marriageData } });
  };

  return (
    <div className="marriage-container-sm">
      <h1 className="title-sm">MARRIAGE APPOINTMENTS</h1>
      <div className="marriage-actions-sm">
        <div className="search-bar-sm">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sm" />
        </div>

        <div className="filter-container-sm">
          <select className="filter-select-sm">
            <option value="">Filter Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="complete">Complete</option>
          </select>
        </div>
      </div>

      <table className="marriage-table-sm">
        <thead>
          <tr>
            <th>No.</th>
            <th>Groom</th>
            <th>Bride</th>
            <th>Date</th>
            <th>Time</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{sampleMarriage.id}</td>
            <td>{sampleMarriage.groomName}</td>
            <td>{sampleMarriage.brideName}</td>
            <td>{sampleMarriage.date}</td>
            <td>{sampleMarriage.time}</td>
            <td>{sampleMarriage.status}</td>
            <td>{sampleMarriage.createdAt}</td>
            <td>
              <button
                className="sm-details"
                onClick={() => viewMarriageDetails(sampleMarriage)}
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

export default SecretaryMarriage;
