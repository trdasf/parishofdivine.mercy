import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./parishactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ParishActivitiesEvent = () => {
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

  return (
    <div className="event-container-pae">
      <h1 className="title-pae">EVENTS & ACTIVITIES</h1>
      <div className="event-actions-pae">
        <div className="search-bar-pae">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-pae" />
        </div>

        <div className="filter-container-pae">
          <select className="filter-select-pae">
            <option value="">Filter Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      <div className="event-table-pae-container">
        <table className="event-table-pae">
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
                  className="pae-details"
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
        <div className="modal-backdrop-pae">
          <div className="modal-content-pae">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-pae"/>
            <div className="view-details-pae">
              <div className="detail-row-pae">
                <div className="detail-label-pae">Title:</div>
                <div className="detail-value-pae">{viewEventData.title}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Description:</div>
                <div className="detail-value-pae">{viewEventData.description}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Category:</div>
                <div className="detail-value-pae">{viewEventData.category}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Start Date:</div>
                <div className="detail-value-pae">{viewEventData.start_date}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">End Date:</div>
                <div className="detail-value-pae">{viewEventData.end_date}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Start Time:</div>
                <div className="detail-value-pae">{viewEventData.start_time}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Location:</div>
                <div className="detail-value-pae">{viewEventData.location}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Organizer:</div>
                <div className="detail-value-pae">{viewEventData.organizer}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Status:</div>
                <div className="detail-value-pae">{viewEventData.status}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Created At:</div>
                <div className="detail-value-pae">{viewEventData.created_at}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Updated At:</div>
                <div className="detail-value-pae">{viewEventData.updated_at}</div>
              </div>
            </div>
            <div className="modal-actions-pae">
              <button onClick={() => setShowViewModal(false)} className="close-btn-pae">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParishActivitiesEvent;