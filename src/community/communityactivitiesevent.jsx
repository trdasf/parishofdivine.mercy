import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./communityactivitiesevent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

const CommunityActivitiesEvent = () => {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    start_date: "",
    start_time: "",
    location: "",
    organizer: "",
    status: "Upcoming"
  });
  const [editEventData, setEditEventData] = useState(null);

  // Sample data
  const sampleEvent = {
    id: 101,
    title: "Community Cleanup Drive",
    description: "Volunteer event to clean up local parks and streets",
    category: "Community Service",
    start_date: "05/20/2025",
    start_time: "08:00 AM",
    location: "Community Center",
    organizer: "Youth Ministry",
    status: "Upcoming",
    created_at: "04/01/2025",
    updated_at: "04/10/2025"
  };

  const handleEditClick = (eventData) => {
    setEditEventData(eventData);
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditEventData({
      ...editEventData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add created_at and updated_at timestamps
    const currentDate = new Date().toLocaleDateString('en-US');
    const newEvent = {
      ...formData,
      created_at: currentDate,
      updated_at: currentDate
    };
    // Here you would typically save the new event to your database
    console.log("New event created:", newEvent);
    // Close the modal
    setShowAddModal(false);
    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      start_date: "",
      start_time: "",
      location: "",
      organizer: "",
      status: "Approved"
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    // Update the updated_at timestamp
    const currentDate = new Date().toLocaleDateString('en-US');
    const updatedEvent = {
      ...editEventData,
      updated_at: currentDate
    };
    // Here you would typically update the event in your database
    console.log("Event updated:", updatedEvent);
    // Close the modal
    setShowEditModal(false);
    // Reset edit data
    setEditEventData(null);
  };

  return (
    <div className="event-container-cae">
      <h1 className="title-cae">EVENTS & ACTIVITIES</h1>
      <div className="event-actions-cae">
        <div className="search-bar-cae">
          <input type="text" placeholder="Search" />
          <FontAwesomeIcon icon={faSearch} className="search-icon-cae" />
        </div>

        <div className="filter-actions-cae">
          <div className="filter-container-cae">
            <select className="filter-select-cae">
              <option value="">Filter Status</option>
              <option value="upcoming">Approved</option>
              <option value="ongoing">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            className="add-event-btn-cae"
            onClick={() => setShowAddModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} /> Add Event
          </button>
        </div>
      </div>
      <div className="event-table-cae-container">
        <table className="event-table-cae">
          <thead>
            <tr>
              <th>No.</th>
              <th>Title</th>
              <th>Description</th>
              <th>Category</th>
              <th>Start Date</th>
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
              <td>{sampleEvent.start_time}</td>
              <td>{sampleEvent.location}</td>
              <td>{sampleEvent.organizer}</td>
              <td>{sampleEvent.status}</td>
              <td>{sampleEvent.created_at}</td>
              <td>{sampleEvent.updated_at}</td>
              <td>
                <button
                  className="cae-details"
                  onClick={() => handleEditClick(sampleEvent)}
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal for adding new event */}
      {showAddModal && (
        <div className="modal-backdrop-cae">
          <div className="modal-content-cae">
            <h2>Add New Event & Activity</h2>
            <hr className="custom-hr-sum"/>
            <form onSubmit={handleSubmit}>
              <div className="form-group-cae">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={formData.category} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={formData.start_date} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                <div className="form-group-cae">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    value={formData.start_time} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={formData.location} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Organizer</label>
                  <input 
                    type="text" 
                    name="organizer" 
                    value={formData.organizer} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="modal-actions-cae">
              <button type="submit" className="submit-btn-cae">
                  Save
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="cancel-btn-cae">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for editing event */}
      {showEditModal && editEventData && (
        <div className="modal-backdrop-cae">
          <div className="modal-content-cae">
            <h2>Update Event & Activity</h2>
            <hr className="custom-hr-sum"/>
            <form onSubmit={handleUpdate}>
              <div className="form-group-cae">
                <label>Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editEventData.title} 
                  onChange={handleEditInputChange} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Description</label>
                <textarea 
                  name="description" 
                  value={editEventData.description} 
                  onChange={handleEditInputChange} 
                  required 
                />
              </div>
              <div className="form-group-cae">
                <label>Category</label>
                <input 
                  type="text" 
                  name="category" 
                  value={editEventData.category} 
                  onChange={handleEditInputChange} 
                  required 
                />
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Start Date</label>
                  <input 
                    type="date" 
                    name="start_date" 
                    value={editEventData.start_date.split('/').reverse().join('-')} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>
                <div className="form-group-cae">
                  <label>Start Time</label>
                  <input 
                    type="time" 
                    name="start_time" 
                    value={editEventData.start_time} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={editEventData.location} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>
              </div>
              <div className="form-row-cae">
                <div className="form-group-cae">
                  <label>Organizer</label>
                  <input 
                    type="text" 
                    name="organizer" 
                    value={editEventData.organizer} 
                    onChange={handleEditInputChange} 
                    required 
                  />
                </div>

              </div>
              <div className="modal-actions-cae">
              <button type="submit" className="submit-btn-cae">
                  Update
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="cancel-btn-cae">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityActivitiesEvent;