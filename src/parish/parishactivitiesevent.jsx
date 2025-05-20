import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ParishActivitiesEvent.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const ParishActivitiesEvent = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewEventData, setViewEventData] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
  }, []);

  // Fetch activities from the server
  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://parishofdivinemercy.com/backend/fetch_activities.php');
      if (response.data.success) {
        setActivities(response.data.activities);
      } else {
        setMessage({ text: "Failed to fetch activities", type: "error" });
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      setMessage({ text: "An error occurred while fetching activities", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle view button click
  const handleViewClick = (eventData) => {
    setViewEventData(eventData);
    setShowViewModal(true);
  };

  // Handle approve button click
  const handleApprove = async () => {
    if (!viewEventData || !viewEventData.activityID) {
      setMessage({ text: "Activity data is missing", type: "error" });
      return;
    }

    try {
      setIsUpdating(true);
      setMessage({ text: "", type: "" });
      
      // Prepare data for API
      const updateData = {
        activityID: viewEventData.activityID,
        status: "Approved"
      };
      
      const response = await axios.put(
        "https://parishofdivinemercy.com/backend/fetch_activities.php",
        updateData
      );
      
      if (response.data.success) {
        // Update local state
        const updatedActivity = {...viewEventData, status: "Approved"};
        setViewEventData(updatedActivity);
        
        // Update activities list
        setActivities(prevActivities => 
          prevActivities.map(activity => 
            activity.activityID === updatedActivity.activityID ? updatedActivity : activity
          )
        );
        
        setMessage({ text: "Activity approved successfully", type: "success" });
      } else {
        setMessage({ text: response.data.message || "Failed to approve activity", type: "error" });
      }
    } catch (error) {
      console.error("Error approving activity:", error);
      setMessage({ 
        text: error.response?.data?.message || "An error occurred while approving the activity", 
        type: "error" 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Filter activities based on status and search term
  const filteredActivities = activities.filter(activity => {
    const matchesStatus = statusFilter ? activity.status === statusFilter : true;
    const matchesSearch = searchTerm 
      ? activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.proposedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="event-container-pae">
      <h1 className="title-pae">EVENTS & ACTIVITIES</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      <div className="event-actions-pae">
        <div className="search-bar-pae">
          <input 
            type="text" 
            placeholder="Search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FontAwesomeIcon icon={faSearch} className="search-icon-pae" />
        </div>

        <div className="filter-container-pae">
          <select 
            className="filter-select-pae"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
           
          </select>
        </div>
      </div>
      <div className="event-table-pae-container">
        {loading ? (
          <div className="loading-indicator">Loading activities...</div>
        ) : (
          <table className="event-table-pae">
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
                <th>Proposed By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="11" className="no-data-pae">
                    No activities found {searchTerm && "for the current search"}
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity, index) => (
                  <tr key={activity.activityID}>
                    <td>{index + 1}</td>
                    <td>{activity.title}</td>
                    <td>{activity.description}</td>
                    <td>{activity.category}</td>
                    <td>{formatDate(activity.startDate)}</td>
                    <td>{activity.startTime}</td>
                    <td>{activity.location}</td>
                    <td>{activity.organizer}</td>
                    <td>{activity.proposedBy}</td>
                    <td className={`status-${activity.status.toLowerCase()}`}>{activity.status}</td>
                    <td>
                      <button
                        className="pae-details"
                        onClick={() => handleViewClick(activity)}
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

      {/* Modal for viewing event details */}
      {showViewModal && viewEventData && (
        <div className="modal-backdrop-pae">
          <div className="modal-content-pae">
            <h2>Event & Activity Details</h2>
            <hr className="custom-hr-sum"/>
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
                <div className="detail-value-pae">{formatDate(viewEventData.startDate)}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Start Time:</div>
                <div className="detail-value-pae">{viewEventData.startTime}</div>
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
                <div className="detail-label-pae">Proposed By:</div>
                <div className="detail-value-pae">{viewEventData.proposedBy}</div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Status:</div>
                <div className={`detail-value-pae status-${viewEventData.status.toLowerCase()}`}>
                  {viewEventData.status}
                </div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Created At:</div>
                <div className="detail-value-pae">
                  {viewEventData.created_at ? new Date(viewEventData.created_at).toLocaleString() : ""}
                </div>
              </div>
              <div className="detail-row-pae">
                <div className="detail-label-pae">Updated At:</div>
                <div className="detail-value-pae">
                  {viewEventData.updated_at ? new Date(viewEventData.updated_at).toLocaleString() : ""}
                </div>
              </div>
            </div>
            <div className="modal-actions-pae">
              {viewEventData.status === "Pending" && (
                <button 
                  onClick={handleApprove} 
                  className="approve-btn-pae"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Approving..." : "Approve"}
                </button>
              )}
              <button onClick={() => setShowViewModal(false)} className="cancel-btn-pae">
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