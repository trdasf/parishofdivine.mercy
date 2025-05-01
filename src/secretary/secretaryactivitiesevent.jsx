import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./secretaryactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const SecretaryActivitiesEvent = () => {
  const navigate = useNavigate();
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEventData, setViewEventData] = useState(null);

  // Sample data
  const sampleEvent = {
    id: 101,
    title: "Annual Student Assembly",
    description: "Yearly gathering of all students for announcements and activities",
    category: "Assembly",
    start_date: "05/15/2025",
    end_date: "05/15/2025",
    start_time: "09:00 AM",
    location: "Main Auditorium",
    organizer: "Youth Ministry",
    status: "Upcoming",
    created_at: "03/10/2025",
    updated_at: "04/05/2025"
  };

  const handleViewClick = (eventData) => {
    setViewEventData(eventData);
    setShowViewModal(true);
  };

  const handleApprove = () => {
    // Here you would typically update the event status in your database
    console.log("Event approved:", viewEventData);
    // Close the modal
    setShowViewModal(false);
    // Reset view data
    setViewEventData(null);
  };

  return (
    <div className="event-container-sae">
      <h1 className="title-sae">EVENTS & ACTIVITIES</h1>
      <div className="event-actions-sae">
        <div className="search-bar-sae">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-sae" />
        </div>

        <div className="filter-container-sae">
          <select className="filter-select-sae">
            <option value="">Filter Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="event-table-sae-container">
        <table className="event-table-sae">
          <thead>
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Start Time</th>
              <th>Location</th>
              <th>Organizer</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Updated At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{sampleEvent.id}</td>
              <td>{sampleEvent.title}</td>
              <td>{sampleEvent.description}</td>
              <td>{sampleEvent.category}</td>
              <td>{sampleEvent.start_date}</td>
              <td>{sampleEvent.end_date}</td>
              <td>{sampleEvent.start_time}</td>
              <td>{sampleEvent.location}</td>
              <td>{sampleEvent.organizer}</td>
              <td>{sampleEvent.status}</td>
              <td>{sampleEvent.created_at}</td>
              <td>{sampleEvent.updated_at}</td>
              <td>
                <button
                  className="sae-details"
                  onClick={() => handleViewClick(sampleEvent)}
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for viewing event details */}
      {showViewModal && viewEventData && (
        <div className="modal-backdrop-sae">
          <div className="modal-content-sae">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-sum"/>
            <div className="view-details-sae">
              <div className="detail-row-sae">
                <div className="detail-label-sae">Title:</div>
                <div className="detail-value-sae">{viewEventData.title}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Description:</div>
                <div className="detail-value-sae">{viewEventData.description}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Category:</div>
                <div className="detail-value-sae">{viewEventData.category}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Date:</div>
                <div className="detail-value-sae">{viewEventData.start_date}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">End Date:</div>
                <div className="detail-value-sae">{viewEventData.end_date}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Start Time:</div>
                <div className="detail-value-sae">{viewEventData.start_time}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Location:</div>
                <div className="detail-value-sae">{viewEventData.location}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Organizer:</div>
                <div className="detail-value-sae">{viewEventData.organizer}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Status:</div>
                <div className="detail-value-sae">{viewEventData.status}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Created At:</div>
                <div className="detail-value-sae">{viewEventData.created_at}</div>
              </div>
              <div className="detail-row-sae">
                <div className="detail-label-sae">Updated At:</div>
                <div className="detail-value-sae">{viewEventData.updated_at}</div>
              </div>
            </div>
            <div className="modal-actions-sae">
              <button onClick={handleApprove} className="approve-btn-sae">
                Approve
              </button>
              <button onClick={() => setShowViewModal(false)} className="cancel-btn-sae">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryActivitiesEvent;